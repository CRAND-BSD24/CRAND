import React from 'react';

interface PromoteClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  className: string;
}

const PromoteClassModal: React.FC<PromoteClassModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  className,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/95 p-6 rounded-lg shadow-xl max-w-md w-full border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Konfirmasi Kenaikan Kelas</h2>
        <p className="mb-6">
          Yakin ingin menaikkan semua santri di kelas {className}?
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Ya, Naikkan
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromoteClassModal; 