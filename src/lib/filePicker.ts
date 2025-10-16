import { Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';

/**
 * Cross-platform file type
 */
export interface FileData {
  uri: string;
  name: string;
  type: string;
  size: number;
}

/**
 * Pick a file from the device
 * Works on web, iOS, and Android
 */
export async function pickFile(): Promise<FileData | null> {
  try {
    if (Platform.OS === 'web') {
      // Web file picker using native HTML input
      return await pickFileWeb();
    } else {
      // Native file picker for iOS/Android
      return await pickFileNative();
    }
  } catch (error) {
    console.error('Error picking file:', error);
    return null;
  }
}

/**
 * Web-specific file picker
 */
async function pickFileWeb(): Promise<FileData | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,video/*,audio/*';
    
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      
      if (!file) {
        resolve(null);
        return;
      }
      
      resolve({
        uri: URL.createObjectURL(file),
        name: file.name,
        type: file.type,
        size: file.size,
      });
    };
    
    input.oncancel = () => {
      resolve(null);
    };
    
    input.click();
  });
}

/**
 * Native file picker for iOS/Android
 */
async function pickFileNative(): Promise<FileData | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['image/*', 'video/*', 'audio/*'],
    copyToCacheDirectory: true,
  });
  
  if (result.canceled) {
    return null;
  }
  
  const asset = result.assets[0];
  return {
    uri: asset.uri,
    name: asset.name,
    type: asset.mimeType || 'application/octet-stream',
    size: asset.size || 0,
  };
}

/**
 * Convert FileData to Blob for uploading
 * On web, fetch the blob URL
 * On native, create from file URI
 */
export async function fileDataToBlob(fileData: FileData): Promise<Blob> {
  if (Platform.OS === 'web') {
    const response = await fetch(fileData.uri);
    return await response.blob();
  } else {
    // For native platforms, fetch from the local URI
    const response = await fetch(fileData.uri);
    return await response.blob();
  }
}

/**
 * Validate file size
 */
export function isFileSizeValid(size: number, maxSizeMB: number = 10): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return size <= maxSizeBytes;
}

/**
 * Validate file type
 */
export function isFileTypeValid(type: string, allowedTypes: string[]): boolean {
  return allowedTypes.some(allowedType => {
    if (allowedType.endsWith('/*')) {
      const prefix = allowedType.split('/')[0];
      return type.startsWith(prefix + '/');
    }
    return type === allowedType;
  });
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 بایت';
  const k = 1024;
  const sizes = ['بایت', 'کیلوبایت', 'مگابایت', 'گیگابایت'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)).toLocaleString('fa-IR') + ' ' + sizes[i];
}

