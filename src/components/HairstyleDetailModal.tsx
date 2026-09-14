import React, { useState } from "react";
import {
  Download,
  Share2,
  Scissors,
  X,
  Sparkles,
  SlidersHorizontal,
  Image as ImageIcon,
  Check,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { HairstyleDefinition, HairstyleResult } from "../types";
import { BeforeAfterSlider } from "./BeforeAfterSlider";
import { BarberGuideModal } from "./BarberGuideModal";

interface HairstyleDetailModalProps {
  originalImage: string;
  selectedResult: HairstyleResult;
  definition: HairstyleDefinition;
  allResults: HairstyleResult[];
  onSelectHairstyle: (result: HairstyleResult) => void;
  onClose: () => void;
  onTryAnotherStyle: () => void;
}

export const HairstyleDetailModal: React.FC<HairstyleDetailModalProps> = ({
  originalImage,
  selectedResult,
  definition,
  allResults,
  onSelectHairstyle,
  onClose,
  onTryAnotherStyle,
}) => {
  const [viewMode, setViewMode] = useState<"slider" | "full">("slider");
  const [fitMode, setFitMode] = useState<"contain" | "cover">("contain");
  const [showBarberGuide, setShowBarberGuide] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);

  const imageUrl = selectedResult.imageUrl || originalImage;

  const handleSave = () => {
    if (!selectedResult.imageUrl) return;
    const link = document.createElement("a");
    link.href = selectedResult.imageUrl;
    link.download = `styleai-${definition.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (!selectedResult.imageUrl) return;

    if (navigator.share) {
      try {
        // Try sharing as blob if possible
        const res = await fetch(selectedResult.imageUrl);
        const blob = await res.blob();
        const file = new File([blob], `${definition.id}.png`, {
          type: blob.type,
        });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `StyleAI Salon - ${definition.name}`,
            text: `Checking out the ${definition.name} hairstyle on me!`,
            files: [file],
          });
          return;
        }

        await navigator.share({
          title: `StyleAI Salon - ${definition.name}`,
          text: `Check out how the ${definition.name} hairstyle looks on me at StyleAI Salon!`,
          url: window.location.href,
        });
        return;
      } catch (err) {
        console.log("Share cancelled or failed, falling back to copy link");
      }
    }

    // Fallback clipboard copy
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2500);
    } catch {
      alert("Link copied to clipboard!");
    }
  };

  return (
    <>
      <div
        id="hairstyle-detail-modal"
        className="fixed inset-0 z-40 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto"
      >
        <div className="relative w-full max-w-lg bg-neutral-950 border border-purple-500/30 rounded-3xl p-4 sm:p-6 shadow-2xl text-white my-auto max-h-[92vh] overflow-y-auto flex flex-col no-scrollbar">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10 flex-shrink-0">
            <div>
              <span className="text-[11px] font-semibold tracking-wider uppercase text-purple-400">
                Hairstyle Preview
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                {definition.name}
              </h2>
            </div>
            <button
              id="btn-close-detail"
              onClick={onClose}
              className="p-2 rounded-full bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Controls Bar: View Toggle (Slider vs Full) + Fit Mode (Full Photo vs Fill) */}
          <div className="flex items-center justify-between py-2.5 gap-2 flex-shrink-0">
            <div className="flex items-center gap-1 p-1 bg-neutral-900/90 rounded-xl border border-white/5">
              <button
                id="btn-view-slider"
                onClick={() => setViewMode("slider")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === "slider"
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Before / After</span>
              </button>
              <button
                id="btn-view-full"
                onClick={() => setViewMode("full")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === "full"
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Full Cut</span>
              </button>
            </div>

            {/* Fit mode toggle: Full Photo (No Crop) vs Fill (Zoom) */}
            <button
              id="btn-toggle-fit-mode"
              onClick={() => setFitMode(fitMode === "contain" ? "cover" : "contain")}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                fitMode === "contain"
                  ? "bg-purple-950/60 border-purple-500/50 text-purple-200 shadow-sm"
                  : "bg-neutral-900 border-white/10 text-neutral-300 hover:text-white hover:border-purple-500/30"
              }`}
              title={
                fitMode === "contain"
                  ? "Showing full photo without cropping. Click to fill box."
                  : "Showing zoomed view. Click to fit full photo."
              }
            >
              {fitMode === "contain" ? (
                <>
                  <Maximize2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>Full Photo</span>
                </>
              ) : (
                <>
                  <Minimize2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>Fill View</span>
                </>
              )}
            </button>
          </div>

          {/* Large Image Preview Area - flex-shrink-0 to guarantee it never collapses */}
          <div className="relative aspect-[4/5] sm:aspect-square w-full max-h-[50vh] min-h-[290px] rounded-2xl overflow-hidden bg-neutral-950 border border-white/10 shadow-inner flex-shrink-0 flex items-center justify-center">
            {viewMode === "slider" ? (
              <BeforeAfterSlider
                beforeImage={originalImage}
                afterImage={imageUrl}
                beforeLabel="Original"
                afterLabel={definition.name}
                className="w-full h-full"
                fitMode={fitMode}
              />
            ) : (
              <img
                src={imageUrl}
                alt={definition.name}
                referrerPolicy="no-referrer"
                className={`w-full h-full ${
                  fitMode === "contain" ? "object-contain" : "object-cover object-top"
                }`}
              />
            )}
          </div>

          {/* Quick Style Switcher (Try Another Style within current session) */}
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
                Switch Style
              </span>
              <button
                onClick={onTryAnotherStyle}
                className="text-[11px] text-purple-400 hover:text-purple-300 font-medium"
              >
                View All in Grid →
              </button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {allResults.map((r) => {
                const isSelected = r.id === selectedResult.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => onSelectHairstyle(r)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                      isSelected
                        ? "bg-purple-600/30 border-purple-500 text-white"
                        : "bg-neutral-900 border-white/5 text-neutral-300 hover:bg-neutral-800"
                    }`}
                  >
                    {r.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Toast feedback */}
          {copiedToast && (
            <div className="mt-2 py-1.5 px-3 rounded-lg bg-purple-600/20 border border-purple-500/40 text-center text-xs text-purple-200 flex items-center justify-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-purple-300" />
              Link copied to clipboard!
            </div>
          )}

          {/* 4 Required Action Buttons */}
          <div className="mt-4 pt-3 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              id="btn-save-style"
              onClick={handleSave}
              className="py-3 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-white/10 active:scale-95 text-neutral-200 font-medium text-xs flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all"
            >
              <Download className="w-4 h-4 text-purple-400" />
              <span>Save</span>
            </button>

            <button
              id="btn-share-style"
              onClick={handleShare}
              className="py-3 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-white/10 active:scale-95 text-neutral-200 font-medium text-xs flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all"
            >
              <Share2 className="w-4 h-4 text-purple-400" />
              <span>Share</span>
            </button>

            <button
              id="btn-show-to-barber"
              onClick={() => setShowBarberGuide(true)}
              className="py-3 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-95 text-white font-medium text-xs flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all shadow-md shadow-purple-900/30"
            >
              <Scissors className="w-4 h-4" />
              <span>Show to Barber</span>
            </button>

            <button
              id="btn-try-another-style"
              onClick={onTryAnotherStyle}
              className="py-3 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-purple-500/30 active:scale-95 text-purple-300 font-medium text-xs flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Try Another</span>
            </button>
          </div>
        </div>
      </div>

      {showBarberGuide && (
        <BarberGuideModal
          hairstyle={definition}
          imageUrl={imageUrl}
          onClose={() => setShowBarberGuide(false)}
        />
      )}
    </>
  );
};
