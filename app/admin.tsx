import { useState, useEffect } from "react";
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, Modal, Platform } from "react-native";
import { useQuery, useMutation } from "convex/react";
import { useRouter } from "expo-router";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { Ionicons } from "@expo/vector-icons";
import { toast } from "../src/lib/toast";
import { QuestionsForm, CategoryForm, FilesTable, MatchDetailsAdmin, TournamentDetailsAdmin, StoreItemForm } from "../src/features/admin";
import { PaginationControls, SkeletonAdminTab, DataTableRN, Avatar, ConfirmationDialog } from "../src/components/ui";
import { useResponsive } from "../src/hooks";
import { getOptimalPageSize } from "../src/lib/platform";
import type { Column } from "../src/components/ui/DataTableRN";

type TabType = "users" | "questions" | "categories" | "files" | "matches" | "tournaments" | "store";

// Question type from admin query (includes rightAnswer and categories)
interface QuestionWithAnswer {
  _id: Id<"questions">;
  mediaPath?: string;
  mediaStorageId?: Id<"_storage">;
  questionText: string;
  option1Text: string;
  option2Text: string;
  option3Text: string;
  option4Text: string;
  timeToRespond: number;
  grade: number;
  categories?: Array<{
    _id: Id<"categories">;
    persianName: string;
    slug: string;
    englishName?: string;
  }>;
  rightAnswer: number; // From questionAnswers table
}

