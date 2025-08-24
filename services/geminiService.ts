import { GoogleGenAI, Type } from "@google/genai";
import type { FoodItem } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            foodName: {
                type: Type.STRING,
                description: "The common name of the food item identified. Be specific (e.g., 'fried chicken thigh' not just 'chicken').",
            },
            calories: {
                type: Type.NUMBER,
                description: "A realistic estimate of the calories for the portion of this specific food item shown in the image.",
            },
            servingSizeGrams: {
                type: Type.NUMBER,
                description: "A realistic estimate of the serving size in grams for the portion of this specific food item shown in the image.",
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
          Identify each distinct food item in this image.
          For each item, provide a reasonable estimate for its calorie count and serving size in grams based on the portion shown.
          Provide only the list of food items as a JSON object that adheres to the provided schema.
          If a food item is not clearly identifiable, do not include it.
          Your response must be a valid JSON array.
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
            throw new Error('AI response is not a valid array.');
        }

        return parsedJson as Omit<FoodItem, 'id'>[];

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("The AI model failed to process the image. This could be due to a network issue, invalid image, or a problem with the AI service.");
    }
};
