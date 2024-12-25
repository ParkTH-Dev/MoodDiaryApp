import axios from "axios";
import { OPENAI_API_KEY } from "@env";

const api = axios.create({
  baseURL: "https://api.openai.com/v1",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${OPENAI_API_KEY}`,
  },
});

api.interceptors.request.use((request) => {
  return request;
});

export const testOpenAI = async () => {
  try {
    console.log("API 요청 시작");
    const response = await api.post("/chat/completions", {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: "Hello",
        },
      ],
      max_tokens: 10,
      temperature: 0.5,
    });

    console.log("API 응답 전체:", response.data);
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("전체 에러 객체:", error);
    console.error("API 에러 상태:", error.response?.status);
    console.error("API 에러 데이터:", error.response?.data);
    throw new Error(error.response?.data?.error?.message || "API 호출 실패");
  }
};

export const analyzeEmotionsWithAI = async (entries) => {
  try {
    const response = await api.post("/chat/completions", {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `당신은 감정 분석 전문가입니다. 사용자의 감정 데이터를 분석하고 
          다음 형식의 JSON으로 응답해주세요:
          {
            "summary": "전반적인 감정 상태 요약 (2-3문장)",
            "mainEmotion": {
              "primary": "기쁨/슬픔/분노/불안/평온/설렘/지침/허탈",
              "intensity": 1-10,  // 감정 강도
              "emoji": "😊/😔/😡/😰/😌/🥰/😫/😕",
              "subEmotions": ["행복", "즐거움"] // 세부 감정들
            },
            "musicKeywords": [
              "기분 좋을 때 듣는 팝송",
              "행복할 때 듣는 팝송",
              "신나는 팝송"
            ],
            "emotionTrend": {
              "direction": "개선/유지/악화",
              "description": "감정 변화 추세 설명"
            },
            "shortVideoKeywords": [
              "힐링되는 영상",
              "기분 전환 영상"
            ],
            "recommendations": [
              {
                "type": "활동",
                "title": "추천 활동 제목",
                "description": "상세 설명",
                "reason": "이 활동을 추천하는 이유"
              }
            ],
            "quotes": [
              {
                "text": "감정에 맞는 명언(한글로 작성)",
                "author": "작성자",
                "context": "이 명언이 도움이 되는 이유"
              }
            ]
          }
          
          주요 감정 카테고리와 관련 음악 키워드:
          1. 기쁨/행복 (😊)
             - "기분 좋을 때 듣는 팝송", "행복한 팝송", "신나는 팝송"
          2. 슬픔/우울 (😔)
             - "우울할 때 듣는 팝송", "새벽에 듣는 팝송", "위로가 되는 팝송"
          3. 분노/짜증 (😡)
             - "스트레스 해소 팝송", "화날 때 듣는 팝송", "분노 해소 팝송"
          4. 불안/걱정 (😰)
             - "불안할 때 듣는 팝송", "마음이 복잡할 때 듣는 팝송"
          5. 평온/안정 (😌)
             - "잔잔한 팝송", "편안한 팝송", "조용한 팝송"
          6. 설렘/기대 (🥰)
             - "설렘가득 팝송", "로맨틱 팝송", "사랑에 빠질 때 듣는 팝송"
          7. 지침/피곤 (😫)
             - "지친 하루 끝에 듣는 팝송", "퇴근길에 듣는 팝송"
          8. 허탈/공허 (😕)
             - "무기력할 때 듣는 팝송", "공허할 때 듣는 팝송"`,
        },
        {
          role: "user",
          content: `최근 감정 기록: ${JSON.stringify(entries)}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    return JSON.parse(response.data.choices[0].message.content);
  } catch (error) {
    console.error("AI 분석 실패:", error);
    throw new Error("감정 분석 중 오류가 발생했습니다");
  }
};
