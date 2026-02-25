import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Share,
} from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import {
  DashboardHeaderCard,
  TournamentCategoryCarousel,
  StatsDonutCard,
  DashboardSlider,
  ReferralCodeCard,
  QuotaUsageCard,
  AccountInfoCard,
  ActiveItemsCards,
} from "./components";
import { Avatar, Modal } from "../../components/ui";
import {
  AVATAR_OPTIONS,
  DEFAULT_AVATAR_ID,
  getAvatarOption,
  isFreeAvatar,
  isPremiumAvatar,
} from "../../../shared/avatarOptions";
import { toast } from "../../lib/toast";
import { copyToClipboard } from "../../lib/helpers";
import { generateReferralLink } from "../../lib/referral";

const AVATAR_MODAL_DESCRIPTION =
  "یکی از آواتارهای از پیش بارگذاری‌شده را انتخاب کنید. آواتار شما بلافاصله در تمامی بخش‌های بازی به‌روزرسانی می‌شود.";

export function DashboardScreen() {
  const router = useRouter();
  const { signOut } = useAuthActions();

  const userProfile = useQuery(api.auth.getUserProfile);
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const dashboardStats = useQuery(api.dashboard.getDashboardStats);
  const categoryWins = useQuery(api.dashboard.getTournamentCategoryWins);
  const categoriesWithCounts = useQuery(api.questionCategories.getCategoriesWithCounts);
  const dashboardSliders = useQuery(api.dashboard.getDashboardSlidersWithUrls);
  const referralStats = useQuery(api.auth.getReferralStats);
  const dailyLimits = useQuery(api.matches.getDailyLimits);
  const ownedAvatars = useQuery(api.store.getUserOwnedAvatars);
  const activeMentor = useQuery(api.store.getUserActiveMentor);
  const activeStadium = useQuery(api.store.getUserActiveStadium);

  const updateProfileAvatar = useMutation(api.auth.updateProfileAvatar);
  const updateProfileName = useMutation(api.auth.updateProfileName);

  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [pendingAvatarId, setPendingAvatarId] = useState(DEFAULT_AVATAR_ID);
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    if (loggedInUser === null) {
      router.replace("/(auth)/login");
    }
  }, [loggedInUser, router]);

  useEffect(() => {
    if (isAvatarModalOpen && userProfile) {
      setPendingAvatarId(userProfile.avatarId ?? DEFAULT_AVATAR_ID);
    }
  }, [isAvatarModalOpen, userProfile]);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenAvatarModal = () => setIsAvatarModalOpen(true);
  const handleCloseAvatarModal = () => {
    if (!isSavingAvatar) setIsAvatarModalOpen(false);
  };
  const handleSaveAvatar = () => {
    if (!pendingAvatarId || !userProfile) return;
    if (pendingAvatarId === (userProfile.avatarId ?? DEFAULT_AVATAR_ID)) {
      setIsAvatarModalOpen(false);
      return;
    }
    setIsSavingAvatar(true);
    updateProfileAvatar({ avatarId: pendingAvatarId })
      .then(() => {
        toast.success("آواتار شما به‌روزرسانی شد");
        setIsAvatarModalOpen(false);
      })
      .catch((err) => {
        console.error(err);
        toast.error("خطا در به‌روزرسانی آواتار");
      })
      .finally(() => setIsSavingAvatar(false));
  };

  const handleOpenNameModal = () => {
    setNameInput(userProfile?.name ?? "");
    setIsNameModalOpen(true);
  };
  const handleCloseNameModal = () => {
    if (!isSavingName) setIsNameModalOpen(false);
  };
  const handleSaveName = () => {
    if (!userProfile) return;
    const trimmed = nameInput.trim();
    if (!trimmed || trimmed === userProfile.name) {
      setIsNameModalOpen(false);
      return;
    }
    setIsSavingName(true);
    updateProfileName({ name: trimmed })
      .then(() => {
        toast.success("نام شما به‌روزرسانی شد");
        setIsNameModalOpen(false);
      })
      .catch((err) => {
        console.error(err);
        toast.error("خطا در به‌روزرسانی نام");
      })
      .finally(() => setIsSavingName(false));
  };

  const handleShareReferral = async (code: string) => {
    try {
      const link = generateReferralLink(code);
      await Share.share({
        message: `کد معرف من: ${code}\n\nلینک ثبت‌نام: ${link}\n\nبا استفاده از این کد در هنگام ثبت‌نام، 2 امتیاز رایگان دریافت کنید و من هم 5 امتیاز دریافت می‌کنم!`,
        title: "کد معرف",
        url: link,
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleSignOut = () => {
    void signOut()
      .then(() => toast.success("با موفقیت خارج شدید"))
      .catch((err) => {
        toast.error("خطا در خروج از حساب کاربری");
        console.error(err);
      });
  };

  if (loggedInUser === undefined || userProfile === undefined) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#ff701a" />
        <Text className="text-gray-400 mt-4" style={{ fontFamily: "Meem-Regular" }}>
          در حال بارگذاری...
        </Text>
      </View>
    );
  }

  if (loggedInUser === null || !userProfile) {
    return null;
  }

  const winsMap = new Map(
    (categoryWins ?? []).map((w: { categoryId: Id<"categories">; wins: number }) => [w.categoryId, w.wins])
  );
  const tournamentCarouselItems = (categoriesWithCounts ?? []).map((c: { _id: Id<"categories">; persianName: string; imageUrl?: string | null }) => ({
    id: c._id,
    title: c.persianName,
    multiplierLabel: `${(winsMap.get(c._id) ?? 0)}.پ`,
    imageUrl: c.imageUrl ?? null,
    wins: winsMap.get(c._id) ?? 0,
  }));

  const stadiumCard = activeStadium
    ? {
        id: activeStadium.itemId as string,
        label: "استادیوم",
        title: activeStadium.name,
        imageUrl: activeStadium.imageUrl ?? null,
      }
    : undefined;

  const mentorCard = activeMentor
    ? {
        id: activeMentor.itemId as string,
        label: "منتور",
        title: activeMentor.name,
        imageUrl: activeMentor.imageUrl ?? null,
      }
    : undefined;

  const resetHint =
    dailyLimits?.resetTime != null
      ? (() => {
          const remaining = dailyLimits.resetTime - currentTime;
          if (remaining <= 0) return "محدودیت‌ها بازنشانی شدند.";
          const h = Math.floor(remaining / (1000 * 60 * 60));
          const m = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
          const pad = (n: number) => (n < 10 ? `۰${n}` : `${n}`);
          return `محدودیت هر ۲۴ ساعت و ${pad(h)} ساعت و ${pad(m)} دقیقه بازنشانی می شوند.`;
        })()
      : undefined;

  const stats = dashboardStats ?? {
    totalGames: 0,
    totalWins: 0,
    totalDraws: 0,
    totalLosses: 0,
    goalsScored: 0,
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="gap-4 py-4">
        <DashboardHeaderCard
          userName={userProfile.name}
          avatarId={userProfile.avatarId}
          onChangeAvatar={handleOpenAvatarModal}
          onChangeUsername={handleOpenNameModal}
        />

        <TournamentCategoryCarousel items={tournamentCarouselItems} />

        <StatsDonutCard
          goalsScored={stats.goalsScored}
          gamesPlayed={stats.totalGames}
          wins={stats.totalWins}
          draws={stats.totalDraws}
          losses={stats.totalLosses}
        />

        <ActiveItemsCards stadium={stadiumCard} mentor={mentorCard} />

        {dashboardSliders && dashboardSliders.length > 0 && (
          <DashboardSlider
            sliderItems={dashboardSliders.map((s: { _id: string; slides: Array<{ imageUrl: string | null; imagePath?: string; order: number }> }) => ({
              _id: s._id,
              slides: s.slides,
            }))}
          />
        )}

        {referralStats?.referralCode && (
          <ReferralCodeCard
            code={referralStats.referralCode}
            onCopy={async () => {
              const ok = await copyToClipboard(referralStats.referralCode!);
              if (ok) toast.success("کد معرف کپی شد");
              else toast.error("خطا در کپی کردن کد");
            }}
            onShare={() => handleShareReferral(referralStats.referralCode!)}
            hint="این کد را با دوستان خود به اشتراک بگذارید"
          />
        )}

        {dailyLimits && (
          <QuotaUsageCard
            createdGames={dailyLimits.matchesCreated}
            createdGamesLimit={dailyLimits.matchesLimit}
            createdTournaments={dailyLimits.tournamentsCreated}
            createdTournamentsLimit={dailyLimits.tournamentsLimit}
            resetHintText={resetHint}
          />
        )}

        <AccountInfoCard
          name={userProfile.name}
          email={loggedInUser.email ?? ""}
          membershipDate={new Date(loggedInUser._creationTime).toLocaleDateString("fa-IR")}
          onChangeName={handleOpenNameModal}
          onChangeEmail={() => toast.info("تغییر ایمیل به زودی")}
          onSignOut={handleSignOut}
        />
      </View>

      <Modal
        isOpen={isAvatarModalOpen}
        onClose={handleCloseAvatarModal}
        title="انتخاب آواتار"
        description={AVATAR_MODAL_DESCRIPTION}
        size="md"
      >
        <View className="flex-row flex-wrap justify-center gap-4">
          {AVATAR_OPTIONS.filter((opt) => {
            if (isFreeAvatar(opt.id)) return true;
            if (isPremiumAvatar(opt.id)) return ownedAvatars?.includes(opt.id) ?? false;
            return false;
          }).map((option) => {
            const isSelected = option.id === pendingAvatarId;
            return (
              <TouchableOpacity
                key={option.id}
                onPress={() => setPendingAvatarId(option.id)}
                activeOpacity={0.8}
                className="items-center gap-2"
              >
                <Avatar
                  avatarId={option.id}
                  size="lg"
                  highlighted={isSelected}
                  badge={
                    isSelected ? (
                      <View className="w-7 h-7 rounded-full bg-accent items-center justify-center border border-white/40">
                        <Text className="text-white text-xs font-bold">✓</Text>
                      </View>
                    ) : undefined
                  }
                />
                <Text
                  className={`text-sm ${isSelected ? "text-accent font-semibold" : "text-gray-300"}`}
                  style={{ fontFamily: "Meem-SemiBold" }}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <View className="flex-row justify-end gap-3 mt-8">
          <TouchableOpacity
            onPress={handleCloseAvatarModal}
            disabled={isSavingAvatar}
            activeOpacity={0.7}
            className="px-4 py-3 rounded-lg border border-gray-600 bg-background"
          >
            <Text className="text-gray-200 font-semibold" style={{ fontFamily: "Meem-SemiBold" }}>
              انصراف
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSaveAvatar}
            disabled={isSavingAvatar || pendingAvatarId === (userProfile.avatarId ?? DEFAULT_AVATAR_ID)}
            activeOpacity={0.7}
            className={`px-4 py-3 rounded-lg ${isSavingAvatar ? "bg-accent/60" : "bg-accent"}`}
          >
            {isSavingAvatar ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-white font-semibold" style={{ fontFamily: "Meem-SemiBold" }}>
                ذخیره آواتار
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal
        isOpen={isNameModalOpen}
        onClose={handleCloseNameModal}
        title="ویرایش نام"
        description="نام جدید خود را وارد کنید."
        size="sm"
      >
        <View className="gap-4">
          <View>
            <Text className="text-gray-300 mb-2 text-right" style={{ fontFamily: "Meem-SemiBold" }}>
              نام جدید
            </Text>
            <TextInput
              value={nameInput}
              onChangeText={setNameInput}
              className="bg-gray-800/80 border border-gray-700/60 rounded-xl px-4 py-3 text-white"
              placeholder="نام شما"
              placeholderTextColor="#6b7280"
              textAlign="right"
              editable={!isSavingName}
            />
          </View>
          <View className="flex-row justify-end gap-3">
            <TouchableOpacity
              onPress={handleCloseNameModal}
              disabled={isSavingName}
              activeOpacity={0.7}
              className="px-4 py-3 rounded-lg border border-gray-600 bg-background"
            >
              <Text className="text-gray-200 font-semibold" style={{ fontFamily: "Meem-SemiBold" }}>
                انصراف
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSaveName}
              disabled={
                isSavingName ||
                nameInput.trim().length === 0 ||
                nameInput.trim() === userProfile.name
              }
              className={`px-4 py-3 rounded-lg ${
                isSavingName || nameInput.trim().length === 0 || nameInput.trim() === userProfile.name
                  ? "bg-accent/60"
                  : "bg-accent"
              }`}
            >
              {isSavingName ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text className="text-white font-semibold" style={{ fontFamily: "Meem-SemiBold" }}>
                  ذخیره نام
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
