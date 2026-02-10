import Anthropic from "@anthropic-ai/sdk";
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const client = new Anthropic();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// 2026 패션 트렌드 데이터
const fashionTrends = {
  men: {
    "20": {
      style: "스트리트 캐주얼 룩",
      items: ["오버사이즈 후드 패딩", "레이어드 후드티", "일자핏 데님", "스니커즈"],
      trends: "2026 콜라주 스타일링, 일자핏 데님 복귀, 뉴트럴 컬러",
      mood: "편안하면서도 트렌디한 대학생 스타일",
    },
    "30": {
      style: "스마트 비즈니스 캐주얼",
      items: ["울 블렌드 코트", "터틀넥 니트", "테일러드 슬랙스", "첼시 부츠"],
      trends: "클라우드 댄서 뉴트럴 톤, 테일러링 강화",
      mood: "세련되고 품격 있는 직장인 스타일",
    },
    "40": {
      style: "모던 클래식 룩",
      items: ["캐시미어 롱 코트", "드레스 셔츠", "울 팬츠", "옥스포드 슈즈"],
      trends: "고급 소재, 클래식 테일러링",
      mood: "성숙하고 신뢰감 있는 비즈니스 스타일",
    },
  },
  girl: {
    "20": {
      style: "러블리 캠퍼스 룩",
      items: ["크롭 패딩", "프린지 디테일 니트", "일자핏 데님", "로퍼"],
      trends: "2026 프린지 & 태슬, 일자핏 데님, 원색 포인트",
      mood: "귀엽고 발랄한 대학생 스타일",
    },
    "30": {
      style: "시크 오피스 룩",
      items: ["롱 울 코트", "콜라주 스타일 블라우스", "테일러드 스커트", "앵클 부츠"],
      trends: "클라우드 댄서 컬러, 콜라주 레이어링",
      mood: "우아하고 세련된 직장인 스타일",
    },
    "40": {
      style: "엘레강스 비즈니스",
      items: ["캐시미어 코트", "니트 앙상블", "와이드 팬츠", "펌프스"],
      trends: "뉴트럴 톤, 고급 소재, 모던 실루엣",
      mood: "품격 있고 우아한 여성 스타일",
    },
  },
};

// 이미지 생성 API
app.post("/api/generate-outfit-image", async (req, res) => {
  const { gender, ageGroup, weatherSummary, fashionTrend } = req.body;

  if (!gender || !ageGroup) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const trend = fashionTrends[gender]?.[ageGroup];
  if (!trend) {
    return res.status(400).json({ error: "Invalid gender or age group" });
  }

  try {
    const positivePrompt = `
Role: Professional Fashion Stylist & AI Image Creator.

Task: Create a high-quality fashion lookbook image for Seoul, South Korea.

1) Weather Context:
- ${weatherSummary}
- Temperature requires warm layering

2) Target Audience:
- ${gender === "men" ? "Male" : "Female"} in their ${ageGroup}s
- Korean urban style

3) Fashion Requirements:
- Style concept: ${trend.style}
- Key items: ${trend.items.join(", ")}
- 2026 trends: ${trend.trends}
- Overall mood: ${trend.mood}

4) Image Specifications:
- Full body shot of a single model
- Modern Seoul urban background (winter street, cafe, or minimalist indoor)
- Photorealistic, 8k quality, cinematic lighting
- Model should look natural and stylish
- Outfit must be weather-appropriate and clearly show all key items

Style: Professional fashion photography, 2026 Korean street style, trendy and realistic.
    `.trim();

    const negativePrompt = `
Avoid: outdated fashion, weather-inappropriate clothing, blurry faces or limbs, 
low quality textures, cartoonish or anime style, generic outfits, 
any text/logos/watermarks in the image, distorted proportions.
    `.trim();

    // Claude 사용 시 활성화
    // const image = await client.images.generate({...});
    
    // 대체: 플레이스홀더 이미지 URL
    const colors = {
      men: { "20": "FF6B6B", "30": "4ECDC4", "40": "95E1D3" },
      girl: { "20": "F38181", "30": "AA96DA", "40": "FCBAD3" },
    };

    const color = colors[gender]?.[ageGroup] || "21808D";
    const imageUrl = `https://via.placeholder.com/600x800/${color}/ffffff?text=${gender}+${ageGroup}s`;

    res.json({
      imageUrl,
      trend,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to generate outfit" });
  }
});

// 정적 파일 제공
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌟 Fashion Daily App running at http://localhost:${PORT}`);
});
