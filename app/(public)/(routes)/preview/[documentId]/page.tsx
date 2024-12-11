"use client";

import dynamic from "next/dynamic";
import { use, useMemo } from "react";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Toolbar } from "@/components/toolbar";
import { Cover } from "@/components/cover";
import { Skeleton } from "@/components/ui/skeleton";

interface DocumentIdPageProps {
  params: {
    documentId: Id<"documents">;
  } | Promise<{
    documentId: Id<"documents">;
  }>;
}

const DocumentIdPage = ({ params }: DocumentIdPageProps) => {
  // 使用 instanceof Promise 检查并解包 params
  const resolvedParams = params instanceof Promise ? use(params) : params;
  const { documentId } = resolvedParams;

  const Editor = useMemo(
    () => dynamic(() => import("@/components/editor"), { ssr: false }),
    []
  );

  const update = useMutation(api.documents.update);

  const document = useQuery(api.documents.getById, {
    documentId: documentId,
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
      id: documentId,
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
