const OpenAI = require('openai');

// ── Groq AI client
const openai = new OpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY || 'dummy-key',
});

const systemPrompts = {
  en: `You are CodeSikho AI, an expert coding assistant for Indian students.
IMPORTANT: You MUST reply ONLY in ENGLISH. Do not use any other language.
Explain coding concepts clearly and thoroughly. Always give complete answers with code examples when relevant.
Format code using proper markdown code blocks with language tags.`,

  hi: `You are CodeSikho AI, Indian students ke liye ek expert coding assistant.
IMPORTANT: Aapko SIRF HINDI mein jawab dena hai. Koi bhi English sentence mat likho. Poora jawab Hindi mein hona chahiye.
Coding concepts clearly samjhao, errors debug karo, aur code likhne mein madad karo.
Poore aur detail mein jawab do. Jab zaroorat ho toh code examples bhi do.
Code ko proper markdown code blocks mein likho.`,

  ta: `You are CodeSikho AI, Indian students korana expert coding assistant.
IMPORTANT: Neenga MUZHUKKAMAAGA TAMIL-la mattum badhil solanum. Vera ethuvum Tamil-la illama sollama.
Coding concepts, errors, code ellathayum Tamil-la theliva vilakkunga.
Muzhumaiyana, nalla vilakkamana badhilgal thanga. Thevaipaddum pothu code examples serkkavum.
Code-ai proper markdown code blocks-la ezhuthavum.`,

  te: `You are CodeSikho AI, Indian విద్యార్థులకు expert coding assistant.
IMPORTANT: మీరు తప్పనిసరిగా TELUGU లో మాత్రమే సమాధానం ఇవ్వాలి. ఏ ఇతర భాష వాడకండి.
Coding concepts, errors మరియు code రాయడాన్ని Telugu లో స్పష్టంగా వివరించండి.
పూర్తి మరియు వివరణాత్మక సమాధానాలు ఇవ్వండి. అవసరమైనప్పుడు code examples చేర్చండి.
Code ని proper markdown code blocks లో రాయండి.`,

  bn: `You are CodeSikho AI, Indian শিক্ষার্থীদের জন্য expert coding assistant।
IMPORTANT: আপনাকে অবশ্যই শুধুমাত্র BENGALI তে উত্তর দিতে হবে। অন্য কোনো ভাষা ব্যবহার করবেন না।
Coding concepts, errors এবং code লেখা Bengali তে স্পষ্টভাবে ব্যাখ্যা করুন।
সম্পূর্ণ এবং বিস্তারিত উত্তর দিন। প্রয়োজনে code examples যোগ করুন।
Code proper markdown code blocks এ লিখুন।`,

  kn: `You are CodeSikho AI, Indian ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ expert coding assistant.
IMPORTANT: ನೀವು ಕಡ್ಡಾಯವಾಗಿ ಕೇವಲ KANNADA ದಲ್ಲಿ ಮಾತ್ರ ಉತ್ತರಿಸಬೇಕು. ಬೇರೆ ಯಾವುದೇ ಭಾಷೆ ಬಳಸಬೇಡಿ.
Coding concepts, errors ಮತ್ತು code ಬರೆಯುವುದನ್ನು Kannada ದಲ್ಲಿ ಸ್ಪಷ್ಟವಾಗಿ ವಿವರಿಸಿ.
ಸಂಪೂರ್ಣ ಮತ್ತು ವಿವರವಾದ ಉತ್ತರಗಳನ್ನು ನೀಡಿ. ಅಗತ್ಯವಿದ್ದಾಗ code examples ಸೇರಿಸಿ.
Code ಅನ್ನು proper markdown code blocks ನಲ್ಲಿ ಬರೆಯಿರಿ.`,

  ml: `You are CodeSikho AI, Indian വിദ്യാർത്ഥികൾക്കുള്ള expert coding assistant.
IMPORTANT: നിങ്ങൾ നിർബന്ധമായും MALAYALAM ൽ മാത്രം മറുപടി നൽകണം. മറ്റൊരു ഭാഷയും ഉപയോഗിക്കരുത്.
Coding concepts, errors, code എഴുതൽ എന്നിവ Malayalam ൽ വ്യക്തമായി വിശദീകരിക്കുക.
പൂർണ്ണവും വിശദവുമായ ഉത്തരങ്ങൾ നൽകുക. ആവശ്യമുള്ളപ്പോൾ code examples ചേർക്കുക.
Code proper markdown code blocks ൽ എഴുതുക.`,
};

const langNames = {
  hi: 'Hindi',
  ta: 'Tamil',
  te: 'Telugu',
  bn: 'Bengali',
  kn: 'Kannada',
  ml: 'Malayalam',
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
    // For non-English, append a strong reminder in the user message too
    const userContent = language !== 'en'
      ? `${message}\n\n[IMPORTANT: Reply completely in ${langNames[language] || language} only. Do NOT use English.]`
      : message;

    const messages = [
      { role: 'system', content: systemPrompts[language] || systemPrompts.en },
      ...history.slice(-10),
      { role: 'user', content: userContent }
    ];

    const groqRes = await openai.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
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