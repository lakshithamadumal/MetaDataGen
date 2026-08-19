import React, { useState, useEffect } from 'react';
import { Key, Plus, Trash2, CheckCircle2, XCircle, ChevronDown, ChevronUp, Eye, EyeOff, Loader2, Sparkles, ExternalLink, RefreshCw, Cpu, Zap, Check } from 'lucide-react';
import { GroqApiKeyItem } from '../types/metadata';
import { AIService, AIProvider, PROVIDERS } from '../services/aiService';

interface ApiKeyManagerProps {
  keys: GroqApiKeyItem[];
  onKeysChange: (keys: GroqApiKeyItem[]) => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({
  keys,
  onKeysChange,
  selectedModel,
  onModelChange,
  isOpen,
  onToggleOpen,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; modelList?: string[] } | null>(null);
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  // Real-time provider detection
  const detectedProvider = AIService.detectProvider(newKey);
  const providerInfo = PROVIDERS[detectedProvider];

  // AUTOMATICALLY REFRESH MODELS ON MOUNT / LOAD!
  useEffect(() => {
    if (keys.length > 0 && keys[0].key) {
      handleTestExistingKey(keys[0].id, keys[0].key);
    }
  }, []);

  const handleAddKey = async () => {
    if (!newKey.trim()) return;

    setIsTesting(true);
    setTestResult(null);

    const keyTrim = newKey.trim();
    const { isValid, provider, models, suggestedModel } = await AIService.testApiKeyAndFetchModels(keyTrim);
    setIsTesting(false);

    if (!isValid) {
      setTestResult({
        success: false,
        message: `Validation failed. Please check your ${PROVIDERS[provider].name} API token.`
      });
      return;
    }

    // Auto-generate clean human-readable name without prompting user
    const shortToken = keyTrim.slice(-4);
    const autoLabel = `${PROVIDERS[provider].name} (${shortToken})`;

    const newItem: GroqApiKeyItem = {
      id: crypto.randomUUID(),
      key: keyTrim,
      label: autoLabel,
      isValid: true,
      usageCount: 0
    };

    const updated = [...keys, newItem];
    onKeysChange(updated);
    AIService.saveKeys(updated);

    if (models.length > 0) {
      setAvailableModels(models);
    }
    if (suggestedModel) {
      onModelChange(suggestedModel);
    }

    setNewKey('');
    setShowAddForm(false);
    setTestResult(null);
  };

  const handleDeleteKey = (id: string) => {
    const updated = keys.filter(k => k.id !== id);
    onKeysChange(updated);
    AIService.saveKeys(updated);
  };

  const handleTestExistingKey = async (id: string, keyVal: string) => {
    const { isValid, models, suggestedModel } = await AIService.testApiKeyAndFetchModels(keyVal);
    const updated = keys.map(k => (k.id === id ? { ...k, isValid: true } : k));
    onKeysChange(updated);
    AIService.saveKeys(updated);

    if (models.length > 0) {
      setAvailableModels(models);
    }
    if (suggestedModel) {
      onModelChange(suggestedModel);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden mb-6 transition-all">
      {/* Header Bar */}
      <div
        onClick={onToggleOpen}
        className="flex items-center justify-between px-5 py-4 bg-slate-50/80 hover:bg-slate-100/80 cursor-pointer border-b border-slate-100 transition-colors"
      >
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
            <Key className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-slate-800 text-sm sm:text-base flex items-center space-x-2">
              <span>AI Key & Vision Model Settings</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Supports OrcaRouter, Google Gemini & Groq with auto-detection
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
            keys.length > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800 animate-pulse'
          }`}>
            {keys.length > 0 ? `${keys.length} Active Key${keys.length > 1 ? 's' : ''}` : 'Key Needed'}
          </span>
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
        </div>
      </div>

      {/* Content */}
      {isOpen && (
        <div className="p-5 space-y-4">
          {/* Active Model Selector */}
          <div className="p-3.5 bg-rose-50/50 rounded-xl border border-rose-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <div>
                <span className="text-xs font-bold text-slate-700 block">
                  Vision Model (Auto-Selected):
                </span>
                <span className="text-[11px] text-slate-500">
                  Model automatically assigned and refreshed from your API key
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={selectedModel}
                onChange={(e) => onModelChange(e.target.value)}
                className="text-xs font-bold bg-white border border-rose-200 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-sm"
              >
                <option value="orcarouter/fusion-flash">orcarouter/fusion-flash</option>
                <option value="google/gemini-2.0-flash">google/gemini-2.0-flash</option>
                <option value="openai/gpt-4o-mini">openai/gpt-4o-mini</option>
                <option value="gemini-1.5-flash">gemini-1.5-flash</option>
                <option value="gemini-2.0-flash">gemini-2.0-flash</option>
                <option value="llama-3.3-70b-versatile">llama-3.3-70b-versatile</option>
                {availableModels.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          {/* If No Keys Added */}
          {keys.length === 0 && !showAddForm && (
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center bg-slate-50/40">
              <div className="w-12 h-12 mx-auto rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mb-3">
                <Key className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 mb-1">
                Paste Your API Key to Get Started
              </h4>
              <p className="text-xs text-slate-500 mb-4 max-w-md mx-auto">
                Paste your <strong>OrcaRouter Token</strong> (sk-orca-...) or <strong>Gemini Key</strong> (AIza...). The provider and models will be auto-detected and refreshed instantly!
              </p>
              
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={() => setShowAddForm(true)}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 bg-brand-gradient hover:opacity-95 text-white rounded-xl font-bold text-xs transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Paste API Key</span>
                </button>
                <a
                  href="https://www.orcarouter.ai/console/token"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors border border-slate-200"
                >
                  <span>Get OrcaRouter Token</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

          {/* List of existing keys */}
          {keys.length > 0 && (
            <div className="space-y-2">
              {keys.map((k) => {
                const prov = AIService.detectProvider(k.key);
                return (
                  <div
                    key={k.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm"
                  >
                    <div className="flex items-center space-x-3 truncate">
                      {k.isValid === true ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-slate-400" />
                      )}
                      <div className="truncate">
                        <div className="font-bold text-slate-800 flex items-center space-x-1.5">
                          <span>{k.label}</span>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            prov === 'orcarouter' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-700'
                          }`}>
                            {PROVIDERS[prov].name}
                          </span>
                        </div>
                        <div className="font-mono text-slate-400 text-xs">
                          {k.key.substring(0, 10)}••••••••••••••••{k.key.slice(-4)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <button
                        onClick={() => handleTestExistingKey(k.id, k.key)}
                        className="px-2.5 py-1 text-xs font-bold text-rose-600 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                      >
                        Refresh Models
                      </button>
                      <button
                        onClick={() => handleDeleteKey(k.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {!showAddForm && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="w-full py-2.5 border-2 border-dashed border-slate-200 hover:border-rose-300 rounded-xl text-xs font-bold text-slate-600 hover:text-rose-600 hover:bg-rose-50/50 flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Another API Key</span>
                </button>
              )}
            </div>
          )}

          {/* Add Key Form with Instant Auto-Detection */}
          {showAddForm && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Paste API Key / Token
                </span>
                <div className="flex items-center space-x-2">
                  <a
                    href="https://www.orcarouter.ai/console/token"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-rose-600 hover:underline inline-flex items-center space-x-1"
                  >
                    <span>OrcaRouter Console</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="sk-orca-... or AIza... or gsk_..."
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  className="w-full pl-3 pr-10 py-2.5 text-xs font-mono bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Auto-detected Provider Badge */}
              {newKey.trim().length > 5 && (
                <div className={`flex items-center space-x-2 text-xs font-black px-3.5 py-2 rounded-xl border ${
                  detectedProvider === 'orcarouter'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-2 ring-emerald-400/30'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}>
                  <Zap className={`w-4 h-4 ${detectedProvider === 'orcarouter' ? 'text-emerald-600' : 'text-rose-600'} animate-pulse`} />
                  <span>Auto-Detected Provider: {providerInfo.badge}</span>
                </div>
              )}

              {testResult && (
                <div
                  className={`text-xs p-3 rounded-xl flex items-center space-x-2 font-medium ${
                    testResult.success
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                  ) : (
                    <XCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                  )}
                  <span>{testResult.message}</span>
                </div>
              )}

              <div className="flex items-center justify-end space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setTestResult(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddKey}
                  disabled={!newKey.trim() || isTesting}
                  className="px-6 py-2 text-xs font-black bg-brand-gradient hover:opacity-95 disabled:opacity-50 text-white rounded-xl transition-all flex items-center space-x-1.5 shadow-md shadow-rose-500/20 active:scale-[0.98]"
                >
                  {isTesting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Validating Token...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Save & Activate</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
