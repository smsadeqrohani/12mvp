import { useQuery, useMutation } from "convex/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";
import { QuestionsForm, FilesTable, MatchDetailsAdmin } from "../features/admin";
import { PaginationControls, PageLoader } from "../components/ui";

type TabType = "users" | "questions" | "files" | "matches";

export function AdminPage() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const userProfile = useQuery(api.auth.getUserProfile);
  const navigate = useNavigate();
  
  // Platform detection - restrict admin to desktop/tablet (≥1024px)
  const [isLargeScreen, setIsLargeScreen] = useState(true);
  
  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
  const [activeTab, setActiveTab] = useState<TabType>("users");
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [viewingMatchId, setViewingMatchId] = useState<string | null>(null);

  // Pagination state for each tab - track cursor history for back navigation
  const [usersCursor, setUsersCursor] = useState<string | null>(null);
  const [questionsCursor, setQuestionsCursor] = useState<string | null>(null);
  const [filesCursor, setFilesCursor] = useState<string | null>(null);
  const [matchesCursor, setMatchesCursor] = useState<string | null>(null);
  
  const [usersCursorHistory, setUsersCursorHistory] = useState<(string | null)[]>([null]);
  const [questionsCursorHistory, setQuestionsCursorHistory] = useState<(string | null)[]>([null]);
  const [filesCursorHistory, setFilesCursorHistory] = useState<(string | null)[]>([null]);
  const [matchesCursorHistory, setMatchesCursorHistory] = useState<(string | null)[]>([null]);
  
  const [usersPage, setUsersPage] = useState(1);
  const [questionsPage, setQuestionsPage] = useState(1);
  const [filesPage, setFilesPage] = useState(1);
  const [matchesPage, setMatchesPage] = useState(1);

  // Pagination queries
  const PAGE_SIZE = 5;
  const allUsers = useQuery(api.auth.getAllUsers, {
    paginationOpts: { numItems: PAGE_SIZE, cursor: usersCursor },
  });
  const allQuestions = useQuery(api.questions.getAllQuestions, {
    paginationOpts: { numItems: PAGE_SIZE, cursor: questionsCursor },
  });
  const allFiles = useQuery(api.files.getAllFiles, {
    paginationOpts: { numItems: PAGE_SIZE, cursor: filesCursor },
  });
  const allMatches = useQuery(api.matches.getAllMatches, {
    paginationOpts: { numItems: PAGE_SIZE, cursor: matchesCursor },
  });

  const makeUserAdmin = useMutation(api.auth.makeUserAdmin);
  const updateUserName = useMutation(api.auth.updateUserName);
  const resetUserPassword = useMutation(api.auth.resetUserPassword);
  const createQuestion = useMutation(api.questions.createQuestion);
  const updateQuestion = useMutation(api.questions.updateQuestion);
  const deleteQuestion = useMutation(api.questions.deleteQuestion);
  const cancelMatch = useMutation(api.matches.cancelMatch);

  // Always call useEffect at the top level
  useEffect(() => {
    if (loggedInUser === null) {
      navigate("/login", { replace: true });
    } else if (userProfile && !userProfile.isAdmin) {
      navigate("/", { replace: true });
    }
  }, [loggedInUser, userProfile, navigate]);

  // Show loading while checking authentication and admin status
  if (loggedInUser === undefined || userProfile === undefined) {
    return <PageLoader message="در حال بررسی دسترسی مدیریت..." />;
  }

  // Don't render anything while redirecting
  if (loggedInUser === null || (userProfile && !userProfile.isAdmin)) {
    return <PageLoader message="در حال انتقال..." />;
  }

  // Restrict admin panel to large screens only (≥1024px - desktop/tablet)
  if (!isLargeScreen) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <div className="bg-background-light/60 backdrop-blur-sm rounded-2xl border border-gray-700/30 p-12 max-w-2xl text-center">
          <div className="text-6xl mb-6">🖥️</div>
          <h1 className="text-3xl font-bold text-accent mb-4">
            پنل مدیریت فقط در دسکتاپ و تبلت قابل دسترسی است
          </h1>
          <p className="text-gray-300 text-lg mb-4">
            برای استفاده از پنل مدیریت، لطفاً از دستگاه با صفحه نمایش بزرگتر استفاده کنید.
          </p>
          <p className="text-gray-400">
            حداقل عرض مورد نیاز: 1024 پیکسل
          </p>
        </div>
      </div>
    );
  }

  const handleToggleAdmin = async (userId: string, isAdmin: boolean) => {
    try {
      await makeUserAdmin({ userId: userId as any, isAdmin });
      toast.success(isAdmin ? "کاربر به مدیر تبدیل شد" : "دسترسی مدیر حذف شد");
    } catch (error) {
      toast.error("خطا در تغییر دسترسی کاربر");
    }
  };

  const handleEditName = async (userId: string) => {
    if (!editName.trim()) return;
    try {
      await updateUserName({ userId: userId as any, name: editName });
      toast.success("نام کاربر با موفقیت به‌روزرسانی شد");
      setEditingUser(null);
      setEditName("");
    } catch (error) {
      toast.error("خطا در به‌روزرسانی نام");
    }
  };

  const handleResetPassword = async (userId: string, userName: string) => {
    try {
      await resetUserPassword({ userId: userId as any });
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
    if (window.confirm("آیا مطمئن هستید که می‌خواهید این سؤال را حذف کنید؟")) {
      try {
        await deleteQuestion({ questionId: questionId as any });
        toast.success("سؤال با موفقیت حذف شد");
      } catch (error) {
        toast.error("خطا در حذف سؤال");
      }
    }
  };

  const handleEditQuestion = (question: any) => {
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

  const handleCancelMatch = async (matchId: string) => {
    if (window.confirm("آیا مطمئن هستید که می‌خواهید این مسابقه را لغو کنید؟")) {
      try {
        await cancelMatch({ matchId: matchId as any });
        toast.success("مسابقه با موفقیت لغو شد");
      } catch (error) {
        toast.error("خطا در لغو مسابقه: " + (error as Error).message);
      }
    }
  };

  const handleViewMatch = (matchId: string) => {
    setViewingMatchId(matchId);
  };

  const handleBackToMatches = () => {
    setViewingMatchId(null);
  };

  // Pagination handlers with proper back navigation
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

  // handleDuplicateQuestion removed - users can manually create questions instead

  // If viewing match details, show the match results view
  if (viewingMatchId) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-full mx-auto px-6 py-6">
          <div className="mb-6">
            <button
              onClick={handleBackToMatches}
              className="flex items-center gap-2 px-4 py-2 bg-background-light/60 backdrop-blur-sm hover:bg-background-light/80 text-white rounded-lg transition-all duration-200 border border-gray-700/30 hover:border-gray-600/50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              بازگشت به لیست مسابقات
            </button>
          </div>
          <MatchDetailsAdmin 
            matchId={viewingMatchId as Id<"matches">} 
            onBack={handleBackToMatches}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-full mx-auto px-4 py-6">
        <div className="grid grid-cols-5 gap-6">
          {/* Right Sidebar - Grid Column */}
          <div className="col-span-1">
            <div className="bg-background-light/60 backdrop-blur-sm rounded-2xl border border-gray-700/30 h-[calc(100vh-8rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
              <div className="p-6">
                {/* Logo/Brand */}
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-accent to-accent-hover rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-bold text-white">
                      پنل مدیریت
                    </h2>
                  </div>
                  <p className="text-gray-400 text-sm">MVP 12</p>
                </div>

                {/* Navigation */}
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    مدیریت
                  </div>
                  
                  <button
                    onClick={() => setActiveTab("users")}
                    className={`group w-full text-right pl-4 pr-4 py-4 rounded-xl transition-all duration-300 ${
                      activeTab === "users"
                        ? "bg-gradient-to-l from-accent/20 to-accent/10 border border-accent/30 shadow-lg shadow-accent/10"
                        : "hover:bg-gray-700/50 border border-transparent hover:border-gray-600/50"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                        activeTab === "users"
                          ? "bg-accent text-white"
                          : "bg-gray-700 group-hover:bg-gray-600 text-gray-400 group-hover:text-gray-300"
                      }`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium transition-colors ${
                          activeTab === "users" ? "text-white" : "text-gray-300 group-hover:text-white"
                        }`}>
                          مدیریت کاربران
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab("questions")}
                    className={`group w-full text-right pl-4 pr-4 py-4 rounded-xl transition-all duration-300 ${
                      activeTab === "questions"
                        ? "bg-gradient-to-l from-accent/20 to-accent/10 border border-accent/30 shadow-lg shadow-accent/10"
                        : "hover:bg-gray-700/50 border border-transparent hover:border-gray-600/50"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                        activeTab === "questions"
                          ? "bg-accent text-white"
                          : "bg-gray-700 group-hover:bg-gray-600 text-gray-400 group-hover:text-gray-300"
                      }`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium transition-colors ${
                          activeTab === "questions" ? "text-white" : "text-gray-300 group-hover:text-white"
                        }`}>
                          مدیریت سؤالات
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab("files")}
                    className={`group w-full text-right pl-4 pr-4 py-4 rounded-xl transition-all duration-300 ${
                      activeTab === "files"
                        ? "bg-gradient-to-l from-accent/20 to-accent/10 border border-accent/30 shadow-lg shadow-accent/10"
                        : "hover:bg-gray-700/50 border border-transparent hover:border-gray-600/50"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                        activeTab === "files"
                          ? "bg-accent text-white"
                          : "bg-gray-700 group-hover:bg-gray-600 text-gray-400 group-hover:text-gray-300"
                      }`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium transition-colors ${
                          activeTab === "files" ? "text-white" : "text-gray-300 group-hover:text-white"
                        }`}>
                          مدیریت فایل‌ها
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab("matches")}
                    className={`group w-full text-right pl-4 pr-4 py-4 rounded-xl transition-all duration-300 ${
                      activeTab === "matches"
                        ? "bg-gradient-to-l from-accent/20 to-accent/10 border border-accent/30 shadow-lg shadow-accent/10"
                        : "hover:bg-gray-700/50 border border-transparent hover:border-gray-600/50"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                        activeTab === "matches"
                          ? "bg-accent text-white"
                          : "bg-gray-700 group-hover:bg-gray-600 text-gray-400 group-hover:text-gray-300"
                      }`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium transition-colors ${
                          activeTab === "matches" ? "text-white" : "text-gray-300 group-hover:text-white"
                        }`}>
                          مدیریت مسابقات
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Grid Column */}
          <div className="col-span-4">
            {activeTab === "users" && (
              <div>
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
      <div>
                      <h1 className="text-3xl font-bold text-white mb-2 text-right">
                        مدیریت کاربران
        </h1>
                      <p className="text-gray-400 text-right">
                        مدیریت و تنظیم کاربران سیستم
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-background-light/50 backdrop-blur-sm rounded-lg pl-4 pr-4 py-2 border border-gray-700/30">
                        <span className="text-gray-400 text-sm">صفحه:</span>
                        <span className="text-white font-semibold mr-2">{usersPage}</span>
                      </div>
                      <div className="bg-background-light/50 backdrop-blur-sm rounded-lg pl-4 pr-4 py-2 border border-gray-700/30">
                        <span className="text-gray-400 text-sm">مدیران در این صفحه:</span>
                        <span className="text-accent font-semibold mr-2">
                          {allUsers?.page?.filter(user => user.isAdmin).length || 0}
                        </span>
                      </div>
                    </div>
                  </div>
      </div>
      
              {/* Users Table */}
              <div className="bg-gradient-to-br from-background-light/80 to-background-light/40 backdrop-blur-sm rounded-2xl border border-gray-700/30 overflow-hidden shadow-2xl shadow-black/20">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-800/80 to-gray-700/80 border-b border-gray-600/50">
                        <th className="text-right pl-6 pr-6 py-4 text-gray-300 font-semibold text-sm uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            نام کاربر
                          </div>
                        </th>
                        <th className="text-right pl-6 pr-6 py-4 text-gray-300 font-semibold text-sm uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                            </svg>
                            ایمیل
                          </div>
                        </th>
                        <th className="text-right pl-6 pr-6 py-4 text-gray-300 font-semibold text-sm uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            وضعیت ایمیل
                          </div>
                        </th>
                        <th className="text-right pl-6 pr-6 py-4 text-gray-300 font-semibold text-sm uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            دسترسی مدیر
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
                      {allUsers?.page?.map((user, index) => (
                        <tr
                          key={user._id}
                          className={`group border-b border-gray-700/30 hover:bg-gradient-to-r hover:from-gray-800/30 hover:to-gray-700/20 transition-all duration-300 ${
                            index % 2 === 0 ? "bg-gray-800/10" : "bg-gray-800/5"
                          }`}
                        >
                          <td className="pl-6 pr-6 py-6">
                            {editingUser === user.userId ? (
                              <div className="flex items-center gap-3">
                                <input
                                  type="text"
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  className="bg-gray-700/80 backdrop-blur-sm text-white rounded-lg px-4 py-2 text-sm w-40 border border-gray-600/50 focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all"
                                  autoFocus
                                />
                                <button
                                  onClick={() => handleEditName(user.userId)}
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
                                <div className="w-10 h-10 bg-gradient-to-br from-accent/20 to-accent/10 rounded-full flex items-center justify-center">
                                  <span className="text-accent font-bold text-sm">{user.name[0]}</span>
                                </div>
                                <div className="flex-1">
                                  <span className="text-white font-medium">{user.name}</span>
                                </div>
                                <button
                                  onClick={() => startEdit(user.userId, user.name)}
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
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                              </svg>
                              <span className="text-gray-300 font-mono text-sm">{user.email}</span>
                            </div>
                          </td>
                          <td className="pl-6 pr-6 py-6">
                            <span
                              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                                user.emailVerified
                                  ? "bg-green-900/30 text-green-400 border border-green-800/30"
                                  : "bg-yellow-900/30 text-yellow-400 border border-yellow-800/30"
                              }`}
                            >
                              <div className={`w-2 h-2 rounded-full ${
                                user.emailVerified ? "bg-green-400" : "bg-yellow-400"
                              }`}></div>
                              {user.emailVerified ? "تأیید شده" : "تأیید نشده"}
                            </span>
                          </td>
                          <td className="pl-6 pr-6 py-6">
                            <label className="flex items-center gap-3 cursor-pointer">
                              <div className="relative inline-block w-12 h-6">
                                <input
                                  type="checkbox"
                                  checked={user.isAdmin}
                                  onChange={(e) =>
                                    handleToggleAdmin(user.userId, e.target.checked)
                                  }
                                  className="sr-only"
                                />
                                <div className={`absolute inset-0 w-12 h-6 rounded-full transition-colors duration-200 ${
                                  user.isAdmin ? "bg-accent" : "bg-gray-600"
                                }`}>
                                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                                    user.isAdmin ? "translate-x-6" : "translate-x-0.5"
                                  }`}></div>
                                </div>
                              </div>
                              <span className={`text-sm font-medium ${
                                user.isAdmin ? "text-accent" : "text-gray-400"
                              }`}>
                                {user.isAdmin ? "مدیر" : "کاربر عادی"}
                              </span>
                            </label>
                          </td>
                          <td className="pl-6 pr-6 py-6">
                            <button
                              onClick={() =>
                                handleResetPassword(user.userId, user.name)
                              }
                              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 rounded-lg text-sm font-medium transition-all duration-200 border border-red-800/30 hover:border-red-700/50"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                              </svg>
                              بازنشانی رمز عبور
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <PaginationControls 
                  currentPage={usersPage}
                  isDone={allUsers?.isDone ?? true}
                  onNext={handleNextUsers}
                  onPrev={handlePrevUsers}
                />
                {allUsers?.page?.length === 0 && (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-400 text-lg">کاربری یافت نشد</p>
                    <p className="text-gray-500 text-sm mt-1">هنوز هیچ کاربری در سیستم ثبت نشده است</p>
                  </div>
                )}
              </div>
              </div>
            )}

            {activeTab === "questions" && (
              <div>
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h1 className="text-3xl font-bold text-white mb-2 text-right">
                        مدیریت سؤالات
                      </h1>
                      <p className="text-gray-400 text-right">
                        مدیریت و تنظیم سؤالات سیستم
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-background-light/50 backdrop-blur-sm rounded-lg pl-4 pr-4 py-2 border border-gray-700/30">
                        <span className="text-gray-400 text-sm">صفحه:</span>
                        <span className="text-white font-semibold mr-2">{questionsPage}</span>
                      </div>
                      <button
                        onClick={handleCreateQuestion}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-all duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        افزودن سؤال جدید
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Questions Table */}
                <div className="bg-gradient-to-br from-background-light/80 to-background-light/40 backdrop-blur-sm rounded-2xl border border-gray-700/30 overflow-hidden shadow-2xl shadow-black/20">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gradient-to-r from-gray-800/80 to-gray-700/80 border-b border-gray-600/50">
                          <th className="text-right pl-6 pr-6 py-4 text-gray-300 font-semibold text-sm uppercase tracking-wider">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              متن سؤال
                            </div>
                          </th>
                          <th className="text-right pl-6 pr-6 py-4 text-gray-300 font-semibold text-sm uppercase tracking-wider">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              زمان پاسخ (ثانیه)
                            </div>
                          </th>
                          <th className="text-right pl-6 pr-6 py-4 text-gray-300 font-semibold text-sm uppercase tracking-wider">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                              </svg>
                              سطح سختی
                            </div>
                          </th>
                          <th className="text-right pl-6 pr-6 py-4 text-gray-300 font-semibold text-sm uppercase tracking-wider">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                              </svg>
                              دسته‌بندی
                            </div>
                          </th>
                          <th className="text-right pl-6 pr-6 py-4 text-gray-300 font-semibold text-sm uppercase tracking-wider">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              پاسخ صحیح
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
                        {allQuestions?.page?.map((question, index) => (
                          <tr
                            key={question._id}
                            className={`group border-b border-gray-700/30 hover:bg-gradient-to-r hover:from-gray-800/30 hover:to-gray-700/20 transition-all duration-300 ${
                              index % 2 === 0 ? "bg-gray-800/10" : "bg-gray-800/5"
                            }`}
                          >
                            <td className="pl-6 pr-6 py-6">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-accent/20 to-accent/10 rounded-full flex items-center justify-center">
                                  <span className="text-accent font-bold text-sm">س</span>
                                </div>
                                <div className="flex-1">
                                  <span className="text-white font-medium text-sm line-clamp-2">
                                    {question.questionText}
                                  </span>
                                  {(question.mediaPath || question.mediaStorageId) && (
                                    <div className="flex items-center gap-1 mt-1">
                                      <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                      </svg>
                                      <span className="text-gray-500 text-xs">
                                        {question.mediaStorageId ? "فایل آپلود شده" : "لینک خارجی"}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="pl-6 pr-6 py-6">
                              <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-gray-300 font-mono text-sm">{question.timeToRespond.toLocaleString()}</span>
                              </div>
                            </td>
                            <td className="pl-6 pr-6 py-6">
                              <div className="flex items-center gap-2">
                                {Array.from({ length: 5 }, (_, i) => (
                                  <div
                                    key={i}
                                    className={`w-3 h-3 rounded-full ${
                                      i < question.grade ? "bg-accent" : "bg-gray-600"
                                    }`}
                                  />
                                ))}
                                <span className="text-gray-300 text-sm mr-2">{question.grade}</span>
                              </div>
                            </td>
                            <td className="pl-6 pr-6 py-6">
                              {question.category ? (
                                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-blue-900/30 text-blue-400 border border-blue-800/30">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                  </svg>
                                  {question.category}
                                </span>
                              ) : (
                                <span className="text-gray-500 text-sm">بدون دسته</span>
                              )}
                            </td>
                            <td className="pl-6 pr-6 py-6">
                              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-green-900/30 text-green-400 border border-green-800/30">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                گزینه {question.rightAnswer}
                              </span>
                            </td>
                            <td className="pl-6 pr-6 py-6">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleEditQuestion(question)}
                                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 rounded-lg text-xs font-medium transition-all duration-200 border border-blue-800/30 hover:border-blue-700/50"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                  ویرایش
                                </button>
                                <button
                                  onClick={() => handleDeleteQuestion(question._id)}
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
                  <PaginationControls 
                    currentPage={questionsPage}
                    isDone={allQuestions?.isDone ?? true}
                    onNext={handleNextQuestions}
                    onPrev={handlePrevQuestions}
                  />
                  {allQuestions?.page?.length === 0 && (
                    <div className="text-center py-16">
                      <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-gray-400 text-lg">سؤالی یافت نشد</p>
                      <p className="text-gray-500 text-sm mt-1">هنوز هیچ سؤالی در سیستم ثبت نشده است</p>
                      <button
                        onClick={handleCreateQuestion}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-all duration-200 mt-4"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        افزودن اولین سؤال
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "files" && <FilesTable />}

            {activeTab === "matches" && (
              <div>
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h1 className="text-3xl font-bold text-white mb-2 text-right">
                        مدیریت مسابقات
                      </h1>
                      <p className="text-gray-400 text-right">
                        مشاهده و مدیریت تمام مسابقات
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-background-light/50 backdrop-blur-sm rounded-lg pl-4 pr-4 py-2 border border-gray-700/30">
                        <span className="text-gray-400 text-sm">صفحه:</span>
                        <span className="text-white font-semibold mr-2">{matchesPage}</span>
                      </div>
                      <div className="bg-background-light/50 backdrop-blur-sm rounded-lg pl-4 pr-4 py-2 border border-gray-700/30">
                        <span className="text-gray-400 text-sm">فعال در این صفحه:</span>
                        <span className="text-accent font-semibold mr-2">
                          {allMatches?.page?.filter(m => m.match.status === "waiting" || m.match.status === "active").length || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Matches Table */}
                <div className="bg-gradient-to-br from-background-light/80 to-background-light/40 backdrop-blur-sm rounded-2xl border border-gray-700/30 overflow-hidden shadow-2xl shadow-black/20">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gradient-to-r from-gray-800/80 to-gray-700/80 border-b border-gray-600/50">
                          <th className="text-right pl-6 pr-6 py-4 text-gray-300 font-semibold text-sm uppercase tracking-wider">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                              </svg>
                              شناسه
                            </div>
                          </th>
                          <th className="text-right pl-6 pr-6 py-4 text-gray-300 font-semibold text-sm uppercase tracking-wider">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              سازنده
                            </div>
                          </th>
                          <th className="text-right pl-6 pr-6 py-4 text-gray-300 font-semibold text-sm uppercase tracking-wider">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              شرکت‌کنندگان
                            </div>
                          </th>
                          <th className="text-right pl-6 pr-6 py-4 text-gray-300 font-semibold text-sm uppercase tracking-wider">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              وضعیت
                            </div>
                          </th>
                          <th className="text-right pl-6 pr-6 py-4 text-gray-300 font-semibold text-sm uppercase tracking-wider">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              تاریخ
                            </div>
                          </th>
                          <th className="text-right pl-6 pr-6 py-4 text-gray-300 font-semibold text-sm uppercase tracking-wider">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              نتیجه
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
                        {allMatches?.page?.map((matchData, index) => {
                          const { match, participants, creator, result } = matchData;
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
                            <tr
                              key={match._id}
                              className={`group border-b border-gray-700/30 hover:bg-gradient-to-r hover:from-gray-800/30 hover:to-gray-700/20 transition-all duration-300 ${
                                index % 2 === 0 ? "bg-gray-800/10" : "bg-gray-800/5"
                              }`}
                            >
                              <td className="pl-6 pr-6 py-6">
                                <span className="text-gray-400 font-mono text-sm">
                                  {match._id.slice(-8)}
                                </span>
                              </td>
                              <td className="pl-6 pr-6 py-6">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 bg-gradient-to-br from-accent/20 to-accent/10 rounded-full flex items-center justify-center">
                                    <span className="text-accent font-bold text-xs">
                                      {creator?.name[0] || "?"}
                                    </span>
                                  </div>
                                  <span className="text-white text-sm font-medium">
                                    {creator?.name || "ناشناس"}
                                  </span>
                                </div>
                              </td>
                              <td className="pl-6 pr-6 py-6">
                                <div className="space-y-2">
                                  {participants.map((p) => (
                                    <div key={p.userId} className="flex items-center gap-2">
                                      <div className="w-6 h-6 bg-gradient-to-br from-accent/20 to-accent/10 rounded-full flex items-center justify-center">
                                        <span className="text-accent font-bold text-xs">
                                          {p.profile?.name[0] || "?"}
                                        </span>
                                      </div>
                                      <span className="text-white text-sm">
                                        {p.profile?.name || "ناشناس"}
                                      </span>
                                      {p.completedAt && (
                                        <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </td>
                              <td className="pl-6 pr-6 py-6">
                                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${statusColors[match.status]}`}>
                                  {statusText[match.status]}
                                </span>
                              </td>
                              <td className="pl-6 pr-6 py-6">
                                <div className="text-gray-300 text-sm">
                                  {new Date(match.createdAt).toLocaleDateString("fa-IR")}
                                </div>
                                <div className="text-gray-500 text-xs">
                                  {new Date(match.createdAt).toLocaleTimeString("fa-IR", { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </div>
                              </td>
                              <td className="pl-6 pr-6 py-6">
                                {result ? (
                                  <div className="space-y-1">
                                    {result.isDraw ? (
                                      <span className="text-yellow-400 text-sm font-semibold">مساوی</span>
                                    ) : (
                                      <div className="text-sm">
                                        <div className="text-green-400 font-semibold">
                                          برنده: {participants.find(p => p.userId === result.winnerId)?.profile?.name || "ناشناس"}
                                        </div>
                                        <div className="text-gray-400 text-xs">
                                          {result.player1Score} - {result.player2Score}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-gray-500 text-sm">-</span>
                                )}
                              </td>
                              <td className="pl-6 pr-6 py-6">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleViewMatch(match._id)}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 rounded-lg text-xs font-medium transition-all duration-200 border border-blue-800/30 hover:border-blue-700/50"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    جزئیات
                                  </button>
                                  {(match.status === "waiting" || match.status === "active") && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCancelMatch(match._id);
                                      }}
                                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 rounded-lg text-xs font-medium transition-all duration-200 border border-red-800/30 hover:border-red-700/50"
                                    >
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                      لغو
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <PaginationControls 
                    currentPage={matchesPage}
                    isDone={allMatches?.isDone ?? true}
                    onNext={handleNextMatches}
                    onPrev={handlePrevMatches}
                  />
                  {allMatches?.page?.length === 0 && (
                    <div className="text-center py-16">
                      <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <p className="text-gray-400 text-lg">مسابقه‌ای یافت نشد</p>
                      <p className="text-gray-500 text-sm mt-1">هنوز هیچ مسابقه‌ای در سیستم ثبت نشده است</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Questions Form Modal */}
      {showQuestionForm && (
        <QuestionsForm
          question={editingQuestion}
          onClose={handleCloseQuestionForm}
        />
      )}
    </div>
  );
}
