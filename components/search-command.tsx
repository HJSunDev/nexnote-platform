"use client";

import { useEffect, useState } from "react";
import { File } from "lucide-react";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/clerk-react";

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";

import { useSearch } from "@/hooks/use-search";

import { api } from "@/convex/_generated/api";

/**
 * SearchCommand组件 - 实现全局搜索功能
 * 可通过 Cmd/Ctrl + K 快捷键唤起搜索框
 */
export const SearchCommand = () => {
    const { user } = useUser();
    const router = useRouter();
    // 获取所有可搜索的文档
    const documents = useQuery(api.documents.getSearch);
    
    // isMounted用于确保组件只在客户端渲染
    // 避免服务端渲染(SSR)和客户端渲染的不匹配问题
    const [isMounted, setIsMounted] = useState(false);
    
    // 从全局状态获取搜索相关方法
    const toggle = useSearch((state) => state.toggle);
    const isOpen = useSearch((state) => state.isOpen);
    const onClose = useSearch((state) => state.onClose);

    // 组件挂载后将isMounted设置为true
    // 确保hydration完成后再显示组件
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // 设置全局键盘快捷键
    // 监听 Cmd/Ctrl + K 组合键来打开搜索框
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if(e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                toggle();
            }
        }

        document.addEventListener("keydown", down);
        // 在组件卸载时清理事件监听器，防止内存泄漏
        return () => document.removeEventListener("keydown", down);
    }, [toggle]);

    // 处理搜索结果选中事件
    // 导航到选中的文档页面并关闭搜索框
    const onSelect = (id: string) => {
        router.push(`/documents/${id}`);
        onClose();
    }

    // 如果组件未完成hydration，返回null避免渲染
    if(!isMounted) {
        return null;
    }


    return (
        <CommandDialog open={isOpen} onOpenChange={onClose}>
            <CommandInput placeholder={`Search ${user?.fullName || user?.username}'s NextNote...`} />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                {documents && documents.length > 0 && (
                    <CommandGroup heading="Documents" >
                        {documents.map((document) => (
                            <CommandItem 
                                key={document._id} 
                                value={`${document._id}-${document.title}`} 
                                title={document.title} 
                                onSelect={onSelect}
                            >
                                {document.icon ? (
                                    <p className="mr-2 text-[18px]">{document.icon}</p>
                                ) : (
                                    // 文件图标
                                    <File className="mr-2 h-4 w-4" />
                                )}
                                <span>{document.title}</span>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                )}
            </CommandList>
        </CommandDialog>
    )
}
