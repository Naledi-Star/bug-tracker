import { supabase } from './supabase';

const BUCKET_NAME = 'uploads';

export interface UploadedFile {
  url: string;
  name: string;
  size: number;
  type: string;
  path: string;
}

export interface UploadProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'done' | 'error';
  result?: UploadedFile;
  error?: string;
}

/**
 * Upload a single file to Supabase Storage
 */
export async function uploadFile(
  file: File,
  folder: string = 'attachments'
): Promise<UploadedFile> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
  const filePath = `${folder}/${fileName}`;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  return {
    url: urlData.publicUrl,
    name: file.name,
    size: file.size,
    type: file.type,
    path: filePath,
  };
}

/**
 * Upload multiple files
 */
export async function uploadFiles(
  files: File[],
  folder: string = 'attachments',
  onProgress?: (progress: UploadProgress[]) => void
): Promise<UploadedFile[]> {
  const progress: UploadProgress[] = files.map(file => ({
    file,
    progress: 0,
    status: 'pending',
  }));

  onProgress?.([...progress]);

  const results: UploadedFile[] = [];

  for (let i = 0; i < files.length; i++) {
    progress[i].status = 'uploading';
    progress[i].progress = 0;
    onProgress?.([...progress]);

    try {
      const result = await uploadFile(files[i], folder);
      progress[i].status = 'done';
      progress[i].progress = 100;
      progress[i].result = result;
      results.push(result);
    } catch (err: any) {
      progress[i].status = 'error';
      progress[i].error = err.message;
    }

    onProgress?.([...progress]);
  }

  return results;
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFile(filePath: string): Promise<void> {
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([filePath]);

  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
}

/**
 * Get public URL for a stored file
 */
export function getFileUrl(filePath: string): string {
  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  return data.publicUrl;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Get file icon type based on MIME type
 */
export function getFileIconType(mimeType: string): 'image' | 'video' | 'document' | 'code' | 'other' {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.includes('pdf') || mimeType.includes('word') || mimeType.includes('excel') || mimeType.includes('powerpoint')) return 'document';
  if (mimeType.includes('javascript') || mimeType.includes('typescript') || mimeType.includes('json') || mimeType.includes('html') || mimeType.includes('css')) return 'code';
  return 'other';
}
