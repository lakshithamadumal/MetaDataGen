import { EssentialSettingsState, GeneratedMetadata, GroqApiKeyItem } from '../types/metadata';
import { auditAndSanitizeMetadata } from './complianceEngine';

const STORAGE_KEYS_KEY = 'metadatagen_groq_keys';
const STORAGE_MODEL_KEY = 'metadatagen_selected_model';

export type AIProvider = 'orcarouter' | 'gemini' | 'groq' | 'openai';

export interface ProviderInfo {
  id: AIProvider;
  name: string;
  badge: string;
  icon: string;
  defaultModel: string;
}

export const PROVIDERS: Record<AIProvider, ProviderInfo> = {
  orcarouter: {
    id: 'orcarouter',
    name: 'OrcaRouter',
    badge: '🐬 OrcaRouter (Recommended)',
    icon: '🐬',
    defaultModel: 'orcarouter/fusion-flash'
  },
  gemini: {
    id: 'gemini',
    name: 'Google Gemini',
    badge: '✨ Google Gemini (Free)',
    icon: '✨',
    defaultModel: 'gemini-1.5-flash'
  },
  groq: {
    id: 'groq',
    name: 'Groq Cloud',
    badge: '⚡ Groq Cloud API',
    icon: '⚡',
    defaultModel: 'llama-3.3-70b-versatile'
  },
  openai: {
    id: 'openai',
    name: 'OpenAI / Other',
    badge: '🤖 OpenAI Compatible',
    icon: '🤖',
    defaultModel: 'gpt-4o-mini'
  }
};

export class AIService {
  private static keyIndex = 0;

  static getStoredModel(): string {
    const saved = localStorage.getItem(STORAGE_MODEL_KEY);
    if (saved) return saved;

    // Detect from first active key
    const keys = this.getStoredKeys();
    if (keys.length > 0) {
      const provider = this.detectProvider(keys[0].key);
      return PROVIDERS[provider].defaultModel;
    }
    return 'orcarouter/fusion-flash';
  }

  static saveStoredModel(model: string): void {
    if (model) {
      localStorage.setItem(STORAGE_MODEL_KEY, model);
    }
  }

  /**
   * Auto-detect provider from API key format
   */
  static detectProvider(key: string): AIProvider {
    const k = key.trim();
    if (k.startsWith('sk-orca-')) return 'orcarouter';
    if (k.startsWith('AIza')) return 'gemini';
    if (k.startsWith('gsk_')) return 'groq';
    return 'orcarouter';
  }

