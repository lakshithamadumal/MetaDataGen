import { PlatformExportConfig, StockPlatform } from '../types/metadata';

export const STOCK_PLATFORMS: Record<StockPlatform, PlatformExportConfig> = {
  'adobe-stock': {
    id: 'adobe-stock',
    name: 'Adobe Stock',
    shortName: 'St',
    iconBg: 'bg-black text-white',
    iconText: 'St',
    badge: 'Popular',
    description: 'Max 49 keywords, title max 200 chars. 5-10 top keywords prioritized.',
    titleRule: 'Descriptive sentence, no period at end, capitalized first letter.',
    keywordLimit: 49,
    headers: ['Filename', 'Title', 'Keywords', 'Category']
  },
  'shutterstock': {
    id: 'shutterstock',
    name: 'Shutterstock',
    shortName: 'SS',
    iconBg: 'bg-red-600 text-white',
    iconText: 'SS',
    badge: 'Popular',
    description: 'Max 50 keywords. Description serves as title (minimum 5 words).',
    titleRule: 'Detailed description (Who, What, Where, Why), minimum 5 words.',
    keywordLimit: 50,
    headers: ['Filename', 'Description', 'Keywords', 'Categories']
  },
  'freepik': {
    id: 'freepik',
    name: 'Freepik',
    shortName: 'Fp',
    iconBg: 'bg-blue-600 text-white',
    iconText: 'Fp',
    badge: 'Fast Review',
    description: 'Tags separated by commas or semicolons. Title max 100 characters.',
    titleRule: 'Short and clear title describing the core visual element.',
    keywordLimit: 50,
    headers: ['Filename', 'Title', 'Tags']
  },
  'vecteezy': {
    id: 'vecteezy',
    name: 'Vecteezy',
    shortName: 'V',
    iconBg: 'bg-orange-500 text-white',
    iconText: 'V',
    description: 'Includes title, description, comma keywords, and license column.',
    titleRule: 'Clear commercial title.',
    keywordLimit: 50,
    headers: ['Filename', 'Title', 'Description', 'Keywords', 'License']
  },
  '123rf': {
    id: '123rf',
    name: '123RF',
    shortName: '123RF',
    iconBg: 'bg-amber-500 text-white',
    iconText: '123',
    description: 'Description, comma separated keywords, and country format.',
    titleRule: 'Standard 123RF contributor description.',
    keywordLimit: 50,
    headers: ['Filename', 'Description', 'Keywords', 'Country']
  },
  'pond5': {
    id: 'pond5',
    name: 'Pond5',
    shortName: 'P5',
    iconBg: 'bg-zinc-800 text-white',
    iconText: 'P5',
    description: 'Title, description, keywords, city, state, country columns.',
    titleRule: 'High detail title for media search indexing.',
    keywordLimit: 50,
    headers: ['Filename', 'Title', 'Description', 'Keywords', 'City', 'State', 'Country']
  },
  'depositphotos': {
    id: 'depositphotos',
    name: 'Depositphotos',
    shortName: 'DP',
    iconBg: 'bg-slate-700 text-white',
    iconText: 'dp',
    description: 'Description and comma separated keywords.',
    titleRule: 'Descriptive title summarizing image elements.',
    keywordLimit: 50,
    headers: ['Filename', 'Description', 'Keywords']
  },
  'istock': {
    id: 'istock',
    name: 'iStock / Getty',
    shortName: 'iSt',
    iconBg: 'bg-black text-white',
    iconText: 'iSt',
    description: 'Getty ESP batch upload template.',
    titleRule: 'Concise editorial or commercial title.',
    keywordLimit: 50,
    headers: ['Filename', 'Title', 'Description', 'Keywords']
  },
  'canva': {
    id: 'canva',
    name: 'Canva',
    shortName: 'Canva',
    iconBg: 'bg-teal-500 text-white',
    iconText: 'Cv',
    description: 'Canva creator platform CSV format.',
    titleRule: 'Creative and design-oriented clear title.',
    keywordLimit: 50,
    headers: ['Filename', 'Title', 'Keywords']
  },
  'general': {
    id: 'general',
    name: 'General',
    shortName: 'All',
    iconBg: 'bg-indigo-600 text-white',
    iconText: '✦',
    badge: 'Universal',
    description: 'Master CSV containing all standard metadata columns.',
    titleRule: 'Universal standard title.',
    keywordLimit: 50,
    headers: ['Filename', 'Title', 'Description', 'Keywords', 'Category', 'ContentType']
  }
};
