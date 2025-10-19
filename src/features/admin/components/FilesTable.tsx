import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, Modal, TextInput, Platform } from "react-native";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { toast } from "../../../lib/toast";
import { Button, SkeletonAdminTab, DataTableRN } from "../../../components/ui";
import { FilePreview } from "./FilePreview";
import { FileUpload } from "./FileUpload";
import { PaginationControls } from "../../../components/ui";
import { Ionicons } from "@expo/vector-icons";
import { formatFileSize } from "../../../lib/filePicker";
import type { Column } from "../../../components/ui/DataTableRN";

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

  // Define table columns
  const filesColumns: Column<typeof allFiles.page[0]>[] = [
    {
      key: 'name',
      header: 'نام فایل',
      render: (file) => (
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 bg-accent/20 rounded-lg items-center justify-center">
            <Ionicons name="document" size={20} color="#ff701a" />
          </View>
          <View className="flex-1">
            <Text className="text-white font-medium text-right" style={{ fontFamily: 'Vazirmatn-SemiBold' }}>
              {file.originalName}
            </Text>
            <Text className="text-gray-400 text-xs text-right mt-1" style={{ fontFamily: 'Vazirmatn-Regular' }}>
              {file.fileType}
            </Text>
          </View>
        </View>
      ),
    },
    {
      key: 'size',
      header: 'حجم',
      render: (file) => (
        <Text className="text-gray-300 text-sm" style={{ fontFamily: 'Vazirmatn-Regular' }}>
          {formatFileSize(file.fileSize)}
        </Text>
      ),
    },
    {
      key: 'date',
      header: 'تاریخ آپلود',
      render: (file) => (
        <Text className="text-gray-300 text-sm" style={{ fontFamily: 'Vazirmatn-Regular' }}>
          {formatDate(file.uploadedAt)}
        </Text>
      ),
    },
    {
      key: 'actions',
      header: 'عملیات',
      width: 200,
      render: (file) => (
        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            onPress={() => setPreviewFile(file)}
            className="p-2 bg-gray-700/50 rounded-lg"
            activeOpacity={0.7}
          >
            <Ionicons name="eye-outline" size={16} color="#9ca3af" />
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => {
              setEditingFile(file._id);
              setEditName(file.originalName);
            }}
            className="p-2 bg-gray-700/50 rounded-lg"
            activeOpacity={0.7}
          >
            <Ionicons name="pencil-outline" size={16} color="#9ca3af" />
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => handleDelete(file._id, file.originalName)}
            className="p-2 bg-red-600/20 rounded-lg"
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={16} color="#ef4444" />
          </TouchableOpacity>
        </View>
      ),
    },
  ];

  return (
    <View className="flex-1">
      {/* Files Table */}
      <DataTableRN
        columns={filesColumns}
        data={allFiles.page}
        keyExtractor={(file) => file._id}
        emptyState={{
          icon: <Ionicons name="folder-open-outline" size={32} color="#6b7280" />,
          title: "هیچ فایلی یافت نشد",
          description: "فایل جدیدی آپلود کنید",
          action: (
            <Button
              onPress={() => setShowUploadForm(true)}
              variant="primary"
              size="sm"
              icon={<Ionicons name="cloud-upload-outline" size={16} color="#fff" />}
            >
              آپلود فایل
            </Button>
          ),
        }}
      />

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