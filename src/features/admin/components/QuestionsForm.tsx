import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Modal } from "react-native";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { toast } from "../../../lib/toast";
import { Button } from "../../../components/ui";
import { Ionicons } from "@expo/vector-icons";

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

  const handleSubmit = async () => {
    console.log("Form submitted with data:", formData);
    setIsSubmitting(true);
    
    try {
      if (question) {
        // Update existing question
        await updateQuestion({
          id: question._id,
          ...formData,
          rightAnswer: parseInt(formData.rightAnswer),
        });
        toast.success("سؤال با موفقیت به‌روزرسانی شد");
      } else {
        // Create new question
        await createQuestion({
          ...formData,
          rightAnswer: parseInt(formData.rightAnswer),
        });
        toast.success("سؤال جدید با موفقیت ایجاد شد");
      }
      onClose();
    } catch (error) {
      console.error("Error saving question:", error);
      toast.error("خطا در ذخیره سؤال: " + (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": selectedFile.type },
        body: selectedFile,
      });
      const { storageId } = await result.json();
      
      setFormData(prev => ({
        ...prev,
        mediaStorageId: storageId,
        mediaPath: selectedFile.name
      }));
      
      toast.success("فایل با موفقیت آپلود شد");
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("خطا در آپلود فایل");
    } finally {
      setIsUploading(false);
    }
  };

  const renderMediaSection = () => (
    <View className="space-y-4">
      <Text className="text-lg font-semibold text-white text-right">رسانه</Text>
      
      {/* Media Type Selection */}
      <View className="flex-row gap-2">
        <TouchableOpacity
          onPress={() => setMediaType("upload")}
          className={`flex-1 py-2 px-4 rounded-lg border ${
            mediaType === "upload" 
              ? "bg-accent/20 border-accent" 
              : "bg-gray-700/50 border-gray-600"
          }`}
        >
          <Text className={`text-center font-medium ${
            mediaType === "upload" ? "text-accent" : "text-gray-300"
          }`}>
            آپلود فایل
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => setMediaType("existing")}
          className={`flex-1 py-2 px-4 rounded-lg border ${
            mediaType === "existing" 
              ? "bg-accent/20 border-accent" 
              : "bg-gray-700/50 border-gray-600"
          }`}
        >
          <Text className={`text-center font-medium ${
            mediaType === "existing" ? "text-accent" : "text-gray-300"
          }`}>
            فایل موجود
          </Text>
        </TouchableOpacity>
      </View>

      {/* File Upload Section */}
      {mediaType === "upload" && (
        <View className="space-y-3">
          <TouchableOpacity
            onPress={() => setShowFileSelector(true)}
            className="border-2 border-dashed border-gray-600 rounded-lg p-4 items-center"
          >
            <Ionicons name="cloud-upload-outline" size={32} color="#9ca3af" />
            <Text className="text-gray-400 mt-2 text-center">
              {selectedFile ? selectedFile.name : "فایل را انتخاب کنید"}
            </Text>
          </TouchableOpacity>
          
          {selectedFile && (
            <Button
              onPress={handleFileUpload}
              loading={isUploading}
              variant="primary"
              size="sm"
            >
              آپلود فایل
            </Button>
          )}
        </View>
      )}

      {/* Existing Files Section */}
      {mediaType === "existing" && (
        <ScrollView className="max-h-32">
          {allFiles.map((file) => (
            <TouchableOpacity
              key={file._id}
              onPress={() => setFormData(prev => ({
                ...prev,
                mediaStorageId: file.storageId,
                mediaPath: file.originalName
              }))}
              className={`p-3 rounded-lg border ${
                formData.mediaStorageId === file.storageId
                  ? "bg-accent/20 border-accent"
                  : "bg-gray-700/50 border-gray-600"
              }`}
            >
              <Text className="text-white text-right">{file.originalName}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Media Preview */}
      {formData.mediaStorageId && getMediaUrl && (
        <View className="mt-4">
          <Text className="text-gray-300 text-right mb-2">پیش‌نمایش:</Text>
          <View className="bg-gray-700/50 rounded-lg p-4">
            <Text className="text-white text-right">{formData.mediaPath}</Text>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <Modal
      visible={true}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View className="flex-1 bg-background">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-gray-700">
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 bg-accent/20 rounded-lg items-center justify-center">
              <Ionicons name="help-circle-outline" size={24} color="#ff701a" />
            </View>
            <View>
              <Text className="text-xl font-bold text-white text-right">
                {question ? "ویرایش سؤال" : "افزودن سؤال جدید"}
              </Text>
              <Text className="text-gray-400 text-sm text-right">
                {question ? "اطلاعات سؤال را ویرایش کنید" : "اطلاعات سؤال جدید را وارد کنید"}
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
          {/* Question Text */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-300 mb-2 text-right">
              متن سؤال *
            </Text>
            <TextInput
              value={formData.questionText}
              onChangeText={(value) => handleInputChange("questionText", value)}
              className="bg-gray-700/50 text-white rounded-lg px-4 py-3 text-sm border border-gray-600/50"
              placeholder="متن سؤال را وارد کنید..."
              multiline
              numberOfLines={3}
              textAlign="right"
            />
          </View>

          {/* Options */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-300 mb-3 text-right">
              گزینه‌ها *
            </Text>
            
            {[1, 2, 3, 4].map((num) => (
              <View key={num} className="mb-3">
                <Text className="text-sm font-medium text-gray-300 mb-2 text-right">
                  گزینه {num} *
                </Text>
                <TextInput
                  value={formData[`option${num}Text` as keyof typeof formData] as string}
                  onChangeText={(value) => handleInputChange(`option${num}Text`, value)}
                  className="bg-gray-700/50 text-white rounded-lg px-4 py-3 text-sm border border-gray-600/50"
                  placeholder={`گزینه ${num}`}
                  textAlign="right"
                />
              </View>
            ))}
          </View>

          {/* Correct Answer */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-300 mb-2 text-right">
              پاسخ صحیح *
            </Text>
            <View className="flex-row gap-2">
              {[1, 2, 3, 4].map((num) => (
                <TouchableOpacity
                  key={num}
                  onPress={() => handleInputChange("rightAnswer", num.toString())}
                  className={`flex-1 py-3 px-4 rounded-lg border ${
                    formData.rightAnswer === num.toString()
                      ? "bg-accent/20 border-accent"
                      : "bg-gray-700/50 border-gray-600"
                  }`}
                >
                  <Text className={`text-center font-medium ${
                    formData.rightAnswer === num.toString() ? "text-accent" : "text-gray-300"
                  }`}>
                    {num}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Media Section */}
          {renderMediaSection()}

          {/* Settings */}
          <View className="mt-6 space-y-4">
            <Text className="text-lg font-semibold text-white text-right">تنظیمات</Text>
            
            {/* Time to Respond */}
            <View>
              <Text className="text-sm font-medium text-gray-300 mb-2 text-right">
                زمان پاسخ (ثانیه) *
              </Text>
              <TextInput
                value={formData.timeToRespond.toString()}
                onChangeText={(value) => handleInputChange("timeToRespond", value)}
                className="bg-gray-700/50 text-white rounded-lg px-4 py-3 text-sm border border-gray-600/50"
                placeholder="30"
                keyboardType="numeric"
                textAlign="right"
              />
            </View>

            {/* Grade */}
            <View>
              <Text className="text-sm font-medium text-gray-300 mb-2 text-right">
                درجه سختی *
              </Text>
              <View className="flex-row gap-2">
                {[1, 2, 3, 4, 5].map((grade) => (
                  <TouchableOpacity
                    key={grade}
                    onPress={() => handleInputChange("grade", grade.toString())}
                    className={`flex-1 py-3 px-4 rounded-lg border ${
                      formData.grade === grade
                        ? "bg-accent/20 border-accent"
                        : "bg-gray-700/50 border-gray-600"
                    }`}
                  >
                    <Text className={`text-center font-medium ${
                      formData.grade === grade ? "text-accent" : "text-gray-300"
                    }`}>
                      {grade}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Category */}
            <View>
              <Text className="text-sm font-medium text-gray-300 mb-2 text-right">
                دسته‌بندی
              </Text>
              <TextInput
                value={formData.category}
                onChangeText={(value) => handleInputChange("category", value)}
                className="bg-gray-700/50 text-white rounded-lg px-4 py-3 text-sm border border-gray-600/50"
                placeholder="دسته‌بندی (اختیاری)"
                textAlign="right"
              />
            </View>
          </View>

          {/* Submit Button */}
          <View className="mt-8 mb-4">
            <Button
              onPress={handleSubmit}
              loading={isSubmitting}
              variant="primary"
              size="lg"
              disabled={!formData.questionText || !formData.option1Text || !formData.option2Text || !formData.option3Text || !formData.option4Text}
            >
              {question ? "به‌روزرسانی سؤال" : "ایجاد سؤال"}
            </Button>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}