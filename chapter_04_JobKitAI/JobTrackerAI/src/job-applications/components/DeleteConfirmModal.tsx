// Delete confirmation modal — "Delete a card with confirmation" (Requirements.md).

interface DeleteConfirmModalProps {
  company: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmModal({
  company,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Confirm delete"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          Delete job?
        </h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          This will permanently remove the application for{' '}
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {company}
          </span>
          . This action cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}