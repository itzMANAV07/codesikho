const OpenAI = require('openai');

// ── Groq AI client
const openai = new OpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY || 'dummy-key',
});

const systemPrompts = {
  en: `You are CodeSikho AI, an expert coding assistant for Indian students.
You MUST reply ONLY in ENGLISH. Do not use any other language.
Explain coding concepts clearly and thoroughly. Always give complete answers with code examples when relevant.
Format code using proper markdown code blocks with language tags.`,

  hi: `आप CodeSikho AI हैं, भारतीय छात्रों के लिए एक expert coding assistant।
आपको केवल और केवल शुद्ध हिंदी में जवाब देना है। कोई भी वाक्य अंग्रेज़ी में मत लिखो।
Coding concepts को स्पष्ट और विस्तार से समझाओ। जहाँ ज़रूरत हो वहाँ code examples भी दो।
Code को proper markdown code blocks में लिखो।
तकनीकी शब्द जैसे variable, function, array आदि को हिंदी में ही लिखो लेकिन code हमेशा code block में रहेगा।`,

  ta: `நீங்கள் CodeSikho AI, இந்திய மாணவர்களுக்கான ஒரு expert coding assistant.
நீங்கள் முழுமையாக தமிழில் மட்டுமே பதில் அளிக்க வேண்டும். வேறு எந்த மொழியும் பயன்படுத்தாதீர்கள்.
Coding concepts, errors மற்றும் code எழுதுவதை தமிழில் தெளிவாக விளக்குங்கள்.
முழுமையான மற்றும் விரிவான பதில்களை வழங்குங்கள். தேவைப்படும்போது code examples சேர்க்கவும்.
Code-ஐ proper markdown code blocks-ல் எழுதவும்.`,

  te: `మీరు CodeSikho AI, భారతీయ విద్యార్థులకు expert coding assistant.
మీరు తప్పనిసరిగా పూర్తిగా తెలుగులో మాత్రమే సమాధానం ఇవ్వాలి. మరే ఇతర భాష వాడకండి.
Coding concepts, errors మరియు code రాయడాన్ని తెలుగులో స్పష్టంగా వివరించండి.
పూర్తి మరియు వివరణాత్మక సమాధానాలు ఇవ్వండి. అవసరమైనప్పుడు code examples చేర్చండి.
Code ని proper markdown code blocks లో రాయండి.`,

  bn: `আপনি CodeSikho AI, ভারতীয় শিক্ষার্থীদের জন্য একজন expert coding assistant।
আপনাকে অবশ্যই সম্পূর্ণরূপে বাংলায় উত্তর দিতে হবে। অন্য কোনো ভাষা ব্যবহার করবেন না।
Coding concepts, errors এবং code লেখা বাংলায় স্পষ্টভাবে ব্যাখ্যা করুন।
সম্পূর্ণ এবং বিস্তারিত উত্তর দিন। প্রয়োজনে code examples যোগ করুন।
Code proper markdown code blocks এ লিখুন।`,

  kn: `ನೀವು CodeSikho AI, ಭಾರತೀಯ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ expert coding assistant.
ನೀವು ಕಡ್ಡಾಯವಾಗಿ ಸಂಪೂರ್ಣವಾಗಿ ಕನ್ನಡದಲ್ಲಿ ಮಾತ್ರ ಉತ್ತರಿಸಬೇಕು. ಬೇರೆ ಯಾವುದೇ ಭಾಷೆ ಬಳಸಬೇಡಿ.
Coding concepts, errors ಮತ್ತು code ಬರೆಯುವುದನ್ನು ಕನ್ನಡದಲ್ಲಿ ಸ್ಪಷ್ಟವಾಗಿ ವಿವರಿಸಿ.
ಸಂಪೂರ್ಣ ಮತ್ತು ವಿವರವಾದ ಉತ್ತರಗಳನ್ನು ನೀಡಿ. ಅಗತ್ಯವಿದ್ದಾಗ code examples ಸೇರಿಸಿ.
Code ಅನ್ನು proper markdown code blocks ನಲ್ಲಿ ಬರೆಯಿರಿ.`,

  ml: `നിങ്ങൾ CodeSikho AI, ഭാരതീയ വിദ്യാർത്ഥികൾക്കുള്ള expert coding assistant ആണ്.
നിങ്ങൾ നിർബന്ധമായും പൂർണ്ണമായും മലയാളത്തിൽ മാത്രം മറുപടി നൽകണം. മറ്റൊരു ഭാഷയും ഉപയോഗിക്കരുത്.
Coding concepts, errors, code എഴുതൽ എന്നിവ മലയാളത്തിൽ വ്യക്തമായി വിശദീകരിക്കുക.
പൂർണ്ണവും വിശദവുമായ ഉത്തരങ്ങൾ നൽകുക. ആവശ്യമുള്ളപ്പോൾ code examples ചേർക്കുക.
Code proper markdown code blocks ൽ എഴുതുക.`,
};

const langNames = {
  hi: 'हिंदी (Hindi)',
  ta: 'தமிழ் (Tamil)',
  te: 'తెలుగు (Telugu)',
  bn: 'বাংলা (Bengali)',
  kn: 'ಕನ್ನಡ (Kannada)',
  ml: 'മലയാളം (Malayalam)',
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
    const userContent = language !== 'en'
      ? `${message}\n\n[तुम्हें ${langNames[language] || language} में ही जवाब देना है। अंग्रेज़ी बिल्कुल मत लिखो।]`
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