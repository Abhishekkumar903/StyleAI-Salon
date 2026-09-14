import React, { useRef } from "react";
import { Camera, Image as ImageIcon, Sparkles, ShieldCheck } from "lucide-react";
import { SAMPLE_PORTRAITS } from "../data/hairstyles";

interface HomeScreenProps {
  onPhotoSelected: (base64Image: string) => void;
  onOpenLiveCamera: () => void;
  isAiConfigured?: boolean;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onPhotoSelected,
  onOpenLiveCamera,
  isAiConfigured = true,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        onPhotoSelected(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSampleSelect = (url: string) => {
    // Convert external URL or load directly
    // Create an Image to convert to data URL so it's consistent
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
        onPhotoSelected(dataUrl);
      } else {
        onPhotoSelected(url);
      }
    };
    img.onerror = () => {
      // Fallback
      onPhotoSelected(url);
    };
    img.src = url;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-8 max-w-xl mx-auto text-center">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Main Hero Card */}
      <div className="w-full bg-neutral-950/70 border border-purple-900/30 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        {/* Glow ambient background element */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Small Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/30 text-xs font-semibold text-purple-300 mb-5 shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>StyleAI Salon</span>
        </div>

        {/* Main Title & Tagline as required */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
          Try Different Hairstyles Before You Cut.
        </h1>

        {/* Short text as required */}
        <p className="text-base text-neutral-300 max-w-md mx-auto mb-8 leading-relaxed">
          Upload your photo and see how different hairstyles could look on you.
        </p>

        {/* Primary Action Button: Large "📷 Upload Your Photo" */}
        <div className="space-y-3 mb-8">
          <button
            id="btn-upload-photo-main"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-4 px-6 rounded-2xl bg-purple-600 hover:bg-purple-500 active:scale-[0.99] text-white font-bold text-base sm:text-lg flex items-center justify-center gap-3 transition-all shadow-[0_0_30px_rgba(168,85,247,0.35)]"
          >
            <Camera className="w-6 h-6" />
            <span>📷 Upload Your Photo</span>
          </button>

          {/* Secondary Action: Live Camera Take Photo */}
          <button
            id="btn-take-photo-camera"
            onClick={onOpenLiveCamera}
            className="w-full py-3 px-6 rounded-2xl bg-neutral-900 hover:bg-neutral-800 active:scale-[0.99] border border-white/10 text-neutral-200 font-semibold text-sm flex items-center justify-center gap-2.5 transition-all"
          >
            <Camera className="w-4 h-4 text-purple-400" />
            <span>Take Photo with Camera</span>
          </button>
        </div>

        {/* 6 Styles Included Preview Chips */}
        <div className="pt-4 border-t border-white/10">
          <p className="text-xs uppercase tracking-wider text-neutral-400 font-medium mb-3">
            6 Styles Generated on Your Face
          </p>
          <div className="flex flex-wrap justify-center gap-1.5 text-xs text-neutral-300">
            <span className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-white/5">
              ✂️ Textured Crop
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-white/5">
              ✂️ Low Fade
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-white/5">
              ✂️ Classic Side Part
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-white/5">
              ✂️ Modern Quiff
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-white/5">
              ✂️ Curly Top
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-white/5">
              ✂️ Buzz Cut
            </span>
          </div>
        </div>
      </div>

      {/* Quick Test Demo Portraits */}
      <div className="w-full mt-6 p-4 rounded-2xl bg-neutral-950/40 border border-white/5">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-medium text-neutral-400">
            Or test with a sample photo:
          </span>
          <span className="text-[11px] text-purple-400 flex items-center gap-1">
            <ImageIcon className="w-3 h-3" /> 1-click test
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {SAMPLE_PORTRAITS.map((sample) => (
            <button
              key={sample.id}
              onClick={() => handleSampleSelect(sample.url)}
              className="group relative aspect-square rounded-xl overflow-hidden border border-white/10 hover:border-purple-500 transition-all hover:scale-[1.03]"
            >
              <img
                src={sample.url}
                alt={sample.label}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1.5">
                <span className="text-[10px] text-neutral-200 font-medium truncate w-full text-center">
                  {sample.label}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Guarantee note */}
      <div className="mt-6 flex items-center gap-2 text-xs text-neutral-400">
        <ShieldCheck className="w-4 h-4 text-purple-400 flex-shrink-0" />
        <span>Keeps your exact face & lighting • Changes only the hairstyle</span>
      </div>

      {!isAiConfigured && (
        <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs">
          LightX API is not configured. Please add LIGHTX_API_KEY to the server environment.
        </div>
      )}
    </div>
  );
};
