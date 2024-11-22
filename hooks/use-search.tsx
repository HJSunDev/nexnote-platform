// 从 zustand 导入 create 函数用于创建 store
import { create } from "zustand";

// 定义 store 的类型接口
type SearchStore = {
    // 控制搜索框是否打开的状态
    isOpen: boolean;
    // 打开搜索框的方法
    onOpen: () => void;
    // 关闭搜索框的方法
    onClose: () => void;
    // 切换搜索框开关状态的方法
    toggle: () => void;
}

// 创建并导出 store
export const useSearch = create<SearchStore>((set, get) => ({
    // 初始状态为关闭
    isOpen: false,
    // 设置为打开状态
    onOpen: () => set({ isOpen: true }),
    // 设置为关闭状态
    onClose: () => set({ isOpen: false }),
    // 切换状态：如果当前是开启则关闭，如果当前是关闭则开启
    toggle: () => set({ isOpen: !get().isOpen }),
}));