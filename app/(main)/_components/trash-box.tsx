"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/router";
import { useQuery, useMutation } from "convex/react";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

import { toast } from "sonner";
import { Spinner } from "@/components/spinner";

export const TrashBox = () => {

    const router = useRouter();
    const params = useParams();
    const documents = useQuery(api.documents.getTrash);
    const restore = useMutation(api.documents.restore);
    const remove = useMutation(api.documents.remove);

    const [search, setSearch] = useState("");

    const filteredDocuments = documents?.filter((document) => {
        return document.title.toLowerCase().includes(search.toLowerCase());
    });

    const onClick = (documentId: Id<"documents">) => {
        router.push(`/documents/${documentId}`);
    }

    const onRestore = (
        event: React.MouseEvent<HTMLDivElement, MouseEvent>,
        documentId: Id<"documents">
    ) => {
        event.stopPropagation();
        const promise = restore({ id: documentId });
        toast.promise(promise, {
            loading: "Restoring note...",
            success: "Note restored!",
            error: "Failed to restore note",
        });
    }

    const onRemove = (documentId: Id<"documents">) => {
        const promise = remove({ id: documentId });

        toast.promise(promise, {
            loading: "Deleting note...",
            success: "Note deleted!",
            error: "Failed to delete note",
        });
        // 如果删除的是当前文档，则跳转到文档列表
        if( params.documentId === documentId ) {
            router.push("/documents");
        }
    }


    if(documents === undefined) {
        return (
            <div className="h-full flex items-center justify-center p-4">
                <Spinner size="lg" />
            </div>
        )
    }

    return (
        <div>TrashBox</div>
    );
};