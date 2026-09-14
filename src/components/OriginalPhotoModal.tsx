import React from "react";
import { X, User } from "lucide-react";

interface OriginalPhotoModalProps {
  image: string;
  onClose: () => void;
}

export const OriginalPhotoModal: React.FC<OriginalPhotoModalProps> = ({
  image,
  onClose,
}) => {
  return (
    <div
      id="original-photo-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
    >
      <div className="relative w-full max-w-md bg-neutral-950 border border-white/10 rounded-3xl p-5 shadow-2xl text-white">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-purple-400" />
            <h3 className="text-base font-bold">Original Uploaded Photo</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-neutral-900 text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="relative aspect-[4/5] sm:aspect-square max-h-[60vh] w-full rounded-2xl overflow-hidden bg-neutral-950 border border-white/10 mb-4 flex items-center justify-center">
          <img
            src={image}
            alt="Original"
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain"
          />
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 text-xs font-semibold"
        >
          Close
        </button>
      </div>
    </div>
  );
};
