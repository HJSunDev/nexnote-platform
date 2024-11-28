"use client";


import { useState } from "react";
import { useMutation } from "convex/react";
import { useParams } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog";

import { useCoverImage } from "@/hooks/use-cover-image";
import { SingleImageDropzone } from "@/components/single-image-dropzone";
import { useEdgeStore } from "@/lib/edgestore";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export const CoverImageModal = () => {
  // 从 useCoverImage hook 中获取模态框的打开状态和关闭方法
  const { isOpen, onClose, url } = useCoverImage();

  // 定义一个状态来存储上传的文件
  const [file, setFile] = useState<File>();
  // 定义一个状态来指示是否正在提交
  const [isSubmitting, setIsSubmitting] = useState(false);
  // 从 useEdgeStore hook 中获取 edgestore 实例
  const { edgestore } = useEdgeStore();

  // 使用 useMutation hook 创建一个更新文档的 mutation
  const update = useMutation(api.documents.update);
  // 获取当前路由的参数
  const params = useParams();

  // 当文件发生变化时调用的函数
  const onChange = async (file?: File) => {
    if (file) {
      // 设置提交状态为 true
      setIsSubmitting(true);
      // 更新文件状态
      setFile(file);

      // 如果为替换则有url，replaceTargetUrl生效，为替换图片
      // 如果为新上传，则没有url即url为undefined，replaceTargetUrl不生效，只是上传图片
      const res = await edgestore.publicFiles.upload({
        file,
        options: {
          replaceTargetUrl: url,
        }
      })

      // 更新文档的封面图片 URL
      await update({
        id: params.documentId as Id<"documents">,
        coverImage: res.url,
      });

      // 关闭模态框
      handleModalClose();
    }
  }

  // 处理模态框关闭的函数
  const handleModalClose = () => {
    // 清空文件状态
    setFile(undefined);
    // 重置提交状态
    setIsSubmitting(false);
    // 调用关闭模态框的方法
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <h2 className="text-center text-lg font-semibold">Cover Image</h2>
        </DialogHeader>
        <SingleImageDropzone
          className="w-full outline-none"
          disabled={isSubmitting}
          onChange={onChange}
          value={file}
        />
      </DialogContent>
    </Dialog>
  )
}