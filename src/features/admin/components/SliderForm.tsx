import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Platform, Image } from "react-native";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { toast } from "../../../lib/toast";
import { Button, TextInput } from "../../../components/ui";
import { Ionicons } from "@expo/vector-icons";
import { pickFile } from "../../../lib/filePicker";

type SliderPosition = "dashboard" | "game_result" | "leaderboard";
type SlideItem = { imagePath?: string; imageStorageId?: Id<"_storage">; order: number };

interface SliderFormProps {
  slider?: {
    _id: Id<"sliders">;
    name?: string;
    position: SliderPosition;
    slides: SlideItem[];
  };
  onClose: () => void;
}

const POSITION_LABELS: Record<SliderPosition, string> = {
  dashboard: "داشبورد",
  game_result: "نتیجه بازی",
  leaderboard: "جدول امتیازات",
};

function SlideThumbnail({
  storageId,
  imagePath,
}: {
  storageId?: Id<"_storage">;
  imagePath?: string;
}) {
  const imageUrl = useQuery(
    api.sliders.getImageUrl,
    storageId ? { storageId } : "skip"
  );
  if (imagePath?.startsWith("http"))
    return <Image source={{ uri: imagePath }} className="w-full h-full" resizeMode="cover" />;
  if (storageId && imageUrl)
    return <Image source={{ uri: imageUrl }} className="w-full h-full" resizeMode="cover" />;
  return (
    <View className="w-full h-full items-center justify-center">
      <Ionicons name="image" size={24} color="#6b7280" />
    </View>
  );
}

