import React from "react";
import { Scissors, X, Sparkles, Check } from "lucide-react";
import { HairstyleDefinition } from "../types";

interface BarberGuideModalProps {
  hairstyle: HairstyleDefinition;
  imageUrl: string;
  onClose: () => void;
}

export const BarberGuideModal: React.FC<BarberGuideModalProps> = ({
  hairstyle,
  imageUrl,
  onClose,
}) => {
  return (
    <div
      id="barber-guide-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto"
    >
      <div className="relative w-full max-w-lg bg-neutral-950 border border-purple-500/30 rounded-3xl p-6 shadow-2xl text-white my-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider text-purple-400 font-semibold">
                  Barber Consultation Card
                </span>
              </div>
              <h2 className="text-xl font-bold text-white">{hairstyle.name}</h2>
            </div>
          </div>
          <button
            id="btn-close-barber-guide"
            onClick={onClose}
            className="p-2 rounded-full bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Big visual card for the barber - full uncropped view */}
        <div className="relative aspect-[4/5] sm:aspect-square max-h-[46vh] w-full rounded-2xl overflow-hidden bg-neutral-950 border border-white/10 mb-5 shadow-lg flex items-center justify-center">
          <img
            src={imageUrl}
            alt={hairstyle.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain"
          />
          <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-black/80 backdrop-blur-md border border-white/10 pointer-events-none">
            <p className="text-xs text-neutral-300 italic">
              "{hairstyle.description}"
            </p>
          </div>
        </div>

        {/* Technical Specs for Barber */}
        <div className="space-y-3 mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Exact Haircut Specifications
          </h3>

          <div className="grid grid-cols-1 gap-2.5 text-sm">
            <div className="p-3 rounded-xl bg-neutral-900/90 border border-white/5">
              <span className="text-xs text-neutral-400 block mb-0.5 font-medium">
                Sides & Temple
              </span>
              <p className="text-neutral-200 font-medium">{hairstyle.barberGuide.sides}</p>
            </div>

            <div className="p-3 rounded-xl bg-neutral-900/90 border border-white/5">
              <span className="text-xs text-neutral-400 block mb-0.5 font-medium">
                Top & Crown
              </span>
              <p className="text-neutral-200 font-medium">{hairstyle.barberGuide.top}</p>
            </div>

            <div className="p-3 rounded-xl bg-neutral-900/90 border border-white/5">
              <span className="text-xs text-neutral-400 block mb-0.5 font-medium">
                Hairline & Perimeter
              </span>
              <p className="text-neutral-200 font-medium">{hairstyle.barberGuide.hairline}</p>
            </div>

            <div className="p-3 rounded-xl bg-neutral-900/90 border border-white/5">
              <span className="text-xs text-neutral-400 block mb-0.5 font-medium">
                Recommended Finish
              </span>
              <p className="text-purple-300 font-medium">{hairstyle.barberGuide.products}</p>
            </div>
          </div>
        </div>

        {/* Close button */}
        <button
          id="btn-done-barber"
          onClick={onClose}
          className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-[0.99] text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-900/30"
        >
          <Check className="w-4 h-4" />
          Done Showing Barber
        </button>
      </div>
    </div>
  );
};
