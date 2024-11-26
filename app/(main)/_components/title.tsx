"use client";

import { useMutation } from "convex/react";
import { useRef, useState } from "react";


import { Doc } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface TitleProps {
  initialData: Doc<"documents">;
}

export const Title = ({ initialData }: TitleProps) => {
  const update = useMutation(api.documents.update);

  const [ isEditing, setIsEditing ] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const [ title, setTitle ] = useState(initialData.title || "Untitled");

  // 启用输入框编辑模式的函数
  const enableInput = () => {
    // 设置标题为初始数据的标题
    setTitle(initialData.title);
    // 将编辑状态设置为true
    setIsEditing(true);
    // 使用setTimeout在下一次事件循环中执行
    setTimeout(() => {
      // 聚焦输入框
      inputRef.current?.focus();
      // 选中输入框中的所有文本
      inputRef.current?.setSelectionRange(0, inputRef.current.value.length);
    }, 0);
  }

  const disableInput = () => {
    setIsEditing(false);
  }

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
    update({
      id: initialData._id,
      title: event.target.value || "Untitled",
    });
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if(event.key === "Enter") {
      disableInput();
    }
  }

  return (
    <div className="flex items-center gap-x-1">
      {!!initialData.icon && (
        <p>{initialData.icon}</p>
      )}
      {isEditing ? (
        <Input
          ref={inputRef}
          onClick={enableInput}
          onBlur={disableInput}
          onChange={onChange}
          onKeyDown={onKeyDown}
          value={title}
          className="h-7 px-2 focus-visible:ring-transparent"
        />
      ) : (
        <Button
          onClick={enableInput}
          variant="ghost"
          size="sm"
          className="h-auto font-normal p-1"
        >
          <span className="truncate">{initialData?.title}</span>
        </Button>
      )}
    </div>
  );
};

Title.Skeleton = function TitleSkeleton() {
  return (
    <Skeleton className="h-6 w-20 rounded-md" />
  );
}
