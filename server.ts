import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'STEP Guide Academic Platform' });
});

// Gemini Vision OCR Endpoint for Study Plan Image Upload
app.post('/api/ocr-study-plan', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Missing imageBase64 data' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY is not configured on the server.',
        fallback: true
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Clean base64 string
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const prompt = `Analyze this image which contains a study schedule/table for English test preparation (STEP).
Extract all study days/tasks into a strictly structured JSON array.
Each element must have:
- dayName: string in Arabic (e.g. 'اليوم 1' or 'الأحد', 'الاثنين', etc.)
- title: clear description of study topics (e.g. 'Vocabulary: المفردات الأكاديمية + حل نموذج STEP 51')
- category: one of 'reading' | 'grammar' | 'listening' | 'vocabulary' | 'exam' | 'review' | 'rest'
- durationHours: number of hours (e.g. 1.5, 2, 3)
- notes: optional short Arabic note

Return ONLY valid JSON matching this schema:
{
  "planTitle": "string",
  "recommendedDays": number,
  "tasks": [
    {
      "dayName": "string",
      "title": "string",
      "category": "string",
      "durationHours": number,
      "notes": "string"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: cleanBase64,
                mimeType: mimeType || 'image/jpeg'
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json',
      }
    });

    const responseText = response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch {
      // Clean possible markdown code fences
      const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleaned);
    }

    return res.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error('Error in /api/ocr-study-plan:', error);
    return res.status(500).json({
      error: error.message || 'Failed to analyze schedule image via OCR',
      fallback: true
    });
  }
});

// Mount Vite middleware in development or serve static in production
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
