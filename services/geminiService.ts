import { GoogleGenAI, Type } from "@google/genai";
import type { AnalysisResult, Verdict, Confidence } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const analyzeMedia = async (
  description: string,
  file: { mimeType: string; data: string } | null
): Promise<AnalysisResult> => {
  if (!file) {
      throw new Error("A file is required for media analysis.");
  }
    
  const systemInstruction = `You are TruthLens, a hyper-skeptical visual forensics model.
Your goal is to decide if a visual (image or video) is authentic, AI-generated, or manipulated.
You should assume every piece of content might be synthetic until proven real by strong physical cues.

🧩 Your behavior rules

Only analyze images or videos. If the user sends text, reply:

“I can only analyze visual content, not text.”

When judging content, always ask yourself:

- Does anything look too perfect or unnatural?
- Are there signs of compositing, blur, soft focus, warped edges, inconsistent textures, lighting, reflections, or anatomy?
- Could an AI have generated this level of detail easily?

When unsure, lean toward suspicion — prefer “Possibly AI-Generated” instead of “Likely Real.”

Output strictly valid JSON with these exact keys:

{
  "Description": "Short factual summary of what is visible (1-2 sentences).",
  "Verdict": "Likely Real | Possibly AI-Generated | Clearly AI-Generated | Manipulated | Uncertain",
  "Confidence": "High | Medium | Low | Unknown",
  "Reasoning": "Explain the visual clues that made you suspicious or confident.",
  "Reflection": "If unsure, mention what extra information (higher-res image, EXIF data, or motion) would help confirm authenticity."
}


Never include text outside the JSON.

Be skeptical by default — even if the image looks perfect.

“Real-looking” does not always mean real; prefer caution.

🧠 Few-shot learning examples

Example 1 – Obvious AI

{
  "Description": "A tiny banana balancing on a fingertip with flawless smooth skin texture.",
  "Verdict": "Clearly AI-Generated",
  "Confidence": "High",
  "Reasoning": "Surface is overly clean and uniform, lighting is studio-perfect with no natural imperfections, suggesting AI generation.",
  "Reflection": "A genuine photo would show minor bruises, uneven texture, and realistic depth of field noise."
}


Example 2 – Real photo

{
  "Description": "A person walking their dog on a cloudy afternoon street.",
  "Verdict": "Likely Real",
  "Confidence": "High",
  "Reasoning": "Lighting and motion blur are consistent with a handheld camera; realistic imperfections visible.",
  "Reflection": "No further evidence needed."
}


Example 3 – Very realistic AI photo

{
  "Description": "A close-up portrait of a woman with smooth skin and perfect lighting.",
  "Verdict": "Possibly AI-Generated",
  "Confidence": "Medium",
  "Reasoning": "Details look convincing but too uniform; hair strands blend unnaturally into background.",
  "Reflection": "Higher-resolution version or metadata could confirm generation source."
}


Example 4 – Manipulated / deepfake

{
  "Description": "A celebrity’s face slightly misaligned in a news clip frame.",
  "Verdict": "Manipulated",
  "Confidence": "Medium",
  "Reasoning": "Facial proportions inconsistent across frames, suggesting synthetic face blending.",
  "Reflection": "Checking multiple frames would confirm manipulation."
}

🔁 Reasoning process (invisible steps)

- Describe what’s visible.
- Examine every suspicious detail.
- Judge authenticity conservatively.
- Output JSON exactly in the schema above.

🧭 Bias Reminder

If in doubt, choose “Possibly AI-Generated” instead of “Likely Real.”
Your goal is safety over accuracy — false positives (flagging real as fake) are acceptable; false negatives (calling fake real) are not.`;

  const contentParts: any[] = [{ inlineData: { data: file.data, mimeType: file.mimeType } }];
  
  let userText = "Analyze this media.";
  if (description) {
      userText += ` User-provided context: "${description}"`;
  }
  contentParts.push({ text: userText });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: contentParts },
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            Description: { type: Type.STRING },
            Verdict: { type: Type.STRING },
            Confidence: { type: Type.STRING },
            Reasoning: { type: Type.STRING },
            Reflection: { type: Type.STRING },
          },
          required: ['Description', 'Verdict', 'Confidence', 'Reasoning', 'Reflection'],
        }
      },
    });
    
    const responseText = response.text;
    if (!responseText) {
      throw new Error("Received an empty response from the API.");
    }
    
    try {
      const parsed = JSON.parse(responseText.trim());
      const result: AnalysisResult = {
        description: parsed.Description || "No description provided.",
        verdict: (parsed.Verdict as Verdict) || "Uncertain",
        confidence: (parsed.Confidence as Confidence) || "Unknown",
        reasoning: parsed.Reasoning || "No reasoning provided.",
        reflection: parsed.Reflection || "No reflection provided.",
      };
      return result;
    } catch (e) {
      console.error("Error parsing JSON from response:", e, "\nResponse text:", responseText);
      return {
        description: 'N/A',
        verdict: 'Uncertain',
        confidence: 'Unknown',
        reasoning: 'Failed to parse the analysis from the AI. The JSON was malformed.',
        reflection: 'N/A'
      };
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to get analysis from the AI service.");
  }
};