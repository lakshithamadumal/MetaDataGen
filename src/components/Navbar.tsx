import React from 'react';
import { Shield, HelpCircle, Key, Zap } from 'lucide-react';
import { GroqApiKeyItem } from '../types/metadata';
import { AIService, PROVIDERS } from '../services/aiService';
import { AppLogo } from './Icons';

interface NavbarProps {
  keys: GroqApiKeyItem[];
  onOpenApiKeySettings: () => void;
  onOpenGuidelines: () => void;
  onOpenFaq: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  keys,
  onOpenApiKeySettings,
  onOpenGuidelines,
  onOpenFaq
}) => {
  // Determine active provider name
  const activeKey = keys.find(k => k.isValid !== false)?.key || '';
  const activeProvider = activeKey ? AIService.detectProvider(activeKey) : null;
  const activeProviderName = activeProvider ? PROVIDERS[activeProvider]?.name : null;

  return (
    <header className="bg-white/95 backdrop-blur-md sticky top-0 z-40 border-b border-rose-100 shadow-2xs py-4 sm:py-5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Logo & Version */}
        <div className="flex items-center space-x-3.5 sm:space-x-4">
          <AppLogo className="w-12 h-12 shadow-md shadow-rose-500/20 flex-shrink-0" />

          <div className="flex flex-col">
            <div className="flex items-center space-x-2.5">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                MetaData<span className="text-brand-gradient">Gen</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-2xs">
                v1.0.0
              </span>
            </div>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline mt-0.5">
              Free AI Stock Metadata Engine for Adobe Stock, Shutterstock & Microstocks
            </span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-2.5 sm:space-x-3.5">
          {/* Active Provider Indicator Button */}
          <button
            onClick={onOpenApiKeySettings}
            className={`inline-flex items-center space-x-2 px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all shadow-2xs border cursor-pointer ${
              activeProvider === 'orcarouter'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-2 ring-emerald-400/30'
                : keys.length > 0
                ? 'bg-rose-50 text-rose-800 border-rose-200'
                : 'bg-brand-gradient text-white shadow-rose-500/20 hover:opacity-95'
            }`}
          >
            {keys.length > 0 ? (
              <>
                <Zap className={`w-4 h-4 ${activeProvider === 'orcarouter' ? 'text-emerald-600 fill-emerald-600' : 'text-rose-600 fill-rose-600'} animate-pulse`} />
                <span>{activeProviderName ? `${activeProviderName} Active` : 'AI Key Active'}</span>
              </>
            ) : (
              <>
                <Key className="w-4 h-4" />
                <span>Add AI Key</span>
              </>
            )}
          </button>

          {/* Stock Guidelines Button */}
          <button
            onClick={onOpenGuidelines}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-slate-700 hover:text-rose-600 hover:bg-rose-50/60 border border-slate-200 transition-colors cursor-pointer"
          >
            <Shield className="w-4 h-4 text-rose-500" />
            <span className="hidden md:inline">Stock Guidelines</span>
          </button>

          {/* FAQ Button */}
          <button
            onClick={onOpenFaq}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-slate-700 hover:text-rose-600 hover:bg-rose-50/60 border border-slate-200 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-slate-500" />
            <span className="hidden md:inline">FAQ</span>
          </button>
        </div>

      </div>
    </header>
  );
};
