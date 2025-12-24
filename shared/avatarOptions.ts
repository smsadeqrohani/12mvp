export type AvatarOption = {
  id: string;
  url: string;
  label: string;
};

export const AVATAR_OPTIONS: AvatarOption[] = [
  { id: "avatar-09", url: "https://precious-horse-758.convex.cloud/api/storage/73eb6a8a-ea19-4d3d-8238-7606627bf528", label: "Avatar 9" },
  { id: "avatar-01", url: "https://precious-horse-758.convex.cloud/api/storage/20b819dd-4705-401b-b2ef-85ecce08c621", label: "Avatar 1" },
  { id: "avatar-02", url: "https://precious-horse-758.convex.cloud/api/storage/028695c6-c2a8-4282-bd01-d7b9517e70d6", label: "Avatar 2" },
  { id: "avatar-03", url: "https://precious-horse-758.convex.cloud/api/storage/88b64eac-d8c6-44f7-a342-91ef6def6840", label: "Avatar 3" },
  { id: "avatar-04", url: "https://precious-horse-758.convex.cloud/api/storage/f12b9ed9-2bfc-46cf-8cd2-f6b3917d071a", label: "Avatar 4" },
  { id: "avatar-05", url: "https://precious-horse-758.convex.cloud/api/storage/2c0cb4ac-98dd-4eab-9591-ff989c2a2fcf", label: "Avatar 5" },
  { id: "avatar-06", url: "https://precious-horse-758.convex.cloud/api/storage/f5540338-f1f2-45ec-8367-e70996fbbb53", label: "Avatar 6" },
  { id: "avatar-07", url: "https://precious-horse-758.convex.cloud/api/storage/f67c3c68-4d03-4167-9484-7b231c4449a6", label: "Avatar 7" },
  { id: "avatar-08", url: "https://precious-horse-758.convex.cloud/api/storage/8c5d1cbb-e53f-4ed5-b3c6-99c5a52c9eed", label: "Avatar 8" },
  { id: "avatar-10", url: "https://precious-horse-758.convex.cloud/api/storage/0afa3e8b-14ea-40f3-a485-fd0ff61d84ed", label: "Avatar 10" },
  // Premium avatars (purchasable from store)
  { id: "avatar-11", url: "https://precious-horse-758.convex.cloud/api/storage/30a90ab7-c70d-4ea9-84e0-b6dac4415fa3", label: "Premium Avatar 11" },
  { id: "avatar-12", url: "https://precious-horse-758.convex.cloud/api/storage/8de9f261-64ef-4b58-98b0-b8654039656b", label: "Premium Avatar 12" },
  { id: "avatar-13", url: "https://precious-horse-758.convex.cloud/api/storage/1ea1c58b-e024-4830-9017-f9dd1e296953", label: "Premium Avatar 13" },
  { id: "avatar-14", url: "https://precious-horse-758.convex.cloud/api/storage/6afb75f7-5198-43a7-8147-3d65ebdfb191", label: "Premium Avatar 14" },
  { id: "avatar-15", url: "https://precious-horse-758.convex.cloud/api/storage/abedc4a2-5bf5-4301-88f1-f4f3168897ec", label: "Premium Avatar 15" },
  { id: "avatar-16", url: "https://precious-horse-758.convex.cloud/api/storage/78a751a8-a399-45e2-9781-b75888cc4ee9", label: "Premium Avatar 16" },
  { id: "avatar-17", url: "https://precious-horse-758.convex.cloud/api/storage/7f981fc5-cf54-4dee-889e-dfb93d2fee04", label: "Premium Avatar 17" },
  { id: "avatar-18", url: "https://precious-horse-758.convex.cloud/api/storage/4db723f7-be92-401e-98b5-e20f70118514", label: "Premium Avatar 18" },
  { id: "avatar-19", url: "https://precious-horse-758.convex.cloud/api/storage/e6fd7185-ce2a-431f-a88b-1515a3820351", label: "Premium Avatar 19" },
  { id: "avatar-20", url: "https://precious-horse-758.convex.cloud/api/storage/e7391da1-2e18-47e5-a3fe-cb61bfe7cfcc", label: "Premium Avatar 20" },
  { id: "avatar-21", url: "https://precious-horse-758.convex.cloud/api/storage/2f9b9557-d0b4-47fe-a0fe-c81b5eea160e", label: "Premium Avatar 21" },
  { id: "avatar-22", url: "https://precious-horse-758.convex.cloud/api/storage/89d26d1f-431e-4a0f-8f24-3caa6234558b", label: "Premium Avatar 22" },
] as const;

export const DEFAULT_AVATAR_ID = "avatar-09";

export function getAvatarOption(id?: string | null): AvatarOption {
  const fallback = AVATAR_OPTIONS.find((option) => option.id === DEFAULT_AVATAR_ID) ?? AVATAR_OPTIONS[0];
  if (!id) {
    return fallback;
  }
  return AVATAR_OPTIONS.find((option) => option.id === id) ?? fallback;
}

export function isValidAvatarId(id: string): boolean {
  return AVATAR_OPTIONS.some((option) => option.id === id);
}

// Free avatars (avatar-01 to avatar-10)
export const FREE_AVATAR_IDS = [
  "avatar-01", "avatar-02", "avatar-03", "avatar-04", "avatar-05",
  "avatar-06", "avatar-07", "avatar-08", "avatar-09", "avatar-10"
] as const;

// Premium avatars (avatar-11 to avatar-22) - purchasable from store
export const PREMIUM_AVATAR_IDS = [
  "avatar-11", "avatar-12", "avatar-13", "avatar-14", "avatar-15",
  "avatar-16", "avatar-17", "avatar-18", "avatar-19", "avatar-20",
  "avatar-21", "avatar-22"
] as const;

export function isPremiumAvatar(id: string): boolean {
  return PREMIUM_AVATAR_IDS.includes(id as any);
}

export function isFreeAvatar(id: string): boolean {
  return FREE_AVATAR_IDS.includes(id as any);
}

