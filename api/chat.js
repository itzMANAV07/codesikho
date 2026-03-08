const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { TranslateClient, TranslateTextCommand } = require('@aws-sdk/client-translate');

const bedrockClient = new BedrockRuntimeClient({
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const dynamoClient = new DynamoDBClient({
  region: 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
const db = DynamoDBDocumentClient.from(dynamoClient);

const translateClient = new TranslateClient({
  region: 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const systemPrompts = {
  en: 'You are CodeSikho AI. Keep responses SHORT (2-3 sentences). Explain coding errors clearly in ENGLISH.',
  hi: 'You are CodeSikho AI. Answer in HINDI in 2-3 sentences. Explain coding errors clearly.',
  ta: 'You are CodeSikho AI. Answer in TAMIL in 2-3 sentences. Explain coding errors clearly.',
  te: 'You are CodeSikho AI. Answer in TELUGU in 2-3 sentences. Explain coding errors clearly.',
  bn: 'You are CodeSikho AI. Answer in BENGALI in 2-3 sentences. Explain coding errors clearly.',
  kn: 'You are CodeSikho AI. Answer in KANNADA in 2-3 sentences. Explain coding errors clearly.',
  ml: 'You are CodeSikho AI. Answer in MALAYALAM in 2-3 sentences. Explain coding errors clearly.',
};

async function saveChatMessage(userId, message, aiResponse, language) {
  try {
    await db.send(new PutCommand({
      TableName: 'ChatHistory',
      Item: {
        userId: userId,
        timestamp: Date.now(),
        message: message,
        aiResponse: aiResponse,
        language: language,
        createdAt: new Date().toISOString(),
      },
    }));
    console.log('✅ Saved to DynamoDB');
  } catch (err) {
    console.error('DynamoDB error:', err.message);
  }
}

async function translateText(text, targetLang) {
  if (targetLang === 'en') return text;
  try {
    const result = await translateClient.send(new TranslateTextCommand({
      Text: text,
      SourceLanguageCode: 'en',
      TargetLanguageCode: targetLang,
    }));
    console.log('✅ Translated with Amazon Translate');
    return result.TranslatedText;
  } catch (err) {
    console.error('Translate error:', err.message);
    return text;
  }
}

async function callBedrock(message, language, history) {
  const systemPrompt = systemPrompts[language] || systemPrompts.en;
  const historyText = history.slice(-6)
    .map(h => `${h.role === 'user' ? 'Human' : 'Assistant'}: ${h.content}`)
    .join('\n');

  const fullPrompt = `${systemPrompt}\n\n${historyText}\n\nHuman: ${message}\n\nAssistant:`;

  const command = new InvokeModelCommand({
    modelId: 'anthropic.claude-instant-v1',
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({
      prompt: fullPrompt,
      max_tokens_to_sample: 300,
      temperature: 0.7,
      stop_sequences: ['\n\nHuman:'],
    }),
  });

  const response = await bedrockClient.send(command);
  const body = JSON.parse(new TextDecoder().decode(response.body));
  return body.completion?.trim() || 'Sorry, I could not generate a response.';
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message, language = 'en', history = [], userId = 'guest' } = req.body;
  if (!message) return res.status(400).json({ error: 'Message required' });

  try {
    // 1. Call AWS Bedrock
    let aiResponse = await callBedrock(message, 'en', history);

    // 2. Translate with Amazon Translate if needed
    if (language !== 'en') {
      aiResponse = await translateText(aiResponse, language);
    }

    // 3. Save to DynamoDB
    await saveChatMessage(userId, message, aiResponse, language);

    res.status(200).json({ text: aiResponse, success: true });

  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: error.message, success: false });
  }
};