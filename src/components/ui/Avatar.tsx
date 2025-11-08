import { ReactNode } from "react";
import { Image, Text, View } from "react-native";
import { getAvatarOption } from "../../../shared/avatarOptions";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

const SIZE_MAP: Record<AvatarSize, number> = {
  xs: 24,
  sm: 32,
  md: 48,
  lg: 64,
  xl: 96,
};

export interface AvatarProps {
  avatarId?: string | null;
  size?: AvatarSize | number;
  className?: string;
  fallbackInitial?: string;
  badge?: ReactNode;
  highlighted?: boolean;
}

export function Avatar({
  avatarId,
  size = "md",
  className = "",
  fallbackInitial,
  badge,
  highlighted = false,
}: AvatarProps) {
  const dimension = typeof size === "number" ? size : SIZE_MAP[size] ?? SIZE_MAP.md;
  const option = getAvatarOption(avatarId);

  return (
    <View
      className={`relative rounded-full overflow-hidden bg-gray-800/60 items-center justify-center ${highlighted ? "border-2 border-accent" : "border border-gray-700/40"} ${className}`}
      style={{
        width: dimension,
        height: dimension,
      }}
    >
      <Image
        source={{ uri: option.url }}
        resizeMode="cover"
        style={{
          width: dimension,
          height: dimension,
        }}
      />
      {!option && fallbackInitial && (
        <Text className="absolute text-white font-semibold text-base">{fallbackInitial}</Text>
      )}
      {badge && (
        <View className="absolute bottom-0 right-0">{badge}</View>
      )}
    </View>
  );
}

