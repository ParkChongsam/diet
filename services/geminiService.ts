import { GoogleGenAI, Type } from "@google/genai";
import type { FoodItem } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY 환경 변수가 설정되지 않았습니다.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            foodName: {
                type: Type.STRING,
                description: "식별된 음식의 일반적인 이름. 구체적으로 작성해주세요 (예: '치킨'이 아닌 '프라이드 치킨 다리').",
            },
            calories: {
                type: Type.NUMBER,
                description: "이미지에 보이는 특정 음식 부분에 대한 현실적인 칼로리 추정치.",
            },
            servingSizeGrams: {
                type: Type.NUMBER,
                description: "이미지에 보이는 특정 음식 부분에 대한 현실적인 그램 단위 양 추정치.",
            },
        },
        required: ["foodName", "calories", "servingSizeGrams"],
    },
};

export const analyzeImageForFood = async (base64Image: string): Promise<Omit<FoodItem, 'id'>[]> => {
    const imagePart = {
        inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image,
        },
    };
    
    const textPart = {
        text: `
          이 이미지에 있는 각각의 음식 항목을 식별해주세요.
          각 항목에 대해, 사진에 보이는 양을 기준으로 칼로리 수치와 그램 단위의 양을 합리적으로 추정해주세요.
          제공된 스키마를 준수하는 JSON 객체로 음식 항목 목록만 제공해주세요.
          명확하게 식별할 수 없는 음식은 포함하지 마세요.
          응답은 반드시 유효한 JSON 배열이어야 합니다.
        `,
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });

        const jsonText = response.text.trim();
        const parsedJson = JSON.parse(jsonText);

        if (!Array.isArray(parsedJson)) {
            throw new Error('AI 응답이 유효한 배열이 아닙니다.');
        }

        return parsedJson as Omit<FoodItem, 'id'>[];

    } catch (error) {
        console.error("Gemini API 호출 오류:", error);
        throw new Error("AI 모델이 이미지를 처리하지 못했습니다. 네트워크 문제, 잘못된 이미지 또는 AI 서비스 문제일 수 있습니다.");
    }
};