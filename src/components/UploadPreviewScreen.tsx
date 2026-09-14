import React from "react";
import { Check, RefreshCw, Sparkles, UserCheck } from "lucide-react";

interface UploadPreviewScreenProps {
  image: string;
  onConfirm: () => void;
  onRetake: () => void;
}

export const UploadPreviewScreen: React.FC<UploadPreviewScreenProps> = ({
  image,
  onConfirm,
  onRetake,
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-6 max-w-md mx-auto text-center">
      <div className="w-full bg-neutral-950/80 border border-purple-900/30 rounded-3xl p-6 shadow-2xl backdrop-blur-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/30 text-xs font-semibold text-purple-300 mb-4">
          <UserCheck className="w-3.5 h-3.5 text-purple-400" />
          <span>Confirm Your Photo</span>
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">Original Photo</h2>
        <p className="text-xs text-neutral-400 mb-5">
          Make sure your face is clearly visible and well-lit for optimal styling.
        </p>

        {/* Big original photo preview - uncropped full view */}
        <div className="relative aspect-[4/5] sm:aspect-square max-h-[50vh] w-full rounded-2xl overflow-hidden bg-neutral-950 border-2 border-purple-500/40 shadow-xl mb-6 flex items-center justify-center">
          <img
            src={image}
            alt="Uploaded portrait"
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain"
          />
          <div className="absolute top-3 left-3 pointer-events-none">
            <span className="px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md text-[11px] font-semibold text-neutral-200 border border-white/10">
              Original Reference
            </span>
          </div>
        </div>

        {/* Required buttons: "Use This Photo" and "Retake" */}
        <div className="space-y-3">
          <button
            id="btn-use-this-photo"
            onClick={onConfirm}
            className="w-full py-4 px-6 rounded-2xl bg-purple-600 hover:bg-purple-500 active:scale-[0.99] text-white font-bold text-base flex items-center justify-center gap-2.5 transition-all shadow-[0_0_25px_rgba(168,85,247,0.4)]"
          >
            <Sparkles className="w-5 h-5" />
            <span>Use This Photo</span>
          </button>

          <button
            id="btn-retake-photo"
            onClick={onRetake}
            className="w-full py-3.5 px-6 rounded-2xl bg-neutral-900 hover:bg-neutral-800 active:scale-[0.99] border border-white/10 text-neutral-300 font-semibold text-sm flex items-center justify-center gap-2 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retake</span>
          </button>
        </div>
      </div>
    </div>
  );
};
