import { HairstyleDefinition } from "../types";

export const INITIAL_HAIRSTYLES: HairstyleDefinition[] = [
  {
    id: "textured-crop",
    name: "Textured Crop",
    shortName: "Crop",
    category: "Short & Modern",
    description: "Choppy texture on top with a clean high or mid skin fade and short, defined fringe.",
    barberGuide: {
      sides: "Mid skin fade blended smoothly into the temple area",
      top: "Point cut for heavy separation and texture, 1.5 - 2 inches",
      hairline: "Micro-textured or straight blunt fringe",
      products: "Matte clay, sea salt spray, or styling powder",
    },
  },
  {
    id: "low-fade",
    name: "Low Fade",
    shortName: "Low Fade",
    category: "Taper & Fade",
    description: "Gradual taper starting just around the ears and neckline, keeping bulk and flow on top.",
    barberGuide: {
      sides: "Low taper fade starting 0.5 inches above ears and base of neck",
      top: "Keep 2.5 - 3.5 inches with natural flow and soft layers",
      hairline: "Crisp natural line-up around the temples and beard transition",
      products: "Light paste or moisturizing cream",
    },
  },
  {
    id: "side-part",
    name: "Classic Side Part",
    shortName: "Side Part",
    category: "Timeless & Professional",
    description: "Sleek, sophisticated combed side parting with clean tapered sides and natural shine.",
    barberGuide: {
      sides: "#2 to #4 scissor-over-comb taper",
      top: "3 - 4 inches parted cleanly on the natural parietal ridge",
      hairline: "Natural clean edge, soft tapered neck",
      products: "Medium hold pomade or grooming tonic with low-to-medium shine",
    },
  },
  {
    id: "quiff",
    name: "Modern Quiff",
    shortName: "Quiff",
    category: "Volume & Lift",
    description: "High volume brushed-up front with tapered or faded sides for strong structure.",
    barberGuide: {
      sides: "#1.5 to #3 fade or low drop fade",
      top: "Graduated from 4 inches at the front fringe down to 2.5 inches at crown",
      hairline: "Clean temple blend with maximum frontal upward brush",
      products: "Blow-dry primer, pre-styler, followed by high-hold matte paste",
    },
  },
  {
    id: "curly-top",
    name: "Curly Top",
    shortName: "Curly Top",
    category: "Texture & Volume",
    description: "Accentuates natural curls and ringlets on top with tight, crisp faded sides.",
    barberGuide: {
      sides: "Drop fade or high taper to accentuate top volume",
      top: "Layered curl shaping using freehand cut, preserving bounce",
      hairline: "Sharp edge-up at temples, soft natural curl hairline",
      products: "Leave-in curl activator, curl defining smoothie, and hair oil",
    },
  },
  {
    id: "buzz-cut",
    name: "Buzz Cut",
    shortName: "Buzz Cut",
    category: "Ultra-Clean & Minimal",
    description: "Uniform, masculine military-grade clipper cut with clean line-up.",
    barberGuide: {
      sides: "#1.5 to #2 guard, or skin-faded temples",
      top: "#2 or #3 guard uniform length across crown and vertex",
      hairline: "Sharp razor lineup across frontal forehead and temples",
      products: "Scalp moisturizer with SPF, light beard oil",
    },
  },
];

// Sample portrait URLs for quick testing if user does not have a photo immediately ready
export const SAMPLE_PORTRAITS = [
  {
    id: "sample-1",
    label: "Man (Short Hair)",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "sample-2",
    label: "Man (Casual Studio)",
    url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "sample-3",
    label: "Man (Outdoor Light)",
    url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&auto=format&fit=crop&q=80",
  },
];
