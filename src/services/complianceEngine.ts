import { BANNED_SPAM_KEYWORDS, PROTECTED_TRADEMARKS } from '../data/bannedKeywords';
import { EssentialSettingsState, GeneratedMetadata, KeywordFormat } from '../types/metadata';

export interface ComplianceReport {
  sanitizedTitle: string;
  sanitizedDescription: string;
  sanitizedKeywords: string[];
  score: number; // 0 - 100
  warnings: string[];
  trademarkHits: string[];
  spamHits: string[];
}

/**
 * Validates and sanitizes metadata according to Adobe Stock, Shutterstock, and Freepik contributor guidelines.
 */
export function auditAndSanitizeMetadata(
  rawTitle: string,
  rawDescription: string,
  rawKeywords: string[],
  settings: EssentialSettingsState,
  category = 'General'
): ComplianceReport {
  const warnings: string[] = [];
  const trademarkHits: string[] = [];
  const spamHits: string[] = [];

  // --- 1. SANITIZE TITLE ---
  let title = rawTitle.trim();

  // Remove quotes around title if AI wrapped it in quotes
  title = title.replace(/^["']|["']$/g, '');

  // Adobe Stock rule: Titles should not end with a period
  if (title.endsWith('.')) {
    title = title.slice(0, -1).trim();
  }

  // Ensure first character is capitalized
  if (title.length > 0) {
    title = title.charAt(0).toUpperCase() + title.slice(1);
  }

  // Check title for banned spam words
  const titleLower = title.toLowerCase();
  for (const banned of BANNED_SPAM_KEYWORDS) {
    const regex = new RegExp(`\\b${banned}\\b`, 'gi');
    if (regex.test(titleLower)) {
      spamHits.push(banned);
      // Remove or replace banned words from title
      title = title.replace(regex, '').replace(/\s{2,}/g, ' ').trim();
      warnings.push(`Removed banned spam term "${banned}" from title.`);
    }
  }

  // Check title for protected trademarks
  for (const trademark of PROTECTED_TRADEMARKS) {
    const regex = new RegExp(`\\b${trademark}\\b`, 'gi');
    if (regex.test(titleLower)) {
      trademarkHits.push(trademark);
      warnings.push(`⚠️ Trademark detected in title: "${trademark}". Stock agencies reject commercial assets with brand names.`);
    }
  }

  // Enforce title length
  const maxTitleLen = Math.min(settings.titleLength || 150, 200);
  if (title.length > maxTitleLen) {
    title = title.substring(0, maxTitleLen).trim();
    // avoid cutting off midway through a word
    const lastSpace = title.lastIndexOf(' ');
    if (lastSpace > 20) {
      title = title.substring(0, lastSpace);
    }
  }

  if (title.length < 20) {
    warnings.push('Title is short. Microstock agencies recommend descriptive titles of at least 5-7 words.');
  }

  // --- 2. SANITIZE DESCRIPTION ---
  let description = (rawDescription || rawTitle).trim();
  if (description.endsWith('.')) {
    description = description.slice(0, -1).trim();
  }
  if (description.length > 0) {
    description = description.charAt(0).toUpperCase() + description.slice(1);
  }

  // --- 3. SANITIZE KEYWORDS ---
  const seen = new Set<string>();
  let cleanKeywords: string[] = [];

  // Parse user include / exclude keywords
  const userIncludes = settings.includeKeywords
    ? settings.includeKeywords.split(/[,;\n]/).map(k => k.trim().toLowerCase()).filter(Boolean)
    : [];

  const userExcludes = settings.excludeKeywords
    ? settings.excludeKeywords.split(/[,;\n]/).map(k => k.trim().toLowerCase()).filter(Boolean)
    : [];

  const excludeSet = new Set(userExcludes);

  // Combine raw keywords with user mandatory includes
  const candidateKeywords = [...userIncludes, ...rawKeywords];

  for (const rawKw of candidateKeywords) {
    if (!rawKw) continue;
    let kw = rawKw.toLowerCase().trim();

    // Remove punctuation
    kw = kw.replace(/^[^a-z0-9]+|[^a-z0-9]+$/gi, '');
    if (!kw || kw.length < 2) continue;

    // Check if in user excludes
    if (excludeSet.has(kw)) continue;

    // Check against Banned Spam list
    if (BANNED_SPAM_KEYWORDS.has(kw)) {
      spamHits.push(kw);
      continue;
    }

    // Check against Protected Trademarks
    let isTrademark = false;
    for (const tm of PROTECTED_TRADEMARKS) {
      if (kw === tm || kw.startsWith(tm + ' ') || kw.endsWith(' ' + tm)) {
        trademarkHits.push(tm);
        isTrademark = true;
        break;
      }
    }
    if (isTrademark && settings.strictGuidelines) {
      warnings.push(`Excluded trademark term "${kw}".`);
      continue;
    }

    // Format single vs double if strictly requested
    if (settings.keywordFormat === 'single' && kw.includes(' ')) {
      // Split multi-word into singles
      const parts = kw.split(' ');
      for (const p of parts) {
        const cleanP = p.trim();
        if (cleanP.length >= 2 && !BANNED_SPAM_KEYWORDS.has(cleanP) && !seen.has(cleanP)) {
          seen.add(cleanP);
          cleanKeywords.push(cleanP);
        }
      }
      continue;
    }

    if (!seen.has(kw)) {
      seen.add(kw);
      cleanKeywords.push(kw);
    }
  }

  // If AI-generated is flagged, append standard compliance tags
  if (settings.isAiGenerated) {
    const aiTags = ['generative ai', 'ai generated', 'artificial intelligence'];
    for (const tag of aiTags) {
      if (!seen.has(tag)) {
        seen.add(tag);
        cleanKeywords.push(tag);
      }
    }
  }

  // Truncate to target keyword count (max 49/50 for Adobe Stock)
  const maxKeywords = Math.min(settings.keywordCount || 45, 49);
  if (cleanKeywords.length > maxKeywords) {
    cleanKeywords = cleanKeywords.slice(0, maxKeywords);
  }

  // --- 4. CALCULATE COMPLIANCE SCORE ---
  let score = 100;
  if (trademarkHits.length > 0) score -= 35;
  if (spamHits.length > 0) score -= 15;
  if (cleanKeywords.length < 15) score -= 20;
  if (cleanKeywords.length > 49) score -= 15;
  if (title.length < 25) score -= 10;
  if (score < 0) score = 0;

  return {
    sanitizedTitle: title,
    sanitizedDescription: description,
    sanitizedKeywords: cleanKeywords,
    score,
    warnings,
    trademarkHits: Array.from(new Set(trademarkHits)),
    spamHits: Array.from(new Set(spamHits))
  };
}
