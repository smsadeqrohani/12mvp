import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Switch, Image } from "react-native";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { toast } from "../../../lib/toast";
import { Button } from "../../../components/ui";
import { Ionicons } from "@expo/vector-icons";
import { Id } from "../../../../convex/_generated/dataModel";
import { pickFile } from "../../../lib/filePicker";

interface StoreItemFormProps {
  item?: {
    _id: Id<"storeItems">;
    name: string;
    description?: string;
    price: number;
    itemType: "stadium" | "mentor" | "avatar";
    matchesBonus?: number;
    tournamentsBonus?: number;
    mentorMode?: 0 | 1 | 2;
    avatarId?: string;
    durationMs: number;
    isActive: boolean;
    imagePath?: string;
    imageStorageId?: Id<"_storage">;
  };
  defaultItemType?: "stadium" | "mentor" | "avatar";
  onClose: () => void;
}

export function StoreItemForm({ item, defaultItemType, onClose }: StoreItemFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [imageMediaType, setImageMediaType] = useState<"upload" | "existing" | "url">("upload");
  const [formData, setFormData] = useState({
    name: item?.name || "",
    description: item?.description || "",
    price: item?.price?.toString() || "0",
    itemType: item?.itemType || defaultItemType || "stadium" as "stadium" | "mentor" | "avatar",
    matchesBonus: item?.matchesBonus?.toString() || "0",
    tournamentsBonus: item?.tournamentsBonus?.toString() || "0",
    mentorMode: item?.mentorMode?.toString() ?? "0",
    avatarId: item?.avatarId || "",
    durationMs: item?.durationMs?.toString() || (30 * 24 * 60 * 60 * 1000).toString(), // 30 days default
    isActive: item?.isActive ?? true,
    imagePath: item?.imagePath || "",
    imageStorageId: item?.imageStorageId as Id<"_storage"> | undefined,
  });

  const createStoreItem = useMutation(api.store.createStoreItem);
  const updateStoreItem = useMutation(api.store.updateStoreItem);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const uploadFile = useMutation(api.files.uploadFile);
  const allFilesResult = useQuery(api.files.getAllFiles, { paginationOpts: { numItems: 100, cursor: null } });
  const allFiles = allFilesResult?.page || [];
  const imageUrl = useQuery(
    api.categories.getImageUrl,
    formData.imageStorageId ? { storageId: formData.imageStorageId } : "skip"
  );

  useEffect(() => {
    if (item) {
      if (item.imageStorageId) setImageMediaType("existing");
      else if (item.imagePath?.startsWith("http")) setImageMediaType("url");
      else setImageMediaType("upload");
    }
  }, [item]);

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("نام آیتم الزامی است");
      return;
    }
    if (parseFloat(formData.price) < 0) {
      toast.error("قیمت نمی‌تواند منفی باشد");
      return;
    }
    if (formData.itemType === "stadium") {
      if (parseFloat(formData.matchesBonus) < 0) {
        toast.error("تعداد بازی نمی‌تواند منفی باشد");
        return;
      }
      if (parseFloat(formData.tournamentsBonus) < 0) {
        toast.error("تعداد تورنومنت نمی‌تواند منفی باشد");
        return;
      }
    } else if (formData.itemType === "mentor") {
      if (formData.mentorMode !== "0" && formData.mentorMode !== "1" && formData.mentorMode !== "2") {
        toast.error("مدل منتور باید ۰، ۱ یا ۲ باشد");
        return;
      }
    } else if (formData.itemType === "avatar") {
      if (formData.avatarId && formData.avatarId.trim().length > 32) {
        toast.error("شناسه آواتار حداکثر ۳۲ کاراکتر");
        return;
      }
    }
    if (parseFloat(formData.durationMs) < 0) {
      toast.error("مدت زمان نمی‌تواند منفی باشد");
      return;
    }
    // 0 is allowed (permanent, never expires)
    // Avatar items are always permanent (durationMs = 0)

    setIsSubmitting(true);
    try {
      const baseData: any = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        price: parseFloat(formData.price),
        itemType: formData.itemType,
        durationMs: parseFloat(formData.durationMs),
        isActive: formData.isActive,
      };
      if (formData.itemType === "stadium" || formData.itemType === "mentor") {
        baseData.imagePath = formData.imagePath?.trim() || undefined;
        baseData.imageStorageId = formData.imageStorageId;
      }
      if (formData.itemType === "avatar") {
        baseData.imagePath = formData.imagePath?.trim() || undefined;
        baseData.imageStorageId = formData.imageStorageId;
      }
      
      if (formData.itemType === "stadium") {
        baseData.matchesBonus = parseInt(formData.matchesBonus);
        baseData.tournamentsBonus = parseInt(formData.tournamentsBonus);
      } else if (formData.itemType === "mentor") {
        baseData.mentorMode = parseInt(formData.mentorMode, 10) as 0 | 1 | 2;
      } else if (formData.itemType === "avatar") {
        baseData.avatarId = formData.avatarId?.trim() || undefined;
        // Avatar items are always permanent
        baseData.durationMs = 0;
      }
      
      // Check if item exists and has a valid ID (not empty string)
      if (item && item._id && item._id !== "" && item._id !== "undefined") {
        await updateStoreItem({
          itemId: item._id,
          ...baseData,
          imagePath: formData.itemType === "stadium" || formData.itemType === "mentor" ? (formData.imagePath?.trim() || null) : undefined,
          imageStorageId: formData.itemType === "stadium" || formData.itemType === "mentor" ? (formData.imageStorageId ?? null) : undefined,
        });
        toast.success("آیتم با موفقیت به‌روزرسانی شد");
      } else {
        await createStoreItem(baseData);
        toast.success("آیتم جدید با موفقیت ایجاد شد");
      }
      onClose();
    } catch (error: any) {
      toast.error(error.message || "خطا در ذخیره آیتم");
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateDurationDays = () => {
    const ms = parseFloat(formData.durationMs) || 0;
    return Math.floor(ms / (24 * 60 * 60 * 1000));
  };

  const setDurationDays = (days: number) => {
    const ms = days * 24 * 60 * 60 * 1000;
    setFormData({ ...formData, durationMs: ms.toString() });
  };

  const handleImageUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const res = await fetch(selectedFile.uri);
      const blob = await res.blob();
      const r = await fetch(uploadUrl, { method: "POST", headers: { "Content-Type": selectedFile.type }, body: blob });
      const { storageId } = await r.json();
      await uploadFile({ storageId, fileName: selectedFile.name, originalName: selectedFile.name, fileType: selectedFile.type, fileSize: selectedFile.size });
      setFormData(prev => ({ ...prev, imageStorageId: storageId as Id<"_storage">, imagePath: selectedFile.name }));
      toast.success("تصویر آپلود شد");
    } catch {
      toast.error("خطا در آپلود");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-background" showsVerticalScrollIndicator={false}>
      <View className="p-4 space-y-4">
        <View>
          <Text className="text-white mb-2 text-right" style={{ fontFamily: 'Meem-SemiBold' }}>
            نام آیتم *
          </Text>
          <TextInput
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            className="bg-gray-800/80 border border-gray-700/60 rounded-xl px-4 py-3 text-white"
            placeholder="مثال: استادیوم"
            placeholderTextColor="#6b7280"
            textAlign="right"
            editable={!isSubmitting}
          />
        </View>

        <View>
          <Text className="text-white mb-2 text-right" style={{ fontFamily: 'Meem-SemiBold' }}>
            توضیحات
          </Text>
          <TextInput
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            className="bg-gray-800/80 border border-gray-700/60 rounded-xl px-4 py-3 text-white"
            placeholder="توضیحات کامل آیتم"
            placeholderTextColor="#6b7280"
            textAlign="right"
            multiline
            numberOfLines={3}
            editable={!isSubmitting}
          />
        </View>

        <View>
          <Text className="text-white mb-2 text-right" style={{ fontFamily: 'Meem-SemiBold' }}>
            نوع آیتم *
          </Text>
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => setFormData({ ...formData, itemType: "stadium" })}
              className={`flex-1 px-4 py-3 rounded-xl border-2 ${
                formData.itemType === "stadium"
                  ? "bg-accent/20 border-accent"
                  : "bg-gray-800/80 border-gray-700/60"
              }`}
              disabled={isSubmitting}
            >
              <Text className={`text-center font-semibold ${
                formData.itemType === "stadium" ? "text-accent" : "text-gray-400"
              }`} style={{ fontFamily: 'Meem-SemiBold' }}>
                استادیوم
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setFormData({ ...formData, itemType: "mentor" })}
              className={`flex-1 px-4 py-3 rounded-xl border-2 ${
                formData.itemType === "mentor"
                  ? "bg-accent/20 border-accent"
                  : "bg-gray-800/80 border-gray-700/60"
              }`}
              disabled={isSubmitting}
            >
              <Text className={`text-center font-semibold ${
                formData.itemType === "mentor" ? "text-accent" : "text-gray-400"
              }`} style={{ fontFamily: 'Meem-SemiBold' }}>
                منتور
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setFormData({ ...formData, itemType: "avatar", durationMs: "0" })}
              className={`flex-1 px-4 py-3 rounded-xl border-2 ${
                formData.itemType === "avatar"
                  ? "bg-accent/20 border-accent"
                  : "bg-gray-800/80 border-gray-700/60"
              }`}
              disabled={isSubmitting}
            >
              <Text className={`text-center font-semibold ${
                formData.itemType === "avatar" ? "text-accent" : "text-gray-400"
              }`} style={{ fontFamily: 'Meem-SemiBold' }}>
                آواتار
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View>
          <Text className="text-white mb-2 text-right" style={{ fontFamily: 'Meem-SemiBold' }}>
            قیمت (امتیاز) *
          </Text>
          <TextInput
            value={formData.price}
            onChangeText={(text) => setFormData({ ...formData, price: text.replace(/[^0-9]/g, "") })}
            className="bg-gray-800/80 border border-gray-700/60 rounded-xl px-4 py-3 text-white"
            placeholder="0"
            placeholderTextColor="#6b7280"
            textAlign="right"
            keyboardType="numeric"
            editable={!isSubmitting}
          />
        </View>

        {formData.itemType === "stadium" && (
          <>
            <View>
              <Text className="text-white mb-2 text-right" style={{ fontFamily: 'Meem-SemiBold' }}>
                تعداد بازی اضافی
              </Text>
              <TextInput
                value={formData.matchesBonus}
                onChangeText={(text) => setFormData({ ...formData, matchesBonus: text.replace(/[^0-9]/g, "") })}
                className="bg-gray-800/80 border border-gray-700/60 rounded-xl px-4 py-3 text-white"
                placeholder="0"
                placeholderTextColor="#6b7280"
                textAlign="right"
                keyboardType="numeric"
                editable={!isSubmitting}
              />
            </View>

            <View>
              <Text className="text-white mb-2 text-right" style={{ fontFamily: 'Meem-SemiBold' }}>
                تعداد تورنومنت اضافی
              </Text>
              <TextInput
                value={formData.tournamentsBonus}
                onChangeText={(text) => setFormData({ ...formData, tournamentsBonus: text.replace(/[^0-9]/g, "") })}
                className="bg-gray-800/80 border border-gray-700/60 rounded-xl px-4 py-3 text-white"
                placeholder="0"
                placeholderTextColor="#6b7280"
                textAlign="right"
                keyboardType="numeric"
                editable={!isSubmitting}
              />
            </View>
          </>
        )}

        {formData.itemType === "mentor" && (
          <View>
            <Text className="text-white mb-2 text-right" style={{ fontFamily: 'Meem-SemiBold' }}>
              مدل منتور *
            </Text>
            <View className="flex-row gap-2 flex-wrap">
              <TouchableOpacity
                onPress={() => setFormData({ ...formData, mentorMode: "0" })}
                className={`flex-1 min-w-[80px] px-3 py-3 rounded-xl border-2 ${
                  formData.mentorMode === "0"
                    ? "bg-accent/20 border-accent"
                    : "bg-gray-800/80 border-gray-700/60"
                }`}
                disabled={isSubmitting}
              >
                <Text className={`text-center font-semibold text-sm ${
                  formData.mentorMode === "0" ? "text-accent" : "text-gray-400"
                }`} style={{ fontFamily: 'Meem-SemiBold' }}>
                  حذف ۰ گزینه
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setFormData({ ...formData, mentorMode: "1" })}
                className={`flex-1 min-w-[80px] px-3 py-3 rounded-xl border-2 ${
                  formData.mentorMode === "1"
                    ? "bg-accent/20 border-accent"
                    : "bg-gray-800/80 border-gray-700/60"
                }`}
                disabled={isSubmitting}
              >
                <Text className={`text-center font-semibold text-sm ${
                  formData.mentorMode === "1" ? "text-accent" : "text-gray-400"
                }`} style={{ fontFamily: 'Meem-SemiBold' }}>
                  حذف ۱ گزینه
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setFormData({ ...formData, mentorMode: "2" })}
                className={`flex-1 min-w-[80px] px-3 py-3 rounded-xl border-2 ${
                  formData.mentorMode === "2"
                    ? "bg-accent/20 border-accent"
                    : "bg-gray-800/80 border-gray-700/60"
                }`}
                disabled={isSubmitting}
              >
                <Text className={`text-center font-semibold text-sm ${
                  formData.mentorMode === "2" ? "text-accent" : "text-gray-400"
                }`} style={{ fontFamily: 'Meem-SemiBold' }}>
                  حذف ۲ گزینه
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {(formData.itemType === "stadium" || formData.itemType === "mentor" || formData.itemType === "avatar") && (
          <View>
            <Text className="text-white mb-2 text-right" style={{ fontFamily: 'Meem-SemiBold' }}>
              تصویر آیتم
            </Text>
            <View className="flex-row gap-2 mb-2">
              {(["upload", "existing", "url"] as const).map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => { setImageMediaType(t); setSelectedFile(null); setFormData(prev => ({ ...prev, imagePath: "", imageStorageId: undefined })); }}
                  className={`flex-1 py-2 rounded-lg border ${imageMediaType === t ? "bg-accent/20 border-accent" : "bg-gray-800 border-gray-600"}`}
                >
                  <Text className={`text-center text-sm ${imageMediaType === t ? "text-accent" : "text-gray-400"}`}>
                    {t === "upload" ? "آپلود" : t === "existing" ? "فایل موجود" : "لینک"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {imageMediaType === "upload" && (
              <>
                <TouchableOpacity
                  onPress={async () => { const f = await pickFile(); if (f) setSelectedFile(f); }}
                  className="border-2 border-dashed border-gray-600 rounded-xl p-4 items-center mb-2"
                >
                  <Ionicons name="cloud-upload-outline" size={28} color="#9ca3af" />
                  <Text className="text-gray-400 mt-1">{selectedFile ? selectedFile.name : "انتخاب فایل"}</Text>
                </TouchableOpacity>
                {selectedFile && <Button onPress={handleImageUpload} loading={isUploading} variant="primary" size="sm">آپلود تصویر</Button>}
              </>
            )}
            {imageMediaType === "existing" && (
              <ScrollView className="max-h-24 mb-2">
                {allFiles.map((file: any) => (
                  <TouchableOpacity
                    key={file._id}
                    onPress={() => setFormData(prev => ({ ...prev, imageStorageId: file.storageId, imagePath: file.originalName }))}
                    className={`p-2 rounded-lg border mb-1 ${formData.imageStorageId === file.storageId ? "bg-accent/20 border-accent" : "bg-gray-800 border-gray-600"}`}
                  >
                    <Text className="text-white text-right text-sm">{file.originalName}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
            {imageMediaType === "url" && (
              <TextInput
                value={formData.imagePath}
                onChangeText={(v) => setFormData(prev => ({ ...prev, imagePath: v, imageStorageId: undefined }))}
                placeholder="https://..."
                className="bg-gray-800/80 border border-gray-700/60 rounded-xl px-4 py-3 text-white mb-2"
                autoCapitalize="none"
                keyboardType="url"
              />
            )}
            {(formData.imageStorageId || (imageMediaType === "url" && formData.imagePath)) && (
              <View className="rounded-xl overflow-hidden bg-gray-800/50 h-28 mt-2">
                {formData.imageStorageId && imageUrl ? (
                  <Image source={{ uri: imageUrl }} className="w-full h-28" resizeMode="contain" />
                ) : imageMediaType === "url" && formData.imagePath ? (
                  <Image source={{ uri: formData.imagePath }} className="w-full h-28" resizeMode="contain" />
                ) : (
                  <View className="flex-1 items-center justify-center"><Text className="text-gray-400">{formData.imagePath}</Text></View>
                )}
              </View>
            )}
          </View>
        )}

        {formData.itemType === "avatar" && (
          <View>
            <Text className="text-white mb-2 text-right" style={{ fontFamily: 'Meem-SemiBold' }}>
              شناسه آواتار (اختیاری)
            </Text>
            <TextInput
              value={formData.avatarId}
              onChangeText={(text) => setFormData({ ...formData, avatarId: text })}
              className="bg-gray-800/80 border border-gray-700/60 rounded-xl px-4 py-3 text-white"
              placeholder="مثال: vip-1 یا خالی بگذارید"
              placeholderTextColor="#6b7280"
              textAlign="right"
              editable={!isSubmitting}
            />
            <Text className="text-gray-400 text-xs mt-1 text-right" style={{ fontFamily: 'Meem-Regular' }}>
              برای نمایش در فروشگاه و پروفایل. تصویر بالا برای آواتار استفاده می‌شود.
            </Text>
          </View>
        )}

        {formData.itemType !== "avatar" && (
          <View>
            <Text className="text-white mb-2 text-right" style={{ fontFamily: 'Meem-SemiBold' }}>
              مدت اعتبار (روز)
            </Text>
            <View className="flex-row items-center gap-2">
              <TextInput
                value={calculateDurationDays().toString()}
                onChangeText={(text) => {
                  const days = parseInt(text.replace(/[^0-9]/g, "")) || 0;
                  setDurationDays(days);
                }}
                className="flex-1 bg-gray-800/80 border border-gray-700/60 rounded-xl px-4 py-3 text-white"
                placeholder="30 (0 برای دائمی)"
                placeholderTextColor="#6b7280"
                textAlign="right"
                keyboardType="numeric"
                editable={!isSubmitting}
              />
              <Text className="text-gray-400" style={{ fontFamily: 'Meem-Regular' }}>
                روز
              </Text>
            </View>
            <Text className="text-gray-400 text-xs mt-1 text-right" style={{ fontFamily: 'Meem-Regular' }}>
              {calculateDurationDays() === 0 ? "0 = فعال دائمی (هرگز expire نمی‌شود)" : ""}
            </Text>
          </View>
        )}

        {formData.itemType === "avatar" && (
          <View className="bg-accent/10 rounded-lg p-3 border border-accent/30">
            <Text className="text-accent text-sm text-right" style={{ fontFamily: 'Meem-SemiBold' }}>
              آواتارها همیشه دائمی هستند (فعال دائمی)
            </Text>
          </View>
        )}

        <View className="flex-row items-center justify-between p-4 bg-gray-800/50 rounded-lg">
          <Text className="text-white" style={{ fontFamily: 'Meem-SemiBold' }}>
            فعال
          </Text>
          <Switch
            value={formData.isActive}
            onValueChange={(value) => setFormData({ ...formData, isActive: value })}
            disabled={isSubmitting}
            trackColor={{ false: "#374151", true: "#ff701a" }}
            thumbColor={formData.isActive ? "#fff" : "#9ca3af"}
          />
        </View>

        <View className="flex-row gap-3 mt-6">
          <TouchableOpacity
            onPress={onClose}
            disabled={isSubmitting}
            className="flex-1 p-4 bg-gray-700 rounded-lg"
          >
            <Text className="text-white text-center font-semibold" style={{ fontFamily: 'Meem-SemiBold' }}>
              انصراف
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 p-4 bg-accent rounded-lg"
          >
            <Text className="text-white text-center font-semibold" style={{ fontFamily: 'Meem-SemiBold' }}>
              {isSubmitting ? "در حال ذخیره..." : item ? "به‌روزرسانی" : "ذخیره"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

