import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Modal, Platform, Image } from "react-native";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { toast } from "../../../lib/toast";
import { Button, TextInput } from "../../../components/ui";
import { Ionicons } from "@expo/vector-icons";
import { pickFile } from "../../../lib/filePicker";

interface CategoryFormProps {
  category?: any;
  onClose: () => void;
}

export function CategoryForm({ category, onClose }: CategoryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [mediaType, setMediaType] = useState<"upload" | "existing" | "url">("upload");
  const [formData, setFormData] = useState({
    persianName: category?.persianName || "",
    slug: category?.slug || "",
    englishName: category?.englishName || "",
    imagePath: category?.imagePath || "",
    imageStorageId: category?.imageStorageId || undefined,
  });

  const createCategory = useMutation(api.categories.createCategory);
  const updateCategory = useMutation(api.categories.updateCategory);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const uploadFile = useMutation(api.files.uploadFile);
  const allFilesResult = useQuery(api.files.getAllFiles, {
    paginationOpts: { numItems: 100, cursor: null },
  });
  const allFiles = allFilesResult?.page || [];
  const getImageUrl = useQuery(
    api.categories.getImageUrl,
    formData.imageStorageId ? { storageId: formData.imageStorageId as any } : "skip"
  );

  // Detect image source when editing existing category
  useEffect(() => {
    if (category) {
      if (category.imageStorageId) {
        setMediaType("existing");
      } else if (category.imagePath && category.imagePath.startsWith("http")) {
        setMediaType("url");
      } else {
        setMediaType("upload");
      }
    }
  }, [category]);


  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Use null when clearing image (so backend can unset); undefined = no change for create
      const imagePath = formData.imagePath?.trim() || null;
      const imageStorageId = formData.imageStorageId ?? null;
      if (category) {
        await updateCategory({
          categoryId: category._id,
          persianName: formData.persianName,
          slug: formData.slug,
          englishName: formData.englishName || undefined,
          imagePath,
          imageStorageId,
        });
        toast.success("دسته‌بندی با موفقیت به‌روزرسانی شد");
      } else {
        await createCategory({
          persianName: formData.persianName,
          slug: formData.slug,
          englishName: formData.englishName || undefined,
          imagePath: imagePath || undefined,
          imageStorageId: imageStorageId || undefined,
        });
        toast.success("دسته‌بندی جدید با موفقیت ایجاد شد");
      }
      onClose();
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error("خطا در ذخیره دسته‌بندی: " + (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const response = await fetch(selectedFile.uri);
      const fileBlob = await response.blob();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": selectedFile.type },
        body: fileBlob,
      });
      const { storageId } = await result.json();
      await uploadFile({
        storageId,
        fileName: selectedFile.name,
        originalName: selectedFile.name,
        fileType: selectedFile.type,
        fileSize: selectedFile.size,
      });
      setFormData((prev) => ({
        ...prev,
        imageStorageId: storageId as any,
        imagePath: selectedFile.name,
      }));
      toast.success("فایل با موفقیت آپلود شد");
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("خطا در آپلود فایل");
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // On web, render without Modal to avoid input issues
  if (Platform.OS === 'web') {
    return (
      <View className="flex-1 bg-background">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-gray-700">
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 bg-accent/20 rounded-lg items-center justify-center">
              <Ionicons name="folder-outline" size={24} color="#ff701a" />
            </View>
            <View>
              <Text className="text-xl font-bold text-white text-right">
                {category ? "ویرایش دسته‌بندی" : "افزودن دسته‌بندی جدید"}
              </Text>
              <Text className="text-gray-400 text-sm text-right">
                {category ? "اطلاعات دسته‌بندی را ویرایش کنید" : "اطلاعات دسته‌بندی جدید را وارد کنید"}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={onClose}
            className="w-8 h-8 bg-gray-700/50 rounded-lg items-center justify-center"
          >
            <Ionicons name="close" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
          {/* Persian Name */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-300 mb-2 text-right">
              نام فارسی *
            </Text>
            <TextInput
              value={formData.persianName}
              onChangeText={(value) => handleInputChange("persianName", value)}
              placeholder="نام فارسی دسته‌بندی را وارد کنید..."
              textAlign="right"
            />
          </View>

          {/* Slug */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-300 mb-2 text-right">
              Slug *
            </Text>
            <TextInput
              value={formData.slug}
              onChangeText={(value) => handleInputChange("slug", value.toLowerCase().replace(/\s+/g, '-'))}
              placeholder="category-slug"
              textAlign="left"
              autoCapitalize="none"
              style={{
                fontFamily: Platform.OS === 'web' ? 'monospace' : undefined,
              }}
            />
            <Text className="text-gray-500 text-xs mt-1 text-right">
              فقط حروف کوچک انگلیسی، اعداد و خط تیره (-)
            </Text>
          </View>

          {/* English Name */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-300 mb-2 text-right">
              نام انگلیسی (اختیاری)
            </Text>
            <TextInput
              value={formData.englishName}
              onChangeText={(value) => handleInputChange("englishName", value)}
              placeholder="English Name (optional)"
              textAlign="left"
            />
          </View>

          {/* Image (optional) — external link, upload, or existing file */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-300 mb-2 text-right">
              تصویر دسته‌بندی (اختیاری)
            </Text>
            <View className="flex-row gap-2 mb-3">
              <TouchableOpacity
                onPress={() => {
                  setMediaType("upload");
                  setSelectedFile(null);
                  setFormData((prev) => ({ ...prev, imagePath: "", imageStorageId: undefined }));
                }}
                className={`flex-1 py-2 px-4 rounded-lg border ${mediaType === "upload" ? "bg-accent/20 border-accent" : "bg-gray-700/50 border-gray-600"}`}
              >
                <Text className={`text-center font-medium ${mediaType === "upload" ? "text-accent" : "text-gray-300"}`}>آپلود فایل</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setMediaType("existing");
                  setSelectedFile(null);
                  setFormData((prev) => ({ ...prev, imagePath: "", imageStorageId: undefined }));
                }}
                className={`flex-1 py-2 px-4 rounded-lg border ${mediaType === "existing" ? "bg-accent/20 border-accent" : "bg-gray-700/50 border-gray-600"}`}
              >
                <Text className={`text-center font-medium ${mediaType === "existing" ? "text-accent" : "text-gray-300"}`}>فایل موجود</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setMediaType("url");
                  setSelectedFile(null);
                  setFormData((prev) => ({ ...prev, imagePath: "", imageStorageId: undefined }));
                }}
                className={`flex-1 py-2 px-4 rounded-lg border ${mediaType === "url" ? "bg-accent/20 border-accent" : "bg-gray-700/50 border-gray-600"}`}
              >
                <Text className={`text-center font-medium ${mediaType === "url" ? "text-accent" : "text-gray-300"}`}>لینک خارجی</Text>
              </TouchableOpacity>
            </View>
            {mediaType === "upload" && (
              <View className="space-y-3">
                <TouchableOpacity
                  onPress={async () => {
                    const file = await pickFile();
                    if (file) setSelectedFile(file);
                  }}
                  className="border-2 border-dashed border-gray-600 rounded-lg p-4 items-center"
                >
                  <Ionicons name="cloud-upload-outline" size={32} color="#9ca3af" />
                  <Text className="text-gray-400 mt-2 text-center">{selectedFile ? selectedFile.name : "فایل را انتخاب کنید"}</Text>
                </TouchableOpacity>
                {selectedFile && (
                  <Button onPress={handleFileUpload} loading={isUploading} variant="primary" size="sm">آپلود فایل</Button>
                )}
              </View>
            )}
            {mediaType === "existing" && (
              <ScrollView className="max-h-32">
                {allFiles.map((file) => (
                  <TouchableOpacity
                    key={file._id}
                    onPress={() => setFormData((prev) => ({ ...prev, imageStorageId: file.storageId as any, imagePath: file.originalName }))}
                    className={`p-3 rounded-lg border mb-2 ${formData.imageStorageId === file.storageId ? "bg-accent/20 border-accent" : "bg-gray-700/50 border-gray-600"}`}
                  >
                    <Text className="text-white text-right">{file.originalName}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
            {mediaType === "url" && (
              <View>
                <TextInput
                  value={formData.imagePath}
                  onChangeText={(value) => setFormData((prev) => ({ ...prev, imagePath: value, imageStorageId: undefined }))}
                  placeholder="https://example.com/image.jpg"
                  textAlign="left"
                  autoCapitalize="none"
                  keyboardType="url"
                />
                <Text className="text-gray-500 text-xs mt-1 text-right">لینک مستقیم به تصویر</Text>
              </View>
            )}
            {(formData.imageStorageId || (mediaType === "url" && formData.imagePath)) && (
              <View className="mt-4">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-gray-300 text-right">پیش‌نمایش:</Text>
                  <TouchableOpacity
                    onPress={() => setFormData((prev) => ({ ...prev, imagePath: "", imageStorageId: undefined }))}
                    className="px-3 py-1 bg-red-600/20 rounded-lg"
                  >
                    <Text className="text-red-400 text-xs">پاک کردن تصویر</Text>
                  </TouchableOpacity>
                </View>
                <View className="bg-gray-700/50 rounded-lg p-4 min-h-20">
                  {formData.imageStorageId && getImageUrl ? (
                    <Image source={{ uri: getImageUrl }} className="w-full h-32 rounded-lg" resizeMode="contain" />
                  ) : mediaType === "url" && formData.imagePath ? (
                    <Image source={{ uri: formData.imagePath }} className="w-full h-32 rounded-lg" resizeMode="contain" />
                  ) : (
                    <Text className="text-white text-right">{formData.imagePath}</Text>
                  )}
                </View>
              </View>
            )}
          </View>

          {/* Submit Button */}
          <View className="mt-8 mb-4">
            <Button
              onPress={handleSubmit}
              loading={isSubmitting}
              variant="primary"
              size="lg"
              disabled={!formData.persianName || !formData.slug}
            >
              {category ? "به‌روزرسانی دسته‌بندی" : "ایجاد دسته‌بندی"}
            </Button>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <Modal
      visible={true}
      animationType="slide"
      presentationStyle={Platform.OS === 'web' ? 'fullScreen' : 'pageSheet'}
    >
      <View className="flex-1 bg-background">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-gray-700">
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 bg-accent/20 rounded-lg items-center justify-center">
              <Ionicons name="folder-outline" size={24} color="#ff701a" />
            </View>
            <View>
              <Text className="text-xl font-bold text-white text-right">
                {category ? "ویرایش دسته‌بندی" : "افزودن دسته‌بندی جدید"}
              </Text>
              <Text className="text-gray-400 text-sm text-right">
                {category ? "اطلاعات دسته‌بندی را ویرایش کنید" : "اطلاعات دسته‌بندی جدید را وارد کنید"}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={onClose}
            className="w-8 h-8 bg-gray-700/50 rounded-lg items-center justify-center"
          >
            <Ionicons name="close" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
          {/* Persian Name */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-300 mb-2 text-right">
              نام فارسی *
            </Text>
            <TextInput
              value={formData.persianName}
              onChangeText={(value) => handleInputChange("persianName", value)}
              placeholder="نام فارسی دسته‌بندی را وارد کنید..."
              textAlign="right"
            />
          </View>

          {/* Slug */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-300 mb-2 text-right">
              Slug *
            </Text>
            <TextInput
              value={formData.slug}
              onChangeText={(value) => handleInputChange("slug", value.toLowerCase().replace(/\s+/g, '-'))}
              placeholder="category-slug"
              textAlign="left"
              autoCapitalize="none"
              style={{
                fontFamily: Platform.OS === 'web' ? 'monospace' : undefined,
              }}
            />
            <Text className="text-gray-500 text-xs mt-1 text-right">
              فقط حروف کوچک انگلیسی، اعداد و خط تیره (-)
            </Text>
          </View>

          {/* English Name */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-300 mb-2 text-right">
              نام انگلیسی (اختیاری)
            </Text>
            <TextInput
              value={formData.englishName}
              onChangeText={(value) => handleInputChange("englishName", value)}
              placeholder="English Name (optional)"
              textAlign="left"
            />
          </View>

          {/* Image (optional) — external link, upload, or existing file */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-300 mb-2 text-right">
              تصویر دسته‌بندی (اختیاری)
            </Text>
            <View className="flex-row gap-2 mb-3">
              <TouchableOpacity
                onPress={() => {
                  setMediaType("upload");
                  setSelectedFile(null);
                  setFormData((prev) => ({ ...prev, imagePath: "", imageStorageId: undefined }));
                }}
                className={`flex-1 py-2 px-4 rounded-lg border ${mediaType === "upload" ? "bg-accent/20 border-accent" : "bg-gray-700/50 border-gray-600"}`}
              >
                <Text className={`text-center font-medium ${mediaType === "upload" ? "text-accent" : "text-gray-300"}`}>آپلود فایل</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setMediaType("existing");
                  setSelectedFile(null);
                  setFormData((prev) => ({ ...prev, imagePath: "", imageStorageId: undefined }));
                }}
                className={`flex-1 py-2 px-4 rounded-lg border ${mediaType === "existing" ? "bg-accent/20 border-accent" : "bg-gray-700/50 border-gray-600"}`}
              >
                <Text className={`text-center font-medium ${mediaType === "existing" ? "text-accent" : "text-gray-300"}`}>فایل موجود</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setMediaType("url");
                  setSelectedFile(null);
                  setFormData((prev) => ({ ...prev, imagePath: "", imageStorageId: undefined }));
                }}
                className={`flex-1 py-2 px-4 rounded-lg border ${mediaType === "url" ? "bg-accent/20 border-accent" : "bg-gray-700/50 border-gray-600"}`}
              >
                <Text className={`text-center font-medium ${mediaType === "url" ? "text-accent" : "text-gray-300"}`}>لینک خارجی</Text>
              </TouchableOpacity>
            </View>
            {mediaType === "upload" && (
              <View className="space-y-3">
                <TouchableOpacity
                  onPress={async () => {
                    const file = await pickFile();
                    if (file) setSelectedFile(file);
                  }}
                  className="border-2 border-dashed border-gray-600 rounded-lg p-4 items-center"
                >
                  <Ionicons name="cloud-upload-outline" size={32} color="#9ca3af" />
                  <Text className="text-gray-400 mt-2 text-center">{selectedFile ? selectedFile.name : "فایل را انتخاب کنید"}</Text>
                </TouchableOpacity>
                {selectedFile && (
                  <Button onPress={handleFileUpload} loading={isUploading} variant="primary" size="sm">آپلود فایل</Button>
                )}
              </View>
            )}
            {mediaType === "existing" && (
              <ScrollView className="max-h-32">
                {allFiles.map((file) => (
                  <TouchableOpacity
                    key={file._id}
                    onPress={() => setFormData((prev) => ({ ...prev, imageStorageId: file.storageId as any, imagePath: file.originalName }))}
                    className={`p-3 rounded-lg border mb-2 ${formData.imageStorageId === file.storageId ? "bg-accent/20 border-accent" : "bg-gray-700/50 border-gray-600"}`}
                  >
                    <Text className="text-white text-right">{file.originalName}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
            {mediaType === "url" && (
              <View>
                <TextInput
                  value={formData.imagePath}
                  onChangeText={(value) => setFormData((prev) => ({ ...prev, imagePath: value, imageStorageId: undefined }))}
                  placeholder="https://example.com/image.jpg"
                  textAlign="left"
                  autoCapitalize="none"
                  keyboardType="url"
                />
                <Text className="text-gray-500 text-xs mt-1 text-right">لینک مستقیم به تصویر</Text>
              </View>
            )}
            {(formData.imageStorageId || (mediaType === "url" && formData.imagePath)) && (
              <View className="mt-4">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-gray-300 text-right">پیش‌نمایش:</Text>
                  <TouchableOpacity
                    onPress={() => setFormData((prev) => ({ ...prev, imagePath: "", imageStorageId: undefined }))}
                    className="px-3 py-1 bg-red-600/20 rounded-lg"
                  >
                    <Text className="text-red-400 text-xs">پاک کردن تصویر</Text>
                  </TouchableOpacity>
                </View>
                <View className="bg-gray-700/50 rounded-lg p-4 min-h-20">
                  {formData.imageStorageId && getImageUrl ? (
                    <Image source={{ uri: getImageUrl }} className="w-full h-32 rounded-lg" resizeMode="contain" />
                  ) : mediaType === "url" && formData.imagePath ? (
                    <Image source={{ uri: formData.imagePath }} className="w-full h-32 rounded-lg" resizeMode="contain" />
                  ) : (
                    <Text className="text-white text-right">{formData.imagePath}</Text>
                  )}
                </View>
              </View>
            )}
          </View>

          {/* Submit Button */}
          <View className="mt-8 mb-4">
            <Button
              onPress={handleSubmit}
              loading={isSubmitting}
              variant="primary"
              size="lg"
              disabled={!formData.persianName || !formData.slug}
            >
              {category ? "به‌روزرسانی دسته‌بندی" : "ایجاد دسته‌بندی"}
            </Button>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

