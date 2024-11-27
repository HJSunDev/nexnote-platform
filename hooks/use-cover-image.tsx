import {create} from "zustand";

// 定义 CoverImageStore 类型，包含 isOpen 状态和两个方法 onOpen 和 onClose
type CoverImageStore = {
    url?: string;
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
    onReplace: (url: string) => void;
}

// 创建一个 zustand store，用于管理 封面图片模态框 的打开和关闭状态
export const useCoverImage = create<CoverImageStore>((set) => ({
    // 初始封面图片 URL 为 undefined
    url: undefined,
    // 初始状态为关闭
    isOpen: false,
    // 打开模态框的方法，将 isOpen 设置为 true
    onOpen: () => set({isOpen: true}),
    // 关闭模态框的方法，将 isOpen 设置为 false
    onClose: () => set({isOpen: false, url: undefined}),
    // 替换封面图片的方法，将 url 设置为新的封面图片 URL
    onReplace: (url: string) => set({isOpen: true, url: url}),
}));