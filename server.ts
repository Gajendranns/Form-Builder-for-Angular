import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Multi-turn Gemini Chat API for Generating and Modifying Angular Forms
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, currentFormConfig, model = 'gemini-3.5-flash' } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const systemInstruction = `You are NgFormCraft AI, a world-class Angular Form Architect and senior engineer specializing in modern Angular 19+, Signal Forms (@angular/forms/signals), Reactive Forms, FormArrays, Zod validation, and modern component design systems (Tailwind UI, Angular Material 3, Spartan/shadcn UI, PrimeNG).

Your job is to converse with the user and generate, update, or refine complete, production-ready Angular form configurations.

Rules for response:
1. Always return a JSON object with:
   - "message": A clear, helpful, expert conversational explanation of the form layout, fields, Angular signals/validators, and UX decisions made.
   - "formConfig": A complete FormConfig JSON object (or null if the user's prompt is purely a general discussion with no form changes).

2. FormConfig structure:
   - "id": string (unique slug like "employee-onboarding", "gym-membership", etc.)
   - "title": string
   - "description": string
   - "layoutType": "single-page" | "multi-step"
   - "frameworkTarget": "angular-signal-form" | "angular-reactive-signals" | "tanstack-angular-form"
   - "uiFramework": "tailwind" | "material" | "shadcn" | "primeng"
   - "submitButtonText": string
   - "resetButtonText": string
   - "showResetButton": boolean
   - "fields": array of FormField objects:
     - "id": string (e.g. "f_1", "f_2")
     - "name": string (valid camelCase identifier e.g. "firstName", "emergencyContactPhone")
     - "label": string (human-readable title)
     - "type": "text" | "email" | "password" | "number" | "textarea" | "select" | "radio" | "checkbox" | "switch" | "slider" | "datepicker" | "rating" | "formarray" | "step"
     - "placeholder": string
     - "helperText": string
     - "colSpan": 12 | 6 | 4 | 8
     - "labelColor": optional hex (e.g. "#f43f5e")
     - "borderColor": optional hex
     - "textColor": optional hex
     - "placeholderColor": optional hex
     - "options": optional array of { "label": string, "value": string } for select or radio
     - "validation": { "required"?: boolean, "requiredMessage"?: string, "minLength"?: number, "maxLength"?: number, "min"?: number, "max"?: number, "pattern"?: string, "emailValidator"?: boolean }
     - "conditional": { "enabled": boolean, "fieldId": string, "operator": "equals" | "notEquals" | "contains" | "isTruthy", "value": string }
     - "children": array of FormField if type is 'step' (for multi-step) or 'formarray' (repeating items)
     - "arrayConfig": { "itemLabel": "Item", "addButtonText": "+ Add Item", "minItems": 1, "maxItems": 10 }
     - "stepTitle": string (if type is 'step')
     - "stepDescription": string (if type is 'step')

3. If the user provided an existing form configuration as context:
   - Preserve existing valid fields and apply requested additions, removals, renamings, column spans, or styling updates.
   - If they ask to switch to multi-step, wrap fields in logical 'step' containers.

Always respond in strictly valid JSON without markdown fences around the JSON object.`;

    // Construct multi-turn contents
    const contents: any[] = [];

    // Provide existing form as starting context if available
    if (currentFormConfig) {
      contents.push({
        role: 'user',
        parts: [
          {
            text: `[System Context: Here is the current form configuration in the builder]:\n${JSON.stringify(
              currentFormConfig
            )}`,
          },
        ],
      });
      contents.push({
        role: 'model',
        parts: [
          {
            text: JSON.stringify({
              message:
                'I have analyzed your current form layout and I am ready to modify or expand it according to your needs.',
              formConfig: null,
            }),
          },
        ],
      });
    }

    // Append conversation messages
    for (const msg of messages) {
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      });
    }

    const response = await ai.models.generateContent({
      model: model || 'gemini-3.5-flash',
      contents,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const text = response.text || '{}';
    let data: any = {};
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text, formConfig: null };
    }

    return res.json(data);
  } catch (error: any) {
    console.error('Gemini Chat API Error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to process chat message',
      message:
        'I encountered an error connecting to the AI model. Please verify your prompt and try again.',
    });
  }
});

// Vite middleware in dev, static files in production
async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
