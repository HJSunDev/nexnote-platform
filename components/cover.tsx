"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ImageIcon, X } from "lucide-react";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

import { useParams } from "next/navigation";

import { useCoverImage } from "@/hooks/use-cover-image";

import { useEdgeStore } from "@/lib/edgestore";
import { Skeleton } from "@/components/ui/skeleton";


interface CoverProps {
  url?: string;
  preview?: boolean;
}

export const Cover = ({ url, preview }: CoverProps) => {

  const params = useParams();

  const { isOpen, onOpen, onReplace} = useCoverImage();

  const removeCoverImage = useMutation(api.documents.removeCoverImage);

  const { edgestore } = useEdgeStore();

  const onRemove = async () => {
    if(url){
      await edgestore.publicFiles.delete({
        url: url,
      });
    } 
    // 调用 removeCoverImage 函数删除封面图片
    removeCoverImage({id: params.documentId as Id<"documents">});
  }

  return (
    <div className={cn(
      "relative w-full h-[35vh] group",
      !url && "h-[12vh]",
      url && "bg-muted"
    )}>
      {!!url && (
        <Image
          src={url}
          fill
          className="object-cover"
          alt="Cover"
        />
      )}
      {url && !preview && (
        <div className="opacity-0 group-hover:opacity-100 absolute bottom-5 right-5 flex items-center gap-x-2">
          <Button
            onClick={()=>onReplace(url)}
            className="text-muted-foreground text-xs"
            variant="outline"
            size="sm"
          >
            <ImageIcon className="h-4 w-4"></ImageIcon>
            Change cover
          </Button>
          <Button
            onClick={onRemove}
            className="text-muted-foreground text-xs"
            variant="outline"
            size="sm"
          >
            <X className="h-4 w-4"></X>
            Remove
          </Button>
        </div>
      )}
    </div>
  )
}

Cover.Skeleton = function CoverSkeleton(){
  return (
    <Skeleton className="w-full h-[12vh]"></Skeleton>
  )
}
