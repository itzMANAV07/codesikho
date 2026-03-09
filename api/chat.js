const OpenAI = require('openai');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { TranslateClient, TranslateTextCommand } = require('@aws-sdk/client-translate');
const { CloudWatchClient, PutMetricDataCommand } = require('@aws-sdk/client-cloudwatch');

// ── Groq AI
const openai = new OpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY || 'dummy-key',
});

// ── DynamoDB
const db = DynamoDBDocumentClient.from(new DynamoDBClient({
  region: 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
}));

// ── Amazon Translate
const translator = new TranslateClient({
  region: 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// ── CloudWatch
const cloudwatch = new CloudWatchClient({
  region: 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const systemPrompts = {
  en: 'You are CodeSikho AI. Keep responses SHORT (2-3 sentences). Explain coding errors clearly in ENGLISH.',
  hi: 'You are CodeSikho AI. Answer in HINDI in 2-3 sentences. Explain coding errors clearly.',
  ta: 'You are CodeSikho AI. Answer in TAMIL in 2-3 sentences.',
  te: 'You are CodeSikho AI. Answer in TELUGU in 2-3 sentences.',
  bn: 'You are CodeSikho AI. Answer in BENGALI in 2-3 sentences.',
  kn: 'You are CodeSikho AI. Answer in KANNADA in 2-3 sentences.',
  ml: 'You are CodeSikho AI. Answer in MALAYALAM in 2-3 sentences.',
};

async function saveToDynamoDB(userId, message, aiResponse, language) {
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
    console.log('✅ DynamoDB saved');
  } catch (err) {
    console.error('DynamoDB error:', err.message);
  }
}

async function translateWithAWS(text, targetLang) {
  if (targetLang === 'en') return text;
  try {
    const result = await translator.send(new TranslateTextCommand({
      Text: text,
      SourceLanguageCode: 'en',
      TargetLanguageCode: targetLang,
    }));
    console.log('✅ Amazon Translate done');
    return result.TranslatedText;
  } catch (err) {
    console.error('Translate error:', err.message);
    return text;
  }
}

async function logToCloudWatch(metric) {
  try {
    await cloudwatch.send(new PutMetricDataCommand({
      Namespace: 'CodeSikho/App',
      MetricData: [{
        MetricName: metric,
        Value: 1,
        Unit: 'Count',
        Timestamp: new Date(),
        Dimensions: [{ Name: 'Environment', Value: 'Production' }],
      }],
    }));
    console.log('✅ CloudWatch logged:', metric);
  } catch (err) {
    console.error('CloudWatch error:', err.message);
  }
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
    // 1. Groq AI response
    const messages = [
      { role: 'system', content: systemPrompts[language] || systemPrompts.en },
      ...history.slice(-6),
      { role: 'user', content: `${message}\n\n(Answer in 2-3 sentences max)` }
    ];

    const groqRes = await openai.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: messages,
      max_tokens: 300,
      temperature: 0.7,
    });

    let aiResponse = groqRes.choices[0].message.content;
    console.log('✅ Groq response received');

    // 2. Amazon Translate
    if (language !== 'en') {
      aiResponse = await translateWithAWS(aiResponse, language);
    }

    // 3. DynamoDB save
    await saveToDynamoDB(userId, message, aiResponse, language);

    // 4. CloudWatch log
    await logToCloudWatch('ChatRequest');

    res.status(200).json({ text: aiResponse, success: true });

  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: error.message, success: false });
  }
};