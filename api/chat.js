const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');

// ── Bedrock client (only available in us-east-1)
const bedrockClient = new BedrockRuntimeClient({
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// ── DynamoDB client (Mumbai)
const dynamoClient = new DynamoDBClient({
  region: 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});
const db = DynamoDBDocumentClient.from(dynamoClient);

// ── System prompts (your original ones — kept exactly same)
const systemPrompts = {
  en: 'You are CodeSikho AI. Keep responses SHORT (2-3 sentences). Explain coding errors clearly in ENGLISH.',
  hi: 'आप CodeSikho AI हैं। जवाब छोटे रखें (2-3 वाक्य)। Coding errors को HINDI में explain करें।',
  ta: 'நீங்கள் CodeSikho AI. பதில்களை சிறியதாக வைக்கவும் (2-3 வாக்கியங்கள்). TAMIL-ல் விளக்குங்கள்.',
  te: 'మీరు CodeSikho AI. సమాధానాలు చిన్నగా ఉంచండి (2-3 వాక్యాలు). TELUGU లో explain చేయండి।',
  bn: 'আপনি CodeSikho AI। উত্তর ছোট রাখুন (২-৩ বাক্য)। BENGALI তে explain করুন।',
  kn: 'ನೀವು CodeSikho AI. ಉತ್ತರಗಳನ್ನು ಚಿಕ್ಕದಾಗಿ ಇರಿಸಿ (2-3 ವಾಕ್ಯಗಳು). KANNADA ನಲ್ಲಿ explain ಮಾಡಿ।',
  ml: 'നിങ്ങൾ CodeSikho AI. ഉത്തരങ്ങൾ ചെറുതാക്കുക (2-3 വാക്യങ്ങൾ). MALAYALAM ൽ explain ചെയ്യുക।'
};

// ── Save chat to DynamoDB
async function saveChatMessage(userId, message, aiResponse, language) {
  try {
    await db.send(new PutCommand({
      TableName: 'ChatHistory',
      Item: {
        userId: userId,
        timestamp: Date.now(),
        message: message,
        aiResponse: aiResponse,
        language: language
      }
    }));
  } catch (err) {
    console.error('DynamoDB save error:', err);
    // don't crash the app if saving fails
  }
}

// ── Main handler
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message, language = 'en', history = [], userId = 'guest' } = req.body;
  if (!message) return res.status(400).json({ error: 'Message required' });

  try {
    // ── Build prompt for Bedrock Claude
    const systemPrompt = systemPrompts[language] || systemPrompts.en;

    const prompt = `${systemPrompt}

Previous conversation:
${history.slice(-6).map(h => `${h.role}: ${h.content}`).join('\n')}

User: ${message}