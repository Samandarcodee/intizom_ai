
import { GoogleGenAI, Type, Schema } from "@google/genai";

// Ensure API Key is present with safe environment check
let apiKey = '';
try {
  if (typeof process !== 'undefined' && process.env) {
    apiKey = process.env.API_KEY || '';
  }
} catch (e) {
  console.warn("Could not access process.env");
}

// Fallback for safety
const ai = new GoogleGenAI({ apiKey: apiKey || 'dummy-key' });

/**
 * Generates a structured learning/discipline plan based on a user goal in the selected language.
 */
export const generateDisciplinePlan = async (
  goal: string, 
  language: 'uz' | 'ru' | 'en' = 'uz', 
  days: number = 7,
  intensity: 'easy' | 'medium' | 'hard' = 'medium'
): Promise<any> => {
  // MOCK FALLBACK DATA
  const mockPlanUz = [
    { day: 1, focus: "Asoslarni o'rnatish", tasks: ["Maqsadni aniqlash", "Resurslarni yig'ish", "30 daqiqa o'rganish"] },
    { day: 2, focus: "Amaliyot", tasks: ["Birinchi qadam", "20 daqiqa amaliyot", "Xatolarni tahlil qilish"] },
    { day: 3, focus: "Qiyinchilik", tasks: ["1 soat shug'ullanish", "Chalg'imaslik", "Natijani yozish"] }
  ];
  const mockPlanRu = [
    { day: 1, focus: "Закладка основ", tasks: ["Определить цель", "Собрать ресурсы", "30 минут обучения"] },
    { day: 2, focus: "Практика", tasks: ["Первый шаг", "20 минут практики", "Анализ ошибок"] },
    { day: 3, focus: "Сложность", tasks: ["Заниматься 1 час", "Не отвлекаться", "Записать результат"] }
  ];
  const mockPlanEn = [
    { day: 1, focus: "Foundations", tasks: ["Define goal", "Gather resources", "30 mins learning"] },
    { day: 2, focus: "Practice", tasks: ["First step", "20 mins practice", "Analyze errors"] },
    { day: 3, focus: "Challenge", tasks: ["1 hour focus", "No distractions", "Log results"] }
  ];

  let mockPlan = mockPlanUz;
  if (language === 'ru') mockPlan = mockPlanRu;
  if (language === 'en') mockPlan = mockPlanEn;

  if (!apiKey || apiKey === 'dummy-key') {
    console.warn("No API Key found. Returning Mock Data for Planner.");
    await new Promise(resolve => setTimeout(resolve, 2000));
    return mockPlan;
  }

  let langPrompt = "O'zbek tilida";
  if (language === 'ru') langPrompt = "Rus tilida (Russian language)";
  if (language === 'en') langPrompt = "Ingliz tilida (English language)";

  const prompt = `Create a strict ${days}-day discipline plan with ${intensity} intensity for the goal: "${goal}". 
  Focus on actionable micro-tasks. 
  Return the response strictly in ${langPrompt}.`;

  const schema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        day: { type: Type.INTEGER },
        focus: { type: Type.STRING, description: `Daily focus in ${langPrompt}` },
        tasks: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING },
          description: `List of 2-3 tasks in ${langPrompt}`
        }
      },
      required: ["day", "focus", "tasks"]
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        systemInstruction: `You are a strict AI Discipline Coach. Divide goals into steps. Answer in ${langPrompt}.`
      }
    });

    const text = response.text;
    if (!text) return mockPlan;
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating plan:", error);
    return mockPlan;
  }
};

/**
 * Sends a message to the AI Coach and gets a response in the selected language.
 */
export const chatWithCoach = async (history: { role: string; parts: { text: string }[] }[], newMessage: string, language: 'uz' | 'ru' | 'en' = 'uz') => {
  const FALLBACK_RESPONSE_UZ = "Server bilan aloqa yo'q. Lekin to'xtamang!";
  const FALLBACK_RESPONSE_RU = "Нет связи с сервером. Но не останавливайтесь!";
  const FALLBACK_RESPONSE_EN = "No connection to server. But don't stop!";

  let fallback = FALLBACK_RESPONSE_UZ;
  if (language === 'ru') fallback = FALLBACK_RESPONSE_RU;
  if (language === 'en') fallback = FALLBACK_RESPONSE_EN;

  if (!apiKey || apiKey === 'dummy-key') {
     await new Promise(resolve => setTimeout(resolve, 1000));
     return fallback;
  }

  let langInstruction = "Faqat O'zbek tilida javob bering.";
  if (language === 'ru') langInstruction = "Отвечайте только на Русском языке.";
  if (language === 'en') langInstruction = "Answer only in English.";

  try {
    const contents = [
      ...history.map(h => ({ role: h.role, parts: h.parts })),
      { role: 'user', parts: [{ text: newMessage }] }
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        systemInstruction: `You are "AI-INTIZOM", a strict but fair discipline coach. 
        Keep answers short (max 3 sentences), impactful, and motivating. 
        ${langInstruction}`,
      }
    });

    return response.text || fallback;
  } catch (error) {
    console.error("Error chatting with coach:", error);
    return fallback;
  }
};
