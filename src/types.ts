export interface HairstyleDefinition {
  id: string;
  name: string;
  shortName: string;
  category: string;
  description: string;
  barberGuide: {
    sides: string;
    top: string;
    hairline: string;
    products: string;
  };
}

export type GenerationStatus = "idle" | "generating" | "completed" | "failed";

export interface HairstyleResult {
  id: string;
  name: string;
  shortName: string;
  imageUrl?: string;
  status: GenerationStatus;
  error?: string;
}

export type AppStep = "home" | "upload_preview" | "processing" | "results";
