import OpenAI from 'openai';
import { getSystemPrompt } from './languages';

const openai = new OpenAI({
  baseURL: 'https://api.groq.com/openai/v1', // ✅ Added for Groq
  apiKey: process.env.REACT_APP_GROQ_API_KEY, // ✅ Changed env variable
  dangerouslyAllowBrowser: true
});

export const getAIResponse = async (userMessage, language = 'en', conversationHistory = []) => {
  try {
    const systemPrompt = getSystemPrompt(language);
    
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-6),
      { role: 'user', content: userMessage }
    ];

    const response = await openai.chat.completions.create({
      model: "openai/gpt-oss-120b", // ✅ Changed model
      messages: messages,
      max_tokens: 1000,
      temperature: 0.7
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('AI Error:', error);
    
    if (error.status === 401) {
      return 'API Key Error: Please check your Groq API key in the .env file.';
    }
    
    if (error.status === 429) {
      return 'Rate limit exceeded. Please wait a moment and try again.';
    }
    
    return `Error: ${error.message}. Please try again.`;
  }
};