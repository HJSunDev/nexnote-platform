import { useEffect, useState } from "react";

export const useOrigin = () => {
  // 定义一个状态变量mounted，用于跟踪组件是否已挂载
  const [mounted, setMounted] = useState(false);

  // 获取当前窗口的origin，如果window对象不存在则返回空字符串
  const origin = typeof window !== "undefined" && window.location.origin ? window.location.origin : "";

  // 使用useEffect在组件挂载后设置mounted为true
  useEffect(() => {
    setMounted(true);
  }, []);

  // 如果组件尚未挂载，返回空字符串
  if(!mounted) {
    return "";
  }

  // 返回当前窗口的origin
  return origin;
}
