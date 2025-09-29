import { forwardRef, useCallback, useEffect } from "react";
import { Editor } from "@toast-ui/react-editor";
import "@toast-ui/editor/dist/toastui-editor.css";
import axiosAttach from "@/api/axiosAttach";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addToast as showToast } from "@/store/slices/toastSlice";
import { fixContentForEditor } from "@/utils/contentUrlHelper";
import { v4 as uuidv4 } from "uuid";

interface Props {
  value: string;
  onChange: (val: string) => void;
}

interface AttachUploadResponseDto {
  id: number;
  fileName: string;
  originFileName: string;
  fileType: string;
  fileUrl?: string;
  publicUrl?: string;
  url?: string;
  createdAt: string;
}

const PostContentEditor = forwardRef<Editor, Props>(({ value, onChange }, ref) => {
  const dispatch = useAppDispatch();
  const memberUuid = useAppSelector((state) => state.auth.user?.uuid);

  const tempKey: string = uuidv4();

  const handleImageUpload = useCallback(
    async (blob: Blob, callback: (url: string, altText: string) => void) => {
      if (!memberUuid) {
        dispatch(
          showToast({
            type: "error",
            text: "Sign in to upload images.",
          }),
        );
        return false;
      }

      const formData = new FormData();

      
      formData.append("file", blob);
      formData.append("uploadType", "EDITOR_IMAGE");
      formData.append("memberUuid", memberUuid);
      formData.append("attachmentStatus", "TEMP");
      formData.append("tempKey", tempKey);

      try {
        const { data } = await axiosAttach.post<AttachUploadResponseDto>(
          "/attach",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );

        const imageUrl = data.publicUrl ?? data.fileUrl ?? data.url;

        if (!imageUrl) {
          throw new Error("Attachment service did not return an accessible URL.");
        }

        const altText = (blob as File).name ?? "editor image";
        callback(imageUrl, altText);
      } catch (error) {
        console.error("Image upload failed:", error);
        dispatch(
          showToast({
            type: "error",
            text: "Image upload failed.",
          }),
        );
      }

      return false;
    },
    [dispatch, memberUuid],
  );

  useEffect(() => {
    if (!ref || typeof ref === "function") return;
    const editorInstance = ref.current?.getInstance();
    if (!editorInstance) return;

    if (typeof editorInstance.removeHook === "function") {
      editorInstance.removeHook("addImageBlobHook");
    }

    editorInstance.addHook("addImageBlobHook", handleImageUpload);

    return () => {
      if (typeof editorInstance.removeHook === "function") {
        editorInstance.removeHook("addImageBlobHook");
      }
    };
  }, [handleImageUpload, ref]);

  useEffect(() => {
    if (!ref || typeof ref === "function") return;
    const editorInstance = ref.current?.getInstance();
    if (!editorInstance) return;

    if (!value) {
      return;
    }

    const fixedContent = fixContentForEditor(value);
    if (editorInstance.getMarkdown() === fixedContent) {
      return;
    }

    editorInstance.setMarkdown(fixedContent);
  }, [ref, value]);

  const handleEditorChange = useCallback(() => {
    if (!ref || typeof ref === "function") return;
    const editorInstance = ref.current?.getInstance();
    if (!editorInstance) return;

    onChange(editorInstance.getMarkdown());
  }, [onChange, ref]);

  return (
    <div className="border rounded-lg overflow-hidden">
      <Editor
        ref={ref}
        height="400px"
        initialEditType="markdown"
        previewStyle="vertical"
        placeholder="Write your content..."
        useCommandShortcut={true}
        onChange={handleEditorChange}
      />
    </div>
  );
});

PostContentEditor.displayName = "PostContentEditor";

export default PostContentEditor;
