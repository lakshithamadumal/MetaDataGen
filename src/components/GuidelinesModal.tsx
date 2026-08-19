import React, { useState } from 'react';
import { X, ShieldCheck, AlertTriangle, BookOpen, CheckCircle, Ban, Search } from 'lucide-react';
import { BANNED_SPAM_KEYWORDS, PROTECTED_TRADEMARKS } from '../data/bannedKeywords';

interface GuidelinesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuidelinesModal: React.FC<GuidelinesModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'rules' | 'adobe' | 'shutterstock' | 'banned'>('rules');
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const bannedArray = Array.from(BANNED_SPAM_KEYWORDS);
  const filteredBanned = bannedArray.filter(b => b.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredTrademarks = PROTECTED_TRADEMARKS.filter(t => t.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Microstock Contributor Guidelines</h3>
              <p className="text-xs text-slate-400">Rules to prevent image rejections and account bans</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex border-b border-slate-200 px-6 space-x-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('rules')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'rules'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            General Rules & Ban Prevention
          </button>
          <button
            onClick={() => setActiveTab('adobe')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'adobe'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Adobe Stock Guidelines
          </button>
          <button
            onClick={() => setActiveTab('shutterstock')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'shutterstock'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Shutterstock Guidelines
          </button>
          <button
            onClick={() => setActiveTab('banned')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'banned'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Banned & Trademark Database
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 text-xs text-slate-600 leading-relaxed space-y-4">
          {activeTab === 'rules' && (
            <div className="space-y-4">
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl">
                <div className="flex items-center space-x-2 text-rose-800 font-bold mb-1">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Why Stock Accounts Get Banned</span>
                </div>
                <p className="text-rose-700">
                  Agencies like Adobe Stock, Shutterstock, and Freepik use automated spam detectors.
                  Submitting trademarked brand names, keyword spamming, or subjective filler words
                  triggers automated quality flags and can lead to permanent portfolio bans.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2">
                  <div className="flex items-center space-x-2 text-emerald-800 font-bold">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Always Do (Best Practices)</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-emerald-900 text-[11px]">
                    <li>Describe the exact subject, action, context, and mood.</li>
                    <li>Place the top 5 to 10 most relevant keywords first.</li>
                    <li>Use 25 to 45 focused keywords.</li>
                    <li>Write natural, human-readable English titles.</li>
                    <li>Flag AI-generated content appropriately.</li>
                  </ul>
                </div>

                <div className="p-4 bg-rose-50/60 border border-rose-200 rounded-xl space-y-2">
                  <div className="flex items-center space-x-2 text-rose-800 font-bold">
                    <Ban className="w-4 h-4 text-rose-600" />
                    <span>Never Do (Instant Rejections)</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-rose-900 text-[11px]">
                    <li>Do not use brand names (iPhone, Nike, Apple, Sony).</li>
                    <li>Do not use spam terms like "best", "4k", "wallpaper", "masterpiece".</li>
                    <li>Do not stuff repetitive synonyms (e.g. dog, dogs, puppy, puppies, canine, doggy).</li>
                    <li>Do not end Adobe Stock titles with a period ('.').</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'adobe' && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-800 text-sm">Adobe Stock Key Contributor Policies</h4>
              <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <p><strong>1. Maximum 49 Keywords:</strong> Adobe Stock hard-limits keywords to 49. MetaDataGen automatically caps at 45-49.</p>
                <p><strong>2. Keyword Importance Hierarchy:</strong> Adobe's search algorithm weights the <em>first 10 keywords</em> higher than the rest. Our AI strictly places the primary subject tags in positions 1-10.</p>
                <p><strong>3. Title Formatting:</strong> Adobe titles must not have a period at the end and should be capitalized sentences without quotation marks.</p>
                <p><strong>4. Generative AI Submissions:</strong> Adobe requires images generated by AI to include the tag <code className="bg-slate-200 px-1 rounded">generative ai</code>.</p>
              </div>
            </div>
          )}

          {activeTab === 'shutterstock' && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-800 text-sm">Shutterstock Contributor Specifications</h4>
              <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <p><strong>1. Description Field:</strong> Shutterstock uses the Description column as the title. It must be at least 5-7 words long answering: Who is in the image, What are they doing, Where is it taking place, and Why.</p>
                <p><strong>2. Max 50 Keywords:</strong> Shutterstock accepts up to 50 keywords. Must be comma-separated in the CSV.</p>
                <p><strong>3. Categories:</strong> Shutterstock requires at least one primary category (e.g. Technology, Business, Nature).</p>
              </div>
            </div>
          )}

          {activeTab === 'banned' && (
            <div className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search banned terms or trademarks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              </div>

              <div>
                <h5 className="font-bold text-slate-800 mb-1.5">Banned Spam Keywords ({filteredBanned.length})</h5>
                <div className="flex flex-wrap gap-1 max-h-36 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-100">
                  {filteredBanned.map((word, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded text-[10px] font-medium">
                      {word}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="font-bold text-slate-800 mb-1.5">Protected Trademarks ({filteredTrademarks.length})</h5>
                <div className="flex flex-wrap gap-1 max-h-36 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-100">
                  {filteredTrademarks.map((tm, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-[10px] font-medium">
                      {tm}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Got it, Back to App
          </button>
        </div>
      </div>
    </div>
  );
};