export function SliderForm({ slider, onClose }: SliderFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [formData, setFormData] = useState({
    name: slider?.name ?? "",
    position: (slider?.position ?? "dashboard") as SliderPosition,
    slides: (slider?.slides?.length
      ? [...slider.slides].sort((a, b) => a.order - b.order)
      : [{ order: 0 }]) as SlideItem[],
  });

  const createSlider = useMutation(api.sliders.createSlider);
  const updateSlider = useMutation(api.sliders.updateSlider);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const uploadFile = useMutation(api.files.uploadFile);
  const allFilesResult = useQuery(api.files.getAllFiles, {
    paginationOpts: { numItems: 100, cursor: null },
  });
  const allFiles = allFilesResult?.page ?? [];

  const currentSlide = formData.slides[currentSlideIndex];

  const getMediaType = (slide: SlideItem): "upload" | "existing" | "url" => {
    if (slide?.imageStorageId) return "existing";
    if (slide?.imagePath?.startsWith("http")) return "url";
    return "upload";
  };
  const [mediaType, setMediaType] = useState<"upload" | "existing" | "url">(
    () => getMediaType(currentSlide)
  );

  useEffect(() => {
    if (currentSlide) setMediaType(getMediaType(currentSlide));
  }, [currentSlideIndex, currentSlide?.imageStorageId, currentSlide?.imagePath]);

  const updateSlide = (index: number, patch: Partial<SlideItem>) => {
    setFormData((prev) => ({
      ...prev,
      slides: prev.slides.map((s, i) =>
        i === index ? { ...s, order: s.order, ...patch } : s
      ),
    }));
  };

  const addSlide = () => {
    const nextOrder = formData.slides.length;
    setFormData((prev) => ({
      ...prev,
      slides: [...prev.slides, { order: nextOrder }],
    }));
    setCurrentSlideIndex(formData.slides.length);
    setMediaType("upload");
  };

  const removeSlide = (index: number) => {
    if (formData.slides.length <= 1) {
      toast.error("حداقل یک اسلاید لازم است");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      slides: prev.slides
        .filter((_, i) => i !== index)
        .map((s, i) => ({ ...s, order: i })),
    }));
    if (currentSlideIndex >= formData.slides.length - 1) {
      setCurrentSlideIndex(Math.max(0, formData.slides.length - 2));
    } else if (currentSlideIndex > index) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };

  const moveSlide = (index: number, dir: "up" | "down") => {
    const newSlides = [...formData.slides];
    const j = dir === "up" ? index - 1 : index + 1;
    if (j < 0 || j >= newSlides.length) return;
    [newSlides[index], newSlides[j]] = [newSlides[j], newSlides[index]];
    newSlides.forEach((s, i) => (s.order = i));
    setFormData((prev) => ({ ...prev, slides: newSlides }));
    setCurrentSlideIndex(j);
  };

  const handleSubmit = async () => {
    const validSlides = formData.slides.filter(
      (s) => s.imagePath || s.imageStorageId
    );
    if (!validSlides.length) {
      toast.error("حداقل یک اسلاید با تصویر لازم است");
      return;
    }
    setIsSubmitting(true);
    try {
      const slides = validSlides.map((s, i) => ({
        imagePath: s.imagePath || undefined,
        imageStorageId: s.imageStorageId,
        order: i,
      }));
      if (slider) {
        await updateSlider({
          sliderId: slider._id,
          name: formData.name.trim() || undefined,
          position: formData.position,
          slides,
        });
        toast.success("اسلایدر به‌روزرسانی شد");
      } else {
        await createSlider({
          name: formData.name.trim() || undefined,
          position: formData.position,
          slides,
        });
        toast.success("اسلایدر ایجاد شد");
      }
      onClose();
    } catch (e: any) {
      toast.error(e?.message ?? "خطا در ذخیره");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile || currentSlideIndex < 0) return;
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
      updateSlide(currentSlideIndex, {
        imageStorageId: storageId as Id<"_storage">,
        imagePath: selectedFile.name,
      });
      setSelectedFile(null);
      toast.success("فایل آپلود شد");
    } catch (e) {
      toast.error("خطا در آپلود");
    } finally {
      setIsUploading(false);
    }
  };

  const content = (
    <>
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 border-b border-gray-700">
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 bg-accent/20 rounded-lg items-center justify-center">
            <Ionicons name="images-outline" size={24} color="#ff701a" />
          </View>
          <View>
            <Text className="text-xl font-bold text-white text-right">
              {slider ? "ویرایش اسلایدر" : "اسلایدر جدید"}
            </Text>
            <Text className="text-gray-400 text-sm text-right">
              چند تصویر به ترتیب برای نمایش در صفحه
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
        {/* Name */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-300 mb-2 text-right">
            نام (اختیاری)
          </Text>
          <TextInput
            value={formData.name}
            onChangeText={(v) => setFormData((p) => ({ ...p, name: v }))}
            placeholder="مثلاً اسلایدر داشبورد"
            textAlign="right"
          />
        </View>

        {/* Position */}
        <View className="mb-6">
          <Text className="text-sm font-medium text-gray-300 mb-2 text-right">
            مکان نمایش
          </Text>
          <View className="flex-row gap-2">
            {(Object.keys(POSITION_LABELS) as SliderPosition[]).map((pos) => (
              <TouchableOpacity
                key={pos}
                onPress={() => setFormData((p) => ({ ...p, position: pos }))}
                className={`flex-1 py-2 px-3 rounded-lg border ${
                  formData.position === pos
                    ? "bg-accent/20 border-accent"
                    : "bg-gray-700/50 border-gray-600"
                }`}
              >
                <Text
                  className={`text-center text-sm font-medium ${
                    formData.position === pos ? "text-accent" : "text-gray-300"
                  }`}
                >
                  {POSITION_LABELS[pos]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Slides list */}
        <View className="mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-sm font-medium text-gray-300 text-right">
              اسلایدها ({formData.slides.length})
            </Text>
            <TouchableOpacity
              onPress={addSlide}
              className="px-3 py-2 bg-accent/20 border border-accent rounded-lg"
            >
              <Text className="text-accent font-medium text-sm">+ افزودن اسلاید</Text>
            </TouchableOpacity>
          </View>

          {formData.slides.map((slide, index) => {
            const hasImage = slide.imagePath || slide.imageStorageId;
            return (
              <View
                key={index}
                className={`mb-3 rounded-xl border p-3 ${
                  currentSlideIndex === index
                    ? "border-accent bg-accent/10"
                    : "border-gray-600 bg-gray-700/30"
                }`}
              >
                <View className="flex-row items-center gap-3">
                  <TouchableOpacity
                    onPress={() => setCurrentSlideIndex(index)}
                    className="flex-1 flex-row items-center gap-2"
                  >
                    {hasImage ? (
                      <View className="w-14 h-14 rounded-lg overflow-hidden bg-gray-800">
                        <SlideThumbnail
                          storageId={slide.imageStorageId}
                          imagePath={slide.imagePath}
                        />
                      </View>
                    ) : (
                      <View className="w-14 h-14 rounded-lg bg-gray-700/50 items-center justify-center">
                        <Ionicons name="image-outline" size={28} color="#6b7280" />
                      </View>
                    )}
                    <Text className="text-white font-medium">
                      اسلاید {index + 1}
                      {!hasImage && " (بدون تصویر)"}
                    </Text>
                  </TouchableOpacity>
                  <View className="flex-row items-center gap-1">
                    <TouchableOpacity
                      onPress={() => moveSlide(index, "up")}
                      disabled={index === 0}
                      className="p-2 rounded-lg bg-gray-600/50"
                    >
                      <Ionicons name="chevron-up" size={18} color="#9ca3af" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => moveSlide(index, "down")}
                      disabled={index === formData.slides.length - 1}
                      className="p-2 rounded-lg bg-gray-600/50"
                    >
                      <Ionicons name="chevron-down" size={18} color="#9ca3af" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => removeSlide(index)}
                      disabled={formData.slides.length <= 1}
                      className="p-2 rounded-lg bg-red-600/20"
                    >
                      <Ionicons name="trash-outline" size={18} color="#f87171" />
                    </TouchableOpacity>
                  </View>
                </View>

                {currentSlideIndex === index && (
                  <View className="mt-3 pt-3 border-t border-gray-600">
                    <Text className="text-xs text-gray-400 mb-2 text-right">
                      منبع تصویر این اسلاید
                    </Text>
                    <View className="flex-row gap-2 mb-3">
                      {(["upload", "existing", "url"] as const).map((type) => (
                        <TouchableOpacity
                          key={type}
                          onPress={() => {
                            setMediaType(type);
                            if (type !== "url") updateSlide(index, { imagePath: undefined });
                            if (type !== "existing") updateSlide(index, { imageStorageId: undefined });
                            if (type === "upload") setSelectedFile(null);
                          }}
                          className={`flex-1 py-2 px-2 rounded-lg border ${
                            mediaType === type
                              ? "bg-accent/20 border-accent"
                              : "bg-gray-700/50 border-gray-600"
                          }`}
                        >
                          <Text
                            className={`text-center text-xs font-medium ${
                              mediaType === type ? "text-accent" : "text-gray-300"
                            }`}
                          >
                            {type === "upload" ? "آپلود" : type === "existing" ? "موجود" : "لینک"}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    {mediaType === "upload" && (
                      <View className="gap-2">
                        <TouchableOpacity
                          onPress={async () => {
                            const file = await pickFile();
                            if (file) setSelectedFile(file);
                          }}
                          className="border-2 border-dashed border-gray-600 rounded-lg p-3 items-center"
                        >
                          <Ionicons name="cloud-upload-outline" size={24} color="#9ca3af" />
                          <Text className="text-gray-400 mt-1 text-sm">
                            {selectedFile ? selectedFile.name : "انتخاب فایل"}
                          </Text>
                        </TouchableOpacity>
                        {selectedFile && (
                          <Button
                            onPress={handleFileUpload}
                            loading={isUploading}
                            variant="primary"
                            size="sm"
                          >
                            آپلود
                          </Button>
                        )}
                      </View>
                    )}
                    {mediaType === "existing" && (
                      <ScrollView className="max-h-28">
                        {allFiles.map((file) => (
                          <TouchableOpacity
                            key={file._id}
                            onPress={() =>
                              updateSlide(index, {
                                imageStorageId: file.storageId as Id<"_storage">,
                                imagePath: file.originalName,
                              })
                            }
                            className={`p-2 rounded-lg border mb-1 ${
                              currentSlide?.imageStorageId === file.storageId
                                ? "bg-accent/20 border-accent"
                                : "bg-gray-700/50 border-gray-600"
                            }`}
                          >
                            <Text className="text-white text-sm text-right" numberOfLines={1}>
                              {file.originalName}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    )}
                    {mediaType === "url" && (
                      <TextInput
                        value={
                          currentSlide?.imagePath?.startsWith("http")
                            ? currentSlide.imagePath
                            : ""
                        }
                        onChangeText={(v) =>
                          updateSlide(index, {
                            imagePath: v,
                            imageStorageId: undefined,
                          })
                        }
                        placeholder="https://example.com/image.jpg"
                        textAlign="left"
                        autoCapitalize="none"
                        keyboardType="url"
                        className="bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white"
                      />
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <View className="mt-6 mb-4">
          <Button
            onPress={handleSubmit}
            loading={isSubmitting}
            variant="primary"
            size="lg"
            disabled={!formData.slides.some((s) => s.imagePath || s.imageStorageId)}
          >
            {slider ? "به‌روزرسانی اسلایدر" : "ایجاد اسلایدر"}
          </Button>
        </View>
      </ScrollView>
    </>
  );

  if (Platform.OS === "web") {
    return <View className="flex-1 bg-background">{content}</View>;
  }
  return (
    <View className="flex-1 bg-background">
      {content}
    </View>
  );
}
