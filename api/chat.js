const OpenAI = require('openai');

// ── Groq AI client
const openai = new OpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY || 'dummy-key',
});

const systemPrompts = {
  en: `You are CodeSikho AI, an expert coding assistant for Indian students and developers.
Explain coding concepts, debug errors, and write code clearly and thoroughly in ENGLISH.
Always give complete, well-explained answers. Include code examples when relevant.
Format code using proper markdown code blocks with language tags.`,

  hi: `You are CodeSikho AI, Indian students ke liye ek expert coding assistant.
Coding concepts clearly samjhao, errors debug karo, aur code likhne mein madad karo — sabkuch HINDI mein.
Poore aur achhe se samjhaye gaye jawab do. Jab zaroorat ho toh code examples bhi do.
Code ko proper markdown code blocks mein likho.`,

  ta: `You are CodeSikho AI, Indian மாணவர்களுக்கான expert coding assistant.
Coding concepts, errors மற்றும் code எழுதுவதை TAMIL இல் தெளிவாக விளக்குங்கள்.
முழுமையான மற்றும் நன்கு விளக்கப்பட்ட பதில்களை வழங்குங்கள். தேவைப்படும்போது code examples சேர்க்கவும்.`,

  te: `You are CodeSikho AI, Indian విద్యార్థులకు expert coding assistant.
Coding concepts, errors మరియు code రాయడాన్ని TELUGU లో స్పష్టంగా వివరించండి.
పూర్తి మరియు బాగా వివరించిన సమాధానాలు ఇవ్వండి. అవసరమైనప్పుడు code examples చేర్చండి.`,

  bn: `You are CodeSikho AI, Indian শিক্ষার্থীদের জন্য একজন expert coding assistant।
Coding concepts, errors এবং code লেখা BENGALI তে স্পষ্টভাবে ব্যাখ্যা করুন।
সম্পূর্ণ এবং ভালোভাবে ব্যাখ্যা করা উত্তর দিন। প্রয়োজনে code examples যোগ করুন।`,

  kn: `You are CodeSikho AI, Indian ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ expert coding assistant.
Coding concepts, errors ಮತ್ತು code ಬರೆಯುವುದನ್ನು KANNADA ದಲ್ಲಿ ಸ್ಪಷ್ಟವಾಗಿ ವಿವರಿಸಿ.
ಸಂಪೂರ್ಣ ಮತ್ತು ಚೆನ್ನಾಗಿ ವಿವರಿಸಿದ ಉತ್ತರಗಳನ್ನು ನೀಡಿ. ಅಗತ್ಯವಿದ್ದಾಗ code examples ಸೇರಿಸಿ.`,

  ml: `You are CodeSikho AI, Indian വിദ്യാർത്ഥികൾക്കുള്ള expert coding assistant.
Coding concepts, errors, code എഴുതൽ എന്നിവ MALAYALAM ൽ വ്യക്തമായി വിശദീകരിക്കുക.
പൂർണ്ണവും നന്നായി വിശദീകരിച്ചതുമായ ഉത്തരങ്ങൾ നൽകുക. ആവശ്യമുള്ളപ്പോൾ code examples ചേർക്കുക.`,
};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message, language = 'en', history = [] } = req.body;
  if (!message) return res.status(400).json({ error: 'Message required' });

  try {
    const messages = [
      { role: 'system', content: systemPrompts[language] || systemPrompts.en },
      ...history.slice(-10),
      { role: 'user', content: message }
    ];

    const groqRes = await openai.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: messages,
      max_tokens: 2048,
      temperature: 0.7,
    });

    const aiResponse = groqRes.choices[0].message.content;
    console.log('✅ Groq response received');

    res.status(200).json({ text: aiResponse, success: true });

  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: error.message, success: false });
  }
};