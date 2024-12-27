import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  Linking,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors } from "../../infrastructure/theme/colors";
import { useTheme } from "../../infrastructure/theme/ThemeContext";
import { analyzeEmotionsWithAI } from "../../services/openaiService";
import { getYoutubeMusic } from "../../services/youtubeService";

export default function AnalyticsScreen({ navigation }) {
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [emotionSummary, setEmotionSummary] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [musicRecommendations, setMusicRecommendations] = useState([]);
  const [quotes, setQuotes] = useState([]);

  useEffect(() => {
    analyzeEmotions();
  }, []);

  const analyzeEmotions = async () => {
    try {
      setLoading(true);

      const entries = await AsyncStorage.getItem("emotionEntries");
      const parsedEntries = entries ? JSON.parse(entries) : [];

      if (parsedEntries.length === 0) {
        Alert.alert(
          "알림",
          "감정 기록이 없습니다. 홈 화면에서 오늘의 감정을 기록해보세요.",
          [
            {
              text: "확인",
              onPress: () => navigation.navigate("홈"),
            },
          ]
        );
        return;
      }

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentEntries = parsedEntries.filter((entry) => {
        const entryDate = new Date(entry.date);
        return entryDate >= sevenDaysAgo;
      });

      if (recentEntries.length === 0) {
        Alert.alert(
          "알림",
          "최근 7일간의 감정 기록이 없습니다. 홈 화면에서 오늘의 감정을 기록해보세요."
        );
        return;
      }

      const analysis = await analyzeEmotionsWithAI(recentEntries);

      setEmotionSummary(analysis);

      if (analysis.recommendations) {
        setRecommendations(analysis.recommendations);
      }

      if (analysis.quotes) {
        setQuotes(analysis.quotes);
      }

      if (analysis.musicKeywords) {
        const musicResults = await getYoutubeMusic(analysis.musicKeywords);
        setMusicRecommendations(musicResults);
      }
    } catch (error) {
      console.error("감정 분석 실패:", error);
      Alert.alert("오류", "감정 분석 중 문제가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const openYoutubeVideo = (videoId) => {
    Linking.openURL(`https://www.youtube.com/watch?v=${videoId}`);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>감정을 분석하고 있습니다...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[
        styles.container,
        {
          backgroundColor: isDarkMode
            ? colors.dark.background
            : colors.light.background,
        },
      ]}
    >
      {emotionSummary && (
        <View style={styles.headerSection}>
          <Text style={styles.mainEmotion}>
            {emotionSummary.mainEmotion.emoji}
          </Text>
          <Text
            style={[
              styles.summaryText,
              { color: isDarkMode ? colors.dark.text : colors.light.text },
            ]}
          >
            {emotionSummary.summary}
          </Text>
          <View
            style={[
              styles.emotionDetails,
              {
                backgroundColor: isDarkMode
                  ? colors.dark.surface
                  : colors.light.surface,
              },
            ]}
          >
            <Text
              style={[
                styles.emotionPrimary,
                { color: isDarkMode ? colors.dark.text : colors.light.text },
              ]}
            >
              {emotionSummary.mainEmotion.primary === "기쁨" &&
                "긍정적이고 밝은 감정 상태"}
              {emotionSummary.mainEmotion.primary === "슬픔" &&
                "우울하고 무거운 감정 상태"}
              {emotionSummary.mainEmotion.primary === "분노" &&
                "화가 나고 짜증이 나는 상태"}
              {emotionSummary.mainEmotion.primary === "불안" &&
                "걱정되고 불안정한 상태"}
              {emotionSummary.mainEmotion.primary === "평온" &&
                "차분하고 안정된 상태"}
              {emotionSummary.mainEmotion.primary === "설렘" &&
                "기대감과 두근거림이 있는 상태"}
              {emotionSummary.mainEmotion.primary === "지침" &&
                "피로감과 에너지 저하 상태"}
              {emotionSummary.mainEmotion.primary === "허탈" &&
                "의욕 저하와 공허한 상태"}
            </Text>
            {emotionSummary.mainEmotion.subEmotions && (
              <Text
                style={[
                  styles.subEmotions,
                  { color: isDarkMode ? colors.dark.text : colors.light.text },
                ]}
              >
                동반 감정: {emotionSummary.mainEmotion.subEmotions.join(", ")}
              </Text>
            )}
          </View>
        </View>
      )}

      {quotes.length > 0 && (
        <View style={styles.recommendationsSection}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: isDarkMode ? colors.dark.text : colors.light.text,
              },
            ]}
          >
            오늘의 명언
          </Text>
          <View style={styles.quotesContainer}>
            {quotes.map((quote, index) => (
              <View
                key={index}
                style={[
                  styles.quoteCard,
                  {
                    backgroundColor: isDarkMode
                      ? colors.dark.surface
                      : colors.light.surface,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.quoteText,
                    {
                      color: isDarkMode ? colors.dark.text : colors.light.text,
                    },
                  ]}
                >
                  "{quote.text}"
                </Text>
                <Text style={styles.quoteAuthor}>- {quote.author}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {recommendations.length > 0 && (
        <View style={styles.recommendationsSection}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: isDarkMode ? colors.dark.text : colors.light.text,
              },
            ]}
          >
            추천 활동
          </Text>
          {recommendations.map((item, index) => (
            <View
              key={index}
              style={[
                styles.recommendCard,
                {
                  backgroundColor: isDarkMode
                    ? colors.dark.surface
                    : colors.light.surface,
                },
              ]}
            >
              <Text
                style={[
                  styles.recommendTitle,
                  { color: isDarkMode ? colors.dark.text : colors.light.text },
                ]}
              >
                {item.title}
              </Text>
              <Text
                style={[
                  styles.recommendDescription,
                  { color: isDarkMode ? colors.dark.text : colors.light.text },
                ]}
              >
                {item.description}
              </Text>
              <Text
                style={[
                  styles.recommendReason,
                  {
                    color: isDarkMode ? colors.dark.text : colors.light.text,
                    marginTop: 8,
                    fontStyle: "italic",
                  },
                ]}
              >
                *{item.reason}
              </Text>
            </View>
          ))}
        </View>
      )}

      {musicRecommendations.length > 0 && (
        <View style={styles.musicSection}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: isDarkMode ? colors.dark.text : colors.light.text,
              },
            ]}
          >
            추천 음악
          </Text>
          <ScrollView horizontal style={{ marginBottom: 24 }}>
            {musicRecommendations.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.musicCard,
                  {
                    backgroundColor: isDarkMode
                      ? colors.dark.surface
                      : colors.light.surface,
                  },
                ]}
                onPress={() => openYoutubeVideo(item.videoId)}
              >
                <Image
                  source={{ uri: item.thumbnail }}
                  style={styles.musicThumbnail}
                />
                <View style={styles.musicInfo}>
                  <Text
                    style={[
                      styles.musicTitle,
                      {
                        color: isDarkMode
                          ? colors.dark.text
                          : colors.light.text,
                      },
                    ]}
                  >
                    {item.title}
                  </Text>
                  <Text style={styles.channelTitle}>{item.channelTitle}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 24,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: colors.primary,
  },
  headerSection: {
    alignItems: "center",
    marginTop: 8,
    marginBottom: 24,
    width: "100%",
  },
  mainEmotion: {
    fontSize: 48,
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 15,
    width: "100%",
  },
  emotionDetails: {
    width: "100%",
    padding: 16,
    borderRadius: 12,
  },
  emotionPrimary: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  emotionIntensity: {
    fontSize: 14,
    marginBottom: 5,
  },
  subEmotions: {
    fontSize: 14,
    fontStyle: "italic",
  },
  quotesSection: {
    marginBottom: 24,
    width: "100%",
    padding: 16,
  },
  quotesContainer: {
    width: "100%",
  },
  quoteCard: {
    width: "100%",
    padding: 20,
    marginBottom: 16,
    borderRadius: 12,
    justifyContent: "space-between",
  },
  quoteText: {
    fontSize: 16,
    fontStyle: "italic",
    marginBottom: 16,
    lineHeight: 24,
  },
  quoteAuthor: {
    fontSize: 14,
    color: colors.primary,
    textAlign: "right",
    fontWeight: "500",
  },
  recommendationsSection: {
    marginBottom: 24,
    width: "100%",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  recommendCard: {
    width: "100%",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  recommendType: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
  },
  recommendTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  recommendDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  musicSection: {
    marginBottom: 24,
    width: "100%",
  },
  musicScrollView: {
    marginLeft: -20,
    paddingLeft: 20,
  },
  musicCard: {
    width: 240,
    marginRight: 12,
    borderRadius: 12,
    overflow: "hidden",
  },
  musicThumbnail: {
    width: "100%",
    height: 135,
  },
  musicInfo: {
    padding: 12,
  },
  musicTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  channelTitle: {
    fontSize: 12,
    color: colors.primary,
  },
});
