import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { toast } from "sonner";

interface QuestionsFormProps {
  question?: any;
  onClose: () => void;
}

export function QuestionsForm({ question, onClose }: QuestionsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showFileSelector, setShowFileSelector] = useState(false);
  const [mediaType, setMediaType] = useState<"upload" | "existing" | "url">("upload");
  const [formData, setFormData] = useState({
    mediaPath: question?.mediaPath || "",
    mediaStorageId: question?.mediaStorageId || "",
    questionText: question?.questionText || "",
    option1Text: question?.option1Text || "",
    option2Text: question?.option2Text || "",
    option3Text: question?.option3Text || "",
    option4Text: question?.option4Text || "",
    rightAnswer: question?.rightAnswer ? question.rightAnswer.toString() : "1",
    timeToRespond: question?.timeToRespond || 30,
    grade: question?.grade || 1,
    category: question?.category || "",
  });

  const createQuestion = useMutation(api.questions.createQuestion);
  const updateQuestion = useMutation(api.questions.updateQuestion);
  const generateUploadUrl = useMutation(api.questions.generateUploadUrl);
  const uploadFile = useMutation(api.files.uploadFile);
  const allFilesResult = useQuery(api.files.getAllFiles, {
    paginationOpts: { numItems: 100, cursor: null },
  });
  const allFiles = allFilesResult?.page || [];
  const getMediaUrl = useQuery(api.questions.getMediaUrl, 
    formData.mediaStorageId ? { storageId: formData.mediaStorageId as any } : "skip"
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted with data:", formData);
    setIsSubmitting(true);
    
    try {
      if (question) {
        // Update existing question
        await updateQuestion({
          questionId: question._id,
          mediaPath: formData.mediaPath || undefined,
          mediaStorageId: formData.mediaStorageId || undefined,
          questionText: formData.questionText,
          option1Text: formData.option1Text,
          option2Text: formData.option2Text,
          option3Text: formData.option3Text,
          option4Text: formData.option4Text,
          rightAnswer: parseInt(formData.rightAnswer.toString()),
          timeToRespond: formData.timeToRespond,
          grade: formData.grade,
          category: formData.category || undefined,
        });
        toast.success("سؤال با موفقیت به‌روزرسانی شد");
      } else {
        // Create new question
        await createQuestion({
          mediaPath: formData.mediaPath || undefined,
          mediaStorageId: formData.mediaStorageId || undefined,
          questionText: formData.questionText,
          option1Text: formData.option1Text,
          option2Text: formData.option2Text,
          option3Text: formData.option3Text,
          option4Text: formData.option4Text,
          rightAnswer: parseInt(formData.rightAnswer.toString()),
          timeToRespond: formData.timeToRespond,
          grade: formData.grade,
          category: formData.category || undefined,
        });
        toast.success("سؤال جدید با موفقیت ایجاد شد");
      }
      onClose();
    } catch (error) {
      console.error("Error saving question:", error);
      toast.error("خطا در ذخیره سؤال");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === "rightAnswer" ? (value === "" ? "" : value.toString()) : value
    }));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFormData(prev => ({
        ...prev,
        mediaPath: file.name,
        mediaStorageId: ""
      }));
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
      
      // Save file metadata to files table
      await uploadFile({
        storageId,
        fileName: selectedFile.name,
        originalName: selectedFile.name,
        fileType: selectedFile.type,
        fileSize: selectedFile.size,
      });
      
      setFormData(prev => ({
        ...prev,
        mediaStorageId: storageId
      }));
      
      toast.success("فایل با موفقیت آپلود شد");
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("خطا در آپلود فایل");
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFormData(prev => ({
      ...prev,
      mediaPath: "",
      mediaStorageId: ""
    }));
  };

  const selectExistingFile = (file: any) => {
    setFormData(prev => ({
      ...prev,
      mediaPath: file.fileName,
      mediaStorageId: file.storageId
    }));
    setShowFileSelector(false);
    setMediaType("existing");
  };

  const handleMediaTypeChange = (type: "upload" | "existing" | "url") => {
    setMediaType(type);
    if (type !== "upload") {
      setSelectedFile(null);
    }
    if (type === "url") {
      setFormData(prev => ({
        ...prev,
        mediaStorageId: ""
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-background-light/95 to-background-light/80 backdrop-blur-sm rounded-2xl border border-gray-700/30 shadow-2xl shadow-black/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-accent/20 to-accent/10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {question ? "ویرایش سؤال" : "افزودن سؤال جدید"}
                </h2>
                <p className="text-gray-400 text-sm">
                  {question ? "اطلاعات سؤال را ویرایش کنید" : "اطلاعات سؤال جدید را وارد کنید"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-gray-700/50 hover:bg-gray-600 text-gray-400 hover:text-white rounded-lg flex items-center justify-center transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Question Text */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 text-right">
                متن سؤال *
              </label>
              <textarea
                value={formData.questionText}
                onChange={(e) => handleInputChange("questionText", e.target.value)}
                className="w-full bg-gray-700/50 backdrop-blur-sm text-white rounded-lg px-4 py-3 text-sm border border-gray-600/50 focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all resize-none"
                rows={3}
                placeholder="متن سؤال را وارد کنید..."
                required
              />
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 text-right">
                  گزینه ۱ *
                </label>
                <input
                  type="text"
                  value={formData.option1Text}
                  onChange={(e) => handleInputChange("option1Text", e.target.value)}
                  className="w-full bg-gray-700/50 backdrop-blur-sm text-white rounded-lg px-4 py-3 text-sm border border-gray-600/50 focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all"
                  placeholder="گزینه اول"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 text-right">
                  گزینه ۲ *
                </label>
                <input
                  type="text"
                  value={formData.option2Text}
                  onChange={(e) => handleInputChange("option2Text", e.target.value)}
                  className="w-full bg-gray-700/50 backdrop-blur-sm text-white rounded-lg px-4 py-3 text-sm border border-gray-600/50 focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all"
                  placeholder="گزینه دوم"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 text-right">
                  گزینه ۳ *
                </label>
                <input
                  type="text"
                  value={formData.option3Text}
                  onChange={(e) => handleInputChange("option3Text", e.target.value)}
                  className="w-full bg-gray-700/50 backdrop-blur-sm text-white rounded-lg px-4 py-3 text-sm border border-gray-600/50 focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all"
                  placeholder="گزینه سوم"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 text-right">
                  گزینه ۴ *
                </label>
                <input
                  type="text"
                  value={formData.option4Text}
                  onChange={(e) => handleInputChange("option4Text", e.target.value)}
                  className="w-full bg-gray-700/50 backdrop-blur-sm text-white rounded-lg px-4 py-3 text-sm border border-gray-600/50 focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all"
                  placeholder="گزینه چهارم"
                  required
                />
              </div>
            </div>

            {/* Right Answer */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 text-right">
                پاسخ صحیح *
              </label>
              <select
                value={formData.rightAnswer}
                onChange={(e) => handleInputChange("rightAnswer", e.target.value || "1")}
                className="w-full bg-gray-700/50 backdrop-blur-sm text-white rounded-lg px-4 py-3 text-sm border border-gray-600/50 focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all"
                required
              >
                <option value="1">گزینه ۱: {formData.option1Text || "گزینه اول"}</option>
                <option value="2">گزینه ۲: {formData.option2Text || "گزینه دوم"}</option>
                <option value="3">گزینه ۳: {formData.option3Text || "گزینه سوم"}</option>
                <option value="4">گزینه ۴: {formData.option4Text || "گزینه چهارم"}</option>
              </select>
              <p className="text-gray-500 text-xs mt-1 text-right">
                یکی از گزینه‌ها را به عنوان پاسخ صحیح انتخاب کنید
              </p>
            </div>

            {/* Time and Grade */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 text-right">
                  زمان پاسخ (ثانیه) *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.timeToRespond}
                  onChange={(e) => handleInputChange("timeToRespond", parseInt(e.target.value) || 30)}
                  className="w-full bg-gray-700/50 backdrop-blur-sm text-white rounded-lg px-4 py-3 text-sm border border-gray-600/50 focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 text-right">
                  سطح سختی *
                </label>
                <select
                  value={formData.grade}
                  onChange={(e) => handleInputChange("grade", parseInt(e.target.value))}
                  className="w-full bg-gray-700/50 backdrop-blur-sm text-white rounded-lg px-4 py-3 text-sm border border-gray-600/50 focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all"
                  required
                >
                  <option value={1}>سطح ۱ (آسان)</option>
                  <option value={2}>سطح ۲</option>
                  <option value={3}>سطح ۳ (متوسط)</option>
                  <option value={4}>سطح ۴</option>
                  <option value={5}>سطح ۵ (سخت)</option>
                </select>
              </div>
            </div>

            {/* Media Upload and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 text-right">
                  رسانه (اختیاری)
                </label>
                
                {/* Current Media Display (Edit Mode) */}
                {(question?.mediaPath || question?.mediaStorageId) && (
                  <div className="mb-4 p-3 bg-gray-700/30 rounded-lg border border-gray-600/30">
                    <p className="text-gray-400 text-xs mb-2">رسانه فعلی:</p>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-white text-sm">
                        {question.mediaStorageId ? "فایل آپلود شده" : "لینک خارجی"}
                      </span>
                      {getMediaUrl && (
                        <a
                          href={getMediaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent hover:text-accent-hover text-xs"
                        >
                          مشاهده
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Media Type Selection */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => handleMediaTypeChange("upload")}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      mediaType === "upload"
                        ? "bg-accent text-white"
                        : "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50"
                    }`}
                  >
                    آپلود جدید
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMediaTypeChange("existing")}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      mediaType === "existing"
                        ? "bg-accent text-white"
                        : "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50"
                    }`}
                  >
                    انتخاب موجود
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMediaTypeChange("url")}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      mediaType === "url"
                        ? "bg-accent text-white"
                        : "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50"
                    }`}
                  >
                    لینک خارجی
                  </button>
                </div>

                {/* File Upload Option */}
                {mediaType === "upload" && (
                  <div className="space-y-3">
                    <input
                      type="file"
                      onChange={handleFileSelect}
                      accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                      className="hidden"
                      id="media-upload"
                    />
                    <label
                      htmlFor="media-upload"
                      className="w-full bg-gray-700/50 backdrop-blur-sm text-white rounded-lg px-4 py-3 text-sm border border-gray-600/50 focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all cursor-pointer flex items-center justify-between"
                    >
                      <span className="text-gray-300">
                        {selectedFile ? selectedFile.name : "انتخاب فایل"}
                      </span>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </label>

                    {selectedFile && !formData.mediaStorageId && (
                      <button
                        type="button"
                        onClick={handleFileUpload}
                        disabled={isUploading}
                        className="w-full px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isUploading ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            در حال آپلود...
                          </div>
                        ) : (
                          "آپلود فایل"
                        )}
                      </button>
                    )}
                  </div>
                )}

                {/* Existing File Selection Option */}
                {mediaType === "existing" && (
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => setShowFileSelector(true)}
                      className="w-full bg-gray-700/50 backdrop-blur-sm text-white rounded-lg px-4 py-3 text-sm border border-gray-600/50 focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all cursor-pointer flex items-center justify-between"
                    >
                      <span className="text-gray-300">
                        {formData.mediaPath || "انتخاب فایل موجود"}
                      </span>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                )}

                {/* External URL Option */}
                {mediaType === "url" && (
                  <div className="space-y-3">
                    <input
                      type="url"
                      value={formData.mediaPath}
                      onChange={(e) => handleInputChange("mediaPath", e.target.value)}
                      className="w-full bg-gray-700/50 backdrop-blur-sm text-white rounded-lg px-4 py-3 text-sm border border-gray-600/50 focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all"
                      placeholder="https://example.com/media"
                    />
                  </div>
                )}

                {/* Remove Media Button */}
                {(formData.mediaPath || formData.mediaStorageId || selectedFile) && (
                  <button
                    type="button"
                    onClick={removeFile}
                    className="w-full mt-3 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 rounded-lg text-sm font-medium transition-all duration-200 border border-red-800/30 hover:border-red-700/50"
                  >
                    حذف رسانه
                  </button>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 text-right">
                  دسته‌بندی (اختیاری)
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => handleInputChange("category", e.target.value)}
                  className="w-full bg-gray-700/50 backdrop-blur-sm text-white rounded-lg px-4 py-3 text-sm border border-gray-600/50 focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all"
                  placeholder="دسته‌بندی سؤال"
                />
              </div>
            </div>

            {/* Grade Visual Indicator */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 text-right">
                نمایش سطح سختی
              </label>
              <div className="flex items-center gap-2">
                {Array.from({ length: 5 }, (_, i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      i < formData.grade ? "bg-accent text-white" : "bg-gray-700 text-gray-400"
                    }`}
                  >
                    {i + 1}
                  </div>
                ))}
                <span className="text-gray-400 text-sm mr-2">
                  {formData.grade === 1 && "آسان"}
                  {formData.grade === 2 && "نسبتاً آسان"}
                  {formData.grade === 3 && "متوسط"}
                  {formData.grade === 4 && "نسبتاً سخت"}
                  {formData.grade === 5 && "سخت"}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-700/30">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 bg-gray-700/50 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg text-sm font-medium transition-all duration-200"
              >
                انصراف
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    در حال ذخیره...
                  </div>
                ) : (
                  question ? "به‌روزرسانی سؤال" : "ایجاد سؤال"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* File Selector Modal */}
      {showFileSelector && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-60 p-4">
          <div className="bg-gradient-to-br from-background-light/95 to-background-light/80 backdrop-blur-sm rounded-2xl border border-gray-700/30 shadow-2xl shadow-black/20 w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">انتخاب فایل موجود</h2>
                <button
                  onClick={() => setShowFileSelector(false)}
                  className="w-8 h-8 bg-gray-700/50 hover:bg-gray-600 text-gray-400 hover:text-white rounded-lg flex items-center justify-center transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {allFiles && allFiles.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {allFiles.map((file) => (
                      <div
                        key={file._id}
                        onClick={() => selectExistingFile(file)}
                        className="bg-gray-700/50 hover:bg-gray-600/50 rounded-lg p-4 border border-gray-600/30 hover:border-accent/30 cursor-pointer transition-all"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          {file.fileType.startsWith("image/") ? (
                            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          )}
                          <span className="text-white font-medium text-sm truncate">{file.fileName}</span>
                        </div>
                        <div className="text-gray-400 text-xs">
                          {file.fileType.split("/")[1]?.toUpperCase() || "فایل"} • {Math.round(file.fileSize / 1024)} KB
                        </div>
                        <div className="text-gray-500 text-xs mt-1">
                          {new Date(file.uploadedAt).toLocaleDateString("fa-IR")}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-400 text-lg">فایلی یافت نشد</p>
                    <p className="text-gray-500 text-sm mt-1">ابتدا فایلی آپلود کنید</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
