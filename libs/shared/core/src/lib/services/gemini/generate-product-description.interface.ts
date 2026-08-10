/** Input for generating a product sales description with Gemini. */
export interface GenerateProductDescriptionInput {
  title: string;
  subtitle?: string;
  imageUrls: string[];
  userPrompt?: string;
}
