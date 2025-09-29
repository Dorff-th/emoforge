import { useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import axiosAttach from "@/api/axiosAttach";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addToast as showToast } from "@/store/slices/toastSlice";
import { formatFileSize } from "@/utils/fileUtils";
import { v4 as uuidv4 } from "uuid";

interface AttachmentUploadResponseDto {
  id: number;
  tempKey: string;
  publicUrl?: string;
  originFileName: string;
  fileSize: number;
}

interface UploadedAttachment {
  id: number;
  tempKey: string;
  originFileName: string;
  fileSize: number;
  publicUrl?: string;
}

interface AttachmentUploaderProps {
  onChange: (attachmentIds: number[]) => void;
}

const AttachmentUploader = ({ onChange }: AttachmentUploaderProps) => {
  const dispatch = useAppDispatch();
  const memberUuid = useAppSelector((state) => state.auth.user?.uuid);

  const [attachments, setAttachments] = useState<UploadedAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Record<number, boolean>>({});
  const inputRef = useRef<HTMLInputElement | null>(null);
  const groupTempKeyRef = useRef<string>("");

  if (!groupTempKeyRef.current) {
    groupTempKeyRef.current = uuidv4();
  }

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
            text: "Sign in to upload attachments.",
          }),
        );
        resetInput();
        return;
      }

      setIsUploading(true);

      const newlyUploaded: UploadedAttachment[] = [];
      const sharedTempKey = groupTempKeyRef.current;

      try {
        for (const file of selectedFiles) {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("uploadType", "ATTACHMENT");
          formData.append("memberUuid", memberUuid);
          formData.append("attachmentStatus", "TEMP");
          formData.append("tempKey", sharedTempKey);

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
              id: data.id,
              tempKey: data.tempKey ?? sharedTempKey,
              originFileName: data.originFileName ?? file.name,
              fileSize: data.fileSize ?? file.size,
              publicUrl: data.publicUrl,
            });
          } catch (error) {
            console.error("Attachment upload failed:", error);
            dispatch(
              showToast({
                type: "error",
                text: `Failed to upload ${file.name}.`,
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
    [dispatch, memberUuid, resetInput],
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
      } catch (error) {
        console.error("Attachment delete failed:", error);
        dispatch(
          showToast({
            type: "error",
            text: "Failed to delete attachment.",
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
                <p className="truncate font-medium text-gray-800">{attachment.originFileName}</p>
                <p className="text-xs text-gray-500">{formatFileSize(attachment.fileSize)}</p>
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

