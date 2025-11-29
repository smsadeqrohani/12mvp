import { View, Text, ActivityIndicator, TouchableOpacity, TextInput } from "react-native";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { SignOutButton } from "../../../features/auth";
import { Avatar, Modal } from "../../../components/ui";
import { AVATAR_OPTIONS, DEFAULT_AVATAR_ID } from "../../../../shared/avatarOptions";
import { toast } from "../../../lib/toast";

const MODAL_DESCRIPTION = "یکی از آواتارهای از پیش بارگذاری‌شده را انتخاب کنید. آواتار شما بلافاصله در تمامی بخش‌های بازی به‌روزرسانی می‌شود.";

export function HelloPage() {
  const userProfile = useQuery(api.auth.getUserProfile);
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const topUsers = useQuery(api.auth.getTopUsers, { limit: 5 });
  const dailyLimits = useQuery(api.matches.getDailyLimits);
  const userPurchases = useQuery(api.store.getUserPurchases);
  const storeItems = useQuery(api.store.getStoreItems);
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
    if (isAvatarModalOpen && userProfile) {
      setPendingAvatarId(userProfile.avatarId ?? DEFAULT_AVATAR_ID);
    }
  }, [isAvatarModalOpen, userProfile]);

  // Update current time every minute for reset time display
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const handleOpenAvatarModal = () => {
    setIsAvatarModalOpen(true);
  };

  const handleCloseAvatarModal = () => {
    if (isSavingAvatar) return;
    setIsAvatarModalOpen(false);
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
      .catch((error) => {
        console.error("Failed to update avatar:", error);
        toast.error("خطا در به‌روزرسانی آواتار");
      })
      .finally(() => setIsSavingAvatar(false));
  };

  const handleOpenNameModal = () => {
    setNameInput(userProfile?.name ?? "");
    setIsNameModalOpen(true);
  };

  const handleCloseNameModal = () => {
    if (isSavingName) return;
    setIsNameModalOpen(false);
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
      .catch((error) => {
        console.error("Failed to update name:", error);
        toast.error("خطا در به‌روزرسانی نام");
      })
      .finally(() => setIsSavingName(false));
  };

  if (!userProfile || !loggedInUser) {
    return (
      <View className="flex justify-center items-center p-8">
        <ActivityIndicator size="large" color="#ff701a" />
      </View>
    );
  }

  return (
    <View className="flex-1 p-4 space-y-6">
      <View className="items-center">
        <Avatar avatarId={userProfile.avatarId} size="xl" highlighted className="mb-4" />
        <Text className="text-4xl font-bold text-accent mb-4" style={{ fontFamily: 'Vazirmatn-Bold' }}>
          سلام، {userProfile.name}! 👋
        </Text>
        <Text className="text-lg text-gray-300" style={{ fontFamily: 'Vazirmatn-Regular' }}>
          به داشبورد خود خوش آمدید
        </Text>
        <TouchableOpacity
          onPress={handleOpenAvatarModal}
          activeOpacity={0.7}
          className="mt-4 px-4 py-2 rounded-lg bg-accent"
        >
          <Text className="text-white font-semibold" style={{ fontFamily: 'Vazirmatn-SemiBold' }}>
            تغییر آواتار
          </Text>
        </TouchableOpacity>
      </View>
      
      <View className="bg-background-light rounded-lg p-6 border border-gray-600">
        <Text className="text-xl font-semibold mb-4 text-white text-right" style={{ fontFamily: 'Vazirmatn-SemiBold' }}>حساب شما</Text>
        <View className="space-y-3">
          <View className="flex-row items-center justify-between gap-3">
            <TouchableOpacity
              onPress={handleOpenNameModal}
              activeOpacity={0.7}
              className="px-3 py-1 rounded-lg border border-accent/40 bg-accent/10"
            >
              <Text className="text-accent text-sm font-semibold" style={{ fontFamily: 'Vazirmatn-SemiBold' }}>
                ویرایش
              </Text>
            </TouchableOpacity>
            <Text className="text-white text-right flex-1">{userProfile.name}</Text>
            <Text className="font-medium text-gray-300 ml-3">نام:</Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-white text-right flex-1">{loggedInUser.email}</Text>
            <Text className="font-medium text-gray-300 ml-3">ایمیل:</Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-white text-right flex-1">
              {new Date(loggedInUser._creationTime).toLocaleDateString('fa-IR')}
            </Text>
            <Text className="font-medium text-gray-300 ml-3">عضو از:</Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-accent text-xl font-bold text-right flex-1">
              {(userProfile.points ?? 0).toLocaleString('fa-IR')}
            </Text>
            <Text className="font-medium text-gray-300 ml-3">امتیاز:</Text>
          </View>
        </View>
      </View>

      {/* Daily Limits */}
      {dailyLimits && (
        <View className="bg-background-light rounded-lg p-6 border border-gray-600">
          <Text className="text-xl font-semibold mb-4 text-white text-right" style={{ fontFamily: 'Vazirmatn-SemiBold' }}>
            محدودیت‌های روزانه
          </Text>
          <View className="space-y-4">
            {/* Matches Limit */}
            <View className="bg-gray-800/50 rounded-lg p-4">
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center gap-2">
                  <View className={`w-3 h-3 rounded-full ${dailyLimits.canCreateMatch ? 'bg-green-500' : 'bg-red-500'}`} />
                  <Text className="text-white font-semibold" style={{ fontFamily: 'Vazirmatn-SemiBold' }}>
                    بازی‌های ایجاد شده
                  </Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Text className={`font-bold ${dailyLimits.canCreateMatch ? 'text-green-400' : 'text-red-400'}`} style={{ fontFamily: 'Vazirmatn-Bold' }}>
                    {dailyLimits.matchesCreated} / {dailyLimits.matchesLimit}
                  </Text>
                  {dailyLimits.matchesBonus > 0 && (
                    <View className="bg-accent/20 rounded px-2 py-1">
                      <Text className="text-accent text-xs" style={{ fontFamily: 'Vazirmatn-SemiBold' }}>
                        +{dailyLimits.matchesBonus}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              <Text className="text-gray-400 text-sm text-right" style={{ fontFamily: 'Vazirmatn-Regular' }}>
                {dailyLimits.canCreateMatch 
                  ? `شما می‌توانید ${dailyLimits.matchesLimit - dailyLimits.matchesCreated} بازی دیگر ایجاد کنید`
                  : 'شما به حداکثر بازی‌های روزانه رسیده‌اید'
                }
              </Text>
            </View>

            {/* Tournaments Limit */}
            <View className="bg-gray-800/50 rounded-lg p-4">
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center gap-2">
                  <View className={`w-3 h-3 rounded-full ${dailyLimits.canCreateTournament ? 'bg-green-500' : 'bg-red-500'}`} />
                  <Text className="text-white font-semibold" style={{ fontFamily: 'Vazirmatn-SemiBold' }}>
                    تورنومنت‌های ایجاد شده
                  </Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Text className={`font-bold ${dailyLimits.canCreateTournament ? 'text-green-400' : 'text-red-400'}`} style={{ fontFamily: 'Vazirmatn-Bold' }}>
                    {dailyLimits.tournamentsCreated} / {dailyLimits.tournamentsLimit}
                  </Text>
                  {dailyLimits.tournamentsBonus > 0 && (
                    <View className="bg-accent/20 rounded px-2 py-1">
                      <Text className="text-accent text-xs" style={{ fontFamily: 'Vazirmatn-SemiBold' }}>
                        +{dailyLimits.tournamentsBonus}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              <Text className="text-gray-400 text-sm text-right" style={{ fontFamily: 'Vazirmatn-Regular' }}>
                {dailyLimits.canCreateTournament 
                  ? 'شما می‌توانید یک تورنومنت دیگر ایجاد کنید'
                  : 'شما به حداکثر تورنومنت‌های روزانه رسیده‌اید'
                }
              </Text>
            </View>

            {/* Reset Time */}
            {dailyLimits.resetTime && (() => {
              const timeUntilReset = dailyLimits.resetTime - currentTime;
              
              if (timeUntilReset <= 0) {
                return null; // Already reset
              }
              
              const hoursUntilReset = Math.floor(timeUntilReset / (1000 * 60 * 60));
              const minutesUntilReset = Math.floor((timeUntilReset % (1000 * 60 * 60)) / (1000 * 60));
              
              return (
                <View className="bg-accent/10 rounded-lg p-3 border border-accent/30">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-accent text-sm" style={{ fontFamily: 'Vazirmatn-Regular' }}>
                      ⏰ محدودیت‌ها در{' '}
                      {hoursUntilReset > 0 ? `${hoursUntilReset} ساعت و ` : ''}
                      {minutesUntilReset} دقیقه{' '}
                      بازنشانی می‌شوند
                    </Text>
                  </View>
                </View>
              );
            })()}
          </View>
        </View>
      )}

      {/* Active Purchases */}
      {userPurchases && storeItems && (() => {
        const now = Date.now();
        const activePurchases = userPurchases
          .map(purchase => {
            const item = storeItems.find(i => i._id === purchase.itemId);
            if (!item) return null;
            const expiresAt = purchase.purchasedAt + purchase.durationMs;
            if (expiresAt <= now) return null;
            return { purchase, item, expiresAt };
          })
          .filter((p): p is { purchase: typeof userPurchases[0], item: typeof storeItems[0], expiresAt: number } => p !== null);

        if (activePurchases.length === 0) return null;

        return (
          <View className="bg-background-light rounded-lg p-6 border border-gray-600">
            <Text className="text-xl font-semibold mb-4 text-white text-right" style={{ fontFamily: 'Vazirmatn-SemiBold' }}>
              🛒 خریدهای فعال
            </Text>
            <View className="space-y-3">
              {activePurchases.map(({ purchase, item, expiresAt }) => {
                const timeRemaining = expiresAt - now;
                const daysRemaining = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
                const hoursRemaining = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

                return (
                  <View key={purchase._id} className="bg-accent/10 rounded-lg p-4 border border-accent/30">
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="text-accent font-bold text-lg text-right flex-1" style={{ fontFamily: 'Vazirmatn-Bold' }}>
                        {item.name}
                      </Text>
                    </View>
                    <Text className="text-gray-300 text-sm text-right mb-2" style={{ fontFamily: 'Vazirmatn-Regular' }}>
                      {item.description}
                    </Text>
                    <View className="flex-row items-center gap-2 mt-2">
                      <Text className="text-accent text-sm" style={{ fontFamily: 'Vazirmatn-Regular' }}>
                        ⏰ باقی‌مانده: {daysRemaining > 0 ? `${daysRemaining} روز و ` : ''}{hoursRemaining} ساعت
                      </Text>
                    </View>
                    {(item.matchesBonus > 0 || item.tournamentsBonus > 0) && (
                      <View className="mt-2 flex-row items-center gap-2">
                        {item.matchesBonus > 0 && (
                          <View className="bg-green-500/20 rounded px-2 py-1">
                            <Text className="text-green-400 text-xs" style={{ fontFamily: 'Vazirmatn-SemiBold' }}>
                              +{item.matchesBonus} بازی
                            </Text>
                          </View>
                        )}
                        {item.tournamentsBonus > 0 && (
                          <View className="bg-blue-500/20 rounded px-2 py-1">
                            <Text className="text-blue-400 text-xs" style={{ fontFamily: 'Vazirmatn-SemiBold' }}>
                              +{item.tournamentsBonus} تورنومنت
                            </Text>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        );
      })()}

      {/* Leaderboard */}
      <View className="bg-background-light rounded-lg p-6 border border-gray-600">
        <Text className="text-xl font-semibold mb-4 text-white text-right" style={{ fontFamily: 'Vazirmatn-SemiBold' }}>
          🏆 جدول برترین‌ها
        </Text>
        {topUsers === undefined ? (
          <View className="flex items-center justify-center py-8">
            <ActivityIndicator size="small" color="#ff701a" />
          </View>
        ) : topUsers.length === 0 ? (
          <Text className="text-gray-400 text-right" style={{ fontFamily: 'Vazirmatn-Regular' }}>
            هنوز کاربری با پاسخ درست وجود ندارد
          </Text>
        ) : (
          <View className="space-y-3">
            {topUsers.map((user, index) => (
              <View
                key={user.rank}
                className={`flex-row items-center justify-between p-3 rounded-lg border ${
                  index === 0
                    ? "bg-accent/20 border-accent/50"
                    : index === 1
                    ? "bg-yellow-900/20 border-yellow-800/50"
                    : index === 2
                    ? "bg-orange-900/20 border-orange-800/50"
                    : "bg-background border-gray-700"
                }`}
              >
                <View className="flex-row items-center gap-3 flex-1">
                  <Avatar avatarId={user.avatarId} size="sm" highlighted={index === 0} />
                  <View className={`w-8 h-8 rounded-full items-center justify-center ${
                    index === 0
                      ? "bg-accent"
                      : index === 1
                      ? "bg-yellow-600"
                      : index === 2
                      ? "bg-orange-600"
                      : "bg-gray-600"
                  }`}>
                    <Text className="text-white font-bold text-sm" style={{ fontFamily: 'Vazirmatn-Bold' }}>
                      {user.rank}
                    </Text>
                  </View>
                  <Text className="text-white font-medium flex-1 text-right" style={{ fontFamily: 'Vazirmatn-SemiBold' }}>
                    {user.name}
                  </Text>
                </View>
                <View className="bg-accent/20 rounded-lg px-3 py-1 border border-accent/30">
                  <Text className="text-accent font-bold" style={{ fontFamily: 'Vazirmatn-Bold' }}>
                    {user.correctAnswers.toLocaleString('fa-IR')}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      <View className="bg-accent/20 rounded-lg p-6 border border-accent/30">
        <Text className="text-lg font-semibold text-accent mb-2 text-right" style={{ fontFamily: 'Vazirmatn-SemiBold' }}>🎉 همه چیز آماده است!</Text>
        <Text className="text-gray-300 text-right leading-6" style={{ fontFamily: 'Vazirmatn-Regular' }}>
          حساب شما با موفقیت ایجاد شد. اکنون می‌توانید از برنامه استفاده کنید.
        </Text>
      </View>

      <View className="items-center mt-4">
        <SignOutButton />
      </View>

      <Modal
        isOpen={isAvatarModalOpen}
        onClose={handleCloseAvatarModal}
        title="انتخاب آواتار"
        description={MODAL_DESCRIPTION}
        size="md"
      >
        <View className="flex-row flex-wrap justify-center gap-4">
          {AVATAR_OPTIONS.map((option) => {
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
                <Text className={`text-sm ${isSelected ? "text-accent font-semibold" : "text-gray-300"}`}>
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
            <Text className="text-gray-200 font-semibold" style={{ fontFamily: 'Vazirmatn-SemiBold' }}>
              انصراف
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSaveAvatar}
            activeOpacity={0.7}
            disabled={isSavingAvatar || pendingAvatarId === (userProfile.avatarId ?? DEFAULT_AVATAR_ID)}
            className={`px-4 py-3 rounded-lg ${isSavingAvatar || pendingAvatarId === (userProfile.avatarId ?? DEFAULT_AVATAR_ID) ? "bg-accent/60" : "bg-accent"}`}
          >
            {isSavingAvatar ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-white font-semibold" style={{ fontFamily: 'Vazirmatn-SemiBold' }}>
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
        description="نام جدید خود را وارد کنید. این نام در مسابقات و تورنومنت‌ها نمایش داده خواهد شد."
        size="sm"
      >
        <View className="space-y-4">
          <View>
            <Text className="text-gray-300 mb-2 text-right" style={{ fontFamily: 'Vazirmatn-SemiBold' }}>
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
              autoFocus
            />
          </View>

          <View className="flex-row justify-end gap-3">
            <TouchableOpacity
              onPress={handleCloseNameModal}
              disabled={isSavingName}
              activeOpacity={0.7}
              className="px-4 py-3 rounded-lg border border-gray-600 bg-background"
            >
              <Text className="text-gray-200 font-semibold" style={{ fontFamily: 'Vazirmatn-SemiBold' }}>
                انصراف
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSaveName}
              activeOpacity={0.7}
              disabled={isSavingName || nameInput.trim().length === 0 || nameInput.trim() === userProfile.name}
              className={`px-4 py-3 rounded-lg ${
                isSavingName || nameInput.trim().length === 0 || nameInput.trim() === userProfile.name
                  ? "bg-accent/60"
                  : "bg-accent"
              }`}
            >
              {isSavingName ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text className="text-white font-semibold" style={{ fontFamily: 'Vazirmatn-SemiBold' }}>
                  ذخیره نام
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