  static getStoredKeys(): GroqApiKeyItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS_KEY);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  static saveKeys(keys: GroqApiKeyItem[]): void {
    localStorage.setItem(STORAGE_KEYS_KEY, JSON.stringify(keys));
  }

  static getNextKey(): { key: string; provider: AIProvider } | null {
    const keys = this.getStoredKeys().filter(k => k.key.trim().length > 0);
    if (keys.length === 0) return null;
    
    const keyItem = keys[this.keyIndex % keys.length];
    this.keyIndex = (this.keyIndex + 1) % keys.length;
    
    keyItem.usageCount = (keyItem.usageCount || 0) + 1;
    keyItem.lastUsed = Date.now();
    this.saveKeys(keys);

    const provider = this.detectProvider(keyItem.key);
    return { key: keyItem.key.trim(), provider };
  }

  /**
   * Test API Key and live-fetch supported models
   */
  static async testApiKeyAndFetchModels(apiKey: string): Promise<{ 
    isValid: boolean; 
    provider: AIProvider; 
    models: string[]; 
    suggestedModel: string 
  }> {
    const cleanKey = apiKey.trim();
    const provider = this.detectProvider(cleanKey);

    if (provider === 'orcarouter') {
      try {
        let res = await fetch('https://api.orcarouter.ai/v1/models', {
          headers: { 'Authorization': `Bearer ${cleanKey}` }
        });
        if (!res.ok) {
          res = await fetch('https://api.orcarouter.com/v1/models', {
            headers: { 'Authorization': `Bearer ${cleanKey}` }
          });
        }

        if (res.ok) {
          const data = await res.json();
          const models: string[] = (data.data || []).map((m: any) => m.id);
          
          // Auto-select best vision model from OrcaRouter
          const visionModel = models.find(m => 
            m === 'orcarouter/fusion-flash' ||
            m.includes('fusion-flash') ||
            m.includes('gemini-2.0-flash') || 
            m.includes('gpt-4o-mini') ||
            m.includes('flash')
          ) || models[0] || 'orcarouter/fusion-flash';

          return { isValid: true, provider, models, suggestedModel: visionModel };
        }
      } catch {}
      return { isValid: true, provider, models: ['orcarouter/fusion-flash', 'google/gemini-2.0-flash', 'openai/gpt-4o-mini'], suggestedModel: 'orcarouter/fusion-flash' };
    }

    if (provider === 'gemini') {
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${cleanKey}`);
        if (!res.ok) return { isValid: false, provider, models: [], suggestedModel: 'gemini-1.5-flash' };
        const data = await res.json();
        const models: string[] = (data.models || [])
          .map((m: any) => m.name.replace('models/', ''))
          .filter((m: string) => m.includes('flash') || m.includes('pro'));
        const suggested = models.find(m => m.includes('gemini-1.5-flash') || m.includes('gemini-2.0-flash')) || 'gemini-1.5-flash';
        return { isValid: true, provider, models, suggestedModel: suggested };
      } catch {
        return { isValid: false, provider, models: [], suggestedModel: 'gemini-1.5-flash' };
      }
    }

    // Groq
    try {
      const res = await fetch('https://api.groq.com/openai/v1/models', {
        headers: { 'Authorization': `Bearer ${cleanKey}` }
      });
      if (!res.ok) return { isValid: false, provider, models: [], suggestedModel: 'llama-3.3-70b-versatile' };
      const data = await res.json();
      const models: string[] = (data.data || []).map((m: any) => m.id);
      return { isValid: true, provider, models, suggestedModel: models[0] || 'llama-3.3-70b-versatile' };
    } catch {
      return { isValid: false, provider, models: [], suggestedModel: 'llama-3.3-70b-versatile' };
    }
  }

  /**
   * Convert file to clean base64 data
   */
  static async convertFileToBase64(file: File): Promise<{ fullDataUrl: string; rawBase64: string }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        const src = e.target?.result as string;
        img.onload = () => {
          const MAX_DIM = 1024;
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
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
            const raw = dataUrl.split(',')[1];
            resolve({ fullDataUrl: dataUrl, rawBase64: raw });
          } else {
            const raw = src.split(',')[1] || src;
            resolve({ fullDataUrl: src, rawBase64: raw });
          }
        };
        img.onerror = () => {
          const raw = src.split(',')[1] || src;
          resolve({ fullDataUrl: src, rawBase64: raw });
        };
        img.src = src;
      };

      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }

  /**
   * Expand keywords to ensure target count (e.g. 45 keywords)
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

    for (const kw of existingKeywords) {
      if (kw && typeof kw === 'string' && kw.length >= 2) {
        addTag(kw);
      }
    }

    const titleWords = title.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 2);
    for (const w of titleWords) {
      addTag(w);
    }
    for (let i = 0; i < titleWords.length - 1; i++) {
      addTag(`${titleWords[i]} ${titleWords[i + 1]}`);
    }

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
   * Extract clean metadata from AI response text
   */
  static extractJsonFromText(rawText: string, targetKeywordCount = 45): { 
    title: string; 
    description: string; 
    keywords: string[]; 
    category: string 
  } {
    let text = (rawText || '').replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

    let parsed: any = null;

    try {
      parsed = JSON.parse(text);
    } catch {}

    if (!parsed) {
      const mdMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
      if (mdMatch && mdMatch[1]) {
        try {
          parsed = JSON.parse(mdMatch[1]);
        } catch {}
      }
    }

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

    if (!title || title.length < 5) {
      const titleMatch = text.match(/"title"\s*:\s*"([^"]+)"/i) ||
                         text.match(/Title\s*:\s*"?([^\n\r"]+)"?/i);
      if (titleMatch && titleMatch[1]) {
        title = titleMatch[1].trim();
      }
    }

    title = title.replace(/^["'<\[(]+|["'>\])]+$/g, '')
                 .replace(/^(?:Title|Here is the title|Suggested title)\s*[:=]\s*/i, '')
                 .replace(/<[^>]*>/g, '')
                 .trim();

    if (!keywords || keywords.length === 0) {
      const kwArrayMatch = text.match(/"keywords"\s*:\s*\[([\s\S]*?)\]/i) ||
                           text.match(/Keywords\s*:\s*\[?([^\n\r]+)\]?/i);
      if (kwArrayMatch && kwArrayMatch[1]) {
        keywords = kwArrayMatch[1].split(/[,;\n]/)
          .map((s: string) => s.replace(/["'\[\]\r\n]/g, '').trim())
          .filter((s: string) => s.length >= 2);
      }
    }

    keywords = keywords.map((k: string) => k.replace(/<[^>]*>/g, '').trim()).filter((k: string) => k.length >= 2);

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

    const finalKeywords = this.expandKeywords(keywords, title, category, targetKeywordCount);

    return {
      title: title.replace(/\.$/, '').trim(),
      description: description.trim(),
      keywords: finalKeywords,
      category: category.trim()
    };
  }

  /**
   * Main generation function supporting OrcaRouter, Gemini Vision & Groq
   */
  static async generateMetadataForImage(
    file: File,
    settings: EssentialSettingsState,
    providedApiKey?: string,
    retryCount = 0
  ): Promise<GeneratedMetadata> {
    const keyInfo = providedApiKey ? { key: providedApiKey, provider: this.detectProvider(providedApiKey) } : this.getNextKey();
    if (!keyInfo) {
      throw new Error('No API Key found. Please paste your OrcaRouter or Gemini API key in settings.');
    }

    const { key, provider } = keyInfo;
    const { fullDataUrl, rawBase64 } = await this.convertFileToBase64(file);

    const promptText = `Analyze this image in high detail as a professional stock photographer. Identify the exact subject (e.g. truck, sports car, yacht, person, architecture), colors, angle, view, lighting, and background.

Generate metadata for Adobe Stock and Shutterstock in this exact JSON format:
{
  "title": "A natural descriptive English commercial title describing the exact subject, color, view angle, and background (40 to ${settings.titleLength || 150} characters, no period at end)",
  "description": "Comprehensive visual description answering what is seen in the image",
  "keywords": ["primary subject", "secondary subject", "color", "angle", "view", "material", "background", "concept", "transport", "modern", "design", "isolated", "commercial", "studio", "metal", "vehicle", "exterior", "clean", "technology", "speed", "travel", "logistics", "shipping", "cargo", "carrier", "highway", "road", "drive", "transit", "contemporary", "sleek", "reflection", "graphic", "automotive", "lifestyle"],
  "category": "Transport"
}

RULES:
1. Title must accurately describe what is actually in the image. Do NOT end with a period.
2. Provide at least 45 relevant stock keywords. The first 10 keywords MUST describe the main subject directly.
3. NO trademarked brand names (e.g. Apple, Nike, Volvo, Ferrari, Scania, BMW).
4. NO spam words (e.g. 4k, best, wallpaper, masterpiece).
${settings.includeKeywords ? `5. Include keywords: ${settings.includeKeywords}` : ''}
${settings.excludeKeywords ? `6. Exclude keywords: ${settings.excludeKeywords}` : ''}
${settings.isAiGenerated ? '7. Include keywords: generative ai, ai generated, illustration' : ''}`;

    let responseText = '';

    // --- 1. ORCAROUTER (sk-orca-...) ---
    if (provider === 'orcarouter') {
      let model = settings.selectedModel || 'orcarouter/fusion-flash';
      if (model.includes('gemini-2.0-flash (Recommended)')) {
        model = 'orcarouter/fusion-flash';
      }
      const endpoint = 'https://api.orcarouter.ai/v1/chat/completions';

      const payload = {
        model: model,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: promptText },
              { type: 'image_url', image_url: { url: fullDataUrl } }
            ]
          }
        ],
        temperature: 0.1,
        max_tokens: 1600
      };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key.trim()}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const msg = errData?.error?.message || `OrcaRouter API Error (${res.status})`;
        throw new Error(msg);
      }

      const jsonRes = await res.json();
      responseText = jsonRes.choices?.[0]?.message?.content || '';
    }
    // --- 2. GOOGLE GEMINI (AIza...) ---
    else if (provider === 'gemini') {
      const model = settings.selectedModel.includes('gemini') ? settings.selectedModel : 'gemini-1.5-flash';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key.trim()}`;

      const payload = {
        contents: [
          {
            parts: [
              { text: promptText },
              {
                inline_data: {
                  mime_type: 'image/jpeg',
                  data: rawBase64
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          response_mime_type: 'application/json'
        }
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const msg = errData?.error?.message || `Gemini API Error (${res.status})`;
        throw new Error(msg);
      }

      const jsonRes = await res.json();
      responseText = jsonRes.candidates?.[0]?.content?.parts?.[0]?.text || '';
    }
    // --- 3. GROQ (gsk_...) ---
    else {
      let model = settings.selectedModel;
      if (model.includes('gemini') || model.includes('decommissioned') || model.includes('fusion')) {
        model = 'llama-3.3-70b-versatile';
      }

      const payload = {
        model: model,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: promptText },
              { type: 'image_url', image_url: { url: fullDataUrl } }
            ]
          }
        ],
        temperature: 0.1,
        max_tokens: 1600
      };

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key.trim()}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const msg = errData?.error?.message || `Groq API Error (${res.status})`;
        if (res.status === 429 && retryCount < 3) {
          await new Promise(r => setTimeout(r, 3500));
          const next = this.getNextKey();
          return this.generateMetadataForImage(file, settings, next?.key || key, retryCount + 1);
        }
        throw new Error(msg);
      }

      const jsonRes = await res.json();
      responseText = jsonRes.choices?.[0]?.message?.content || '';
    }

    const parsed = this.extractJsonFromText(responseText, settings.keywordCount || 45);

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
