import { useState } from "react";
import { View, Text, TouchableOpacity, Platform, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { toast } from "../../../lib/toast";
import { pickFile, fileDataToBlob, formatFileSize, FileData } from "../../../lib/filePicker";

interface FileUploadProps {
  onUploadComplete?: () => void;
}

export function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const generateUploadUrl = useMutation(api.questions.generateUploadUrl);
  const uploadFile = useMutation(api.files.uploadFile);

  const handleSelectFile = async () => {
    try {
      const file = await pickFile();
      if (file) {
        setSelectedFile(file);
      }
    } catch (error) {
      console.error("Error picking file:", error);
      toast.error("خطا در انتخاب فایل");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setIsUploading(true);

      // Generate upload URL
      const uploadUrl = await generateUploadUrl();

      // Convert file to blob for upload
      const blob = await fileDataToBlob(selectedFile);

      // Upload file
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": selectedFile.type },
        body: blob,
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

      onUploadComplete?.();
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("خطا در آپلود فایل");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  return (
    <View className="space-y-4">
      {/* File Selection Area */}
      {!selectedFile ? (
        <TouchableOpacity
          onPress={handleSelectFile}
          className="border-2 border-dashed border-gray-600 rounded-xl p-8 items-center justify-center bg-gray-800/20"
          activeOpacity={0.7}
        >
          <View className="w-16 h-16 bg-accent/20 rounded-full items-center justify-center mb-4">
            <Ionicons name="cloud-upload-outline" size={32} color="#ff701a" />
          </View>
          <Text className="text-white font-semibold text-lg mb-2" style={{ fontFamily: 'Vazirmatn-SemiBold' }}>
            انتخاب فایل برای آپلود
          </Text>
          <Text className="text-gray-400 text-sm text-center" style={{ fontFamily: 'Vazirmatn-Regular' }}>
            کلیک کنید تا فایل را از دستگاه خود انتخاب کنید
          </Text>
          <Text className="text-gray-500 text-xs text-center mt-2" style={{ fontFamily: 'Vazirmatn-Regular' }}>
            پشتیبانی از تمام فرمت‌های فایل
          </Text>
        </TouchableOpacity>
      ) : (
        // Selected File Preview
        <View className="border border-gray-600 rounded-xl p-4 bg-background-light/60">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3 flex-1">
              <View className="w-12 h-12 bg-accent/20 rounded-lg items-center justify-center">
                <Ionicons 
                  name={
                    selectedFile.type.startsWith('image/') ? 'image-outline' :
                    selectedFile.type.startsWith('video/') ? 'videocam-outline' :
                    selectedFile.type.startsWith('audio/') ? 'musical-notes-outline' :
                    'document-outline'
                  }
                  size={24}
                  color="#ff701a"
                />
              </View>
              <View className="flex-1">
                <Text className="text-white font-medium" style={{ fontFamily: 'Vazirmatn-SemiBold' }}>
                  {selectedFile.name}
                </Text>
                <Text className="text-gray-400 text-sm" style={{ fontFamily: 'Vazirmatn-Regular' }}>
                  {formatFileSize(selectedFile.size)}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={handleRemoveFile}
              className="w-8 h-8 bg-red-600/20 rounded-lg items-center justify-center"
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Upload Button */}
      {selectedFile && (
        <TouchableOpacity
          onPress={handleUpload}
          disabled={isUploading}
          className="bg-accent rounded-lg p-4 items-center justify-center disabled:opacity-50"
          activeOpacity={0.7}
        >
          {isUploading ? (
            <View className="flex-row items-center gap-2">
              <ActivityIndicator color="#fff" size="small" />
              <Text className="text-white font-semibold" style={{ fontFamily: 'Vazirmatn-SemiBold' }}>
                در حال آپلود...
              </Text>
            </View>
          ) : (
            <View className="flex-row items-center gap-2">
              <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
              <Text className="text-white font-semibold" style={{ fontFamily: 'Vazirmatn-SemiBold' }}>
                آپلود فایل
              </Text>
            </View>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

