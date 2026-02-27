const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': 'https://codesikho-zppi.vercel.app',
    'X-Title': 'CodeSikho'
  }
});

const systemPrompts = {
  en: `You are CodeSikho AI. Keep ALL responses SHORT and CONCISE (2-3 sentences max).
- Explain errors briefly
- Give minimal code examples
- Be direct
Respond in ENGLISH.`,

  hi: `आप CodeSikho AI हैं। सभी जवाब छोटे और संक्षिप्त रखें (2-3 वाक्य)।
- Errors को briefly explain करें
- Minimal code examples दें
- Direct रहें
HINDI में जवाब दें।`,

  ta: `நீங்கள் CodeSikho AI. எல்லா பதில்களும் சிறியதாக வைக்கவும் (2-3 வாக்கியங்கள்).
- Errors-ஐ சுருக்கமாக விளக்கவும்
- குறைந்த code examples
- நேரடியாக
TAMIL-ல் பதிலளியுங்கள்.`,

  te: `మీరు CodeSikho AI. అన్ని సమాధానాలు చిన్నగా ఉంచండి (2-3 వాక్యాలు).
- Errors ను briefly explain చేయండి
- తక్కువ code examples
- నేరుగా
TELUGU లో సమాధానం ఇవ్వండి।`,

  bn: `আপনি CodeSikho AI। সব উত্তর ছোট রাখুন (২-৩ বাক্য)।
- Errors সংক্ষেপে explain করুন
- কম code examples
- সরাসরি
BENGALI তে উত্তর দিন।`,

  kn: `ನೀವು CodeSikho AI. ಎಲ್ಲಾ ಉತ್ತರಗಳನ್ನು ಚಿಕ್ಕದಾಗಿ ಇರಿಸಿ (2-3 ವಾಕ್ಯಗಳು).
- Errors ಅನ್ನು ಸಂಕ್ಷಿಪ್ತವಾಗಿ explain ಮಾಡಿ
- ಕಡಿಮೆ code examples
- ನೇರವಾಗಿ
KANNADA ನಲ್ಲಿ ಉತ್ತರಿಸಿ।`,

  ml: `നിങ്ങൾ CodeSikho AI. എല്ലാ ഉത്തരങ്ങളും ചെറുതാക്കുക (2-3 വാക്യങ്ങൾ).
- Errors സംക്ഷിപ്തമായി explain ചെയ്യുക
- കുറച്ച് code examples
- നേരിട്ട്
MALAYALAM ൽ ഉത്തരം നൽകുക।`
};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, language = 'en', history = [] } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const systemPrompt = systemPrompts[language] || systemPrompts.en;
    
    // Add concise instruction to user message
    const conciseMessage = `${message}\n\n(Answer in 2-3 sentences max)`;
    
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-6),
      { role: 'user', content: conciseMessage }
    ];

    const response = await openai.chat.completions.create({
      model: 'openai/gpt-oss-120b',
      messages: messages,
      max_tokens: 300,  // SHORT responses
      temperature: 0.7
    });

    res.status(200).json({ 
      text: response.choices[0].message.content,
      success: true 
    });

  } catch (error) {
    console.error('AI Error:', error);
    res.status(500).json({ 
      error: error.message,
      success: false 
    });
  }
};