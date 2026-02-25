import { View, Text, ScrollView, TouchableOpacity, Image, Dimensions } from "react-native";
import { useState, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";

export interface DashboardSlideItem {
  imageUrl: string | null;
  imagePath?: string;
  order: number;
}

export interface DashboardSliderProps {
  /** Each item has slides with resolved imageUrl */
  sliderItems: Array<{ _id: string; slides: DashboardSlideItem[] }>;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const BANNER_WIDTH = SCREEN_WIDTH - 32;
const BANNER_HEIGHT = 120;

export function DashboardSlider({
  sliderItems,
}: DashboardSliderProps) {
  const flatSlides = sliderItems.flatMap((s) =>
    s.slides.map((slide) => ({
      ...slide,
      sliderId: s._id,
    }))
  );
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  if (flatSlides.length === 0) {
    return (
      <View
        className="rounded-2xl border border-gray-700/30 overflow-hidden bg-background-light items-center justify-center"
        style={{ width: BANNER_WIDTH, height: BANNER_HEIGHT }}
      >
        <Text className="text-gray-500" style={{ fontFamily: "Meem-Regular" }}>
          اسلایدری وجود ندارد
        </Text>
      </View>
    );
  }

  const current = flatSlides[index];
  const goPrev = () => {
    const next = index === 0 ? flatSlides.length - 1 : index - 1;
    setIndex(next);
    scrollRef.current?.scrollTo({ x: next * BANNER_WIDTH, animated: true });
  };
  const goNext = () => {
    const next = index === flatSlides.length - 1 ? 0 : index + 1;
    setIndex(next);
    scrollRef.current?.scrollTo({ x: next * BANNER_WIDTH, animated: true });
  };

  return (
    <View className="rounded-2xl overflow-hidden border border-gray-700/30">
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const i = Math.round(e.nativeEvent.contentOffset.x / BANNER_WIDTH);
          setIndex(Math.min(i, flatSlides.length - 1));
        }}
        style={{ width: BANNER_WIDTH, height: BANNER_HEIGHT }}
      >
        {flatSlides.map((slide, i) => (
          <View
            key={`${slide.sliderId}-${i}`}
            style={{
              width: BANNER_WIDTH,
              height: BANNER_HEIGHT,
              backgroundColor: "#ea580c",
            }}
          >
            {slide.imageUrl ? (
              <Image
                source={{ uri: slide.imageUrl }}
                style={{ width: BANNER_WIDTH, height: BANNER_HEIGHT }}
                resizeMode="cover"
              />
            ) : (
              <View className="flex-1 items-center justify-center px-4">
                <Text
                  className="text-white text-lg font-semibold text-center"
                  style={{ fontFamily: "Meem-SemiBold" }}
                >
                  از اول گوش کنیم
                </Text>
                <Text
                  className="text-white/90 text-sm mt-1"
                  style={{ fontFamily: "Meem-Regular" }}
                >
                  از اول
                </Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
      <View className="flex-row items-center justify-between absolute bottom-2 left-2 right-2">
        <TouchableOpacity onPress={goPrev} className="p-2 bg-white/20 rounded-full">
          <Ionicons name="chevron-forward" size={20} color="#fff" />
        </TouchableOpacity>
        <View className="flex-row gap-1">
          {flatSlides.map((_, i) => (
            <View
              key={i}
              className={`w-2 h-2 rounded-full ${i === index ? "bg-white" : "bg-white/40"}`}
            />
          ))}
        </View>
        <TouchableOpacity onPress={goNext} className="p-2 bg-white/20 rounded-full">
          <Ionicons name="chevron-back" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
