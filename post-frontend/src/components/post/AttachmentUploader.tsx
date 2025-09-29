import { useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import axiosAttach from "@/api/axiosAttach";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addToast as showToast } from "@/store/slices/toastSlice";
import { formatFileSize } from "@/utils/fileUtils";

interface AttachmentUploadResponseDto {
  id: number;
  tempKey?: string;
  groupTempKey?: string;
  fileName?: string;
  originalName?: string;
  originFileName?: string;
  fileUrl?: string;
  uploadType: "EDITOR_IMAGE" | "ATTACHMENT";
  status: "TEMP" | "CONFIRMED";
  fileSize?: number;
}

interface UploadedAttachment extends AttachmentUploadResponseDto {
  fileSize?: number;
}

interface AttachmentUploaderProps {
  groupTempKey: string;
  onChange: (attachmentIds: number[]) => void;
}

const AttachmentUploader = ({ groupTempKey, onChange }: AttachmentUploaderProps) => {
  const dispatch = useAppDispatch();
  const memberUuid = useAppSelector((state) => state.auth.user?.uuid);

  const [attachments, setAttachments] = useState<UploadedAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Record<number, boolean>>({});
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    onChange(attachments.map((att) => att.id));
  }, [attachments, onChange]);

  const resetInput = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, []);

  const handleFileSelect = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = event.target.files ? Array.from(event.target.files) : [];
      if (!selectedFiles.length) {
        return;
      }

      if (!memberUuid) {
        dispatch(
          showToast({
            type: "error",
            text: "첨부파일 업로드를 위해 로그인이 필요합니다.",
          }),
        );
        resetInput();
        return;
      }

      if (!groupTempKey) {
        dispatch(
          showToast({
            type: "error",
            text: "첨부파일 업로드 키를 찾을 수 없습니다.",
          }),
        );
        resetInput();
        return;
      }

      setIsUploading(true);

      const newlyUploaded: UploadedAttachment[] = [];

      try {
        for (const file of selectedFiles) {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("groupTempKey", groupTempKey);
          formData.append("tempKey", groupTempKey);
          formData.append("uploadType", "ATTACHMENT");
          formData.append("memberUuid", memberUuid);
          formData.append("attachmentStatus", "TEMP");

          try {
            const { data } = await axiosAttach.post<AttachmentUploadResponseDto>(
              "/attach",
              formData,
              {
                headers: { "Content-Type": "multipart/form-data" },
              },
            );

            if (typeof data.id !== "number") {
              throw new Error("Attachment service did not return an attachment id.");
            }

            newlyUploaded.push({
              ...data,
              originalName: data.originalName ?? data.originFileName ?? data.fileName ?? file.name,
              fileSize: data.fileSize ?? file.size,
            });
          } catch (error) {
            console.error("Attachment upload failed:", error);
            dispatch(
              showToast({
                type: "error",
                text: `파일 ${file.name} 업로드에 실패했습니다.`,
              }),
            );
          }
        }
      } finally {
        setIsUploading(false);
        resetInput();
      }

      if (newlyUploaded.length) {
        setAttachments((prev) => [...prev, ...newlyUploaded]);
      }
    },
    [dispatch, groupTempKey, memberUuid, resetInput],
  );

  const handleDelete = useCallback(
    async (attachmentId: number) => {
      if (!attachmentId) {
        return;
      }

      setDeletingIds((prev) => ({ ...prev, [attachmentId]: true }));

      try {
        await axiosAttach.delete(`/attach/${attachmentId}`);
        setAttachments((prev) => prev.filter((att) => att.id !== attachmentId));
        dispatch(
          showToast({
            type: "success",
            text: "첨부파일이 삭제되었습니다.",
          }),
        );
      } catch (error) {
        console.error("Attachment delete failed:", error);
        dispatch(
          showToast({
            type: "error",
            text: "첨부파일 삭제에 실패했습니다.",
          }),
        );
      } finally {
        setDeletingIds((prev) => {
          const next = { ...prev };
          delete next[attachmentId];
          return next;
        });
      }
    },
    [dispatch],
  );

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700">Attachments</label>
        <p className="text-xs text-gray-500">Upload supporting files for this post.</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        disabled={isUploading}
        className="block w-full cursor-pointer rounded border border-gray-300 px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-gray-100"
      />
      {isUploading && <p className="text-xs text-indigo-600">Uploading...</p>}

      {attachments.length > 0 && (
        <ul className="space-y-2">
          {attachments.map((attachment) => (
            <li
              key={attachment.id}
              className="flex items-center justify-between rounded border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm"
            >
              <div className="min-w-0 pr-3">
                <p className="truncate font-medium text-gray-800">
                  {attachment.originalName ?? attachment.fileName ?? '파일'}
                </p>
                {typeof attachment.fileSize === "number" && (
                  <p className="text-xs text-gray-500">{formatFileSize(attachment.fileSize)}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleDelete(attachment.id)}
                disabled={Boolean(deletingIds[attachment.id])}
                className="text-xs font-medium text-red-500 hover:text-red-600 disabled:cursor-not-allowed disabled:text-red-300"
              >
                {deletingIds[attachment.id] ? "Removing..." : "Delete"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AttachmentUploader;
