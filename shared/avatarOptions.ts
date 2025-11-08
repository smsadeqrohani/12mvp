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