export default function AdminScreen() {
  const router = useRouter();
  const responsive = useResponsive();
  const { isAdminReady, width, orientation, touchTargetSize, isTouchDevice } = responsive || {
    isAdminReady: false,
    width: 0,
    orientation: 'portrait' as const,
    touchTargetSize: 44,
    isTouchDevice: true
  };
  const [activeTab, setActiveTab] = useState<TabType>("users");
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionWithAnswer | null>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [showStoreItemForm, setShowStoreItemForm] = useState(false);
  const [editingStoreItem, setEditingStoreItem] = useState<any>(null);
  const [creatingItemType, setCreatingItemType] = useState<"stadium" | "mentor" | null>(null);
  const [viewingMatchId, setViewingMatchId] = useState<string | null>(null);
  const [viewingTournamentId, setViewingTournamentId] = useState<string | null>(null);
  const [confirmationDialog, setConfirmationDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText: string;
    cancelText: string;
  } | null>(null);

  // Pagination state
  const [usersCursor, setUsersCursor] = useState<string | null>(null);
  const [questionsCursor, setQuestionsCursor] = useState<string | null>(null);
  const [categoriesCursor, setCategoriesCursor] = useState<string | null>(null);
  const [filesCursor, setFilesCursor] = useState<string | null>(null);
  const [matchesCursor, setMatchesCursor] = useState<string | null>(null);
  
  const [usersCursorHistory, setUsersCursorHistory] = useState<(string | null)[]>([null]);
  const [questionsCursorHistory, setQuestionsCursorHistory] = useState<(string | null)[]>([null]);
  const [categoriesCursorHistory, setCategoriesCursorHistory] = useState<(string | null)[]>([null]);
  const [filesCursorHistory, setFilesCursorHistory] = useState<(string | null)[]>([null]);
  const [matchesCursorHistory, setMatchesCursorHistory] = useState<(string | null)[]>([null]);
  
  const [usersPage, setUsersPage] = useState(1);
  const [questionsPage, setQuestionsPage] = useState(1);
  const [categoriesPage, setCategoriesPage] = useState(1);
  const [filesPage, setFilesPage] = useState(1);
  const [matchesPage, setMatchesPage] = useState(1);

  const loggedInUser = useQuery(api.auth.loggedInUser);
  const userProfile = useQuery(api.auth.getUserProfile);

  // Pagination queries
  const PAGE_SIZE = getOptimalPageSize();
  const allUsers = useQuery(api.auth.getAllUsers, {
    paginationOpts: { numItems: PAGE_SIZE, cursor: usersCursor },
  });
  const allQuestions = useQuery(api.questions.getAllQuestions, {
    paginationOpts: { numItems: PAGE_SIZE, cursor: questionsCursor },
  });
  const allCategories = useQuery(api.categories.getCategoriesPaginated, {
    paginationOpts: { numItems: PAGE_SIZE, cursor: categoriesCursor },
  });
  const allFiles = useQuery(api.files.getAllFiles, {
    paginationOpts: { numItems: PAGE_SIZE, cursor: filesCursor },
  });
  const allMatches = useQuery(api.matches.getAllMatches, {
    paginationOpts: { numItems: PAGE_SIZE, cursor: matchesCursor },
  });
  const allTournaments = useQuery(api.tournaments.getAllTournaments);
  const allStoreItems = useQuery(api.store.getAllStoreItems);

  const makeUserAdmin = useMutation(api.auth.makeUserAdmin);
  const updateUserName = useMutation(api.auth.updateUserName);
  const resetUserPassword = useMutation(api.auth.resetUserPassword);
  const createQuestion = useMutation(api.questions.createQuestion);
  const updateQuestion = useMutation(api.questions.updateQuestion);
  const deleteQuestion = useMutation(api.questions.deleteQuestion);
  const deleteCategory = useMutation(api.categories.deleteCategory);
  const cancelMatch = useMutation(api.matches.cancelMatch);
  const cancelTournament = useMutation(api.tournaments.cancelTournament);
  const deleteStoreItem = useMutation(api.store.deleteStoreItem);
  const toggleStoreItemStatus = useMutation(api.store.toggleStoreItemStatus);
  const migrateStoreItems = useMutation(api.store.migrateStoreItems);

  console.log("cancelMatch mutation:", cancelMatch);

  useEffect(() => {
    if (loggedInUser === null) {
      router.replace("/(auth)/login");
    } else if (userProfile && !userProfile.isAdmin) {
      router.replace("/(tabs)");
    }
  }, [loggedInUser, userProfile, router]);

  // Show loading while checking authentication and admin status
  if (loggedInUser === undefined || userProfile === undefined) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 justify-center items-center">
          <Text className="text-white text-lg">در حال بررسی دسترسی مدیریت...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Don't render anything while redirecting
  if (loggedInUser === null || (userProfile && !userProfile.isAdmin)) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 justify-center items-center">
          <Text className="text-white text-lg">در حال انتقال...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Check screen size - Admin panel requires iPad (landscape) or desktop
  if (!isAdminReady) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ScrollView 
          contentContainerClassName="flex-1 justify-center items-center p-8"
          showsVerticalScrollIndicator={false}
        >
          {/* Icon */}
          <View className="items-center mb-6">
            <View className="w-24 h-24 bg-accent/20 rounded-full items-center justify-center mb-4">
              <Ionicons 
                name={Platform.OS === 'web' ? 'desktop' : 'tablet-landscape'} 
                size={48} 
                color="#ff701a" 
              />
            </View>
          </View>

          {/* Title */}
          <Text className="text-white text-2xl font-bold text-center mb-3" style={{ fontFamily: 'Meem-Bold' }}>
            پنل مدیریت
          </Text>

          {/* Message */}
          <Text className="text-gray-300 text-center text-base mb-6 max-w-md" style={{ fontFamily: 'Meem-Regular' }}>
            برای استفاده از پنل مدیریت، لطفاً از یکی از موارد زیر استفاده کنید:
          </Text>

          {/* Requirements */}
          <View className="bg-background-light/60 rounded-2xl border border-gray-700/30 p-6 w-full max-w-md mb-6">
            <View className="flex-row items-center gap-3 mb-4">
              <View className="w-8 h-8 bg-green-900/30 rounded-full items-center justify-center">
                <Ionicons name="checkmark" size={20} color="#10b981" />
              </View>
              <Text className="text-white text-base flex-1" style={{ fontFamily: 'Meem-SemiBold' }}>
                کامپیوتر رومیزی یا لپ‌تاپ
              </Text>
            </View>

            <View className="flex-row items-center gap-3 mb-4">
              <View className="w-8 h-8 bg-green-900/30 rounded-full items-center justify-center">
                <Ionicons name="checkmark" size={20} color="#10b981" />
              </View>
              <Text className="text-white text-base flex-1" style={{ fontFamily: 'Meem-SemiBold' }}>
                آیپد در حالت افقی (Landscape)
              </Text>
            </View>

            <View className="flex-row items-center gap-3">
              <View className="w-8 h-8 bg-green-900/30 rounded-full items-center justify-center">
                <Ionicons name="checkmark" size={20} color="#10b981" />
              </View>
              <Text className="text-white text-base flex-1" style={{ fontFamily: 'Meem-SemiBold' }}>
                مرورگر وب
              </Text>
            </View>
          </View>

          {/* Technical Info */}
          <View className="bg-blue-900/20 border border-blue-800/30 rounded-xl p-4 max-w-md w-full">
            <View className="flex-row items-start gap-2">
              <Ionicons name="information-circle" size={20} color="#60a5fa" />
              <View className="flex-1">
                <Text className="text-blue-400 text-sm mb-1" style={{ fontFamily: 'Meem-SemiBold' }}>
                  اطلاعات فنی:
                </Text>
                <Text className="text-blue-300 text-xs" style={{ fontFamily: 'Meem-Regular' }}>
                  حداقل عرض صفحه: ۱۰۲۴ پیکسل
                </Text>
                <Text className="text-blue-300 text-xs" style={{ fontFamily: 'Meem-Regular' }}>
                  عرض فعلی: {Math.round(width).toLocaleString('fa-IR')} پیکسل
                </Text>
                <Text className="text-blue-300 text-xs" style={{ fontFamily: 'Meem-Regular' }}>
                  جهت: {orientation === 'landscape' ? 'افقی' : 'عمودی'}
                </Text>
              </View>
            </View>
          </View>

          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-8 px-6 py-3 bg-accent active:bg-accent-hover rounded-lg"
            style={{ minHeight: touchTargetSize }}
            activeOpacity={0.7}
          >
            <Text className="text-white font-semibold text-center" style={{ fontFamily: 'Meem-SemiBold' }}>
              بازگشت به داشبورد
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // If viewing tournament details, show the tournament details view
  if (viewingTournamentId) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1">
          <TouchableOpacity
            onPress={() => setViewingTournamentId(null)}
            className="flex-row items-center gap-2 px-4 py-3 mx-6 mt-6 w-fit bg-background-light rounded-lg mb-6"
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color="#ff701a" />
            <Text className="text-accent font-semibold">بازگشت به لیست تورنومنت‌ها</Text>
          </TouchableOpacity>
          <TournamentDetailsAdmin 
            tournamentId={viewingTournamentId} 
            onBack={() => setViewingTournamentId(null)}
          />
        </View>
      </SafeAreaView>
    );
  }

  // If viewing match details, show the match results view
  if (viewingMatchId) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="px-6 py-6">
          <TouchableOpacity
            onPress={() => setViewingMatchId(null)}
            className="flex-row items-center gap-2 px-4 py-3 bg-background-light rounded-lg mb-6 w-fit"
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color="#ff701a" />
            <Text className="text-accent font-semibold">بازگشت به لیست مسابقات</Text>
          </TouchableOpacity>
          <MatchDetailsAdmin 
            matchId={viewingMatchId as Id<"matches">} 
            onBack={() => setViewingMatchId(null)}
          />
        </View>
      </SafeAreaView>
    );
  }

  const showConfirmation = (
    title: string,
    message: string,
    onConfirm: () => void,
    confirmText: string = "حذف",
    cancelText: string = "لغو"
  ) => {
    setConfirmationDialog({
      isOpen: true,
      title,
      message,
      onConfirm,
      confirmText,
      cancelText,
    });
  };

  const handleToggleAdmin = async (userId: string, isAdmin: boolean) => {
    try {
      await makeUserAdmin({ userId: userId as Id<"users">, isAdmin });
      toast.success(isAdmin ? "کاربر به مدیر تبدیل شد" : "دسترسی مدیر حذف شد");
    } catch (error) {
      toast.error("خطا در تغییر دسترسی کاربر");
    }
  };

  const handleEditName = async (userId: string) => {
    if (!editName.trim()) return;
    try {
      await updateUserName({ userId: userId as Id<"users">, name: editName });
      toast.success("نام کاربر با موفقیت به‌روزرسانی شد");
      setEditingUser(null);
      setEditName("");
    } catch (error) {
      toast.error("خطا در به‌روزرسانی نام");
    }
  };

  const handleResetPassword = async (userId: string, userName: string) => {
    try {
      await resetUserPassword({ userId: userId as Id<"users"> });
      toast.success(`رمز عبور برای کاربر ${userName} بازنشانی شد`);
    } catch (error) {
      toast.error("خطا در بازنشانی رمز عبور");
    }
  };

  const startEdit = (userId: string, currentName: string) => {
    setEditingUser(userId);
    setEditName(currentName);
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setEditName("");
  };

  const handleDeleteQuestion = async (questionId: string) => {
    showConfirmation(
      "حذف سؤال",
      "آیا مطمئن هستید که می‌خواهید این سؤال را حذف کنید؟",
      async () => {
        try {
          await deleteQuestion({ questionId: questionId as Id<"questions"> });
          toast.success("سؤال با موفقیت حذف شد");
        } catch (error) {
          toast.error("خطا در حذف سؤال");
        }
      }
    );
  };

  const handleEditQuestion = (question: QuestionWithAnswer) => {
    setEditingQuestion(question);
    setShowQuestionForm(true);
  };

  const handleCreateQuestion = () => {
    setEditingQuestion(null);
    setShowQuestionForm(true);
  };

  const handleCloseQuestionForm = () => {
    setShowQuestionForm(false);
    setEditingQuestion(null);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    showConfirmation(
      "حذف دسته‌بندی",
      "آیا مطمئن هستید که می‌خواهید این دسته‌بندی را حذف کنید؟",
      async () => {
        try {
          await deleteCategory({ categoryId: categoryId as Id<"categories"> });
          toast.success("دسته‌بندی با موفقیت حذف شد");
        } catch (error) {
          toast.error("خطا در حذف دسته‌بندی: " + (error as Error).message);
        }
      }
    );
  };

  const handleEditCategory = (category: any) => {
    setEditingCategory(category);
    setShowCategoryForm(true);
  };

  const handleCreateCategory = () => {
    setEditingCategory(null);
    setShowCategoryForm(true);
  };

  const handleCloseCategoryForm = () => {
    setShowCategoryForm(false);
    setEditingCategory(null);
  };

  const handleCancelMatch = async (matchId: string) => {
    console.log("handleCancelMatch called with matchId:", matchId);
    
    try {
      console.log("Calling cancelMatch mutation...");
      await cancelMatch({ matchId: matchId as Id<"matches"> });
      console.log("cancelMatch successful");
      toast.success("مسابقه با موفقیت لغو شد");
    } catch (error) {
      console.error("cancelMatch error:", error);
      toast.error("خطا در لغو مسابقه: " + (error as Error).message);
    }
  };

  const handleCancelTournament = async (tournamentId: string) => {
    console.log("handleCancelTournament called with tournamentId:", tournamentId);
    
    try {
      console.log("Calling cancelTournament mutation...");
      await cancelTournament({ tournamentId });
      console.log("cancelTournament successful");
      toast.success("تورنومنت با موفقیت لغو شد");
    } catch (error) {
      console.error("cancelTournament error:", error);
      toast.error("خطا در لغو تورنومنت: " + (error as Error).message);
    }
  };

  const handleViewMatch = (matchId: string) => {
    setViewingMatchId(matchId);
  };

  const handleViewTournament = (tournamentId: string) => {
    setViewingTournamentId(tournamentId);
  };



  const handleEditStoreItem = (item: any) => {
    setEditingStoreItem(item);
    setShowStoreItemForm(true);
  };

  const handleCloseStoreItemForm = () => {
    setShowStoreItemForm(false);
    setEditingStoreItem(null);
    setCreatingItemType(null);
  };

  const handleDeleteStoreItem = async (itemId: string) => {
    showConfirmation(
      "حذف آیتم",
      "آیا مطمئن هستید که می‌خواهید این آیتم را حذف کنید؟",
      async () => {
        try {
          await deleteStoreItem({ itemId: itemId as Id<"storeItems"> });
          toast.success("آیتم با موفقیت حذف شد");
        } catch (error) {
          toast.error("خطا در حذف آیتم");
        }
      }
    );
  };

  const handleToggleStoreItemStatus = async (itemId: string) => {
    try {
      await toggleStoreItemStatus({ itemId: itemId as Id<"storeItems"> });
      toast.success("وضعیت آیتم تغییر کرد");
    } catch (error) {
      toast.error("خطا در تغییر وضعیت آیتم");
    }
  };

  // Pagination handlers
  const handleNextUsers = () => {
    if (allUsers && !allUsers.isDone) {
      const newCursor = allUsers.continueCursor;
      setUsersCursorHistory(prev => [...prev, newCursor]);
      setUsersCursor(newCursor);
      setUsersPage(prev => prev + 1);
    }
  };

  const handlePrevUsers = () => {
    if (usersPage > 1) {
      const newHistory = usersCursorHistory.slice(0, -1);
      setUsersCursorHistory(newHistory);
      setUsersCursor(newHistory[newHistory.length - 1]);
      setUsersPage(prev => prev - 1);
    }
  };

  const handleNextQuestions = () => {
    if (allQuestions && !allQuestions.isDone) {
      const newCursor = allQuestions.continueCursor;
      setQuestionsCursorHistory(prev => [...prev, newCursor]);
      setQuestionsCursor(newCursor);
      setQuestionsPage(prev => prev + 1);
    }
  };

  const handlePrevQuestions = () => {
    if (questionsPage > 1) {
      const newHistory = questionsCursorHistory.slice(0, -1);
      setQuestionsCursorHistory(newHistory);
      setQuestionsCursor(newHistory[newHistory.length - 1]);
      setQuestionsPage(prev => prev - 1);
    }
  };

  const handleNextCategories = () => {
    if (allCategories && !allCategories.isDone) {
      const newCursor = allCategories.continueCursor;
      setCategoriesCursorHistory(prev => [...prev, newCursor]);
      setCategoriesCursor(newCursor);
      setCategoriesPage(prev => prev + 1);
    }
  };

  const handlePrevCategories = () => {
    if (categoriesPage > 1) {
      const newHistory = categoriesCursorHistory.slice(0, -1);
      setCategoriesCursorHistory(newHistory);
      setCategoriesCursor(newHistory[newHistory.length - 1]);
      setCategoriesPage(prev => prev - 1);
    }
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

  const handleNextMatches = () => {
    if (allMatches && !allMatches.isDone) {
      const newCursor = allMatches.continueCursor;
      setMatchesCursorHistory(prev => [...prev, newCursor]);
      setMatchesCursor(newCursor);
      setMatchesPage(prev => prev + 1);
    }
  };

  const handlePrevMatches = () => {
    if (matchesPage > 1) {
      const newHistory = matchesCursorHistory.slice(0, -1);
      setMatchesCursorHistory(newHistory);
      setMatchesCursor(newHistory[newHistory.length - 1]);
      setMatchesPage(prev => prev - 1);
    }
  };

  const renderUsersTab = () => {
    // Show skeleton while loading
    if (allUsers === undefined) {
      return <SkeletonAdminTab />;
    }

    // Define table columns
    const usersColumns: Column<typeof allUsers.page[0]>[] = [
      {
        key: 'name',
        header: 'نام کاربر',
        render: (user) => (
          <View className="flex-row items-center gap-3">
            <Avatar avatarId={user.avatarId} size="md" />
            <Text className="text-white font-medium" style={{ fontFamily: 'Meem-SemiBold' }}>
              {user.name}
            </Text>
          </View>
        ),
      },
      {
        key: 'email',
        header: 'ایمیل',
        render: (user) => (
          <Text className="text-gray-300 text-sm" style={{ fontFamily: 'Meem-Regular' }}>
            {user.email}
          </Text>
        ),
      },
      {
        key: 'emailStatus',
        header: 'وضعیت ایمیل',
        render: (user) => (
          <View className={`px-3 py-1 rounded-full w-fit ${
            user.emailVerified
              ? "bg-green-900/30 border border-green-800/30"
              : "bg-yellow-900/30 border border-yellow-800/30"
          }`}>
            <Text className={`text-xs font-medium ${
              user.emailVerified ? "text-green-400" : "text-yellow-400"
            }`}>
              {user.emailVerified ? "تأیید شده" : "تأیید نشده"}
            </Text>
          </View>
        ),
      },
      {
        key: 'points',
        header: 'امتیاز',
        render: (user) => (
          <View className="flex-row items-center gap-2">
            <View className="bg-accent/20 rounded-lg px-3 py-1 border border-accent/30">
              <Text className="text-accent font-bold text-sm" style={{ fontFamily: 'Meem-Bold' }}>
                {(user.points ?? 0).toLocaleString('fa-IR')}
              </Text>
            </View>
          </View>
        ),
      },
      {
        key: 'adminStatus',
        header: 'دسترسی مدیر',
        render: (user) => (
          <TouchableOpacity
            onPress={() => handleToggleAdmin(user.userId, !user.isAdmin)}
            className="flex-row items-center gap-3"
            activeOpacity={0.7}
          >
            <View className={`relative inline-block w-12 h-6 rounded-full ${
              user.isAdmin ? "bg-accent" : "bg-gray-600"
            }`}>
              <View className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                user.isAdmin ? "translate-x-6" : "translate-x-0.5"
              }`} />
            </View>
            <Text className={`text-sm font-medium ${
              user.isAdmin ? "text-accent" : "text-gray-400"
            }`} style={{ fontFamily: 'Meem-SemiBold' }}>
              {user.isAdmin ? "مدیر" : "کاربر عادی"}
            </Text>
          </TouchableOpacity>
        ),
      },
      {
        key: 'actions',
        header: 'عملیات',
        width: 256,
        render: (user) => (
          <TouchableOpacity
            onPress={() => handleResetPassword(user.userId, user.name)}
            className="px-4 py-3 bg-red-600/20 rounded-lg border border-red-800/30"
            style={{ minHeight: touchTargetSize }}
            activeOpacity={0.7}
          >
            <Text className="text-red-400 text-sm font-semibold text-center" style={{ fontFamily: 'Meem-SemiBold' }}>
              بازنشانی رمز عبور
            </Text>
          </TouchableOpacity>
        ),
      },
    ];

    return (
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-2xl font-bold text-white mb-2 text-right" style={{ fontFamily: 'Meem-Bold' }}>
                مدیریت کاربران
              </Text>
              <Text className="text-gray-400 text-right" style={{ fontFamily: 'Meem-Regular' }}>
                مدیریت و تنظیم کاربران سیستم
              </Text>
            </View>
            <View className="flex-row items-center gap-3">
              <View className="bg-background-light/50 rounded-lg px-4 py-2 border border-gray-700/30">
                <Text className="text-gray-400 text-sm">صفحه:</Text>
                <Text className="text-white font-semibold mr-2">{usersPage.toLocaleString('fa-IR')}</Text>
              </View>
            </View>
          </View>
        </View>
      
        {/* Users Table */}
        <DataTableRN
          columns={usersColumns}
          data={allUsers?.page || []}
          keyExtractor={(user) => user.userId}
          emptyState={{
            icon: <Ionicons name="people" size={32} color="#6b7280" />,
            title: "کاربری یافت نشد",
            description: "هنوز هیچ کاربری در سیستم ثبت نشده است",
          }}
        />
      
        <PaginationControls 
          currentPage={usersPage}
          isDone={allUsers?.isDone ?? true}
          onNext={handleNextUsers}
          onPrev={handlePrevUsers}
          isLoading={allUsers === undefined}
        />
      </ScrollView>
    );
  };

  const renderQuestionsTab = () => {
    // Show skeleton while loading
    if (allQuestions === undefined) {
      return <SkeletonAdminTab />;
    }

    // Define table columns
    const questionsColumns: Column<typeof allQuestions.page[0]>[] = [
      {
        key: 'questionText',
        header: 'متن سؤال',
        render: (question) => (
                      <View className="flex-row items-start gap-3">
                        <View className="w-8 h-8 bg-accent rounded-full items-center justify-center">
                          <Text className="text-white font-bold text-xs" style={{ fontFamily: 'Meem-Bold' }}>
                            س
                          </Text>
                        </View>
                        <View className="flex-1">
                          <Text className="text-white font-medium text-sm leading-5" style={{ fontFamily: 'Meem-SemiBold' }}>
                            {question.questionText}
                          </Text>
                          {(question.mediaPath || question.mediaStorageId) && (
                            <View className="flex-row items-center gap-1 mt-2">
                              <Ionicons name="image" size={12} color="#6b7280" />
                              <Text className="text-gray-500 text-xs">
                                {question.mediaStorageId ? "فایل آپلود شده" : "لینک خارجی"}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
        ),
      },
      {
        key: 'timeToRespond',
        header: 'زمان پاسخ (ثانیه)',
        render: (question) => (
                      <Text className="text-gray-300 text-sm" style={{ fontFamily: 'Meem-Regular' }}>
                        {question.timeToRespond.toLocaleString('fa-IR')}
                      </Text>
        ),
      },
      {
        key: 'grade',
        header: 'سطح سختی',
        render: (question) => (
                      <View className="flex-row items-center gap-1">
                        {Array.from({ length: 5 }, (_, i) => (
                          <View
                            key={i}
                            className={`w-3 h-3 rounded-full ${
                              i < question.grade ? "bg-accent" : "bg-gray-600"
                            }`}
                          />
                        ))}
                        <Text className="text-gray-300 text-sm mr-2">{question.grade}</Text>
                      </View>
        ),
      },
      {
        key: 'categories',
        header: 'دسته‌بندی‌ها',
        render: (question) => (
          question.categories && question.categories.length > 0 ? (
            <View className="flex-row flex-wrap gap-1">
              {question.categories.map((category: any, index: number) => (
                <View key={index} className="px-2 py-1 rounded-full bg-blue-900/30 border border-blue-800/30">
                  <Text className="text-blue-400 text-xs font-medium">
                    {category.persianName}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text className="text-gray-500 text-sm">بدون دسته</Text>
          )
        ),
      },
      {
        key: 'rightAnswer',
        header: 'پاسخ صحیح',
        render: (question) => (
                      <View className="px-3 py-1 rounded-full bg-green-900/30 border border-green-800/30 w-fit">
                        <Text className="text-green-400 text-xs font-medium">
                          گزینه {question.rightAnswer}
                        </Text>
                      </View>
        ),
      },
      {
        key: 'actions',
        header: 'عملیات',
        width: 200,
        render: (question) => (
                      <View className="flex-row items-center gap-2">
                        <TouchableOpacity
                          onPress={() => handleEditQuestion(question)}
                          className="px-3 py-2 bg-blue-600/20 border border-blue-500/30 rounded-lg"
                          style={{ minHeight: touchTargetSize }}
                          activeOpacity={0.7}
                        >
                          <Text className="text-blue-400 text-xs font-semibold" style={{ fontFamily: 'Meem-SemiBold' }}>
                            ویرایش
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleDeleteQuestion(question._id)}
                          className="px-3 py-2 bg-red-600/20 border border-red-500/30 rounded-lg"
                          style={{ minHeight: touchTargetSize }}
                          activeOpacity={0.7}
                        >
                          <Text className="text-red-400 text-xs font-semibold" style={{ fontFamily: 'Meem-SemiBold' }}>
                            حذف
                          </Text>
                        </TouchableOpacity>
                      </View>
        ),
      },
    ];

    return (
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-2xl font-bold text-white mb-2 text-right" style={{ fontFamily: 'Meem-Bold' }}>
                مدیریت سؤالات
              </Text>
              <Text className="text-gray-400 text-right" style={{ fontFamily: 'Meem-Regular' }}>
                مدیریت و تنظیم سؤالات سیستم
              </Text>
            </View>
            <View className="flex-row items-center gap-3">
              <View className="bg-background-light/50 rounded-lg px-4 py-2 border border-gray-700/30">
                <Text className="text-gray-400 text-sm">صفحه:</Text>
                <Text className="text-white font-semibold mr-2">{questionsPage.toLocaleString('fa-IR')}</Text>
              </View>
              <TouchableOpacity
                onPress={handleCreateQuestion}
                className="flex-row items-center gap-2 px-4 py-3 bg-accent rounded-lg"
                style={{ minHeight: touchTargetSize }}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={20} color="#fff" />
                <Text className="text-white text-sm font-semibold">افزودن سؤال</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      
      {/* Questions Table */}
      <DataTableRN
        columns={questionsColumns}
        data={allQuestions?.page || []}
        keyExtractor={(question) => question._id}
        emptyState={{
          icon: <Ionicons name="help-circle" size={32} color="#6b7280" />,
          title: "سؤالی یافت نشد",
          description: "هنوز هیچ سؤالی در سیستم ثبت نشده است",
          action: (
                  <TouchableOpacity
                    onPress={handleCreateQuestion}
              className="flex-row items-center gap-2 px-4 py-2 bg-accent rounded-lg"
                    activeOpacity={0.7}
                  >
                    <Ionicons name="add" size={16} color="#fff" />
                    <Text className="text-white text-sm font-semibold">افزودن اولین سؤال</Text>
                  </TouchableOpacity>
          ),
        }}
      />
      
      <PaginationControls 
        currentPage={questionsPage}
        isDone={allQuestions?.isDone ?? true}
        onNext={handleNextQuestions}
        onPrev={handlePrevQuestions}
        isLoading={allQuestions === undefined}
      />
      </ScrollView>
    );
  };

  const renderCategoriesTab = () => {
    // Show skeleton while loading
    if (allCategories === undefined) {
      return <SkeletonAdminTab />;
    }

    // Define table columns
    const categoriesColumns: Column<typeof allCategories.page[0]>[] = [
      {
        key: 'persianName',
        header: 'نام فارسی',
        render: (category) => (
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 bg-accent/20 rounded-full items-center justify-center">
              <Ionicons name="folder" size={20} color="#ff701a" />
            </View>
            <Text className="text-white font-semibold text-base" style={{ fontFamily: 'Meem-SemiBold' }}>
              {category.persianName}
            </Text>
          </View>
        ),
      },
      {
        key: 'slug',
        header: 'Slug',
        render: (category) => (
          <Text className="text-gray-400 text-sm font-mono">
            {category.slug}
          </Text>
        ),
      },
      {
        key: 'englishName',
        header: 'English Name',
        render: (category) => (
          category.englishName ? (
            <Text className="text-gray-300 text-sm">
              {category.englishName}
            </Text>
          ) : (
            <Text className="text-gray-500 text-sm">-</Text>
          )
        ),
      },
      {
        key: 'actions',
        header: 'عملیات',
        width: 200,
        render: (category) => (
          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              onPress={() => handleEditCategory(category)}
              className="px-3 py-2 bg-blue-600/20 border border-blue-500/30 rounded-lg"
              style={{ minHeight: touchTargetSize }}
              activeOpacity={0.7}
            >
              <Text className="text-blue-400 text-xs font-semibold" style={{ fontFamily: 'Meem-SemiBold' }}>
                ویرایش
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDeleteCategory(category._id)}
              className="px-3 py-2 bg-red-600/20 border border-red-500/30 rounded-lg"
              style={{ minHeight: touchTargetSize }}
              activeOpacity={0.7}
            >
              <Text className="text-red-400 text-xs font-semibold" style={{ fontFamily: 'Meem-SemiBold' }}>
                حذف
              </Text>
            </TouchableOpacity>
          </View>
        ),
      },
    ];

    return (
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-2xl font-bold text-white mb-2 text-right" style={{ fontFamily: 'Meem-Bold' }}>
                مدیریت دسته‌بندی‌ها
              </Text>
              <Text className="text-gray-400 text-right" style={{ fontFamily: 'Meem-Regular' }}>
                مدیریت و تنظیم دسته‌بندی‌های سیستم
              </Text>
            </View>
            <View className="flex-row items-center gap-3">
              <View className="bg-background-light/50 rounded-lg px-4 py-2 border border-gray-700/30">
                <Text className="text-gray-400 text-sm">صفحه:</Text>
                <Text className="text-white font-semibold mr-2">{categoriesPage.toLocaleString('fa-IR')}</Text>
              </View>
              <TouchableOpacity
                onPress={handleCreateCategory}
                className="flex-row items-center gap-2 px-4 py-3 bg-accent rounded-lg"
                style={{ minHeight: touchTargetSize }}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={20} color="#fff" />
                <Text className="text-white text-sm font-semibold">افزودن دسته‌بندی</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      
      {/* Categories Table */}
      <DataTableRN
        columns={categoriesColumns}
        data={allCategories?.page || []}
        keyExtractor={(category) => category._id}
        emptyState={{
          icon: <Ionicons name="folder-outline" size={32} color="#6b7280" />,
          title: "دسته‌بندی‌ای یافت نشد",
          description: "هنوز هیچ دسته‌بندی‌ای در سیستم ثبت نشده است",
          action: (
            <TouchableOpacity
              onPress={handleCreateCategory}
              className="flex-row items-center gap-2 px-4 py-2 bg-accent rounded-lg"
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={16} color="#fff" />
              <Text className="text-white text-sm font-semibold">افزودن اولین دسته‌بندی</Text>
            </TouchableOpacity>
          ),
        }}
      />
      
      <PaginationControls 
        currentPage={categoriesPage}
        isDone={allCategories?.isDone ?? true}
        onNext={handleNextCategories}
        onPrev={handlePrevCategories}
        isLoading={allCategories === undefined}
      />
      </ScrollView>
    );
  };

  const renderFilesTab = () => (
    <View className="flex-1">
      <View className="mb-6">
        <View className="flex-row items-center justify-between mb-4">
          <View>
        <Text className="text-2xl font-bold text-white mb-2 text-right" style={{ fontFamily: 'Meem-Bold' }}>
          مدیریت فایل‌ها
        </Text>
        <Text className="text-gray-400 text-right" style={{ fontFamily: 'Meem-Regular' }}>
          مدیریت فایل‌های آپلود شده
        </Text>
          </View>
          <View className="flex-row items-center gap-3">
            <View className="bg-background-light/50 rounded-lg px-4 py-2 border border-gray-700/30">
              <Text className="text-gray-400 text-sm">صفحه:</Text>
              <Text className="text-white font-semibold mr-2">{filesPage.toLocaleString('fa-IR')}</Text>
            </View>
          </View>
        </View>
      </View>
      <FilesTable />
    </View>
  );

  const renderMatchesTab = () => {
    // Show skeleton while loading
    if (allMatches === undefined) {
      return <SkeletonAdminTab />;
    }

    // Define table columns
    const matchesColumns: Column<typeof allMatches.page[0]>[] = [
      {
        key: 'id',
        header: 'شناسه',
        render: (matchData) => (
          <Text className="text-gray-400 text-sm" style={{ fontFamily: 'Meem-Regular' }}>
            {matchData.match._id.slice(-8)}
          </Text>
        ),
      },
      {
        key: 'creator',
        header: 'سازنده',
        render: (matchData) => {
          const { creator } = matchData;
          return (
            <View className="flex-row items-center gap-2">
              <View className="w-8 h-8 bg-accent/20 rounded-full items-center justify-center">
                <Text className="text-accent font-bold text-xs" style={{ fontFamily: 'Meem-Bold' }}>
                  {creator?.name[0] || "?"}
                </Text>
              </View>
              <Text className="text-white text-sm font-medium" style={{ fontFamily: 'Meem-SemiBold' }}>
                {creator?.name || "ناشناس"}
              </Text>
            </View>
          );
        },
      },
      {
        key: 'participants',
        header: 'شرکت‌کنندگان',
        render: (matchData) => {
          const { participants } = matchData;
          return (
            <View className="space-y-1">
              {participants.map((p) => (
                <View key={p.userId} className="flex-row items-center gap-2">
                  <View className="w-6 h-6 bg-accent/20 rounded-full items-center justify-center">
                    <Text className="text-accent font-bold text-xs" style={{ fontFamily: 'Meem-Bold' }}>
                      {p.profile?.name[0] || "?"}
                    </Text>
                  </View>
                  <Text className="text-white text-xs" style={{ fontFamily: 'Meem-Regular' }}>
                    {p.profile?.name || "ناشناس"}
                  </Text>
                  {p.completedAt && (
                    <Ionicons name="checkmark-circle" size={12} color="#10b981" />
                  )}
                </View>
              ))}
            </View>
          );
        },
      },
      {
        key: 'type',
        header: 'نوع',
        render: (matchData) => {
          const { tournamentInfo } = matchData;
          if (tournamentInfo) {
            return (
              <View className="items-center">
                <View className="bg-purple-900/30 border border-purple-800/30 rounded-lg px-2 py-1">
                  <Ionicons name="trophy" size={14} color="#a78bfa" />
                </View>
              </View>
            );
          }
          return (
            <View className="px-3 py-1 rounded-full bg-gray-700/50 border border-gray-600/30">
              <Text className="text-gray-400 text-xs" style={{ fontFamily: 'Meem-Regular' }}>
                عادی
              </Text>
            </View>
          );
        },
      },
      {
        key: 'tournament',
        header: 'تورنومنت',
        render: (matchData) => {
          const { tournamentInfo } = matchData;
          if (tournamentInfo) {
            const roundText = {
              semi1: "نیمه‌نهایی ۱",
              semi2: "نیمه‌نهایی ۲",
              final: "فینال",
            };
            return (
              <View className="flex-1">
                <Text className="text-purple-400 text-sm font-medium mb-1" style={{ fontFamily: 'Meem-SemiBold' }}>
                  {roundText[tournamentInfo.round]}
                </Text>
                <Text className="text-gray-500 text-xs" style={{ fontFamily: 'Meem-Regular' }}>
                  {tournamentInfo.tournamentId.slice(-12)}
                </Text>
              </View>
            );
          }
          return (
            <View className="px-3 py-1 rounded-full bg-gray-700/50 border border-gray-600/30">
              <Text className="text-gray-400 text-xs" style={{ fontFamily: 'Meem-Regular' }}>
                ندارد
              </Text>
            </View>
          );
        },
      },
      {
        key: 'status',
        header: 'وضعیت',
        render: (matchData) => {
          const { match } = matchData;
          const statusColors = {
            waiting: "bg-yellow-900/30 text-yellow-400 border-yellow-800/30",
            active: "bg-blue-900/30 text-blue-400 border-blue-800/30",
            completed: "bg-green-900/30 text-green-400 border-green-800/30",
            cancelled: "bg-red-900/30 text-red-400 border-red-800/30",
          };
          const statusText = {
            waiting: "منتظر",
            active: "در حال انجام",
            completed: "تکمیل شده",
            cancelled: "لغو شده",
          };
          
          return (
            <View className={`px-3 py-1 rounded-full border ${statusColors[match.status]} w-fit`}>
              <Text className="text-sm font-semibold" style={{ fontFamily: 'Meem-SemiBold' }}>
                {statusText[match.status]}
              </Text>
            </View>
          );
        },
      },
      {
        key: 'date',
        header: 'تاریخ',
        render: (matchData) => {
          const { match } = matchData;
          return (
            <View>
              <Text className="text-gray-300 text-sm" style={{ fontFamily: 'Meem-Regular' }}>
                {new Date(match.createdAt).toLocaleDateString("fa-IR")}
              </Text>
              <Text className="text-gray-500 text-xs" style={{ fontFamily: 'Meem-Regular' }}>
                {new Date(match.createdAt).toLocaleTimeString("fa-IR", { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </Text>
            </View>
          );
        },
      },
      {
        key: 'result',
        header: 'نتیجه',
        render: (matchData) => {
          const { result, participants } = matchData;
          if (!result) {
            return <Text className="text-gray-500 text-sm">-</Text>;
          }
          
          if (result.isDraw) {
            return (
              <Text className="text-yellow-400 text-sm font-semibold" style={{ fontFamily: 'Meem-SemiBold' }}>
                مساوی
              </Text>
            );
          }
          
          return (
            <View>
              <Text className="text-green-400 text-sm font-semibold" style={{ fontFamily: 'Meem-SemiBold' }}>
                برنده: {participants.find(p => p.userId === result.winnerId)?.profile?.name || "ناشناس"}
              </Text>
              <Text className="text-gray-400 text-xs" style={{ fontFamily: 'Meem-Regular' }}>
                {result.player1Score} - {result.player2Score}
              </Text>
            </View>
          );
        },
      },
      {
        key: 'actions',
        header: 'عملیات',
        width: 200,
        render: (matchData) => {
          const { match } = matchData;
          return (
            <View className="flex-row items-center gap-2">
              <TouchableOpacity
                onPress={() => handleViewMatch(match._id)}
                className="px-3 py-2 bg-blue-600/20 border border-blue-500/30 rounded-lg"
                style={{ minHeight: touchTargetSize }}
                activeOpacity={0.7}
              >
                <Text className="text-blue-400 text-xs font-semibold" style={{ fontFamily: 'Meem-SemiBold' }}>
                  جزئیات
                </Text>
              </TouchableOpacity>
              {(match.status === "waiting" || match.status === "active") && (
                <TouchableOpacity
                  onPress={(e) => {
                    console.log("Cancel button pressed for match:", match._id);
                    console.log("Match status:", match.status);
                    console.log("User profile:", userProfile);
                    e.stopPropagation();
                    handleCancelMatch(match._id);
                  }}
                  className="px-3 py-2 bg-red-600/20 border border-red-500/30 rounded-lg"
                  style={{ minHeight: touchTargetSize }}
                  activeOpacity={0.7}
                >
                  <Text className="text-red-400 text-xs font-semibold" style={{ fontFamily: 'Meem-SemiBold' }}>
                    لغو مسابقه
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          );
        },
      },
    ];

    return (
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-2xl font-bold text-white mb-2 text-right" style={{ fontFamily: 'Meem-Bold' }}>
                مدیریت مسابقات
              </Text>
              <Text className="text-gray-400 text-right" style={{ fontFamily: 'Meem-Regular' }}>
                مشاهده و مدیریت تمام مسابقات
              </Text>
            </View>
            <View className="flex-row items-center gap-3">
              <View className="bg-background-light/50 rounded-lg px-4 py-2 border border-gray-700/30">
                <Text className="text-gray-400 text-sm">صفحه:</Text>
                <Text className="text-white font-semibold mr-2">{matchesPage.toLocaleString('fa-IR')}</Text>
              </View>
              <View className="bg-background-light/50 rounded-lg px-4 py-2 border border-gray-700/30">
                <Text className="text-gray-400 text-sm">فعال در این صفحه:</Text>
                <Text className="text-accent font-semibold mr-2">
                  {allMatches?.page?.filter(m => m.match.status === "waiting" || m.match.status === "active").length || 0}
                </Text>
              </View>
            </View>
          </View>
        </View>
      
      {/* Matches Table */}
      <DataTableRN
        columns={matchesColumns}
        data={allMatches?.page || []}
        keyExtractor={(matchData) => matchData.match._id}
        emptyState={{
          icon: <Ionicons name="trophy" size={32} color="#6b7280" />,
          title: "مسابقه‌ای یافت نشد",
          description: "هنوز هیچ مسابقه‌ای در سیستم ثبت نشده است",
        }}
      />
      
      <PaginationControls 
        currentPage={matchesPage}
        isDone={allMatches?.isDone ?? true}
        onNext={handleNextMatches}
        onPrev={handlePrevMatches}
        isLoading={allMatches === undefined}
      />
      </ScrollView>
    );
  };

  const handleMigrateStoreItems = async () => {
    try {
      const result = await migrateStoreItems();
      toast.success(`Migration انجام شد. ${result.migrated} آیتم به‌روزرسانی شد.`);
    } catch (error: any) {
      toast.error(error.message || "خطا در migration");
    }
  };

  const renderStoreTab = () => {
    if (allStoreItems === undefined) {
      return <SkeletonAdminTab />;
    }

    const stadiumItems = allStoreItems.filter(item => item.itemType === "stadium");
    const mentorItems = allStoreItems.filter(item => item.itemType === "mentor");
    const allItems = [...stadiumItems, ...mentorItems];
    const itemsWithoutType = allStoreItems.filter(item => !item.itemType);

    const storeColumns: Column<typeof allItems[0]>[] = [
      {
        key: 'name',
        header: 'نام',
        render: (item) => (
          <View className="flex-row items-center gap-3">
            <View className={`w-10 h-10 rounded-full items-center justify-center ${
              item.itemType === "stadium" ? "bg-accent/20" : "bg-purple-600/20"
            }`}>
              <Ionicons 
                name={item.itemType === "stadium" ? "storefront" : "school"} 
                size={20} 
                color={item.itemType === "stadium" ? "#ff701a" : "#a78bfa"} 
              />
            </View>
            <View className="flex-1">
              <Text className="text-white font-semibold text-base" style={{ fontFamily: 'Meem-SemiBold' }}>
                {item.name}
              </Text>
              {item.description && item.description.trim() && (
                <Text className="text-gray-400 text-sm mt-1" style={{ fontFamily: 'Meem-Regular' }}>
                  {item.description}
                </Text>
              )}
            </View>
          </View>
        ),
      },
      {
        key: 'type',
        header: 'نوع',
        render: (item) => (
          <View className={`rounded-lg px-3 py-1 border w-fit ${
            item.itemType === "stadium"
              ? "bg-accent/20 border-accent/30"
              : "bg-purple-600/20 border-purple-500/30"
          }`}>
            <Text className={`font-semibold text-sm ${
              item.itemType === "stadium" ? "text-accent" : "text-purple-300"
            }`} style={{ fontFamily: 'Meem-SemiBold' }}>
              {item.itemType === "stadium" ? "استادیوم" : "منتور"}
            </Text>
          </View>
        ),
      },
      {
        key: 'price',
        header: 'قیمت',
        render: (item) => (
          <View className="bg-accent/10 rounded-lg px-3 py-1 border border-accent/30 w-fit">
            <Text className="text-accent font-bold text-sm" style={{ fontFamily: 'Meem-Bold' }}>
              {item.price.toLocaleString('fa-IR')} امتیاز
            </Text>
          </View>
        ),
      },
      {
        key: 'matchesBonus',
        header: 'بازی اضافی',
        render: (item) => (
          item.itemType === "stadium" ? (
            <Text className="text-white font-semibold" style={{ fontFamily: 'Meem-SemiBold' }}>
              +{item.matchesBonus ?? 0}
            </Text>
          ) : (
            <Text className="text-gray-500 text-sm">-</Text>
          )
        ),
      },
      {
        key: 'tournamentsBonus',
        header: 'تورنومنت اضافی',
        render: (item) => (
          item.itemType === "stadium" ? (
            <Text className="text-white font-semibold" style={{ fontFamily: 'Meem-SemiBold' }}>
              +{item.tournamentsBonus ?? 0}
            </Text>
          ) : (
            <Text className="text-gray-500 text-sm">-</Text>
          )
        ),
      },
      {
        key: 'mentorMode',
        header: 'مدل منتور',
        render: (item) => (
          item.itemType === "mentor" ? (
            <View className="bg-purple-600/20 rounded-lg px-3 py-1 border border-purple-500/30 w-fit">
              <Text className="text-purple-300 font-semibold text-sm" style={{ fontFamily: 'Meem-SemiBold' }}>
                {item.mentorMode === 1 ? "حذف ۱ گزینه" : "حذف ۲ گزینه"}
              </Text>
            </View>
          ) : (
            <Text className="text-gray-500 text-sm">-</Text>
          )
        ),
      },
      {
        key: 'duration',
        header: 'مدت اعتبار',
        render: (item) => (
          <Text className="text-gray-300 text-sm" style={{ fontFamily: 'Meem-Regular' }}>
            {item.durationMs === 0 
              ? "دائمی"
              : `${Math.floor(item.durationMs / (24 * 60 * 60 * 1000))} روز`
            }
          </Text>
        ),
      },
      {
        key: 'status',
        header: 'وضعیت',
        render: (item) => (
          <View className={`px-3 py-1 rounded-full border w-fit ${
            item.isActive
              ? "bg-green-900/30 text-green-400 border-green-800/30"
              : "bg-gray-700/50 text-gray-400 border-gray-600/30"
          }`}>
            <Text className={`text-xs font-semibold ${
              item.isActive ? "text-green-400" : "text-gray-400"
            }`} style={{ fontFamily: 'Meem-SemiBold' }}>
              {item.isActive ? "فعال" : "غیرفعال"}
            </Text>
          </View>
        ),
      },
      {
        key: 'actions',
        header: 'عملیات',
        width: 300,
        render: (item) => (
          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              onPress={() => handleEditStoreItem(item)}
              className="px-3 py-2 bg-blue-600/20 border border-blue-500/30 rounded-lg"
              style={{ minHeight: touchTargetSize }}
              activeOpacity={0.7}
            >
              <Text className="text-blue-400 text-xs font-semibold" style={{ fontFamily: 'Meem-SemiBold' }}>
                ویرایش
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleToggleStoreItemStatus(item._id)}
              className={`px-3 py-2 rounded-lg border ${
                item.isActive
                  ? "bg-yellow-600/20 border-yellow-500/30"
                  : "bg-green-600/20 border-green-500/30"
              }`}
              style={{ minHeight: touchTargetSize }}
              activeOpacity={0.7}
            >
              <Text
                className={`text-xs font-semibold ${
                  item.isActive ? "text-yellow-400" : "text-green-400"
                }`}
                style={{ fontFamily: 'Meem-SemiBold' }}
              >
                {item.isActive ? "غیرفعال" : "فعال"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDeleteStoreItem(item._id)}
              className="px-3 py-2 bg-red-600/20 border border-red-500/30 rounded-lg"
              style={{ minHeight: touchTargetSize }}
              activeOpacity={0.7}
            >
              <Text className="text-red-400 text-xs font-semibold" style={{ fontFamily: 'Meem-SemiBold' }}>
                حذف
              </Text>
            </TouchableOpacity>
          </View>
        ),
      },
    ];

    return (
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-6">
          {/* Migration Button */}
          {itemsWithoutType.length > 0 && (
            <View className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-4 mb-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-yellow-300 font-semibold mb-1" style={{ fontFamily: 'Meem-SemiBold' }}>
                    ⚠️ آیتم‌های قدیمی نیاز به به‌روزرسانی دارند
                  </Text>
                  <Text className="text-yellow-400/80 text-sm" style={{ fontFamily: 'Meem-Regular' }}>
                    {itemsWithoutType.length} آیتم فیلد itemType ندارد
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={handleMigrateStoreItems}
                  className="px-4 py-2 bg-yellow-600 rounded-lg flex-row items-center gap-2"
                  activeOpacity={0.7}
                >
                  <Ionicons name="refresh" size={18} color="#fff" />
                  <Text className="text-white font-semibold text-sm" style={{ fontFamily: 'Meem-SemiBold' }}>
                    Migration
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-2xl font-bold text-white mb-2 text-right" style={{ fontFamily: 'Meem-Bold' }}>
                مدیریت فروشگاه
              </Text>
              <Text className="text-gray-400 text-right" style={{ fontFamily: 'Meem-Regular' }}>
                استادیوم‌ها و منتورها
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                setEditingStoreItem(null);
                setCreatingItemType(null);
                setShowStoreItemForm(true);
              }}
              className="px-4 py-3 bg-accent rounded-lg flex-row items-center gap-2"
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text className="text-white font-semibold" style={{ fontFamily: 'Meem-SemiBold' }}>
                افزودن
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      
        {/* Store Items Table */}
        <DataTableRN
          columns={storeColumns}
          data={allItems}
          keyExtractor={(item) => item._id}
          emptyState={{
            icon: <Ionicons name="storefront" size={32} color="#6b7280" />,
            title: "آیتمی یافت نشد",
            description: "هنوز هیچ آیتمی در سیستم ثبت نشده است",
          }}
        />
      </ScrollView>
    );
  };


  const renderTournamentsTab = () => {
    // Show skeleton while loading
    if (allTournaments === undefined) {
      return <SkeletonAdminTab />;
    }

    const tournamentsColumns: Column<typeof allTournaments[0]>[] = [
      {
        key: 'id',
        header: 'شناسه تورنومنت',
        render: (tournamentData) => (
          <Text className="text-gray-400 text-sm font-mono" style={{ fontFamily: 'Meem-Regular' }}>
            {tournamentData.tournament.tournamentId.slice(-12)}
          </Text>
        ),
      },
      {
        key: 'creator',
        header: 'سازنده',
        render: (tournamentData) => (
          <Text className="text-white text-sm" style={{ fontFamily: 'Meem-SemiBold' }}>
            {tournamentData.creator?.name || "ناشناس"}
          </Text>
        ),
      },
      {
        key: 'participants',
        header: 'شرکت‌کنندگان',
        render: (tournamentData) => (
          <Text className="text-gray-300 text-sm" style={{ fontFamily: 'Meem-Regular' }}>
            {tournamentData.participants.length} / 4
          </Text>
        ),
      },
      {
        key: 'status',
        header: 'وضعیت',
        render: (tournamentData) => {
          const status = tournamentData.tournament.status;
          const color = status === 'active' ? 'green' : status === 'completed' ? 'blue' : status === 'cancelled' ? 'red' : 'yellow';
          const bgColor = status === 'active' ? 'bg-green-900/20' : status === 'completed' ? 'bg-blue-900/20' : status === 'cancelled' ? 'bg-red-900/20' : 'bg-yellow-900/20';
          const borderColor = status === 'active' ? 'border-green-500/30' : status === 'completed' ? 'border-blue-500/30' : status === 'cancelled' ? 'border-red-500/30' : 'border-yellow-500/30';
          const textColor = status === 'active' ? 'text-green-400' : status === 'completed' ? 'text-blue-400' : status === 'cancelled' ? 'text-red-400' : 'text-yellow-400';
          
          const statusText = status === 'waiting' ? 'در انتظار' : status === 'active' ? 'فعال' : status === 'completed' ? 'تمام شده' : 'لغو شده';
          
          return (
            <View className={`px-3 py-1 rounded-full border ${bgColor} ${borderColor}`}>
              <Text className={`text-xs font-semibold ${textColor}`} style={{ fontFamily: 'Meem-SemiBold' }}>
                {statusText}
              </Text>
            </View>
          );
        },
      },
      {
        key: 'matches',
        header: 'مسابقات',
        render: (tournamentData) => (
          <Text className="text-gray-300 text-sm" style={{ fontFamily: 'Meem-Regular' }}>
            {tournamentData.matches.length} مسابقه
          </Text>
        ),
      },
      {
        key: 'created',
        header: 'تاریخ ایجاد',
        render: (tournamentData) => {
          const date = new Date(tournamentData.tournament.createdAt);
          return (
            <Text className="text-gray-400 text-sm" style={{ fontFamily: 'Meem-Regular' }}>
              {date.toLocaleDateString('fa-IR', { year: 'numeric', month: 'short', day: 'numeric' })}
            </Text>
          );
        },
      },
      {
        key: 'actions',
        header: 'عملیات',
        width: 200,
        render: (tournamentData) => {
          const { tournament } = tournamentData;
          return (
            <View className="flex-row items-center gap-2">
              <TouchableOpacity
                onPress={() => handleViewTournament(tournament.tournamentId)}
                className="px-3 py-2 bg-blue-600/20 border border-blue-500/30 rounded-lg"
                style={{ minHeight: touchTargetSize }}
                activeOpacity={0.7}
              >
                <Text className="text-blue-400 text-xs font-semibold" style={{ fontFamily: 'Meem-SemiBold' }}>
                  جزئیات
                </Text>
              </TouchableOpacity>
              {(tournament.status === "waiting" || tournament.status === "active") && (
                <TouchableOpacity
                  onPress={(e) => {
                    console.log("Cancel button pressed for tournament:", tournament.tournamentId);
                    console.log("Tournament status:", tournament.status);
                    e.stopPropagation();
                    handleCancelTournament(tournament.tournamentId);
                  }}
                  className="px-3 py-2 bg-red-600/20 border border-red-500/30 rounded-lg"
                  style={{ minHeight: touchTargetSize }}
                  activeOpacity={0.7}
                >
                  <Text className="text-red-400 text-xs font-semibold" style={{ fontFamily: 'Meem-SemiBold' }}>
                    لغو تورنومنت
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          );
        },
      },
    ];

    return (
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-2xl font-bold text-white mb-2 text-right" style={{ fontFamily: 'Meem-Bold' }}>
                مدیریت تورنومنت‌ها
              </Text>
              <Text className="text-gray-400 text-right" style={{ fontFamily: 'Meem-Regular' }}>
                مشاهده و مدیریت تمام تورنومنت‌ها
              </Text>
            </View>
            <View className="flex-row items-center gap-3">
              <View className="bg-background-light/50 rounded-lg px-4 py-2 border border-gray-700/30">
                <Text className="text-gray-400 text-sm">تعداد:</Text>
                <Text className="text-white font-semibold mr-2">{allTournaments?.length || 0}</Text>
              </View>
            </View>
          </View>
        </View>
      
      {/* Tournaments Table */}
      <DataTableRN
        columns={tournamentsColumns}
        data={allTournaments || []}
        keyExtractor={(tournamentData) => tournamentData.tournament.tournamentId}
        emptyState={{
          icon: <Ionicons name="medal" size={32} color="#6b7280" />,
          title: "تورنومنتی یافت نشد",
          description: "هنوز هیچ تورنومنتی در سیستم ثبت نشده است",
        }}
      />
      </ScrollView>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 flex-row">
        {/* Sidebar */}
        <View className="w-64 bg-background-light/60 border-l border-gray-700/30">
          <View className="p-6">
            {/* Logo/Brand */}
            <View className="mb-8">
              <View className="flex-row items-center gap-3 mb-2">
                <View className="w-8 h-8 bg-accent rounded-lg items-center justify-center">
                  <Ionicons name="shield-checkmark" size={20} color="#fff" />
                </View>
                <Text className="text-xl font-bold text-white" style={{ fontFamily: 'Meem-Bold' }}>
                  پنل مدیریت
                </Text>
              </View>
              <Text className="text-gray-400 text-sm">MVP 12</Text>
            </View>

            {/* Navigation */}
            <View className="space-y-3">
              <Text className="text-xs font-semibold text-gray-500 mb-3" style={{ fontFamily: 'Meem-SemiBold' }}>
                مدیریت
              </Text>
              
              <TouchableOpacity
                onPress={() => setActiveTab("users")}
                className={`p-4 rounded-xl ${
                  activeTab === "users"
                    ? "bg-accent/20 border border-accent/30"
                    : "bg-transparent"
                }`}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center gap-3">
                  <View className={`w-10 h-10 rounded-lg items-center justify-center ${
                    activeTab === "users" ? "bg-accent" : "bg-gray-700"
                  }`}>
                    <Ionicons name="people" size={20} color={activeTab === "users" ? "#fff" : "#9ca3af"} />
                  </View>
                  <Text className={`font-medium ${
                    activeTab === "users" ? "text-white" : "text-gray-300"
                  }`} style={{ fontFamily: 'Meem-SemiBold' }}>
                    مدیریت کاربران
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setActiveTab("questions")}
                className={`p-4 rounded-xl ${
                  activeTab === "questions"
                    ? "bg-accent/20 border border-accent/30"
                    : "bg-transparent"
                }`}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center gap-3">
                  <View className={`w-10 h-10 rounded-lg items-center justify-center ${
                    activeTab === "questions" ? "bg-accent" : "bg-gray-700"
                  }`}>
                    <Ionicons name="help-circle" size={20} color={activeTab === "questions" ? "#fff" : "#9ca3af"} />
                  </View>
                  <Text className={`font-medium ${
                    activeTab === "questions" ? "text-white" : "text-gray-300"
                  }`} style={{ fontFamily: 'Meem-SemiBold' }}>
                    مدیریت سؤالات
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setActiveTab("categories")}
                className={`p-4 rounded-xl ${
                  activeTab === "categories"
                    ? "bg-accent/20 border border-accent/30"
                    : "bg-transparent"
                }`}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center gap-3">
                  <View className={`w-10 h-10 rounded-lg items-center justify-center ${
                    activeTab === "categories" ? "bg-accent" : "bg-gray-700"
                  }`}>
                    <Ionicons name="pricetags" size={20} color={activeTab === "categories" ? "#fff" : "#9ca3af"} />
                  </View>
                  <Text className={`font-medium ${
                    activeTab === "categories" ? "text-white" : "text-gray-300"
                  }`} style={{ fontFamily: 'Meem-SemiBold' }}>
                    مدیریت دسته‌بندی‌ها
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setActiveTab("files")}
                className={`p-4 rounded-xl ${
                  activeTab === "files"
                    ? "bg-accent/20 border border-accent/30"
                    : "bg-transparent"
                }`}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center gap-3">
                  <View className={`w-10 h-10 rounded-lg items-center justify-center ${
                    activeTab === "files" ? "bg-accent" : "bg-gray-700"
                  }`}>
                    <Ionicons name="folder" size={20} color={activeTab === "files" ? "#fff" : "#9ca3af"} />
                  </View>
                  <Text className={`font-medium ${
                    activeTab === "files" ? "text-white" : "text-gray-300"
                  }`} style={{ fontFamily: 'Meem-SemiBold' }}>
                    مدیریت فایل‌ها
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setActiveTab("matches")}
                className={`p-4 rounded-xl ${
                  activeTab === "matches"
                    ? "bg-accent/20 border border-accent/30"
                    : "bg-transparent"
                }`}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center gap-3">
                  <View className={`w-10 h-10 rounded-lg items-center justify-center ${
                    activeTab === "matches" ? "bg-accent" : "bg-gray-700"
                  }`}>
                    <Ionicons name="trophy" size={20} color={activeTab === "matches" ? "#fff" : "#9ca3af"} />
                  </View>
                  <Text className={`font-medium ${
                    activeTab === "matches" ? "text-white" : "text-gray-300"
                  }`} style={{ fontFamily: 'Meem-SemiBold' }}>
                    مدیریت مسابقات
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setActiveTab("tournaments")}
                className={`p-4 rounded-xl ${
                  activeTab === "tournaments"
                    ? "bg-accent/20 border border-accent/30"
                    : "bg-transparent"
                }`}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center gap-3">
                  <View className={`w-10 h-10 rounded-lg items-center justify-center ${
                    activeTab === "tournaments" ? "bg-accent" : "bg-gray-700"
                  }`}>
                    <Ionicons name="medal" size={20} color={activeTab === "tournaments" ? "#fff" : "#9ca3af"} />
                  </View>
                  <Text className={`font-medium ${
                    activeTab === "tournaments" ? "text-white" : "text-gray-300"
                  }`} style={{ fontFamily: 'Meem-SemiBold' }}>
                    مدیریت تورنومنت‌ها
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setActiveTab("store")}
                className={`p-4 rounded-xl ${
                  activeTab === "store"
                    ? "bg-accent/20 border border-accent/30"
                    : "bg-transparent"
                }`}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center gap-3">
                  <View className={`w-10 h-10 rounded-lg items-center justify-center ${
                    activeTab === "store" ? "bg-accent" : "bg-gray-700"
                  }`}>
                    <Ionicons name="storefront" size={20} color={activeTab === "store" ? "#fff" : "#9ca3af"} />
                  </View>
                  <Text className={`font-medium ${
                    activeTab === "store" ? "text-white" : "text-gray-300"
                  }`} style={{ fontFamily: 'Meem-SemiBold' }}>
                    فروشگاه
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Back to Main Button */}
            <View className="mt-8 pt-6 border-t border-gray-700/30">
              <TouchableOpacity
                onPress={() => router.push("/(tabs)")}
                className="p-4 rounded-xl bg-gray-700/30 border border-gray-600/30"
                activeOpacity={0.7}
              >
                <View className="flex-row items-center gap-3">
                  <View className="w-10 h-10 rounded-lg items-center justify-center bg-gray-600">
                    <Ionicons name="home-outline" size={20} color="#9ca3af" />
                  </View>
                  <Text className="font-medium text-gray-300" style={{ fontFamily: 'Meem-SemiBold' }}>
                    بازگشت به صفحه اصلی
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Main Content */}
        <View 
          className="flex-1" 
          style={{ paddingHorizontal: 24, paddingVertical: 24 }}
        >
          {activeTab === "users" && renderUsersTab()}
          {activeTab === "questions" && renderQuestionsTab()}
          {activeTab === "categories" && renderCategoriesTab()}
          {activeTab === "files" && renderFilesTab()}
          {activeTab === "matches" && renderMatchesTab()}
          {activeTab === "tournaments" && renderTournamentsTab()}
          {activeTab === "store" && renderStoreTab()}
        </View>
      </View>

      {/* Questions Form Modal */}
      <Modal
        visible={showQuestionForm}
        animationType="slide"
        presentationStyle={Platform.select({
          ios: Platform.isPad ? 'formSheet' : 'pageSheet',
          android: 'fullScreen',
          default: 'pageSheet'
        })}
      >
        <SafeAreaView className="flex-1 bg-background">
          <QuestionsForm
            question={editingQuestion}
            onClose={handleCloseQuestionForm}
          />
        </SafeAreaView>
      </Modal>

      {/* Category Form Modal */}
      <Modal
        visible={showCategoryForm}
        animationType="slide"
        presentationStyle={Platform.select({
          ios: Platform.isPad ? 'formSheet' : 'pageSheet',
          android: 'fullScreen',
          default: 'pageSheet'
        })}
      >
        <SafeAreaView className="flex-1 bg-background">
          <CategoryForm
            category={editingCategory}
            onClose={handleCloseCategoryForm}
          />
        </SafeAreaView>
      </Modal>

      {/* Store Item Form Modal */}
      <Modal
        visible={showStoreItemForm}
        animationType="slide"
        presentationStyle={Platform.select({
          ios: Platform.isPad ? 'formSheet' : 'pageSheet',
          android: 'fullScreen',
          default: 'pageSheet'
        })}
      >
        <SafeAreaView className="flex-1 bg-background">
          <View className="flex-1">
            <View className="flex-row items-center justify-between p-4 border-b border-gray-700">
              <Text className="text-xl font-bold text-white" style={{ fontFamily: 'Meem-Bold' }}>
                {editingStoreItem 
                  ? editingStoreItem.itemType === "stadium" 
                    ? "ویرایش استادیوم" 
                    : "ویرایش منتور"
                  : "ایجاد آیتم جدید"
                }
              </Text>
              <TouchableOpacity
                onPress={handleCloseStoreItemForm}
                className="p-2"
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            <StoreItemForm
              item={editingStoreItem}
              defaultItemType={editingStoreItem?.itemType || creatingItemType || "stadium"}
              onClose={handleCloseStoreItemForm}
            />
          </View>
        </SafeAreaView>
      </Modal>

      {/* Confirmation Dialog */}
      {confirmationDialog && (
        <ConfirmationDialog
          isOpen={confirmationDialog.isOpen}
          onClose={() => setConfirmationDialog(null)}
          onConfirm={confirmationDialog.onConfirm}
          title={confirmationDialog.title}
          message={confirmationDialog.message}
          confirmText={confirmationDialog.confirmText}
          cancelText={confirmationDialog.cancelText}
          variant="danger"
        />
      )}
    </SafeAreaView>
  );
}

