import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

interface FilePreviewProps {
  file: {
    _id: string;
    fileName: string;
    fileType: string;
    storageId: string;
  };
  onClose: () => void;
}

export function FilePreview({ file, onClose }: FilePreviewProps) {
  const fileUrl = useQuery(api.questions.getMediaUrl, { storageId: file.storageId });

  if (!fileUrl) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-background-light/95 to-background-light/80 backdrop-blur-sm rounded-2xl border border-gray-700/30 shadow-2xl shadow-black/20 w-full max-w-4xl max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-700/30">
            <h2 className="text-xl font-bold text-white">{file.fileName}</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-gray-700/50 hover:bg-gray-600 text-gray-400 hover:text-white rounded-lg flex items-center justify-center transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="p-4 flex items-center justify-center">
            <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-400 text-lg">در حال بارگذاری...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-background-light/95 to-background-light/80 backdrop-blur-sm rounded-2xl border border-gray-700/30 shadow-2xl shadow-black/20 w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-700/30">
          <h2 className="text-xl font-bold text-white">{file.fileName}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-700/50 hover:bg-gray-600 text-gray-400 hover:text-white rounded-lg flex items-center justify-center transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-4 max-h-[calc(90vh-80px)] overflow-auto">
          {file.fileType.startsWith("image/") ? (
            <div className="flex justify-center">
              <img
                src={fileUrl}
                alt={file.fileName}
                className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
              />
            </div>
          ) : file.fileType.startsWith("video/") ? (
            <div className="flex justify-center">
              <video
                src={fileUrl}
                controls
                className="max-w-full max-h-full rounded-lg shadow-lg"
              >
                مرورگر شما از پخش ویدیو پشتیبانی نمی‌کند.
              </video>
            </div>
          ) : file.fileType.startsWith("audio/") ? (
            <div className="flex justify-center">
              <audio
                src={fileUrl}
                controls
                className="w-full max-w-md"
              >
                مرورگر شما از پخش صدا پشتیبانی نمی‌کند.
              </audio>
            </div>
          ) : file.fileType.includes("pdf") ? (
            <div className="w-full h-[600px]">
              <iframe
                src={fileUrl}
                className="w-full h-full border-0 rounded-lg shadow-lg"
                title={file.fileName}
              />
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-400 text-lg mb-4">پیش‌نمایش برای این نوع فایل پشتیبانی نمی‌شود</p>
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                باز کردن در تب جدید
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
