import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client lazily/safely on server
let genAI: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!genAI && process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAI;
}

// API Health
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", aiAvailable: !!process.env.GEMINI_API_KEY });
});

// Generate dynamic ЕГЭ punctuation question using Gemini
app.post("/api/generate-question", async (req, res) => {
  try {
    const ai = getGenAI();
    const taskType = req.body.taskType || "16"; // 16, 17, 18, 19, 20, 21

    if (!ai) {
      return res.status(503).json({
        error: "AI service not configured with API key. Using built-in question database.",
      });
    }

    const prompt = `Сгенерируй ОДНО уникальное, качественное задание ЕГЭ по русскому языку на тему пунктуации.
Номер задания: ${taskType}.
Требования:
- Задание ${taskType} строго соответствует реальному формату ЕГЭ.
- Задания 16-20: Предложение (или 2 предложения для 16) с цифрами в скобках [1], [2], [3], [4], [5] в местах возможных запятых.
- Задание 21: Текст из 5-7 пронумерованных предложений (1), (2), (3)... для анализа правила (например, тире между подлежащим и сказуемым, тире в БСП, двоеточие в БСП, запятая при причастном обороте и т.д.).
- Верни строго JSON со следующей структурой:
For tasks 16-20:
{
  "taskNumber": ${taskType},
  "type": "numbers",
  "title": "Задание ${taskType} ЕГЭ. Пунктуация",
  "instruction": "Расставьте знаки препинания. Укажите цифры, на месте которых должны стоять запятые.",
  "sentence": "Предложение с цифрами типа [1], [2], [3]...",
  "options": [
    {"num": 1, "rule": "Объяснение, нужна ли запятая"},
    {"num": 2, "rule": "Объяснение"}
  ],
  "correctAnswer": [1, 3], // массив чисел
  "ruleDescription": "Подробный филологический разбор правила с примерами.",
  "difficulty": "средний"
}

For task 21:
{
  "taskNumber": 21,
  "type": "sentences",
  "title": "Задание 21 ЕГЭ. Пунктуационный анализ",
  "instruction": "Найдите предложения, в которых ТИРЕ (или ДВОЕТОЧИЕ или ЗАПЯТАЯ) ставится в соответствии с одним и тем же правилом пунктуации.",
  "targetPunctuation": "ТИРЕ", // или "ДВОЕТОЧИЕ" или "ЗАПЯТАЯ"
  "sentencesList": [
    {"num": 1, "text": "Текст первого предложения..."},
    {"num": 2, "text": "Текст второго..."}
  ],
  "correctAnswer": [1, 3, 5], // номера предложений
  "ruleName": "Тире между подлежащим и сказуемым",
  "ruleDescription": "Подробное объяснение правила пунктуационного анализа.",
  "difficulty": "сложный"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from Gemini");
    }

    const questionData = JSON.parse(text);
    return res.json({ question: questionData });
  } catch (err: any) {
    console.error("Error generating question via Gemini:", err);
    return res.status(500).json({ error: "Failed to generate AI question", details: err.message });
  }
});

// Explain mistake AI endpoint
app.post("/api/explain-mistake", async (req, res) => {
  try {
    const ai = getGenAI();
    if (!ai) {
      return res.status(503).json({ error: "AI service unavailable" });
    }

    const { question, userAnswer, correctAnswer } = req.body;

    const prompt = `Ты — добрый, опытный эксперт ЕГЭ по русскому языку.
Ученик совершил ошибку в задании по пунктуации.
Задание: ${JSON.stringify(question)}
Ответ ученика: ${JSON.stringify(userAnswer)}
Правильный ответ: ${JSON.stringify(correctAnswer)}

Дай понятное, вдохновляющее и лаконичное объяснение ошибки на русском языке (2-3 коротких абзаца):
1. В чём именно заключается ошибка ученика.
2. Какое именно правило ЕГЭ тут работает и как его легко запомнить (лайфхак/мнемоника).
3. Подбадривание в стиле азартного казино ("В следующий раз сорвёшь куш!").`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    return res.json({ explanation: response.text });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to get explanation", details: err.message });
  }
});

// Start Server with Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🎰 Казино Пунктуации ЕГЭ запущен на http://localhost:${PORT}`);
  });
}

startServer();
