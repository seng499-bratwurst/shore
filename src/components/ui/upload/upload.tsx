import React from "react";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-/30 backdrop-blur-sm  flex items-center justify-center">
      <div className="bg-neutral-900 p-6 rounded shadow-lg w-96 relative text-neutral-100">
        <h2 className="text-xl font-semibold mb-4  text-center">Upload Files</h2>

        {/* Drag-and-drop area */}
        <div className="border-2 border-dashed border-neutral-400 p-8 text-center mb-4 rounded">
          <p>Choose a file or drag and drop it here</p>
          <p className="text-sm text-neutral-500 mt-2">MD, TXT, and PDF formats, maximum size of 50MB</p>
        </div>

        <button className="bg-neutral-700 hover:bg-neutral-200 px-4 py-2 rounded block mx-auto">
          Upload
        </button>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default UploadModal;
