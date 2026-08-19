import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Trash2, 
  Edit3, 
  Copy, 
  Check, 
  ShieldCheck, 
  AlertTriangle,
  RotateCw,
  Sparkles,
  ExternalLink,
  Zap
} from 'lucide-react';
import { UploadedMediaItem } from '../types/metadata';
import { AIService } from '../services/aiService';

interface MetadataCardProps {
  item: UploadedMediaItem;
  onUpdateTitle: (id: string, title: string) => void;
  onUpdateKeywords: (id: string, keywords: string[]) => void;
  onDelete: (id: string) => void;
  onRetry: (item: UploadedMediaItem) => void;
  activeProviderName?: string;
}

export const MetadataCard: React.FC<MetadataCardProps> = ({
  item,
  onUpdateTitle,
  onUpdateKeywords,
  onDelete,
  onRetry,
  activeProviderName = 'AI'
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(item.metadata?.title || '');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSaveTitle = () => {
    onUpdateTitle(item.id, editedTitle);
    setIsEditingTitle(false);
  };

  const handleRemoveKeyword = (indexToRemove: number) => {
    if (!item.metadata) return;
    const newKeywords = item.metadata.keywords.filter((_, idx) => idx !== indexToRemove);
    onUpdateKeywords(item.id, newKeywords);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden hover:border-orange-200 transition-all p-5 sm:p-6 mb-4">
      {/* Top Media Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-4">
          {/* Thumbnail */}
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0 shadow-2xs">
            <img
              src={item.previewUrl}
              alt={item.file.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* File Info */}
          <div className="truncate">
            <h4 className="font-extrabold text-slate-800 text-sm sm:text-base truncate max-w-xs sm:max-w-md">
              {item.file.name}
            </h4>
            <div className="flex items-center space-x-2 mt-1 text-xs text-slate-400">
              <span>{(item.file.size / 1024).toFixed(1)} KB</span>
              <span>•</span>
              <span className="uppercase font-semibold">{item.file.type.split('/')[1] || 'IMAGE'}</span>
            </div>
          </div>
        </div>

        {/* Status Badges & Actions */}
        <div className="flex items-center space-x-2">
          {item.status === 'completed' && (
            <div className="flex items-center space-x-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>100% Compliant</span>
            </div>
          )}

          {item.status === 'processing' && (
            <div className="flex items-center space-x-1.5 px-3 py-1 bg-orange-50 border border-orange-200 text-orange-700 rounded-xl text-xs font-bold animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-600" />
              <span>Analyzing with {activeProviderName}...</span>
            </div>
          )}

          {item.status === 'error' && (
            <button
              onClick={() => onRetry(item)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold transition-all shadow-2xs"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          )}

          <button
            onClick={() => onDelete(item.id)}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
            title="Remove image"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* SKELETON LOADING STATE (ANIMATED) */}
      {item.status === 'processing' && (
        <div className="mt-5 space-y-4 p-4 rounded-2xl bg-rose-50/40 border border-rose-100/80">
          <div className="flex items-center space-x-2 text-xs font-black text-rose-600 mb-2">
            <Sparkles className="w-4 h-4 animate-spin text-rose-500" />
            <span>AI is inspecting visual details, angles, colors & background...</span>
          </div>

          <div className="space-y-2">
            <div className="h-4 w-32 bg-slate-200 rounded-md skeleton-shimmer" />
            <div className="h-11 w-full bg-slate-200 rounded-xl skeleton-shimmer" />
          </div>

          <div className="space-y-2">
            <div className="h-4 w-44 bg-slate-200 rounded-md skeleton-shimmer" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 24 }).map((_, i) => (
                <div 
                  key={i} 
                  className="h-8 rounded-xl bg-slate-200 skeleton-shimmer"
                  style={{ width: `${Math.floor(Math.random() * 45) + 60}px` }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ERROR STATE */}
      {item.status === 'error' && (
        <div className="mt-4 p-4 bg-rose-50/70 border border-rose-200 rounded-2xl text-xs text-rose-700">
          <div className="flex items-center space-x-2 font-bold mb-1">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>Generation Failed</span>
          </div>
          <p className="leading-relaxed font-mono text-[11px]">
            {item.errorMessage || 'Unknown AI error occurred. Please check your API key or try again.'}
          </p>
        </div>
      )}

      {/* COMPLETED METADATA STATE */}
      {item.status === 'completed' && item.metadata && (
        <div className="mt-5 space-y-5">
          {/* TITLE SECTION */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                TITLE ({item.metadata.title.length} CHARS)
              </span>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsEditingTitle(!isEditingTitle)}
                  className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-600 hover:text-orange-600 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isEditingTitle ? 'Cancel' : 'Edit'}</span>
                </button>

                <button
                  onClick={() => handleCopy(item.metadata!.title, 'title')}
                  className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-600 hover:text-orange-600 transition-colors"
                >
                  {copiedField === 'title' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                      <span className="text-emerald-600">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {isEditingTitle ? (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="w-full text-sm font-medium text-slate-800 bg-white border border-orange-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-2xs"
                />
                <button
                  onClick={handleSaveTitle}
                  className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-colors"
                >
                  Save
                </button>
              </div>
            ) : (
              <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-800 leading-relaxed select-all">
                {item.metadata.title}
              </div>
            )}
          </div>

          {/* KEYWORDS SECTION */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  KEYWORDS ({item.metadata.keywords.length} TAGS)
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  (Top 5-10 prioritized for Adobe Stock ranking)
                </span>
              </div>

              <button
                onClick={() => handleCopy(item.metadata!.keywords.join(', '), 'keywords')}
                className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-600 hover:text-orange-600 transition-colors"
              >
                {copiedField === 'keywords' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                    <span className="text-emerald-600">Copied All</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy All Tags</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-1">
              {item.metadata.keywords.map((kw, idx) => (
                <span
                  key={idx}
                  className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-medium border transition-all ${
                    idx < 10
                      ? 'bg-orange-50/80 border-orange-200 text-orange-900 font-semibold'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span>{kw}</span>
                  <button
                    onClick={() => handleRemoveKeyword(idx)}
                    className="text-slate-400 hover:text-rose-500 transition-colors"
                    title="Remove tag"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
