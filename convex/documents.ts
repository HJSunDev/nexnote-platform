// v 是 Convex 的数据验证工具，用于定义和验证数据类型
// 比如 v.string() 验证字符串，v.number() 验证数字等
import { v } from "convex/values";

// mutation: 用于定义修改数据库的函数（增删改）
// query: 用于定义查询数据库的函数（读取）
// 这些是由 Convex 自动生成的类型和函数
import { mutation, query } from "./_generated/server";

// Doc: 数据表的类型定义
// Id: 数据表ID的类型定义
import { Doc, Id } from "./_generated/dataModel";


// 归档文档
export const archive = mutation({
    args: {
        id: v.id("documents"),
    },
    handler: async (ctx, args) => {

        const identity = await ctx.auth.getUserIdentity();

        if(!identity) {
            throw new Error("Unauthorized");
        }

        const userId = identity.subject;

        // 获取文档ID
        const { id } = args;
        // 获取文档
        const existingDocument = await ctx.db.get(id);
        // 检查文档是否存在
        if(!existingDocument) {
            throw new Error("Document not found");
        }
        // 检查文档是否属于当前用户
        if(existingDocument.userId !== userId) {
            throw new Error("Unauthorized");
        }

        // 递归归档文档
        const recursiveArchive = async (documentId: Id<"documents">) => {
            const children = await ctx.db
                .query("documents")
                .withIndex("by_user_parent", (q) => q.eq("userId", userId).eq("parentDocument", documentId))
                .filter((q) => q.eq(q.field("isArchived"), false)) // 只查找未归档的子节点
                .collect();

            for(const child of children) {
                await ctx.db.patch(child._id, {
                    isArchived: true,
                });
                await recursiveArchive(child._id);
            }
        };

        // 归档文档
        const updatedDocument = await ctx.db.patch(id, {
            isArchived: true,
        });

        recursiveArchive(id);

        return updatedDocument;
    }
});




// 已弃用
export const get = query({
    // ctx 是上下文对象，包含了数据库访问、认证等功能
    // async 表示这是异步函数
    handler: async (ctx) => {

        // ctx.auth.getUserIdentity() 获取当前用户的身份信息
        // 如果用户已登录，返回用户信息；如果未登录，返回 null
        const identity = await ctx.auth.getUserIdentity();

        // 如果用户未登录，抛出错误
        if(!identity) { 
            throw new Error("Unauthorized");
        }

        // ctx.db.query("documents") 查询 documents 表中的所有记录
        // documents 是表名
        const documents = await ctx.db.query("documents").collect();

        // 返回查询结果
        return documents;
    }
});

// 获取侧边栏文档
export const getSidebar = query({
    args: {
        parentDocument: v.optional(v.id("documents")),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if(!identity) {
            throw new Error("Unauthorized");
        }

        const userId = identity.subject;

        const documents = await ctx.db.query("documents")
        .withIndex("by_user_parent", (q) => q.eq("userId", userId).eq("parentDocument", args.parentDocument))
        .filter((q) => q.eq(q.field("isArchived"), false))
        .order("desc")
        .collect();

        return documents;
    }
});


// 定义创建文档的函数，mutation 可以理解为 修改
export const create = mutation({

    args: {
        // title 必须是字符串类型
        title: v.string(),
        // parentDocument 是可选的，如果提供，必须是 documents 表中某条记录的 ID
        parentDocument: v.optional(v.id("documents")),

    },
    handler: async (ctx, args) => {
        // ctx: 上下文对象
        // args: 包含传入的参数（title 和 parentDocument）

        const identity = await ctx.auth.getUserIdentity();
        if(!identity) {
            throw new Error("Unauthorized");
        }

        // 从用户身份信息中获取用户ID
        const userId = identity.subject;

        const document = await ctx.db.insert("documents", {
            // ctx.db.insert 向数据库插入新记录
            // 第一个参数 "documents" 是表名
            // 第二个参数是要插入的数据对象
            title: args.title,
            parentDocument: args.parentDocument,
            userId,
            isArchived: false,
            isPublished: false,
        });

        return document;
    }
});

// 获取垃圾桶中的文档
export const getTrash = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if(!identity) {
            throw new Error("Unauthorized");
        }

        const userId = identity.subject;

        const documents = await ctx.db.query("documents")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .filter((q) => q.eq(q.field("isArchived"), true))
        .order("desc")
        .collect();

        return documents;
    }
});

