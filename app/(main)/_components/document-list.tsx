"use client";

import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Item } from "./item";
import { cn } from "@/lib/utils";
import { FileIcon } from "lucide-react";

interface DocumentListProps {
  parentDocumentId?: Id<"documents">;
  level?: number;
  data?: Doc<"documents">[];
}

export const DocumentList = ({
  parentDocumentId,
  level = 0,
}: DocumentListProps) => {

  const params = useParams();
  const router = useRouter();

  // 存储文档的展开状态，key 为文档 ID，value 为布尔值表示是否展开
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // 切换指定文档的展开/折叠状态
  const onExpand = (documentId: string) => {
    setExpanded((prevExpanded) => ({
      // 保留其他文档的展开状态
      ...prevExpanded,
      // 切换当前文档的展开状态（true 变为 false，false 变为 true）
      [documentId]: !prevExpanded[documentId],
    }));
  };

  const documents = useQuery(api.documents.getSidebar, {
    parentDocument: parentDocumentId,
  });

  // 重定向到指定文档
  const onRedirect = (documentId: string) => {
    router.push(`/documents/${documentId}`);
  };

  if(documents === undefined) {
    return (
      <>
        <Item.Skeleton level={level} />
        {level === 0 && (
          <>
            <Item.Skeleton level={level} />
            <Item.Skeleton level={level} />
          </>
        )}
      </>
    );
  }

  return (
    <>
      {documents.length === 0 && level !== 0 && (
        <p 
          style={{
            paddingLeft: level ? `${(level * 12) + 25}px` : undefined,
          }}
          className="text-sm font-medium text-muted-foreground/80"
        >
          No pages inside
        </p>
      )}
      {documents.map(document => (
        <div key={document._id}>
          <Item
            id={document._id}
            onClick={() => onRedirect(document._id)}
            label={document.title}
            icon={FileIcon}
            documentIcon={document.icon}
            active={params.documentId === document._id}
            onExpand={() => onExpand(document._id)}
            expanded={expanded[document._id]}
            level={level}
          />
          {expanded[document._id] && (
            <DocumentList
              parentDocumentId={document._id}
              level={level + 1}
            />
          )}
        </div>
      ))}
    </>
  );
};
