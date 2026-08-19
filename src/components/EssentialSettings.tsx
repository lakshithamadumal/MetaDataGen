import React, { useState } from 'react';
import { Sliders, Tag, Plus, Check, ShieldAlert, Sparkles, ShieldCheck, Cpu } from 'lucide-react';
import { ContentType, EssentialSettingsState, KeywordFormat } from '../types/metadata';

interface EssentialSettingsProps {
  settings: EssentialSettingsState;
  onSettingsChange: (settings: EssentialSettingsState) => void;
}

export const EssentialSettings: React.FC<EssentialSettingsProps> = ({
  settings,
  onSettingsChange
}) => {
  const [includeInput, setIncludeInput] = useState('');
  const [excludeInput, setExcludeInput] = useState('');

  const updateSetting = <K extends keyof EssentialSettingsState>(key: K, value: EssentialSettingsState[K]) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  const handleAddInclude = () => {
    if (!includeInput.trim()) return;
    const existing = settings.includeKeywords ? settings.includeKeywords.split(',').map(s => s.trim()) : [];
    const newItems = includeInput.split(/[,;\n]/).map(s => s.trim()).filter(Boolean);
    const combined = Array.from(new Set([...existing, ...newItems])).join(', ');
    updateSetting('includeKeywords', combined);
    setIncludeInput('');
  };

  const handleAddExclude = () => {
    if (!excludeInput.trim()) return;
    const existing = settings.excludeKeywords ? settings.excludeKeywords.split(',').map(s => s.trim()) : [];
    const newItems = excludeInput.split(/[,;\n]/).map(s => s.trim()).filter(Boolean);
    const combined = Array.from(new Set([...existing, ...newItems])).join(', ');
    updateSetting('excludeKeywords', combined);
    setExcludeInput('');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 mb-6">
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Essential Settings</h3>
            <p className="text-xs text-slate-400">Core metadata generation parameters</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="hidden sm:inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Stock Guidelines Active</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Sliders */}
        <div className="space-y-6">
          {/* Title Length Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                <span className="text-blue-600 font-extrabold">H</span>
                <span>Title Length</span>
              </label>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100">
                {settings.titleLength} chars
              </span>
            </div>
            <input
              type="range"
              min="40"
              max="200"
              step="5"
              value={settings.titleLength}
              onChange={(e) => updateSetting('titleLength', Number(e.target.value))}
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>Short (40)</span>
              <span>Adobe Standard (150)</span>
              <span>Max (200)</span>
            </div>
          </div>

          {/* Keywords Count Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                <Tag className="w-3.5 h-3.5 text-blue-600" />
                <span>Keywords Count</span>
              </label>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100">
                {settings.keywordCount} keywords
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="49"
              step="1"
              value={settings.keywordCount}
              onChange={(e) => updateSetting('keywordCount', Number(e.target.value))}
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>10 Min</span>
              <span>Optimal (45)</span>
              <span>49 (Adobe Stock Max)</span>
            </div>
          </div>

          {/* Description Length Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                <span className="text-blue-600 font-bold">≡</span>
                <span>Description Length</span>
              </label>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100">
                {settings.descriptionLength} chars
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="250"
              step="10"
              value={settings.descriptionLength}
              onChange={(e) => updateSetting('descriptionLength', Number(e.target.value))}
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>50 chars</span>
              <span>160 chars</span>
              <span>250 chars</span>
            </div>
          </div>
        </div>

        {/* Right Column: Keyword Format & Include/Exclude */}
        <div className="space-y-5">
          {/* Keyword Format Buttons */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Keyword Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => updateSetting('keywordFormat', 'single')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                  settings.keywordFormat === 'single'
                    ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-600 ring-offset-1'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>Single</span>
              </button>

              <button
                type="button"
                onClick={() => updateSetting('keywordFormat', 'double')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                  settings.keywordFormat === 'double'
                    ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-600 ring-offset-1'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>Double</span>
              </button>

              <button
                type="button"
                onClick={() => updateSetting('keywordFormat', 'auto')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                  settings.keywordFormat === 'auto'
                    ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-600 ring-offset-1'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Auto</span>
              </button>
            </div>
          </div>

          {/* Include Keywords */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
              <span className="text-blue-600 font-bold">+</span>
              <span>Include Keywords</span>
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={includeInput}
                onChange={(e) => setIncludeInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInclude())}
                placeholder="e.g. technology, innovation, AI"
                className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
              <button
                type="button"
                onClick={handleAddInclude}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {settings.includeKeywords && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {settings.includeKeywords.split(',').map((kw, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md font-medium"
                  >
                    +{kw.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Exclude Keywords */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
              <span className="text-rose-600 font-bold">-</span>
              <span>Exclude Keywords</span>
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={excludeInput}
                onChange={(e) => setExcludeInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddExclude())}
                placeholder="e.g. spam, clickbait, watermark"
                className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
              />
              <button
                type="button"
                onClick={handleAddExclude}
                className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {settings.excludeKeywords && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {settings.excludeKeywords.split(',').map((kw, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center text-[10px] bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-md font-medium"
                  >
                    -{kw.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* AI Generated Content Toggle */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-purple-600" />
              <div>
                <p className="text-xs font-bold text-slate-800">Generative AI Asset Compliance</p>
                <p className="text-[11px] text-slate-400">
                  Automatically appends required AI tags for Adobe & Shutterstock rules
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.isAiGenerated}
                onChange={(e) => updateSetting('isAiGenerated', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
