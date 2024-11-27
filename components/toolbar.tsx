"use client";


import { ElementRef, useRef, useState } from "react";

import { IconPicker } from "./icon-picker";
import { Button } from "@/components/ui/button";
import { ImagePlus, Smile, X } from "lucide-react";
import TextareaAutosize from "react-textarea-autosize";

import { Doc } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCoverImage } from "@/hooks/use-cover-image";



interface ToolbarProps {
  initialData: Doc<"documents">;
  preview?: boolean;
}

export const Toolbar = ({ initialData, preview }: ToolbarProps) => {

  // 创建一个引用来访问textarea元素
  const inputRef = useRef<ElementRef<"textarea">>(null);
  // 定义一个状态来跟踪编辑模式是否启用
  const [ isEditing, setIsEditing ] = useState(false);
  // 定义一个状态来存储输入框的值，初始值为文档的标题
  const [ value, setValue ] = useState(initialData.title);

  // 使用Convex的useMutation钩子来获取更新文档的函数
  const update = useMutation(api.documents.update);
  // 使用Convex的useMutation钩子来获取删除图标的函数
  const removeIcon = useMutation(api.documents.removeIcon);

  const { onOpen } = useCoverImage();

  // 启用输入框编辑模式的函数
  const enableInput = () => {
    // 如果是预览模式，则不允许编辑
    if(preview) return;

    // 设置编辑模式为启用
    setIsEditing(true);
    // 使用setTimeout确保在下一次渲染后执行
    setTimeout(() => {
      // 将输入框的值重置为初始标题
      setValue(initialData.title);
      // 聚焦到输入框并将光标移动到内容末尾
      const input = inputRef.current;
      if (input) {
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
      }
    }, 0);
  };

  // 禁用输入框编辑模式的函数
  const disableInput = () => {
    // 设置编辑模式为禁用
    setIsEditing(false);
  };

  // 处理输入框内容变化的函数
  const onInput = (value: string) => {
    // 更新输入框的值
    setValue(value);
    // 调用更新函数更新文档的标题
    update({
      id: initialData._id,
      title: value || "Untitled", // 如果输入为空，则设置为"Untitled"
    });
  };

  // 处理键盘事件的函数
  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // 如果按下的是Enter键
    if(event.key === "Enter") {
      // 阻止默认行为（如换行）
      event.preventDefault();
      // 禁用编辑模式
      disableInput();
    }
  };

  // 处理图标选择的函数
  const onIconSelect = (icon: string) => {
    update({
      id: initialData._id,
      icon,
    });
  };

  // 处理删除图标的函数
  const onRemoveIcon = () => {
    removeIcon({
      id: initialData._id,
    });
  };

  return (
    <div className="pl-[54px] group relative">

      {/* 图标模块：图标、图标选择按钮、删除图标按钮、封面图片选择按钮 */}
      {/* 如果文档有图标且不是预览模式，则显示图标 */}
      {!!initialData.icon && !preview && (
        <div className="flex items-center gap-x-2 group/icon pt-6 ">
          <IconPicker onChange={onIconSelect}>
            <p className="text-6xl hover:opacity-75 transition">
              {initialData.icon}
            </p>
          </IconPicker>
          <Button
            onClick={onRemoveIcon}
            className="rounded-full opacity-0 group-hover/icon:opacity-100 transition text-muted-foreground text-xs"
            variant="outline"
            size="icon"
          >
            <X className="h-4 w-4"></X>
          </Button>
        </div>
      )}
      {/* 如果文档没有图标且不是预览模式，则显示图标选择按钮 */}
      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-x-1 py-4">
        {!initialData.icon && !preview && (
          <IconPicker asChild onChange={onIconSelect}>
            <Button
              className="text-muted-foreground text-xs"
              variant="outline"
              size="sm"
            >
              <Smile className="h-4 w-4 mr-2"></Smile>
              Add icon
            </Button>
          </IconPicker>
        )}
        {/* 如果文档没有封面图片且不是预览模式，则显示封面图片选择按钮 */}
        {!initialData.coverImage && !preview && (
          <Button
            onClick={onOpen}
            className="text-muted-foreground text-xs"
            variant="outline"
            size="sm"
          >
            <ImagePlus className="h-4 w-4 mr-2"></ImagePlus>
            Add cover
          </Button>
        )}
      </div>
      {/* 如果文档有图标且是预览模式，则显示图标 */}
      {!!initialData.icon && preview && (
        <p className="text-6xl pt-6">{initialData.icon}</p>
      )}

      {/* 标题模块 */}
      {/* 如果编辑模式启用且不是预览模式，则显示输入框 */}
      {isEditing && !preview ? (
        <TextareaAutosize
          ref={inputRef}
          onBlur={disableInput}
          onKeyDown={onKeyDown}
          value={value}
          onChange={(e) => onInput(e.target.value)}
          className="text-5xl bg-transparent font-bold break-words outline-none text-[#3f3f3f] dark:text-[#CFCFCF] resize-none"
        />
      ) : (
        <div
          onClick={enableInput}
          className="pb-[11.5px] text-5xl font-bold break-words outline-none text-[#3f3f3f] dark:text-[#CFCFCF]"
        >
          {initialData.title}
        </div>
      )}

    </div>
  );
};
