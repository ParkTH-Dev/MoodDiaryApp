import axios from "axios";
import { YOUTUBE_API_KEY } from "@env";

export const getYoutubeMusic = async (keywords) => {
  try {
    // OpenAI가 제공한 키워드 배열에서 랜덤으로 하나 선택
    const randomKeyword = Array.isArray(keywords)
      ? keywords[Math.floor(Math.random() * keywords.length)]
      : keywords;

    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/search`,
      {
        params: {
          part: "snippet",
          maxResults: 5,
          key: YOUTUBE_API_KEY,
          q: randomKeyword,
          type: "video",
          //   videoCategoryId: "10",
          regionCode: "KR",
          videoDefinition: "high",
          relevanceLanguage: "ko",
          videoDuration: "medium",
        },
      }
    );

    return response.data.items.map((item) => ({
      type: "음악",
      title: item.snippet.title,
      description: item.snippet.description.slice(0, 100) + "...",
      thumbnail: item.snippet.thumbnails.high.url,
      videoId: item.id.videoId,
      channelTitle: item.snippet.channelTitle,
      publishedAt: new Date(item.snippet.publishedAt).toLocaleDateString(),
    }));
  } catch (error) {
    console.error("YouTube API 에러:", error);
    return [];
  }
};

export const getYoutubeShorts = async (keyword) => {
  try {
    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/search`,
      {
        params: {
          part: "snippet",
          maxResults: 5,
          key: YOUTUBE_API_KEY,
          q: `${keyword} #shorts`,
          type: "video",
          videoDuration: "short",
          order: "relevance",
          regionCode: "KR",
          videoDefinition: "high",
          relevanceLanguage: "ko",
        },
      }
    );

    return response.data.items.map((item) => ({
      type: "short",
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.high.url,
      videoId: item.id.videoId,
      channelTitle: item.snippet.channelTitle,
      publishedAt: new Date(item.snippet.publishedAt).toLocaleDateString(),
    }));
  } catch (error) {
    console.error("YouTube Shorts API 에러:", error);
    return [];
  }
};
