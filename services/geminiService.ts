import { GoogleGenAI, Type, Schema } from "@google/genai";
import { KnowledgeCard, TurnData } from "../types";

// Initialize the API client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-2.5-flash';

// Schema for card generation
const cardsSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    cards: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          reasoning: { type: Type.STRING },
          icon: { type: Type.STRING, description: "A single emoji representing the concept" }
        },
        required: ["id", "title", "description", "reasoning", "icon"]
      }
    }
  },
  required: ["cards"]
};

// Schema for final summary
const summarySchema: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING },
    keyTakeaways: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    title: { type: Type.STRING }
  },
  required: ["summary", "keyTakeaways", "title"]
};

export const generateInitialCards = async (topic: string): Promise<KnowledgeCard[]> => {
  const prompt = `
    The user wants to explore the topic: "${topic}".
    This is the start of an 8-round knowledge exploration game.
    Generate 3 distinct starting concepts or branches related to "${topic}".
    Ensure they are diverse and interesting.
    The 'id' should be unique (e.g., 'round1-opt1').
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: cardsSchema,
        systemInstruction: "You are a specialized Knowledge Graph Architect. Your goal is to guide a user through a topic by offering branching paths of learning."
      }
    });

    const data = JSON.parse(response.text || '{"cards": []}');
    return data.cards;
  } catch (error) {
    console.error("Error generating initial cards:", error);
    throw error;
  }
};

export const generateNextCards = async (
  topic: string, 
  history: TurnData[], 
  currentRound: number
): Promise<KnowledgeCard[]> => {
  const previousTurn = history[history.length - 1];
  const selected = previousTurn.selectedCard;

  const pathSummary = history.map(h => `${h.selectedCard?.title}`).join(" -> ");

  const prompt = `
    Context:
    - Main Topic: "${topic}"
    - Current Path: ${pathSummary}
    - Just Selected: "${selected?.title}" (${selected?.description})
    - Current Round: ${currentRound} of 8.

    Task:
    Generate 3 new sub-concepts, deeper dives, or related tangential topics based specifically on the choice of "${selected?.title}".
    These should represent the next logical step in learning or exploring this branch.
    The 'id' should be 'round${currentRound}-opt1', etc.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: cardsSchema,
        systemInstruction: "You are a Knowledge Guide. Maintain continuity but introduce novelty. If it's the final round (8), these cards should represent conclusions or final mastery concepts."
      }
    });

    const data = JSON.parse(response.text || '{"cards": []}');
    return data.cards;
  } catch (error) {
    console.error("Error generating next cards:", error);
    throw error;
  }
};

export interface SummaryResult {
  summary: string;
  keyTakeaways: string[];
  title: string;
}

export const generateSummary = async (topic: string, history: TurnData[]): Promise<SummaryResult> => {
  const pathDetails = history.map((h, i) => `Round ${i + 1}: Chosen "${h.selectedCard?.title}" (Context: ${h.selectedCard?.description})`).join("\n");

  const prompt = `
    Analyze this learning path:
    Topic: ${topic}
    Path:
    ${pathDetails}

    Create a cohesive summary of this knowledge journey. Give the journey a cool title. List 3-5 key takeaways.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: summarySchema
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Error generating summary:", error);
    return {
      title: "Journey Complete",
      summary: "We successfully navigated the knowledge graph.",
      keyTakeaways: ["Exploration complete"]
    };
  }
};
