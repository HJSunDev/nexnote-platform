"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Toolbar } from "@/components/toolbar";
import { Cover } from "@/components/cover";
import { Skeleton } from "@/components/ui/skeleton";

interface DocumentIdPageProps {
  params: {
    documentId: Id<"documents">;
  };
}

const DocumentIdPage = ({ params }: DocumentIdPageProps) => {
  //dynamic 实现了代码分割和按需加载,减少了初始 bundle 大小，加快了首次加载速度
  //useMemo 确保 dynamic 函数只被调用一次，即使父组件重新渲染,防止在每次渲染时重新创建动态组件
  //{ ssr: false } 确保 Editor 组件只在客户端渲染
  //空依赖数组 [] 表示这个 memoized 值只会在组件的生命周期内创建一次
  const Editor = useMemo(
    () => dynamic(() => import("@/components/editor"), { ssr: false }),
    []
  );

  const update = useMutation(api.documents.update);

  const document = useQuery(api.documents.getById, {
    documentId: params.documentId,
  });

  if (document === undefined) {
    return (
      <div>
        <Cover.Skeleton></Cover.Skeleton>
        <div className="md:max-w-3xl lg:max-w-4xl mx-auto mt-10">
          <div className="space-y-4 pl-8 pt-4">
            <Skeleton className="h-14 w-[50%]"></Skeleton>
            <Skeleton className="h-4 w-[80%]"></Skeleton>
            <Skeleton className="h-4 w-[40%]"></Skeleton>
            <Skeleton className="h-4 w-[60%]"></Skeleton>
          </div>
        </div>
      </div>
    );
  }

  if (document === null) {
    return <div>Not found</div>;
  }

  const onContentChange = (content: string) => {
    update({
      id: params.documentId,
      content,
    });
  };

  return (
    <div className="pb-40">
      <Cover preview url={document.coverImage} />
      <div className="md:max-w-3xl lg:max-w-4xl mx-auto">
        <Toolbar preview initialData={document} />
        <Editor
          editable={false}
          onChange={onContentChange}
          initialContent={document.content}
        />
      </div>
    </div>
  );
};

export default DocumentIdPage;
