// 用于定义数据库结构和数据表
import { defineSchema, defineTable } from "convex/server";
// 用于定义字段类型的工具
import { v } from "convex/values";

// 导出数据库结构定义
export default defineSchema({
    // 定义一个名为 documents 的数据表
    documents: defineTable({
        // === 必填字段 ===
        // 文档标题
        title: v.string(),
        // 创建者的用户ID
        userId: v.string(),
        // 是否归档
        isArchived: v.boolean(),
        // 是否发布
        isPublished: v.boolean(),

        // === 可选字段 ===
        // 父文档ID，用于实现文档层级（值必须是 "documents" 表中某条记录的 ID）
        parentDocument: v.optional(v.id("documents")),
        // 文档内容
        content: v.optional(v.string()),
        // 封面图片URL
        coverImage: v.optional(v.string()),
        // 文档图标
        icon: v.optional(v.string()),
    })
    // === 索引定义（用于优化查询速度）===
    // 通过用户ID快速查找文档
    .index("by_user", ["userId"])
    // 通过用户ID和父文档ID快速查找
    .index("by_user_parent", ["userId", "parentDocument"])
}) 