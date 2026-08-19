import React from 'react';
import { X, HelpCircle, Key, Shield, Sparkles, Zap, FileSpreadsheet, Lock } from 'lucide-react';

interface FaqModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FaqModal: React.FC<FaqModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const faqs = [
    {
      q: 'Which AI API key should I use for the best visual recognition?',
      a: 'We strongly recommend OrcaRouter (sk-orca-...) or Google Gemini (AIza...). OrcaRouter provides high-speed, reliable access to top vision models like google/gemini-2.0-flash and openai/gpt-4o-mini with native image understanding.',
      icon: <Zap className="w-4 h-4 text-orange-600" />
    },
    {
      q: 'How does MetaDataGen guarantee 100% Client-Side Privacy?',
      a: 'Zero images or metadata are sent to or stored on any server. All image resizing and AI completions happen directly inside your browser tab through direct HTTPS requests to OrcaRouter or Gemini.',
      icon: <Lock className="w-4 h-4 text-emerald-600" />
    },
    {
      q: 'How are titles and tags formatted for Adobe Stock & Shutterstock?',
      a: 'The built-in Compliance Engine enforces microstock rules: no trailing periods in Adobe Stock titles, strict exclusion of banned trademarks (Apple, Nike, Volvo, etc.), removal of spam words (4k, best, wallpaper), and exact 45 keyword counts with top subject tags prioritized first.',
      icon: <Shield className="w-4 h-4 text-blue-600" />
    },
    {
      q: 'Can I download the CSV while metadata is generating?',
      a: 'Yes! As soon as any image finishes generation, you can click "Export to CSV" immediately without waiting for the rest of the batch to complete.',
      icon: <FileSpreadsheet className="w-4 h-4 text-amber-600" />
    },
    {
      q: 'Where do I get a free OrcaRouter or Gemini API Key?',
      a: 'You can get an OrcaRouter token from orcarouter.ai/console/token or a free Google Gemini key from aistudio.google.com/app/apikey. Paste your key in settings, and the app will automatically configure the provider and vision model.',
      icon: <Key className="w-4 h-4 text-purple-600" />
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col border border-orange-100">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-orange-50 to-amber-50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
              <HelpCircle className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-slate-800 text-base">
              Frequently Asked Questions (FAQ)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-orange-200 transition-colors">
              <div className="flex items-center space-x-2 font-bold text-slate-800 text-sm mb-1.5">
                {faq.icon}
                <h4>{faq.q}</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pl-6">
                {faq.a}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Close FAQ
          </button>
        </div>

      </div>
    </div>
  );
};
