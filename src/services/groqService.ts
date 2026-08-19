import { EssentialSettingsState, GeneratedMetadata, GroqApiKeyItem } from '../types/metadata';
import { auditAndSanitizeMetadata } from './complianceEngine';

const STORAGE_KEYS_KEY = 'metadatagen_groq_keys';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODELS_URL = 'https://api.groq.com/openai/v1/models';

export interface GroqModelOption {
  id: string;
  name: string;
  isVision: boolean;
}

export const POPULAR_VISION_MODELS: GroqModelOption[] = [
  { id: 'llama-3.2-90b-vision-preview', name: '⚡ Llama 3.2 90B Vision (Official Groq Vision Model)', isVision: true },
];

export class GroqService {
  private static keyIndex = 0;

  /**
   * Load stored keys from LocalStorage
   */
  static getStoredKeys(): GroqApiKeyItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS_KEY);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  /**
   * Save keys to LocalStorage
   */
  static saveKeys(keys: GroqApiKeyItem[]): void {
    localStorage.setItem(STORAGE_KEYS_KEY, JSON.stringify(keys));
  }

  /**
   * Get the next available active key in round-robin rotation
   */
  static getNextKey(): string | null {
    const keys = this.getStoredKeys().filter(k => k.key.trim().length > 0);
    if (keys.length === 0) return null;
    
    const keyItem = keys[this.keyIndex % keys.length];
    this.keyIndex = (this.keyIndex + 1) % keys.length;
    
    keyItem.usageCount = (keyItem.usageCount || 0) + 1;
    keyItem.lastUsed = Date.now();
    this.saveKeys(keys);

    return keyItem.key.trim();
  }

  /**
   * Test if an API key is valid and fetch live available models
   */
  static async testApiKeyAndGetModels(apiKey: string): Promise<{ isValid: boolean; models: string[] }> {
    try {
      const response = await fetch(GROQ_MODELS_URL, {
        headers: {
          'Authorization': `Bearer ${apiKey.trim()}`
        }
      });
      
      if (!response.ok) {
        return { isValid: false, models: [] };
      }

      const data = await response.json();
      const modelIds: string[] = (data.data || []).map((m: any) => m.id);
      return { isValid: true, models: modelIds };
    } catch (e) {
      return { isValid: false, models: [] };
    }
  }

  /**
   * Test if an API key is valid
   */
  static async testApiKey(apiKey: string): Promise<boolean> {
    const res = await this.testApiKeyAndGetModels(apiKey);
    return res.isValid;
  }

  /**
   * Resize image client-side to max 800x800 and 0.8 JPEG quality to keep payload small (<100KB)
   */
  static async convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        const src = e.target?.result as string;
        if (file.type.includes('svg')) {
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = Math.min(img.width || 800, 800);
            canvas.height = Math.min(img.height || 800, 800);
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              resolve(canvas.toDataURL('image/jpeg', 0.8));
            } else {
              resolve(src);
            }
          };
          img.onerror = () => resolve(src);
          img.src = src;
        } else {
          img.onload = () => {
            const MAX_DIM = 800;
            let width = img.width;
            let height = img.height;

            if (width > MAX_DIM || height > MAX_DIM) {
              if (width > height) {
                height = Math.round((height * MAX_DIM) / width);
                width = MAX_DIM;
              } else {
                width = Math.round((width * MAX_DIM) / height);
                height = MAX_DIM;
              }
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              resolve(canvas.toDataURL('image/jpeg', 0.8));
            } else {
              resolve(src);
            }
          };
          img.onerror = () => resolve(src);
          img.src = src;
        }
      };

      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }

  /**
   * Expand and enrich keywords to reach the requested count (e.g. 45 keywords)
   */
  static expandKeywords(
    existingKeywords: string[], 
    title: string, 
    category: string, 
    targetCount = 45
  ): string[] {
    const seen = new Set<string>();
    const cleanList: string[] = [];

    const addTag = (tag: string) => {
      const clean = tag.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, ' ');
      if (clean && clean.length >= 2 && !seen.has(clean)) {
        seen.add(clean);
        cleanList.push(clean);
      }
    };

    // 1. Add AI visual keywords first
    for (const kw of existingKeywords) {
      if (kw && typeof kw === 'string' && kw.length >= 2) {
        addTag(kw);
      }
    }

    // 2. Extract words and 2-word phrases from title
    const titleWords = title.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter((w: string) => w.length > 2);
    for (const w of titleWords) {
      addTag(w);
    }
    for (let i = 0; i < titleWords.length - 1; i++) {
      addTag(`${titleWords[i]} ${titleWords[i + 1]}`);
    }

    // 3. Domain expansion pools
    const domainPools: Record<string, string[]> = {
      'Transport': ['vehicle', 'transportation', 'modern vehicle', 'automobile', 'automotive', 'motor', 'engine', 'speed', 'journey', 'travel', 'drive', 'trip', 'express', 'traffic', 'roadway', 'highway', 'commute', 'mobility', 'transit', 'heavy duty', 'technology', 'design', 'exterior', 'metal', 'contemporary', 'studio shot', 'isolated', 'commercial', 'render', 'illustration', 'graphic', 'logistics', 'shipping', 'distribution', 'cargo', 'freight', 'carrier', 'haulage'],
      'Technology': ['digital', 'innovation', 'futuristic', 'modern', 'electronic', 'device', 'gadget', 'network', 'cyber', 'smart', 'computer', 'interface', 'software', 'hardware', 'wireless', 'connection', 'concept', 'virtual', 'automation', 'data', 'information', 'graphic', 'isolated', 'contemporary', 'technology', 'commercial', 'render', 'design'],
      'Business': ['corporate', 'finance', 'concept', 'strategy', 'professional', 'management', 'work', 'office', 'career', 'success', 'growth', 'investment', 'market', 'teamwork', 'leadership', 'commercial', 'economy', 'planning', 'business', 'modern', 'presentation', 'graphic'],
      'General': ['concept', 'commercial', 'modern', 'clean', 'isolated', 'design', 'graphic', 'element', 'creative', 'contemporary', 'detail', 'visual', 'render', 'illustration', 'background', 'object', 'symbol', 'studio', 'composition', 'texture', 'style', 'presentation', 'artistic', 'digital', 'resource', 'isolated object', 'high detail', 'commercial asset', 'stock resource', 'nobody']
    };

    const catPool = domainPools[category] || domainPools['Transport'] || domainPools['General'];
    for (const kw of catPool) {
      if (cleanList.length >= targetCount) break;
      addTag(kw);
    }

    const genPool = domainPools['General'];
    for (const kw of genPool) {
      if (cleanList.length >= targetCount) break;
      addTag(kw);
    }

    return cleanList.slice(0, targetCount);
  }

  /**
   * Extract JSON and Metadata from model output
   */
  static extractJsonFromText(rawText: string, targetKeywordCount = 45): { 
    title: string; 
    description: string; 
    keywords: string[]; 
    category: string 
  } {
    let text = (rawText || '').replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

    let parsed: any = null;

    // 1. Direct JSON parse
    try {
      parsed = JSON.parse(text);
    } catch {}

    // 2. Remove markdown code fences ```json ... ```
    if (!parsed) {
      const mdMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
      if (mdMatch && mdMatch[1]) {
        try {
          parsed = JSON.parse(mdMatch[1]);
        } catch {}
      }
    }

    // 3. Extract substring between first { and last }
    if (!parsed) {
      const firstBrace = text.indexOf('{');
      const lastBrace = text.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace > firstBrace) {
        const rawJson = text.substring(firstBrace, lastBrace + 1);
        try {
          parsed = JSON.parse(rawJson);
        } catch {
          try {
            const cleanJson = rawJson.replace(/,\s*([}\]])/g, '$1');
            parsed = JSON.parse(cleanJson);
          } catch {}
        }
      }
    }

    let title = parsed?.title || '';
    let description = parsed?.description || '';
    let keywords: string[] = Array.isArray(parsed?.keywords) ? parsed.keywords : [];
    let category = parsed?.category || 'Transport';

    // 4. Regex fallback extraction
    if (!title || title.length < 5) {
      const titleMatch = text.match(/"title"\s*:\s*"([^"]+)"/i) ||
                         text.match(/Title\s*:\s*"?([^\n\r"]+)"?/i);
      if (titleMatch && titleMatch[1]) {
        title = titleMatch[1].trim();
      }
    }

    // Clean title from prompt placeholders or wrappers
    title = title.replace(/^["'<\[(]+|["'>\])]+$/g, '')
                 .replace(/^(?:Title|Here is the title|Suggested title)\s*[:=]\s*/i, '')
                 .replace(/<[^>]*>/g, '')
                 .trim();

    // Check if keywords need extraction from raw text
    if (!keywords || keywords.length === 0) {
      const kwArrayMatch = text.match(/"keywords"\s*:\s*\[([\s\S]*?)\]/i) ||
                           text.match(/Keywords\s*:\s*\[?([^\n\r]+)\]?/i);
      if (kwArrayMatch && kwArrayMatch[1]) {
        keywords = kwArrayMatch[1].split(/[,;\n]/)
          .map((s: string) => s.replace(/["'\[\]\r\n]/g, '').trim())
          .filter((s: string) => s.length >= 2);
      }
    }

    // Filter valid keywords
    keywords = keywords.map((k: string) => k.replace(/<[^>]*>/g, '').trim()).filter((k: string) => k.length >= 2);

    // If title was still missing or invalid, generate a real visual title from keywords!
    if (!title || title.length < 5 || /^[0-9]+$/.test(title)) {
      if (keywords.length >= 3) {
        const keyWordsSample = keywords.slice(0, 4).join(' ');
        title = `${keyWordsSample.charAt(0).toUpperCase() + keyWordsSample.slice(1)} isolated on clean background`;
      } else {
        title = `Modern commercial subject isolated on studio background`;
      }
    }

    if (!description || description.length < 10) {
      description = `Commercial stock photograph featuring ${title.toLowerCase()}`;
    }

    // Expand keywords up to requested count (e.g. 45 tags)
    const finalKeywords = this.expandKeywords(keywords, title, category, targetKeywordCount);

    return {
      title: title.replace(/\.$/, '').trim(),
      description: description.trim(),
      keywords: finalKeywords,
      category: category.trim()
    };
  }

  /**
   * Generate metadata from an image using Groq Vision API
   */
  static async generateMetadataForImage(
    file: File,
    settings: EssentialSettingsState,
    providedApiKey?: string,
    retryCount = 0
  ): Promise<GeneratedMetadata> {
    const apiKey = providedApiKey || this.getNextKey();
    if (!apiKey) {
      throw new Error('No Groq API Key found. Please add a valid Groq API key in the settings.');
    }

    const base64Image = await this.convertFileToBase64(file);
    
    // Default to the official Groq Multimodal Vision Model
    let model = settings.selectedModel || 'llama-3.2-90b-vision-preview';
    if (model === 'llama-3.2-11b-vision-preview' || model === 'qwen/qwen3.6-27b') {
      model = 'llama-3.2-90b-vision-preview';
    }

    const systemPrompt = `You are an expert AI stock photography metadata engine for Adobe Stock and Shutterstock.
Analyze the image visual content carefully.
You MUST output ONLY a valid JSON object. Do not output any thought process, commentary, or markdown.`;

    const userPrompt = `Examine this image in high detail. Describe the exact visual subject, vehicle or object type, colors, angles/view, lighting, and background.

Return ONLY this JSON object:
{
  "title": "<write a specific descriptive commercial English title 40 to ${settings.titleLength || 150} characters, describing exact subject, color, angle, and background, no period at end>",
  "description": "<write a 1-2 sentence detailed visual description>",
  "keywords": ["<tag1>", "<tag2>", "<tag3>", ... list 45 distinct relevant keywords],
  "category": "Transport"
}

Requirements:
1. Title must describe what is actually visible in the image. No period at the end.
2. Provide 45 relevant stock keywords. The first 10 keywords MUST describe the main subject directly.
3. No trademarked brand names (e.g. Apple, Nike, Volvo, Ferrari, Scania).
4. No spam words (e.g. 4k, best, wallpaper, masterpiece).
${settings.includeKeywords ? `5. Include keywords: ${settings.includeKeywords}` : ''}
${settings.excludeKeywords ? `6. Exclude keywords: ${settings.excludeKeywords}` : ''}
${settings.isAiGenerated ? '7. Include keywords: generative ai, ai generated, illustration' : ''}`;

    const payload = {
      model: model,
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: userPrompt
            },
            {
              type: 'image_url',
              image_url: {
                url: base64Image
              }
            }
          ]
        }
      ],
      temperature: 0.1,
      max_tokens: 1600
    };

    let response: Response;
    try {
      response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey.trim()}`
        },
        body: JSON.stringify(payload)
      });
    } catch (networkErr: any) {
      throw new Error(`Network Error: ${networkErr.message}`);
    }

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const errorMsg = errData?.error?.message || `Groq API Error (${response.status}: ${response.statusText})`;
      
      // Handle Rate Limit 429: wait and retry with next key
      if (response.status === 429 && retryCount < 3) {
        await new Promise(r => setTimeout(r, 3500));
        const nextKey = this.getNextKey();
        return this.generateMetadataForImage(file, settings, nextKey || apiKey, retryCount + 1);
      }

      throw new Error(errorMsg);
    }

    const jsonRes = await response.json();
    const content = jsonRes.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('Received empty response from AI model.');
    }

    const parsed = this.extractJsonFromText(content, settings.keywordCount || 45);

    const report = auditAndSanitizeMetadata(
      parsed.title, 
      parsed.description, 
      parsed.keywords, 
      settings, 
      parsed.category
    );

    return {
      title: report.sanitizedTitle,
      description: report.sanitizedDescription,
      keywords: report.sanitizedKeywords,
      category: parsed.category || 'General',
      complianceScore: report.score,
      complianceWarnings: report.warnings
    };
  }
}
