import React from 'react';
import { FacebookIcon, InstagramIcon, LinkedInIcon, GithubIcon } from './Icons';
import { Heart } from 'lucide-react';

interface FooterProps {
  onOpenGuidelines: () => void;
  onOpenFaq: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenGuidelines, onOpenFaq }) => {
  return (
    <footer className="bg-white border-t border-rose-100 py-8 mt-16 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left: Branding & Developer Credit */}
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 text-center sm:text-left">
          <div className="flex items-center space-x-1.5 text-xs text-slate-600 font-medium">
            <span>Developed with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>by</span>
            <a
              href="https://github.com/lakshithamadumal"
              target="_blank"
              rel="noreferrer"
              className="font-extrabold text-slate-900 bg-brand-gradient bg-clip-text text-transparent hover:opacity-80 transition-opacity"
            >
              Lakshitha Madumal
            </a>
          </div>
          <span className="hidden sm:inline text-slate-300">•</span>
          <p className="text-xs text-slate-400">
            © 2026 MetaDataGen • AI Stock Metadata Generator
          </p>
        </div>

        {/* Center: Social Media Links Row */}
        <div className="flex items-center space-x-3">
          <a
            href="https://facebook.com/iamlakshithamadumal/"
            target="_blank"
            rel="noreferrer"
            className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 flex items-center justify-center transition-all hover:scale-110 shadow-2xs cursor-pointer"
            title="Facebook Profile"
          >
            <FacebookIcon className="w-5 h-5" />
          </a>

          <a
            href="https://instagram.com/lak_ii__"
            target="_blank"
            rel="noreferrer"
            className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-pink-50 border border-slate-200 hover:border-pink-300 flex items-center justify-center transition-all hover:scale-110 shadow-2xs cursor-pointer"
            title="Instagram Profile"
          >
            <InstagramIcon className="w-5 h-5" />
          </a>

          <a
            href="https://www.linkedin.com/in/lakshitha-madumal/"
            target="_blank"
            rel="noreferrer"
            className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-300 flex items-center justify-center transition-all hover:scale-110 shadow-2xs cursor-pointer"
            title="LinkedIn Profile"
          >
            <LinkedInIcon className="w-5 h-5" />
          </a>

          <a
            href="https://github.com/lakshithamadumal"
            target="_blank"
            rel="noreferrer"
            className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-200 border border-slate-200 hover:border-slate-400 flex items-center justify-center transition-all hover:scale-110 shadow-2xs cursor-pointer"
            title="GitHub Profile"
          >
            <GithubIcon className="w-5 h-5" />
          </a>
        </div>

        {/* Right: Helpful Rules & FAQ */}
        <div className="flex items-center space-x-4 text-xs font-semibold text-slate-500">
          <button
            onClick={onOpenGuidelines}
            className="hover:text-rose-600 transition-colors cursor-pointer"
          >
            Stock Guidelines
          </button>
          <span>•</span>
          <button
            onClick={onOpenFaq}
            className="hover:text-rose-600 transition-colors cursor-pointer"
          >
            FAQ
          </button>
        </div>

      </div>
    </footer>
  );
};
