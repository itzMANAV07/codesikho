const { PollyClient, SynthesizeSpeechCommand } = require('@aws-sdk/client-polly');

const pollyClient = new PollyClient({
  region: 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { text, language = 'en' } = req.body;
  if (!text) return res.status(400).json({ error: 'Text required' });

  try {
    const command = new SynthesizeSpeechCommand({
      Text: text.slice(0, 1500),
      OutputFormat: 'mp3',
      VoiceId: 'Aditi',
      Engine: 'standard',
    });

    const response = await pollyClient.send(command);

    const chunks = [];
    for await (const chunk of response.AudioStream) {
      chunks.push(chunk);
    }
    const audioBuffer = Buffer.concat(chunks);

    res.setHeader('Content-Type', 'audio/mpeg');
    res.status(200).send(audioBuffer);
    console.log('✅ Polly audio generated');

  } catch (error) {
    console.error('Polly error:', error.message);
    res.status(500).json({ error: error.message });
  }
};