// 恢复文档
export const restore = mutation({
    args: {
        id: v.id("documents"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if(!identity) {
            throw new Error("Unauthorized");
        }

        const userId = identity.subject;

        const existingDocument = await ctx.db.get(args.id);
        if(!existingDocument) {
            throw new Error("Document not found");
        }

        if(existingDocument.userId !== userId) {
            throw new Error("Unauthorized");
        }

        const recursiveRestore = async (documentId: Id<"documents">) => {
            const children = await ctx.db
                .query("documents")
                .withIndex("by_user_parent", (q) => q.eq("userId", userId).eq("parentDocument", documentId))
                .filter((q) => q.eq(q.field("isArchived"), true))
                .collect();

            for(const child of children) {
                await ctx.db.patch(child._id, {
                    isArchived: false,
                });
                await recursiveRestore(child._id);
            }
        }

        const options: Partial<Doc<"documents">> = {
            isArchived: false,
        };

        // 检查当前文档是否有父文档
        if(existingDocument.parentDocument) {
            // 获取父文档的信息
            const parentDocument = await ctx.db.get(existingDocument.parentDocument);
            // 如果父文档已被归档，则将当前文档的父文档设为 undefined
            if(parentDocument?.isArchived) {
                options.parentDocument = undefined;
            }
        }

        const document = await ctx.db.patch(args.id, options);

        recursiveRestore(args.id);

        return document;

    }
});

// 删除文档
export const remove = mutation({
    args: {
        id: v.id("documents"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if(!identity) {
            throw new Error("Unauthorized");
        }

        const userId = identity.subject;

        const existingDocument = await ctx.db.get(args.id);
        if(!existingDocument) {
            throw new Error("Document not found");
        }

        if(existingDocument.userId !== userId) {
            throw new Error("Unauthorized");
        }

        const document = await ctx.db.delete(args.id);

        return document;
    }
});


// 搜索文档
export const getSearch = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if(!identity) {
            throw new Error("Unauthorized");
        }

        const userId = identity.subject;

        const documents = await ctx.db.query("documents")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .filter((q) => q.eq(q.field("isArchived"), false))
        .order("desc")
        .collect();

        return documents;
    }
})

/**
 * 根据文档ID获取文档内容
 * 实现了基于发布状态的访问控制：
 * 1. 已发布文档：所有人可访问
 * 2. 未发布文档：仅文档所有者可访问
 */
export const getById = query({
    // 定义参数类型：需要文档ID
    args: { documentId: v.id("documents") },
    handler: async (ctx, args) => {
        // 获取当前访问者的身份信息
        const identity = await ctx.auth.getUserIdentity();

        // 从数据库获取指定ID的文档
        const document = await ctx.db.get(args.documentId);

        // 如果文档不存在，抛出错误
        if(!document) {
            throw new Error("Document not found");
        }

        // 访问控制逻辑：
        // 条件1：文档已发布（isPublished=true）
        // 条件2：文档未归档（isArchived=false）
        // 满足这两个条件的文档允许公开访问
        if(document.isPublished && !document.isArchived) {
            return document;
        }

        // 对于未发布或已归档的文档：
        // 检查访问者是否已登录
        if(!identity) {
            throw new Error("Unauthorized");
        }

        // 获取访问者的用户ID
        const userId = identity.subject;

        // 检查访问者是否为文档所有者
        // 只有文档所有者才能访问未发布的文档
        if(document.userId !== userId) {
            throw new Error("Unauthorized");
        }

        // 返回文档内容
        return document;
    }
})

// 更新文档
export const update = mutation({
    args: {
        id: v.id("documents"),
        title: v.optional(v.string()),
        content: v.optional(v.string()),
        coverImage: v.optional(v.string()),
        icon: v.optional(v.string()),
        isPublished: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if(!identity) {
            throw new Error("Unauthorized");
        }

        const userId = identity.subject;

        const { id, ...rest } = args;

        const existingDocument = await ctx.db.get(id);

        if(!existingDocument) {
            throw new Error("Document not found");
        }

        if(existingDocument.userId !== userId) {
            throw new Error("Unauthorized");
        }

        const document = await ctx.db.patch(id, {   
            ...rest,
        });

        return document;
    }
})

// 删除图标
export const removeIcon = mutation({
    args: {
        id: v.id("documents"),
    },
    handler: async (ctx, args) => {
        
        const identity = await ctx.auth.getUserIdentity();

        if(!identity) {
            throw new Error("Unauthorized");
        }

        const userId = identity.subject;

        const existingDocument = await ctx.db.get(args.id);

        if(!existingDocument) {
            throw new Error("Document not found");
        }

        if(existingDocument.userId !== userId) {
            throw new Error("Unauthorized");
        }


        const document = await ctx.db.patch(args.id, {
            icon: undefined,
        });

        return document;
    }
})

// 删除封面图片
export const removeCoverImage = mutation({
    args: {
        id: v.id("documents"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if(!identity) {
            throw new Error("Unauthorized");
        }

        const userId = identity.subject;

        const existingDocument = await ctx.db.get(args.id);

        if(!existingDocument) {
            throw new Error("Document not found");
        }

        if(existingDocument.userId !== userId) {
            throw new Error("Unauthorized");
        }

        const document = await ctx.db.patch(args.id, {
            coverImage: undefined,
        });

        return document;
    }
})
