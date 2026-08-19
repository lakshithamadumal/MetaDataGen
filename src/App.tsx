import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  Play, 
  Pause, 
  RotateCw, 
  Trash2, 
  ShieldCheck, 
  Key,
  Layers,
  ArrowRight,
  Zap,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import { 
  EssentialSettingsState, 
  GroqApiKeyItem, 
  StockPlatform, 
  UploadedMediaItem, 
  GeneratedMetadata 
} from './types/metadata';
import { AIService, PROVIDERS } from './services/aiService';
import { Navbar } from './components/Navbar';
import { ApiKeyManager } from './components/ApiKeyManager';
import { EssentialSettings } from './components/EssentialSettings';
import { FileUploader } from './components/FileUploader';
import { MetadataCard } from './components/MetadataCard';
import { ExportPanel } from './components/ExportPanel';
import { GuidelinesModal } from './components/GuidelinesModal';
import { FaqModal } from './components/FaqModal';
import { Footer } from './components/Footer';

export function App() {
  // State: API Keys & Persistent Model
  const [keys, setKeys] = useState<GroqApiKeyItem[]>(() => AIService.getStoredKeys());
  const [isApiSettingsOpen, setIsApiSettingsOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>(() => AIService.getStoredModel());

  // Automatically refresh and sync live model on initial load/refresh in background!
  useEffect(() => {
    if (keys.length > 0 && keys[0].key) {
      AIService.testApiKeyAndFetchModels(keys[0].key).then(({ isValid, suggestedModel }) => {
        if (isValid && suggestedModel) {
          setSelectedModel(suggestedModel);
          AIService.saveStoredModel(suggestedModel);
          setSettings(prev => ({ ...prev, selectedModel: suggestedModel }));
        }
      });
    }
  }, []);

  // State: Media Files Queue
  const [files, setFiles] = useState<UploadedMediaItem[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<StockPlatform>('adobe-stock');

  // State: Settings
  const [settings, setSettings] = useState<EssentialSettingsState>({
    titleLength: 150,
    keywordCount: 45,
    descriptionLength: 160,
    keywordFormat: 'auto',
    includeKeywords: '',
    excludeKeywords: '',
    contentType: 'auto',
    isAiGenerated: false,
    strictGuidelines: true,
    selectedModel: selectedModel
  });

  // State: Batch Processing
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'completed' | 'errors'>('all');

  // State: Modals
  const [isGuidelinesOpen, setIsGuidelinesOpen] = useState(false);
  const [isFaqOpen, setIsFaqOpen] = useState(false);

  // Trigger celebration confetti when batch finishes 100%
  const triggerCelebrationConfetti = () => {
    // Cannon Left & Right
    confetti({
      particleCount: 75,
      spread: 70,
      origin: { x: 0.15, y: 0.65 },
      colors: ['#ff2d7a', '#ff4b3e', '#ff6a1a', '#10b981', '#3b82f6', '#fbbf24', '#a855f7']
    });
    confetti({
      particleCount: 75,
      spread: 70,
      origin: { x: 0.85, y: 0.65 },
      colors: ['#ff2d7a', '#ff4b3e', '#ff6a1a', '#10b981', '#3b82f6', '#fbbf24', '#a855f7']
    });

    // Big Center Starburst
    setTimeout(() => {
      confetti({
        particleCount: 130,
        spread: 110,
        origin: { x: 0.5, y: 0.4 },
        colors: ['#ff2d7a', '#ff4b3e', '#ff6a1a', '#10b981', '#3b82f6', '#fbbf24', '#ec4899']
      });
    }, 300);
  };

  // Sync selected model to storage and settings
  const handleModelChange = (model: string) => {
    setSelectedModel(model);
    AIService.saveStoredModel(model);
    setSettings(prev => ({ ...prev, selectedModel: model }));
  };

  // Determine active provider name
  const activeKey = keys.find(k => k.isValid !== false)?.key || '';
  const activeProvider = activeKey ? AIService.detectProvider(activeKey) : null;
  const activeProviderName = activeProvider ? PROVIDERS[activeProvider]?.name : 'AI Engine';

  // Handle uploaded files
  const handleFilesAdded = (newFiles: File[]) => {
    const newItems: UploadedMediaItem[] = newFiles.map(file => ({
      id: crypto.randomUUID(),
      file,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type.includes('svg') ? 'svg' : (file.type.includes('video') ? 'video' : 'image'),
      previewUrl: URL.createObjectURL(file),
      status: 'idle',
      createdAt: Date.now()
    }));
    setFiles(prev => [...prev, ...newItems]);
  };

  // Process single item
  const processItem = async (item: UploadedMediaItem): Promise<boolean> => {
    setFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: 'processing', errorMessage: undefined } : f));

    try {
      const metadata = await AIService.generateMetadataForImage(item.file, settings);
      setFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: 'completed', metadata } : f));
      return true;
    } catch (err: any) {
      setFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: 'error', errorMessage: err.message || 'Generation failed' } : f));
      return false;
    }
  };

  // Batch Generation Loop with rate-limit safe delay
  useEffect(() => {
    if (!isProcessing || isPaused) return;

    const idleItem = files.find(f => f.status === 'idle');
    
    // When no idle items remain, finish batch and trigger confetti celebration!
    if (!idleItem) {
      setIsProcessing(false);
      const hasCompleted = files.length > 0 && files.some(f => f.status === 'completed');
      if (hasCompleted) {
        triggerCelebrationConfetti();
      }
      return;
    }

    let isSubscribed = true;

    const run = async () => {
      await processItem(idleItem);
      // 1.8s safe spacing between items to protect API limits
      if (isSubscribed) {
        await new Promise(r => setTimeout(r, 1800));
      }
    };

    run();

    return () => {
      isSubscribed = false;
    };
  }, [isProcessing, isPaused, files]);

  const handleStartProcessing = () => {
    if (keys.length === 0) {
      setIsApiSettingsOpen(true);
      return;
    }
    if (files.length === 0) {
      return;
    }
    // Set all pending or errored to idle
    setFiles(prev => prev.map(f => f.status === 'error' ? { ...f, status: 'idle' } : f));
    setIsProcessing(true);
    setIsPaused(false);
  };

  const handlePauseProcessing = () => {
    setIsPaused(true);
  };

  const handleResumeProcessing = () => {
    setIsPaused(false);
  };

  const handleClearAll = () => {
    files.forEach(f => URL.revokeObjectURL(f.previewUrl));
    setFiles([]);
    setIsProcessing(false);
  };

  const handleDeleteItem = (id: string) => {
    const item = files.find(f => f.id === id);
    if (item) URL.revokeObjectURL(item.previewUrl);
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleUpdateTitle = (id: string, newTitle: string) => {
    setFiles(prev => prev.map(f => {
      if (f.id === id && f.metadata) {
        return { ...f, metadata: { ...f.metadata, title: newTitle } };
      }
      return f;
    }));
  };

  const handleUpdateKeywords = (id: string, newKeywords: string[]) => {
    setFiles(prev => prev.map(f => {
      if (f.id === id && f.metadata) {
        return { ...f, metadata: { ...f.metadata, keywords: newKeywords } };
      }
      return f;
    }));
  };

  // Filtered files
  const filteredFiles = files.filter(f => {
    if (activeFilter === 'completed') return f.status === 'completed';
    if (activeFilter === 'errors') return f.status === 'error';
    return true;
  });

  const completedCount = files.filter(f => f.status === 'completed').length;
  const errorCount = files.filter(f => f.status === 'error').length;
  const processingCount = files.filter(f => f.status === 'processing').length;
  const isAllQueueCompleted = files.length > 0 && completedCount === files.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/40 via-slate-50/60 to-orange-50/30 text-slate-800 flex flex-col font-sans">
      
      {/* Navigation */}
      <Navbar
        keys={keys}
        onOpenApiKeySettings={() => setIsApiSettingsOpen(true)}
        onOpenGuidelines={() => setIsGuidelinesOpen(true)}
        onOpenFaq={() => setIsFaqOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* API Settings Accordion */}
        <ApiKeyManager
          keys={keys}
          onKeysChange={setKeys}
          selectedModel={selectedModel}
          onModelChange={handleModelChange}
          isOpen={isApiSettingsOpen}
          onToggleOpen={() => setIsApiSettingsOpen(!isApiSettingsOpen)}
        />

        {/* Supported APIs Badge Strip */}
        <div className="bg-white/90 backdrop-blur-xs rounded-2xl border border-rose-100 p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center space-x-2 text-xs font-black text-slate-700">
            <Sparkles className="w-4 h-4 text-rose-500 animate-pulse" />
            <span>Supported Vision Providers:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* OrcaRouter in Emerald Green */}
            <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-black ring-2 ring-emerald-400/20 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>🐬 OrcaRouter (Recommended)</span>
            </span>

            <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl text-xs font-bold shadow-2xs">
              <span>✨ Google Gemini (Free)</span>
            </span>

            <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-slate-100 border border-slate-200 text-slate-800 rounded-xl text-xs font-bold shadow-2xs">
              <span>⚡ Groq Cloud</span>
            </span>

            <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-purple-50 border border-purple-200 text-purple-800 rounded-xl text-xs font-bold shadow-2xs">
              <span>🤖 OpenAI Vision</span>
            </span>
          </div>
        </div>

        {/* 2-COLUMN MAIN WORKFLOW LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN (8 cols): Upload -> Customize -> Generate Button -> Metadata Cards */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 1. File Upload Dropzone */}
            <FileUploader
              files={files}
              onFilesAdded={handleFilesAdded}
              onClearAll={handleClearAll}
              onRemoveFile={handleDeleteItem}
            />

            {/* 2. Customization / Essential Settings */}
            <EssentialSettings
              settings={settings}
              onSettingsChange={setSettings}
            />

            {/* 3. Action Bar: Generate Metadata Button */}
            <div className="bg-white rounded-3xl border border-rose-100 shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-3 text-xs sm:text-sm font-bold text-slate-700">
                <span>Queue: {files.length} Image{files.length === 1 ? '' : 's'}</span>
                <span>•</span>
                <span className="text-emerald-600 font-extrabold">{completedCount} Done</span>
                {errorCount > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-rose-600 font-extrabold">{errorCount} Failed</span>
                  </>
                )}
                {processingCount > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-rose-500 font-extrabold animate-pulse">{processingCount} Processing</span>
                  </>
                )}
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                {!isProcessing ? (
                  <button
                    onClick={handleStartProcessing}
                    disabled={files.length === 0}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-2.5 px-8 py-3.5 bg-brand-gradient hover:opacity-95 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-rose-500/25 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Generate Metadata {files.length > 0 ? `(${files.length})` : ''}</span>
                  </button>
                ) : isPaused ? (
                  <button
                    onClick={handleResumeProcessing}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm transition-all shadow-xs"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Resume</span>
                  </button>
                ) : (
                  <button
                    onClick={handlePauseProcessing}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-2 px-6 py-3.5 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-black text-sm transition-all shadow-xs"
                  >
                    <Pause className="w-4 h-4 fill-white" />
                    <span>Pause</span>
                  </button>
                )}

                {files.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    disabled={isProcessing}
                    className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl border border-slate-200 transition-colors disabled:opacity-50"
                    title="Clear All Images"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* 4. Generated Metadata Results Cards with Skeleton Loading Shimmer */}
            {files.length > 0 && (
              <div className="space-y-4">
                {/* Filter Tabs Bar */}
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-extrabold text-slate-900 text-base">Metadata Results</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-50 text-rose-600 border border-rose-100">
                      {files.length}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5 p-1 bg-slate-200/60 rounded-xl text-xs font-bold">
                    <button
                      onClick={() => setActiveFilter('all')}
                      className={`px-3 py-1 rounded-lg transition-all ${
                        activeFilter === 'all' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      All ({files.length})
                    </button>
                    <button
                      onClick={() => setActiveFilter('completed')}
                      className={`px-3 py-1 rounded-lg transition-all ${
                        activeFilter === 'completed' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Completed ({completedCount})
                    </button>
                    {errorCount > 0 && (
                      <button
                        onClick={() => setActiveFilter('errors')}
                        className={`px-3 py-1 rounded-lg transition-all ${
                          activeFilter === 'errors' ? 'bg-white text-rose-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Errors ({errorCount})
                      </button>
                    )}
                  </div>
                </div>

                {/* Cards List */}
                <div className="space-y-4">
                  {filteredFiles.map((item) => (
                    <MetadataCard
                      key={item.id}
                      item={item}
                      onUpdateTitle={handleUpdateTitle}
                      onUpdateKeywords={handleUpdateKeywords}
                      onDelete={handleDeleteItem}
                      onRetry={processItem}
                      activeProviderName={activeProviderName}
                    />
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN (4 cols): Sticky Export Panel */}
          <div className="lg:col-span-4 sticky top-22">
            <ExportPanel
              selectedPlatform={selectedPlatform}
              onSelectPlatform={setSelectedPlatform}
              items={files}
              isAllCompleted={isAllQueueCompleted}
            />
          </div>

        </div>

      </main>

      {/* Footer with Lakshitha Madumal credit & Social links */}
      <Footer
        onOpenGuidelines={() => setIsGuidelinesOpen(true)}
        onOpenFaq={() => setIsFaqOpen(true)}
      />

      {/* Modals */}
      <GuidelinesModal
        isOpen={isGuidelinesOpen}
        onClose={() => setIsGuidelinesOpen(false)}
      />

      <FaqModal
        isOpen={isFaqOpen}
        onClose={() => setIsFaqOpen(false)}
      />

    </div>
  );
}

export default App;
