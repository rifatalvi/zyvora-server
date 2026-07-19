import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { AuthRequest } from '../middleware/authMiddleware';
import Item from '../models/Item';

// Initialize the Gemini SDK
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// ── POST /api/ai/generate-content ──────────────────────────────
export const generateContent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, shortDescription, category } = req.body;

    if (!title) {
      res.status(400).json({ success: false, message: 'Title is required to generate content' });
      return;
    }

    const prompt = `
      You are an expert course creator. Write a compelling, detailed, and structured "full description" 
      for a course titled "${title}". 
      ${shortDescription ? `The short description is: "${shortDescription}".` : ''}
      ${category ? `The category is: "${category}".` : ''}
      
      Format the output in clean, readable text with paragraphs. Do not use markdown syntax like ** or #, 
      just return plain text paragraphs separated by newlines. Ensure it sounds professional, engaging, 
      and highlights what the student will learn.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });

    const generatedText = response.text || '';

    res.status(200).json({
      success: true,
      data: generatedText,
    });
  } catch (error) {
    console.error('AI Generation error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate content' });
  }
};

// ── GET /api/ai/recommendations ────────────────────────────────
export const getRecommendations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // 1. Fetch some items from the database (e.g., top rated or random)
    const items = await Item.find({ isPublished: true }).limit(10).select('title category difficulty averageRating');

    if (items.length === 0) {
      res.status(200).json({ success: true, recommendedItems: [] });
      return;
    }

    // 2. We can simulate AI reasoning for recommendations
    // In a real app, you'd pass user interests. For now, we'll ask Gemini to pick the top 3 best courses
    // from this list for a general learner.
    const itemListString = items.map(i => `ID: ${i._id} | Title: ${i.title} | Category: ${i.category}`).join('\n');
    
    const prompt = `
      You are an AI career mentor. Based on the following list of available courses:
      ${itemListString}
      
      Select exactly 3 course IDs that you would recommend as the most essential for someone looking to upscale their skills in tech or business.
      Return ONLY a JSON array of the 3 IDs. For example: ["id1", "id2", "id3"]. Do not include any other text or markdown block.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });

    let rawText = response.text || '';
    // Clean up potential markdown blocks if the model ignores the instruction
    rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let recommendedIds: string[] = [];
    try {
      recommendedIds = JSON.parse(rawText);
    } catch (parseError) {
      console.error('Failed to parse Gemini response as JSON:', rawText);
      // Fallback: just return the first 3
      recommendedIds = items.slice(0, 3).map(i => i._id.toString());
    }

    // 3. Fetch the full details of the recommended items
    const recommendedItems = await Item.find({ _id: { $in: recommendedIds } })
      .populate('instructor', 'name avatar');

    res.status(200).json({
      success: true,
      recommendedItems,
    });
  } catch (error) {
    console.error('AI Recommendations error:', error);
    res.status(500).json({ success: false, message: 'Failed to get recommendations' });
  }
};

// ── POST /api/ai/chat ──────────────────────────────────────────
export const chatWithJarvis = async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, image } = req.body;

    if (!message && !image) {
      res.status(400).json({ success: false, message: 'Message or image is required' });
      return;
    }

    const systemPrompt = `
You are Jarvis, an AI assistant for Zyvora. 
Zyvora is an AI-Powered Learning Platform connecting ambitious learners with world-class courses and mentors.
You can answer questions about the platform, courses, or help analyze images if the user provides one.
Be helpful, concise, and friendly.
`;

    const contents: any[] = [{ text: systemPrompt }];

    if (message) {
      contents.push({ text: `User message: ${message}` });
    }

    if (image) {
      const match = image.match(/^data:(image\/[a-zA-Z+.-]+);base64,(.+)$/);
      if (match) {
        contents.push({
          inlineData: {
            mimeType: match[1],
            data: match[2],
          },
        });
      } else {
        console.warn('Invalid base64 image format received');
      }
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: contents,
    });

    const generatedText = response.text || 'I am sorry, I could not generate a response.';

    res.status(200).json({
      success: true,
      data: generatedText,
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ success: false, message: 'Failed to chat with Jarvis' });
  }
};
