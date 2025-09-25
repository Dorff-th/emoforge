import { useState } from "react";
import Modal from "@/components/ui/Modal";
import { uploadProfileImage } from "@/api/profileImageApi";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  memberUuid: string;
  onUploaded: () => void; // 업로드 후 새로고침 콜백
}

function ProfileImageUploadModal({ isOpen, onClose, memberUuid, onUploaded }: Props) {
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async () => {
    if (!file) return;
    await uploadProfileImage(file, "PROFILE_IMAGE", "CONFIRMED", memberUuid);
    onUploaded();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-lg font-semibold mb-4">프로필 이미지 업로드</h2>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="mb-4"
      />
      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">
          취소
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          업로드
        </button>
      </div>
    </Modal>
  );
}

export default ProfileImageUploadModal;
