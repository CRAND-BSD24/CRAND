interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'success' | 'danger';
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Ya',
  cancelText = 'Batal',
  type = 'success'
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn p-4">
      <div 
        className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold mb-4 text-gray-800">
          {title}
        </h3>
        <p className="text-gray-600 mb-6">
          {message}
        </p>
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all font-medium"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`w-full sm:w-auto px-4 py-2 rounded-lg font-medium text-white transition-all
              ${type === 'danger' 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-blue-800 hover:bg-blue-700'
              }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
} 