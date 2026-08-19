import React from 'react';
import { Download, Check, Sparkles, Archive, ShieldCheck, Lock } from 'lucide-react';
import { StockPlatform, UploadedMediaItem } from '../types/metadata';
import { STOCK_PLATFORMS } from '../data/platformTemplates';
import { CsvExportService } from '../services/csvExportService';
import {
  AdobeStockIcon,
  ShutterstockIcon,
  FreepikIcon,
  VecteezyIcon,
  Icon123rf,
  CanvaIcon,
  IStockIcon,
  Pond5Icon,
  DepositphotosIcon,
  GeneralStockIcon
} from './Icons';

interface ExportPanelProps {
  selectedPlatform: StockPlatform;
  onSelectPlatform: (platform: StockPlatform) => void;
  items: UploadedMediaItem[];
  isAllCompleted?: boolean;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({
  selectedPlatform,
  onSelectPlatform,
  items,
  isAllCompleted
}) => {
  const completedItems = items.filter(i => i.status === 'completed');
  // Enable ONLY when all items in queue are 100% completed
  const isReadyToExport = isAllCompleted ?? (items.length > 0 && completedItems.length === items.length);

  const handleExportCsv = () => {
    if (!isReadyToExport) return;
    CsvExportService.downloadPlatformCsv(selectedPlatform, items);
  };

  const handleExportAllZip = async () => {
    if (!isReadyToExport) return;
    await CsvExportService.exportAllPlatformsZip(items);
  };

  const platformList: { id: StockPlatform; name: string; icon: React.ReactNode; limit: number }[] = [
    { id: 'adobe-stock', name: 'Adobe Stock', icon: <AdobeStockIcon className="w-8 h-8 rounded-lg" />, limit: 49 },
    { id: 'shutterstock', name: 'Shutterstock', icon: <ShutterstockIcon className="w-8 h-8 rounded-full" />, limit: 50 },
    { id: 'freepik', name: 'Freepik', icon: <FreepikIcon className="w-8 h-8" />, limit: 50 },
    { id: 'vecteezy', name: 'Vecteezy', icon: <VecteezyIcon className="w-8 h-8" />, limit: 50 },
    { id: '123rf', name: '123RF', icon: <Icon123rf className="w-8 h-8 rounded-lg" />, limit: 50 },
    { id: 'canva', name: 'Canva', icon: <CanvaIcon className="w-8 h-8 rounded-full" />, limit: 50 },
    { id: 'istock', name: 'iStock / Getty', icon: <IStockIcon className="w-8 h-8 rounded-lg" />, limit: 50 },
    { id: 'pond5', name: 'Pond5', icon: <Pond5Icon className="w-8 h-8 rounded-lg" />, limit: 50 },
    { id: 'depositphotos', name: 'Depositphotos', icon: <DepositphotosIcon className="w-8 h-8 rounded-lg" />, limit: 50 },
    { id: 'general', name: 'General CSV', icon: <GeneralStockIcon className="w-8 h-8 rounded-lg" />, limit: 50 },
  ];

  return (
    <div className="space-y-4">
      {/* Main Export Card with Brand Gradient Header */}
      <div className="bg-white rounded-3xl border border-rose-100 shadow-sm overflow-hidden">
        {/* Header matching main brand gradient #ff2d7a -> #ff4b3e -> #ff6a1a */}
        <div className="bg-brand-gradient px-6 py-5 text-white shadow-xs">
          <div className="flex items-center space-x-2.5">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
            <div>
              <h3 className="font-extrabold text-base tracking-tight">Export Options</h3>
              <p className="text-rose-100 text-xs mt-0.5">
                Download ready-to-upload stock metadata CSVs
              </p>
            </div>
          </div>
        </div>

        {/* Platform Grid */}
        <div className="p-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
            {platformList.map((plat) => {
              const isSelected = selectedPlatform === plat.id;

              return (
                <button
                  key={plat.id}
                  type="button"
                  onClick={() => onSelectPlatform(plat.id)}
                  className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition-all relative group cursor-pointer ${
                    isSelected
                      ? 'border-[#ff4b3e] bg-rose-50/70 shadow-sm ring-2 ring-[#ff4b3e]/30 scale-[1.02]'
                      : 'border-slate-100 hover:border-rose-200 hover:bg-rose-50/30 bg-slate-50/50'
                  }`}
                >
                  {/* Selected Indicator */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-brand-gradient text-white flex items-center justify-center shadow-xs">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}

                  {/* Icon */}
                  <div className="mb-2 transition-transform group-hover:scale-110">
                    {plat.icon}
                  </div>

                  {/* Title */}
                  <span className="text-xs font-bold text-slate-800 line-clamp-1">
                    {plat.name}
                  </span>

                  {/* Max tags info */}
                  <span className="text-[10px] font-semibold text-slate-400 mt-0.5">
                    {plat.limit} tags
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Platform Info Banner */}
          <div className="p-3.5 bg-rose-50/60 rounded-2xl border border-rose-200/70 text-xs mb-4">
            <div className="flex items-center justify-between font-bold text-slate-800 mb-1">
              <span>Target: {STOCK_PLATFORMS[selectedPlatform]?.name}</span>
              <span className="text-[#ff2d7a] font-mono text-[11px] bg-white px-2 py-0.5 rounded-md border border-rose-200">
                {STOCK_PLATFORMS[selectedPlatform]?.headers.length} columns
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              {STOCK_PLATFORMS[selectedPlatform]?.description}
            </p>
          </div>

          {/* Export Buttons */}
          <div className="space-y-2.5">
            <button
              onClick={handleExportCsv}
              disabled={!isReadyToExport}
              className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm flex items-center justify-center space-x-2 transition-all shadow-md ${
                isReadyToExport
                  ? 'bg-brand-gradient hover:opacity-95 text-white active:scale-[0.99] cursor-pointer shadow-rose-500/30 ring-2 ring-rose-400/40 animate-pulse-subtle'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 opacity-60'
              }`}
            >
              {isReadyToExport ? (
                <>
                  <Download className="w-4 h-4" />
                  <span>Export to CSV ({completedItems.length})</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-slate-400" />
                  <span>
                    {items.length === 0 
                      ? 'Export to CSV (Upload & Generate First)'
                      : `Export to CSV (${completedItems.length}/${items.length} Done)`}
                  </span>
                </>
              )}
            </button>

            <button
              onClick={handleExportAllZip}
              disabled={!isReadyToExport}
              className={`w-full py-2.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 transition-all border ${
                isReadyToExport
                  ? 'border-rose-200 hover:bg-rose-50 text-slate-700 cursor-pointer shadow-2xs'
                  : 'border-slate-100 text-slate-300 cursor-not-allowed opacity-50'
              }`}
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Export All 10 Platforms (.ZIP)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Compliance Quality Banner */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200/80 p-4 text-xs">
        <div className="flex items-center space-x-2 font-bold text-emerald-900 mb-1">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Microstock Agency Ready</span>
        </div>
        <p className="text-emerald-800 leading-relaxed text-[11px]">
          CSV formats strictly match Adobe Stock & Shutterstock upload schemas with zero spam keywords and full brand safety.
        </p>
      </div>
    </div>
  );
};
