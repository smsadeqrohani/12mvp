import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, Modal, TextInput, Platform } from "react-native";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { toast } from "../../../lib/toast";
import { Button, SkeletonAdminTab } from "../../../components/ui";
import { FilePreview } from "./FilePreview";
import { FileUpload } from "./FileUpload";
import { PaginationControls } from "../../../components/ui";
import { Ionicons } from "@expo/vector-icons";
import { formatFileSize } from "../../../lib/filePicker";

export function FilesTable() {
  const [editingFile, setEditingFile] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [previewFile, setPreviewFile] = useState<any>(null);
  
  // Pagination state - track cursor history for back navigation
  const [filesCursor, setFilesCursor] = useState<string | null>(null);
  const [filesCursorHistory, setFilesCursorHistory] = useState<(string | null)[]>([null]);
  const [filesPage, setFilesPage] = useState(1);
  const PAGE_SIZE = 5;

  const allFiles = useQuery(api.files.getAllFiles, {
    paginationOpts: { numItems: PAGE_SIZE, cursor: filesCursor },
  });
  const renameFile = useMutation(api.files.renameFile);
  const deleteFile = useMutation(api.files.deleteFile);

  const handleRename = async (fileId: string, newName: string) => {
    try {
      await renameFile({ 
        fileId: fileId as any,
        newName 
      });
      toast.success("نام فایل با موفقیت تغییر کرد");
      setEditingFile(null);
      setEditName("");
    } catch (error) {
      console.error("Error renaming file:", error);
      toast.error("خطا در تغییر نام فایل");
    }
  };

  const handleDelete = async (fileId: string, fileName: string) => {
    Alert.alert(
      "حذف فایل",
      `آیا مطمئن هستید که می‌خواهید فایل "${fileName}" را حذف کنید؟`,
      [
        { text: "لغو", style: "cancel" },
        {
          text: "حذف",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteFile({ fileId: fileId as any });
              toast.success("فایل با موفقیت حذف شد");
            } catch (error) {
              console.error("Error deleting file:", error);
              toast.error("خطا در حذف فایل");
            }
          },
        },
      ]
    );
  };

  const handleNextFiles = () => {
    if (allFiles && !allFiles.isDone) {
      const newCursor = allFiles.continueCursor;
      setFilesCursorHistory(prev => [...prev, newCursor]);
      setFilesCursor(newCursor);
      setFilesPage(prev => prev + 1);
    }
  };

  const handlePrevFiles = () => {
    if (filesPage > 1) {
      const newHistory = filesCursorHistory.slice(0, -1);
      setFilesCursorHistory(newHistory);
      setFilesCursor(newHistory[newHistory.length - 1]);
      setFilesPage(prev => prev - 1);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('fa-IR');
  };

  if (!allFiles) {
    return <SkeletonAdminTab />;
  }

  return (
    <View className="flex-1">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-xl font-bold text-white">مدیریت فایل‌ها</Text>
        <Button
          onPress={() => setShowUploadForm(true)}
          variant="primary"
          size="sm"
          icon={<Ionicons name="cloud-upload-outline" size={16} color="#fff" />}
        >
          آپلود فایل
        </Button>
      </View>

      {/* Files List */}
      <View className="flex-1">
        {allFiles.page.length === 0 ? (
          <View className="flex-1 items-center justify-center p-8">
            <Ionicons name="folder-open-outline" size={64} color="#6b7280" />
            <Text className="text-gray-400 text-center mt-4">
              هیچ فایلی یافت نشد
            </Text>
            <Text className="text-gray-500 text-center text-sm mt-2">
              فایل جدیدی آپلود کنید
            </Text>
          </View>
        ) : (
          <View className="space-y-3">
            {allFiles.page.map((file) => (
              <View
                  key={file._id}
                className="bg-background-light/60 rounded-lg border border-gray-700/30 p-4"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-white font-medium text-right">
                      {file.originalName}
                    </Text>
                    <View className="flex-row items-center gap-4 mt-1">
                      <Text className="text-gray-400 text-sm">
                            {formatFileSize(file.fileSize)}
                      </Text>
                      <Text className="text-gray-400 text-sm">
                        {formatDate(file.uploadedAt)}
                      </Text>
                      <Text className="text-gray-400 text-sm">
                        {file.fileType}
                      </Text>
                    </View>
                  </View>
                  
                  <View className="flex-row items-center gap-2">
                    <TouchableOpacity
                      onPress={() => setPreviewFile(file)}
                      className="p-2 bg-gray-700/50 rounded-lg"
                    >
                      <Ionicons name="eye-outline" size={16} color="#9ca3af" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      onPress={() => {
                        setEditingFile(file._id);
                        setEditName(file.originalName);
                      }}
                      className="p-2 bg-gray-700/50 rounded-lg"
                    >
                      <Ionicons name="pencil-outline" size={16} color="#9ca3af" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      onPress={() => handleDelete(file._id, file.originalName)}
                      className="p-2 bg-red-600/20 rounded-lg"
                    >
                      <Ionicons name="trash-outline" size={16} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Pagination */}
      {allFiles.page.length > 0 && (
        <View className="mt-4">
        <PaginationControls 
          currentPage={filesPage}
            isDone={allFiles.isDone}
          onNext={handleNextFiles}
          onPrev={handlePrevFiles}
          isLoading={allFiles === undefined}
        />
        </View>
      )}

      {/* Upload Modal */}
      <Modal
        visible={showUploadForm}
        animationType="slide"
        presentationStyle={Platform.select({
          ios: Platform.isPad ? 'formSheet' : 'pageSheet',
          android: 'fullScreen',
          default: 'pageSheet'
        })}
      >
        <View className="flex-1 bg-background">
          <View className="flex-row items-center justify-between p-4 border-b border-gray-700">
            <Text className="text-xl font-bold text-white" style={{ fontFamily: 'Vazirmatn-Bold' }}>
              آپلود فایل جدید
            </Text>
            <TouchableOpacity
              onPress={() => setShowUploadForm(false)}
              className="w-8 h-8 bg-gray-700/50 rounded-lg items-center justify-center"
            >
              <Ionicons name="close" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>
          
          <ScrollView className="flex-1 p-6">
            <FileUpload 
              onUploadComplete={() => {
                setShowUploadForm(false);
              }}
            />
          </ScrollView>
        </View>
      </Modal>

      {/* Rename Modal */}
      <Modal
        visible={editingFile !== null}
        animationType="slide"
        presentationStyle={Platform.select({
          ios: Platform.isPad ? 'formSheet' : 'pageSheet',
          android: 'fullScreen',
          default: 'pageSheet'
        })}
      >
        <View className="flex-1 bg-background">
          <View className="flex-row items-center justify-between p-4 border-b border-gray-700">
            <Text className="text-xl font-bold text-white">تغییر نام فایل</Text>
            <TouchableOpacity
              onPress={() => {
                setEditingFile(null);
                setEditName("");
              }}
              className="w-8 h-8 bg-gray-700/50 rounded-lg items-center justify-center"
            >
              <Ionicons name="close" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>
          
          <View className="flex-1 p-4">
            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-300 mb-2 text-right">
                نام جدید فایل
              </Text>
              <TextInput
                value={editName}
                onChangeText={setEditName}
                className="bg-gray-700/50 text-white rounded-lg px-4 py-3 text-sm border border-gray-600/50"
                placeholder="نام فایل را وارد کنید"
                textAlign="right"
              />
            </View>
            
            <View className="flex-row gap-3">
              <Button
                onPress={() => {
                  setEditingFile(null);
                  setEditName("");
                }}
                variant="secondary"
                size="lg"
                className="flex-1"
              >
                لغو
              </Button>
              <Button
                onPress={() => editingFile && handleRename(editingFile, editName)}
                variant="primary"
                size="lg"
                className="flex-1"
                disabled={!editName.trim()}
              >
                ذخیره
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      {/* File Preview Modal */}
      {previewFile && (
        <FilePreview 
          file={previewFile} 
          onClose={() => setPreviewFile(null)} 
        />
      )}
    </View>
  );
}