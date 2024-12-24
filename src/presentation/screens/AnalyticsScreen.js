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

export default function RecommendScreen() {
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
          <View style={styles.emotionDetails}>
            <Text style={styles.emotionPrimary}>
              주요 감정: {emotionSummary.mainEmotion.primary}
            </Text>
            <Text style={styles.emotionIntensity}>
              감정 강도: {emotionSummary.mainEmotion.intensity}/10
            </Text>
            {emotionSummary.mainEmotion.subEmotions && (
              <Text style={styles.subEmotions}>
                세부 감정: {emotionSummary.mainEmotion.subEmotions.join(", ")}
              </Text>
            )}
          </View>
        </View>
      )}

      {quotes.length > 0 && (
        <View style={styles.quotesSection}>
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
          <ScrollView horizontal>
            {quotes.map((quote, index) => (
              <View key={index} style={styles.quoteCard}>
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
          </ScrollView>
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
            <View key={index} style={styles.recommendCard}>
              <Text
                style={[
                  styles.recommendType,
                  { color: isDarkMode ? colors.dark.text : colors.light.text },
                ]}
              >
                {item.type}
              </Text>
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
          <ScrollView horizontal>
            {musicRecommendations.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.musicCard}
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
    padding: 16,
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
    backgroundColor: colors.primary + "10",
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
  },
  quotesScrollView: {
    marginLeft: -20,
    paddingLeft: 20,
  },
  quoteCard: {
    width: 320,
    minHeight: 150,
    padding: 20,
    marginRight: 16,
    backgroundColor: colors.primary + "10",
    borderRadius: 12,
    justifyContent: "space-between",
  },
  quoteText: {
    fontSize: 17,
    fontStyle: "italic",
    marginBottom: 16,
    lineHeight: 26,
    color: colors.dark.text,
  },
  quoteAuthor: {
    fontSize: 15,
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
    backgroundColor: colors.primary + "10",
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
    backgroundColor: colors.primary + "10",
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
