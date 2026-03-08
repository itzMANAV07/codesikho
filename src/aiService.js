export const getAIResponse = async (userMessage, language = 'en', conversationHistory = []) => {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userMessage,
        language: language,
        history: conversationHistory,
        userId: 'guest-user'
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'API error');
    }

    const data = await response.json();
    return data.text;

  } catch (error) {
    console.error('AI Error:', error);
    return `Error: ${error.message}. Please try again.`;
  }
};