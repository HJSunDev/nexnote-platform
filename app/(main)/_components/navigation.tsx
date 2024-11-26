"use client";

import {
  ChevronsLeft,
  MenuIcon,
  Plus,
  PlusCircle,
  Search,
  Settings,
  Trash,
} from "lucide-react";
import { useParams, usePathname } from "next/navigation";
import { ElementRef, useEffect, useRef, useState } from "react";
import { useMediaQuery } from "usehooks-ts";
import { useMutation } from "convex/react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { api } from "@/convex/_generated/api";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useSearch } from "@/hooks/use-search";
import { useSettings } from "@/hooks/use-settings";

import { UserItem } from "./user-item";
import { Item } from "./item";
import { DocumentList } from "./document-list";
import { TrashBox } from "./trash-box";
import { Navbar } from "./navbar";

export const Navigation = () => {
  const pathname = usePathname();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const create = useMutation(api.documents.create);

  const isResizingRef = useRef(false);
  const sidebarRef = useRef<ElementRef<"aside">>(null);
  const navbarRef = useRef<ElementRef<"div">>(null);
  // 是否正在重置状态（用于动画过渡）
  const [isResetting, setIsResetting] = useState(false);
  // 侧边栏是否为收起状态，如果是移动端，默认收起，否则默认展开
  const [isCollapsed, setIsCollapsed] = useState(isMobile);

  const openSearch = useSearch((state) => state.onOpen);
  const onOpenSettings = useSettings((state) => state.onOpen);

  const params = useParams();

  
  // 当 isMobile 变化时，改变侧边栏现实状态
  useEffect(() => {
    // 如果是移动设备，收起侧边栏
    if (isMobile) {
      collapse();
    } else {
      // 否则，重置侧边栏宽度，显示侧边栏
      resetWidth();
    }
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) collapse();
  }, [pathname, isMobile]);

  const handleMouseDown = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    event.preventDefault();
    event.stopPropagation();

    isResizingRef.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (!isResizingRef.current) return;
    let newWidth = event.clientX;
    if (newWidth < 240) newWidth = 240;
    if (newWidth > 480) newWidth = 480;

    if (sidebarRef.current && navbarRef.current) {
      sidebarRef.current.style.width = `${newWidth}px`;
      navbarRef.current.style.setProperty("left", `${newWidth}px`);
      navbarRef.current.style.setProperty(
        "width",
        `calc(100% - ${newWidth}px)`
      );
    }
  };

  const handleMouseUp = () => {
    isResizingRef.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  // 打开侧边栏并恢复到侧边栏的默认宽度，移动端时侧边栏满屏，非移动端时，侧边栏宽度为240px
  const resetWidth = () => {
    if (sidebarRef.current && navbarRef.current) {
      // 设置侧边栏收起状态为false，显示侧边栏
      setIsCollapsed(false);
      // 设置重置状态为true，用于动画过渡
      setIsResetting(true);
      // 设置侧边栏宽度
      sidebarRef.current.style.width = isMobile ? "100%" : "240px";
      // 设置导航栏宽度,移动端时侧边栏满屏，导航栏宽度为0；非移动端时，导航栏宽度为 总宽度减去侧边栏宽度
      navbarRef.current.style.setProperty(
        "width",
        isMobile ? "0" : "calc(100% - 240px)"
      );
      // 设置导航栏左侧偏移量,移动端时侧边栏满屏，导航栏左侧偏移量为100%；非移动端时，导航栏左侧偏移量为侧边栏宽度
      navbarRef.current.style.setProperty("left", isMobile ? "100%" : "240px");
      // 动画过渡300ms后，重置重置状态为false
      setTimeout(() => {
        setIsResetting(false);
      }, 300);
    }
  };

  // 收起侧边栏，不分移动端，因为导航栏的宽度在侧边栏收起后都为100%
  const collapse = () => {
    if (sidebarRef.current && navbarRef.current) {
      // 设置侧边栏收起状态为true，隐藏侧边栏
      setIsCollapsed(true);
      // 设置重置状态为true，用于动画过渡
      setIsResetting(true);
      // 设置侧边栏宽度为0，隐藏侧边栏
      sidebarRef.current.style.width = "0";
      // 设置导航栏左侧偏移量为0，导航栏宽度为100%
      navbarRef.current.style.setProperty("left", "0");
      // 设置导航栏宽度为100%
      navbarRef.current.style.setProperty("width", "100%");
      // 动画过渡300ms后，重置重置状态为false
      setTimeout(() => {
        setIsResetting(false);
      }, 300);
    }
  };

  const handleCreate = () => {
    const promise = create({ title: "Untitled" });

    toast.promise(promise, {
      loading: "Creating a new note...",
      success: "New note created!",
      error: "Failed to create a new note",
    });
  };

  return (
    <>
      {/* 侧边栏 */}
      <aside
        className={cn(
          "group/slidebar h-full bg-secondary overflow-y-auto relative flex flex-col w-60 z-50",
          isResetting && "transition-all duration-300 ease-in-out",
          isMobile && "w-0"
        )}
        ref={sidebarRef}
      >
        {/* 折叠按钮 */}
        <div
          onClick={collapse}
          role="button"
          className={cn(
            "h-6 w-6 text-muted-foreground rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600 absolute top-3 right-2 opacity-0 group-hover/slidebar:opacity-100 transition",
            isMobile && "opacity-100"
          )}
        >
          <ChevronsLeft className="h-6 w-6"></ChevronsLeft>
        </div>
        {/* 用户信息 */}
        <div>
          <UserItem></UserItem>
          <Item label="Search" icon={Search} isSearch onClick={openSearch}></Item>
          <Item label="Settings" icon={Settings} onClick={onOpenSettings}></Item>
          <Item onClick={handleCreate} label="New page" icon={PlusCircle} />
        </div>
        {/* 文档列表 */}
        <div className="mt-4">
          <DocumentList />
          <Item onClick={handleCreate} icon={Plus} label="Add a page" />
          <Popover>
            <PopoverTrigger className="w-full mt-4">
              <Item label="Trash" icon={Trash} />
            </PopoverTrigger>
            <PopoverContent className="p-0 w-72" side={isMobile ? "bottom" : "right"}>
              <TrashBox />
            </PopoverContent>
          </Popover>
        </div>
        {/* 调整侧边栏宽度 */}
        <div
          onMouseDown={handleMouseDown}
          onClick={resetWidth}
          className="opacity-0 group-hover/slidebar:opacity-100 transition cursor-ew-resize absolute h-full w-1 bg-primary/10 right-0 top-0"
        ></div>
      </aside>
      {/* 
        
        默认情况下，导航栏宽度为 总宽度减去侧边栏宽度，侧边栏宽度为240px
        
      */}
      <div
        ref={navbarRef}
        className={cn(
          "absolute top-0 left-60 z-50 w-[calc(100%-240px)] overflow-hidden",
          isResetting && "transition-all duration-300 ease-in-out",
          isMobile && "left-0 w-full"
        )}
      >
        {!!params.documentId ? (
          <Navbar isCollapsed={isCollapsed} onResetWidth={resetWidth} />
        ) : (
          <nav className="bg-transparent px-3 py-2 w-full">
            {/* 如果是侧边栏是收起状态，显示菜单按钮(展开侧边栏) */}
            {isCollapsed && (
              <MenuIcon
                onClick={resetWidth}
                role="button"
                className="h-6 w-6 text-muted-foreground"
              />
            )}
          </nav>
        )}

      </div>
    </>
  );
};
