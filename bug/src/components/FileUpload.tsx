import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, FileText, Image, Film, Code, File, Download, Trash2 } from 'lucide-react';
import { uploadFiles, deleteFile, formatFileSize, getFileIconType, type UploadedFile, type UploadProgress } from '../lib/upload';

interface FileUploadProps {
  onFilesUploaded: (files: UploadedFile[]) => void;
  onFileDeleted?: (filePath: string) => void;
  existingFiles?: UploadedFile[];
  folder?: string;
  maxFiles?: number;
  maxSizeMB?: number;
  disabled?: boolean;
}

const iconMap = {
  image: Image,
  video: Film,
  document: FileText,
  code: Code,
  other: File,
};

const iconColorMap = {
  image: '#FB923C',
  video: '#9b7cf4',
  document: '#3dd68c',
  code: '#e5a435',
  other: '#7c85a2',
};

export function FileUpload({
  onFilesUploaded,
  onFileDeleted,
  existingFiles = [],
  folder = 'attachments',
  maxFiles = 10,
  maxSizeMB = 25,
  disabled = false,
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState<UploadProgress[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(existingFiles);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(async (fileList: FileList | File[]) => {
    const files = Array.from(fileList);

    // Validate
    if (uploadedFiles.length + files.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const oversized = files.find(f => f.size > maxSizeMB * 1024 * 1024);
    if (oversized) {
      alert(`File "${oversized.name}" exceeds ${maxSizeMB}MB limit`);
      return;
    }

    const results = await uploadFiles(files, folder, (progress) => {
      setUploading([...progress]);
    });

    const successful = results.filter(r => r);
    if (successful.length > 0) {
      const newFiles = [...uploadedFiles, ...successful];
      setUploadedFiles(newFiles);
      onFilesUploaded(newFiles);
    }

    setUploading([]);
  }, [uploadedFiles, folder, maxFiles, maxSizeMB, onFilesUploaded]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (!disabled && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [disabled, handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  }, [disabled]);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDelete = async (file: UploadedFile) => {
    try {
      await deleteFile(file.path);
      const newFiles = uploadedFiles.filter(f => f.path !== file.path);
      setUploadedFiles(newFiles);
      onFilesUploaded(newFiles);
      onFileDeleted?.(file.path);
    } catch (err: any) {
      alert(`Failed to delete: ${err.message}`);
    }
  };

  return (
    <div>
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className="flex flex-col items-center justify-center gap-2 rounded-lg transition-all cursor-pointer"
        style={{
          padding: '20px',
          border: `2px dashed ${isDragOver ? '#FB923C' : 'rgba(255,255,255,0.1)'}`,
          background: isDragOver ? 'rgba(251,146,60,0.05)' : 'rgba(255,255,255,0.02)',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <Upload size={20} color={isDragOver ? '#FB923C' : '#484f6b'} />
        <div className="text-center">
          <p className="text-xs font-medium" style={{ color: isDragOver ? '#FB923C' : '#7c85a2' }}>
            Drop files here or click to upload
          </p>
          <p className="text-xs mt-1" style={{ color: '#484f6b' }}>
            Screenshots, videos, logs, files (max {maxSizeMB}MB each)
          </p>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleFiles(e.target.files);
          e.target.value = '';
        }}
      />

      {/* Upload progress */}
      {uploading.length > 0 && (
        <div className="mt-3 space-y-2">
          {uploading.map((item, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <File size={14} color="#484f6b" />
              <div className="flex-1 min-w-0">
                <p className="text-xs truncate" style={{ color: '#d9dff0' }}>{item.file.name}</p>
                <div className="w-full h-1 rounded-full mt-1" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${item.progress}%`,
                      background: item.status === 'error' ? '#f75f6b' : '#FB923C',
                    }}
                  />
                </div>
              </div>
              <span className="text-xs" style={{ color: item.status === 'error' ? '#f75f6b' : '#484f6b' }}>
                {item.status === 'error' ? 'Failed' : item.status === 'done' ? 'Done' : `${item.progress}%`}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Uploaded files list */}
      {uploadedFiles.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {uploadedFiles.map((file, i) => {
            const fileType = getFileIconType(file.type);
            const Icon = iconMap[fileType];
            const color = iconColorMap[fileType];

            return (
              <div
                key={i}
                className="flex items-center gap-3 px-3 py-2 rounded-lg group transition-colors"
                style={{ background: 'rgba(255,255,255,0.03)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}15` }}>
                  <Icon size={14} color={color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate" style={{ color: '#d9dff0' }}>{file.name}</p>
                  <p className="text-xs" style={{ color: '#484f6b' }}>{formatFileSize(file.size)}</p>
                </div>
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: '#7c85a2' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Download size={13} />
                </a>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(file); }}
                  className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: '#f75f6b' }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
