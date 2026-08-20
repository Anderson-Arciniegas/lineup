import { Injectable } from '@angular/core';
import { environment } from '@lineup/envs';
import { from, Observable } from 'rxjs';
import { GenerateProductDescriptionInput } from './generate-product-description.interface';
import { PRODUCT_DESCRIPTION_SYSTEM_INSTRUCTION } from './product-description.prompt';

/** Minimal inline image part for Gemini generateContent (avoids static SDK import). */
interface InlineImagePart {
  inlineData: {
    mimeType: string;
    data: string;
  };
}

/**
 * Client-side Gemini integration for product description generation.
 * Uses environment.google.GEMINI_API_KEY (exposed in the browser bundle).
 * The `@google/genai` SDK is loaded on demand to keep it out of the initial bundle.
 */
@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private readonly apiKey = environment.google.GEMINI_API_KEY;
  private readonly model = environment.google.GEMINI_MODEL;

  /**
   * Generates an HTML sales description from title, subtitle, image URLs, and an optional user prompt.
   */
  generateProductDescription(
    input: GenerateProductDescriptionInput,
  ): Observable<string> {
    return from(this.generateProductDescriptionAsync(input));
  }

  private async generateProductDescriptionAsync(
    input: GenerateProductDescriptionInput,
  ): Promise<string> {
    const title = input.title?.trim() ?? '';
    if (!title) {
      throw new Error('TITLE_REQUIRED');
    }
    if (!this.apiKey || this.apiKey === 'YOUR_GEMINI_KEY') {
      throw new Error('GEMINI_API_KEY_NOT_SET');
    }
    if (!this.model) {
      throw new Error('GEMINI_MODEL_NOT_SET');
    }

    const { GoogleGenAI } = await import('@google/genai');
    const client = new GoogleGenAI({ apiKey: this.apiKey });

    const imageUrls = (input.imageUrls ?? []).filter(Boolean);
    const { imageParts, failedUrls } = await this.buildImageParts(imageUrls);
    const textPrompt = this.buildUserTextPrompt(input, failedUrls);
    const contents: Array<string | InlineImagePart> = [
      ...imageParts,
      textPrompt,
    ];

    const response = await client.models.generateContent({
      model: this.model,
      contents,
      config: {
        systemInstruction: PRODUCT_DESCRIPTION_SYSTEM_INSTRUCTION,
        temperature: 0.7,
        maxOutputTokens: 4096,
      },
    });

    const text = this.stripCodeFences(response.text ?? '').trim();
    if (!text) {
      throw new Error('GEMINI_EMPTY_RESPONSE');
    }
    return text;
  }

  private buildUserTextPrompt(
    input: GenerateProductDescriptionInput,
    failedUrls: string[],
  ): string {
    const lines: string[] = [
      'Generate a sales description for this product.',
      `Title: ${input.title.trim()}`,
    ];

    const subtitle = input.subtitle?.trim();
    if (subtitle) {
      lines.push(`Subtitle: ${subtitle}`);
    }

    const userPrompt = input.userPrompt?.trim();
    if (userPrompt) {
      lines.push(`Additional instructions from the seller: ${userPrompt}`);
    }

    if (failedUrls.length > 0) {
      lines.push(
        'The following product image URLs could not be loaded as binary parts; use them as visual references if possible:',
        ...failedUrls.map((url) => `- ${url}`),
      );
    }

    if ((input.imageUrls?.length ?? 0) === 0) {
      lines.push('No product images were provided.');
    }

    return lines.join('\n');
  }

  private async buildImageParts(
    imageUrls: string[],
  ): Promise<{ imageParts: InlineImagePart[]; failedUrls: string[] }> {
    const imageParts: InlineImagePart[] = [];
    const failedUrls: string[] = [];

    for (const url of imageUrls) {
      try {
        const part = await this.urlToInlinePart(url);
        imageParts.push(part);
      } catch {
        failedUrls.push(url);
      }
    }

    return { imageParts, failedUrls };
  }

  private async urlToInlinePart(url: string): Promise<InlineImagePart> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }
    const blob = await response.blob();
    const mimeType = blob.type || this.guessMimeType(url) || 'image/jpeg';
    const data = await this.blobToBase64(blob);
    return {
      inlineData: {
        mimeType,
        data,
      },
    };
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result;
        if (typeof result !== 'string') {
          reject(new Error('Failed to read image as base64'));
          return;
        }
        const commaIndex = result.indexOf(',');
        resolve(commaIndex >= 0 ? result.slice(commaIndex + 1) : result);
      };
      reader.onerror = () =>
        reject(reader.error ?? new Error('FileReader error'));
      reader.readAsDataURL(blob);
    });
  }

  private guessMimeType(url: string): string | null {
    const path = url.split('?')[0]?.toLowerCase() ?? '';
    if (path.endsWith('.png')) return 'image/png';
    if (path.endsWith('.webp')) return 'image/webp';
    if (path.endsWith('.gif')) return 'image/gif';
    if (path.endsWith('.jpg') || path.endsWith('.jpeg')) return 'image/jpeg';
    return null;
  }

  private stripCodeFences(text: string): string {
    const trimmed = text.trim();
    const fenced = trimmed.match(/^```(?:html)?\s*([\s\S]*?)\s*```$/i);
    return fenced?.[1]?.trim() ?? trimmed;
  }
}
