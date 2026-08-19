import React, { useRef, useState } from 'react';
import { Upload, Plus, FolderOpen, Image as ImageIcon, Video, Code, Trash2, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { UploadedMediaItem } from '../types/metadata';

interface FileUploaderProps {
  files: UploadedMediaItem[];
  onFilesAdded: (newFiles: File[]) => void;
  onClearAll: () => void;
  onRemoveFile: (id: string) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  files,
  onFilesAdded,
  onClearAll,
  onRemoveFile
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const validFiles = Array.from(e.dataTransfer.files);
      onFilesAdded(validFiles);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const validFiles = Array.from(e.target.files);
      onFilesAdded(validFiles);
      e.target.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
      {/* Left: Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`lg:col-span-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer p-6 flex flex-col items-center justify-center text-center relative ${
          isDragOver
            ? 'border-blue-500 bg-blue-50/70 scale-[1.01]'
            : 'border-blue-300 hover:border-blue-400 bg-blue-50/20 hover:bg-blue-50/40'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.webp,.svg,.mp4"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </div>

        <p className="text-slate-600 text-sm font-medium mb-2">
          Drop or
        </p>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors shadow-sm flex items-center space-x-2"
        >
          <Upload className="w-4 h-4" />
          <span>Choose Files</span>
        </button>

        <p className="text-xs text-slate-400 mt-3">
          Select multiple files for batch processing
        </p>

        {/* Supported Types Chips */}
        <div className="flex items-center space-x-2 mt-4">
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-white border border-slate-200 text-slate-600 shadow-xs">
            <ImageIcon className="w-3 h-3 text-blue-500" />
            <span>Images</span>
          </span>
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-white border border-slate-200 text-slate-600 shadow-xs">
            <Video className="w-3 h-3 text-purple-500" />
            <span>Videos</span>
          </span>
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-white border border-slate-200 text-slate-600 shadow-xs">
            <Code className="w-3 h-3 text-emerald-500" />
            <span>SVG</span>
          </span>
        </div>

        {/* File Count Limit Badge */}
        <div className="absolute bottom-3 right-4">
          <span className="text-[10px] font-semibold text-slate-400 bg-white/80 px-2 py-0.5 rounded border border-slate-200">
            {files.length}/500
          </span>
        </div>
      </div>

      {/* Right: Uploaded Files Status Box */}
      <div className="lg:col-span-6 rounded-2xl border border-slate-200 bg-white p-4 flex flex-col justify-between shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
          <div className="flex items-center space-x-2">
            <ImageIcon className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-bold text-slate-800">Uploaded Files</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {files.length} {files.length === 1 ? 'file' : 'files'}
            </span>
          </div>

          {files.length > 0 && (
            <button
              onClick={onClearAll}
              className="inline-flex items-center space-x-1 text-xs font-semibold px-2.5 py-1 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-rose-100"
            >
              <Trash2 className="w-3 h-3" />
              <span>CLEAR ALL</span>
            </button>
          )}
        </div>

        {/* File List Content */}
        {files.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-8 text-center text-slate-400">
            <FolderOpen className="w-12 h-12 text-slate-300 mb-2 stroke-1" />
            <span className="text-xs font-medium text-slate-400">No files uploaded yet</span>
          </div>
        ) : (
          <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
            {files.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors text-xs"
              >
                <div className="flex items-center space-x-2.5 truncate">
                  <img
                    src={item.previewUrl}
                    alt={item.fileName}
                    className="w-9 h-9 rounded-lg object-cover bg-slate-200 border border-slate-200 flex-shrink-0"
                  />
                  <div className="truncate">
                    <p className="font-semibold text-slate-800 truncate" title={item.fileName}>
                      {item.fileName}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {formatFileSize(item.fileSize)} • {item.fileType.toUpperCase()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0">
                  {item.status === 'completed' && (
                    <span className="flex items-center space-x-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Ready</span>
                    </span>
                  )}
                  {item.status === 'processing' && (
                    <span className="flex items-center space-x-1 text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md animate-pulse">
                      <Sparkles className="w-3 h-3 animate-spin" />
                      <span>Generating</span>
                    </span>
                  )}
                  {item.status === 'error' && (
                    <span className="flex items-center space-x-1 text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                      <AlertCircle className="w-3 h-3" />
                      <span>Failed</span>
                    </span>
                  )}
                  {item.status === 'idle' && (
                    <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      Queued
                    </span>
                  )}
                  <button
                    onClick={() => onRemoveFile(item.id)}
                    className="text-slate-400 hover:text-rose-600 p-1 hover:bg-rose-50 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
