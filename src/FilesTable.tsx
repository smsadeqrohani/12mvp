import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { toast } from "sonner";
import { FilePreview } from "./FilePreview";

export function FilesTable() {
  const [editingFile, setEditingFile] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewFile, setPreviewFile] = useState<any>(null);

  const allFiles = useQuery(api.auth.getAllFiles);
  const generateUploadUrl = useMutation(api.auth.generateUploadUrl);
  const uploadFile = useMutation(api.auth.uploadFile);
  const renameFile = useMutation(api.auth.renameFile);
  const deleteFile = useMutation(api.auth.deleteFile);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    try {
      setIsUploading(true);
      
      // Generate upload URL
      const uploadUrl = await generateUploadUrl();
      
      // Upload file
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": selectedFile.type },
        body: selectedFile,
      });
      
      const { storageId } = await result.json();
      
      // Save file metadata
      await uploadFile({
        storageId,
        fileName: selectedFile.name,
        originalName: selectedFile.name,
        fileType: selectedFile.type,
        fileSize: selectedFile.size,
      });
      
      toast.success("فایل با موفقیت آپلود شد");
      setSelectedFile(null);
      setShowUploadForm(false);
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("خطا در آپلود فایل");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRenameFile = async (fileId: string) => {
    if (!editName.trim()) return;
    try {
      await renameFile({ fileId: fileId as any, newName: editName });
      toast.success("نام فایل با موفقیت تغییر کرد");
      setEditingFile(null);
      setEditName("");
    } catch (error) {
      toast.error("خطا در تغییر نام فایل");
    }
  };

  const handleDeleteFile = async (fileId: string, fileName: string) => {
    if (window.confirm(`آیا مطمئن هستید که می‌خواهید فایل "${fileName}" را حذف کنید؟`)) {
      try {
        await deleteFile({ fileId: fileId as any });
        toast.success("فایل با موفقیت حذف شد");
      } catch (error) {
        toast.error("خطا در حذف فایل");
      }
    }
  };

  const startEdit = (fileId: string, currentName: string) => {
    setEditingFile(fileId);
    setEditName(currentName);
  };

  const cancelEdit = () => {
    setEditingFile(null);
    setEditName("");
  };

  const handlePreviewFile = (file: any) => {
    setPreviewFile(file);
  };

  const handleOpenFile = async (file: any) => {
    try {
      // For opening in new tab, we need to get the URL first
      // This is a simplified approach - in a real app you might want to handle this differently
      toast.info("برای باز کردن فایل در تب جدید، لطفاً از دکمه پیش‌نمایش استفاده کنید");
    } catch (error) {
      toast.error("خطا در باز کردن فایل");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatFileType = (type: string) => {
    if (type.startsWith("image/")) return "تصویر";
    if (type.startsWith("video/")) return "ویدیو";
    if (type.startsWith("audio/")) return "صدا";
    if (type.includes("pdf")) return "PDF";
    if (type.includes("document") || type.includes("word")) return "سند";
    if (type.includes("spreadsheet") || type.includes("excel")) return "جدول";
    if (type.includes("presentation") || type.includes("powerpoint")) return "ارائه";
    return type.split("/")[1]?.toUpperCase() || "فایل";
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) {
      return (
        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    }
    if (type.startsWith("video/")) {
      return (
        <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      );
    }
    if (type.startsWith("audio/")) {
      return (
        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
  };

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 text-right">
              مدیریت فایل‌ها
            </h1>
            <p className="text-gray-400 text-right">
              مدیریت و تنظیم فایل‌های آپلود شده
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-background-light/50 backdrop-blur-sm rounded-lg pl-4 pr-4 py-2 border border-gray-700/30">
              <span className="text-gray-400 text-sm">تعداد کل:</span>
              <span className="text-white font-semibold mr-2">{allFiles?.length || 0}</span>
            </div>
            <button
              onClick={() => setShowUploadForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              آپلود فایل جدید
            </button>
          </div>
        </div>
      </div>
      
      {/* Files Table */}
      <div className="bg-gradient-to-br from-background-light/80 to-background-light/40 backdrop-blur-sm rounded-2xl border border-gray-700/30 overflow-hidden shadow-2xl shadow-black/20">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-800/80 to-gray-700/80 border-b border-gray-600/50">
                <th className="text-right pl-6 pr-6 py-4 text-gray-300 font-semibold text-sm uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    نام فایل
                  </div>
                </th>
                <th className="text-right pl-6 pr-6 py-4 text-gray-300 font-semibold text-sm uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011 1v18a1 1 0 01-1 1H6a1 1 0 01-1-1V2a1 1 0 011-1v3" />
                    </svg>
                    نوع فایل
                  </div>
                </th>
                <th className="text-right pl-6 pr-6 py-4 text-gray-300 font-semibold text-sm uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    تاریخ آپلود
                  </div>
                </th>
                <th className="text-right pl-6 pr-6 py-4 text-gray-300 font-semibold text-sm uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                    </svg>
                    عملیات
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {allFiles?.map((file, index) => (
                <tr
                  key={file._id}
                  className={`group border-b border-gray-700/30 hover:bg-gradient-to-r hover:from-gray-800/30 hover:to-gray-700/20 transition-all duration-300 ${
                    index % 2 === 0 ? "bg-gray-800/10" : "bg-gray-800/5"
                  }`}
                >
                  <td className="pl-6 pr-6 py-6">
                    {editingFile === file._id ? (
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="bg-gray-700/80 backdrop-blur-sm text-white rounded-lg px-4 py-2 text-sm w-40 border border-gray-600/50 focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all"
                          autoFocus
                        />
                        <button
                          onClick={() => handleRenameFile(file._id)}
                          className="w-8 h-8 bg-green-600 hover:bg-green-500 text-white rounded-lg flex items-center justify-center transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="w-8 h-8 bg-red-600 hover:bg-red-500 text-white rounded-lg flex items-center justify-center transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        {getFileIcon(file.fileType)}
                        <div className="flex-1">
                          <span className="text-white font-medium text-sm">{file.fileName}</span>
                          <div className="text-gray-500 text-xs mt-1">
                            {formatFileSize(file.fileSize)}
                          </div>
                        </div>
                        <button
                          onClick={() => startEdit(file._id, file.fileName)}
                          className="w-8 h-8 bg-gray-700/50 hover:bg-accent/20 text-gray-400 hover:text-accent rounded-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="pl-6 pr-6 py-6">
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-blue-900/30 text-blue-400 border border-blue-800/30">
                      {formatFileType(file.fileType)}
                    </span>
                  </td>
                  <td className="pl-6 pr-6 py-6">
                    <div className="text-gray-300 text-sm">
                      {new Date(file.uploadedAt).toLocaleDateString("fa-IR")}
                    </div>
                    <div className="text-gray-500 text-xs">
                      توسط {file.uploaderName}
                    </div>
                  </td>
                  <td className="pl-6 pr-6 py-6">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePreviewFile(file)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 rounded-lg text-xs font-medium transition-all duration-200 border border-blue-800/30 hover:border-blue-700/50"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        پیش‌نمایش
                      </button>
                      <button
                        onClick={() => handleOpenFile(file)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-600/20 hover:bg-green-600/30 text-green-400 hover:text-green-300 rounded-lg text-xs font-medium transition-all duration-200 border border-green-800/30 hover:border-green-700/50"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        باز کردن
                      </button>
                      <button
                        onClick={() => handleDeleteFile(file._id, file.fileName)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 rounded-lg text-xs font-medium transition-all duration-200 border border-red-800/30 hover:border-red-700/50"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {allFiles?.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-400 text-lg">فایلی یافت نشد</p>
            <p className="text-gray-500 text-sm mt-1">هنوز هیچ فایلی آپلود نشده است</p>
            <button
              onClick={() => setShowUploadForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-all duration-200 mt-4"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              آپلود اولین فایل
            </button>
          </div>
        )}
      </div>

      {/* Upload Form Modal */}
      {showUploadForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-background-light/95 to-background-light/80 backdrop-blur-sm rounded-2xl border border-gray-700/30 shadow-2xl shadow-black/20 w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">آپلود فایل جدید</h2>
                <button
                  onClick={() => setShowUploadForm(false)}
                  className="w-8 h-8 bg-gray-700/50 hover:bg-gray-600 text-gray-400 hover:text-white rounded-lg flex items-center justify-center transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 text-right">
                    انتخاب فایل
                  </label>
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                    className="w-full bg-gray-700/50 backdrop-blur-sm text-white rounded-lg px-4 py-3 text-sm border border-gray-600/50 focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all"
                  />
                </div>

                {selectedFile && (
                  <div className="bg-gray-700/30 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      {getFileIcon(selectedFile.type)}
                      <div className="flex-1">
                        <p className="text-white font-medium text-sm">{selectedFile.name}</p>
                        <p className="text-gray-400 text-xs">{formatFileSize(selectedFile.size)}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-700/30">
                  <button
                    onClick={() => setShowUploadForm(false)}
                    className="px-6 py-2 bg-gray-700/50 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg text-sm font-medium transition-all duration-200"
                  >
                    انصراف
                  </button>
                  <button
                    onClick={handleFileUpload}
                    disabled={!selectedFile || isUploading}
                    className="px-6 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        در حال آپلود...
                      </div>
                    ) : (
                      "آپلود فایل"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewFile && (
        <FilePreview 
          file={previewFile} 
          onClose={() => setPreviewFile(null)} 
        />
      )}
    </div>
  );
}
