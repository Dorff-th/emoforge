import { useState } from 'react';
import { formatFileSize } from '@/utils/fileUtils';

// 기존 첨부파일 DTO (백엔드에서 내려오는 데이터 구조)
export interface ExistingAttachment {
  id: number;
  originalName: string;
}

interface AttachmentUploaderProps {
  // 신규 파일
  files: File[];
  onChange: (files: File[]) => void;

  // 수정 모드: 기존 첨부파일
  existingAttachments?: ExistingAttachment[];
  deleteIds?: number[];
  onDeleteIdsChange?: (ids: number[]) => void;
}

export default function AttachmentUploader({
  files,
  onChange,
  existingAttachments = [],
  deleteIds = [],
  onDeleteIdsChange = () => {},
}: AttachmentUploaderProps) {
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
    if (!selectedFiles.length) return;

    const totalFiles = [...files, ...selectedFiles];
    if (totalFiles.length + existingAttachments.length - deleteIds.length > 3) {
      setError('첨부파일은 최대 3개까지만 가능합니다.');
      return;
    }

    setError(null);
    onChange(totalFiles);
  };

  const handleRemoveNew = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onChange(newFiles);
  };

  const handleToggleExisting = (id: number) => {
    if (deleteIds.includes(id)) {
      onDeleteIdsChange(deleteIds.filter((d) => d !== id)); // 삭제 취소
    } else {
      onDeleteIdsChange([...deleteIds, id]); // 삭제 추가
    }
  };

  return (
    <div className="space-y-2">
      <label className="block font-semibold text-gray-700">첨부파일</label>
      <input
        type="file"
        multiple
        onChange={handleFileSelect}
        className="block w-full border rounded px-2 py-1 text-sm"
      />

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* 기존 첨부파일 리스트 (수정 모드) */}
      {existingAttachments.length > 0 && (
        <ul className="space-y-1">
          {existingAttachments.map((att) => {
            const marked = deleteIds.includes(att.id);
            return (
              <li
                key={att.id}
                className={`flex items-center justify-between text-sm border p-2 rounded ${
                  marked ? 'opacity-50' : ''
                }`}
              >
                <span>{att.originalName} </span>
                <button
                  type="button"
                  onClick={() => handleToggleExisting(att.id)}
                  className={
                    marked ? 'text-blue-500 hover:underline' : 'text-red-500 hover:underline'
                  }
                >
                  {marked ? '삭제취소' : '삭제'}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* 신규 첨부파일 리스트 */}
      {files.length > 0 && (
        <ul className="space-y-1">
          {files.map((file, index) => (
            <li
              key={index}
              className="flex items-center justify-between text-sm border p-2 rounded"
            >
              <span>
                {file.name} <span className="text-gray-500">({formatFileSize(file.size)})</span>
              </span>
              <button
                type="button"
                onClick={() => handleRemoveNew(index)}
                className="text-red-500 hover:underline"
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
