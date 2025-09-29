// src/components/post/FormActions.tsx
export default function FormActions() {
  return (
    <div className="flex justify-end gap-3">
      <button type="button" className="px-4 py-2 border rounded-md hover:bg-gray-100">
        취소
      </button>
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        저장
      </button>
    </div>
  );
}
