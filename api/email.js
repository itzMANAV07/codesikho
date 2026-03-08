const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

const sesClient = new SESClient({
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

  const { toEmail, userName = 'Coder' } = req.body;
  if (!toEmail) return res.status(400).json({ error: 'Email required' });

  try {
    await sesClient.send(new SendEmailCommand({
      Source: process.env.SES_FROM_EMAIL || 'noreply@codesikho.in',
      Destination: { ToAddresses: [toEmail] },
      Message: {
        Subject: { Data: '🎉 Welcome to CodeSikho!' },
        Body: {
          Html: {
            Data: `
              <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a0f1e;color:#fff;padding:40px;border-radius:12px;">
                <h1 style="color:#4ade80;">Welcome to CodeSikho! 🚀</h1>
                <p>Namaste <strong>${userName}</strong>! 🙏</p>
                <p>Your AI-powered multilingual coding tutor is ready.</p>
                <div style="background:#1e293b;padding:20px;border-radius:8px;margin:20px 0;">
                  <h3 style="color:#22d3ee;">You can now:</h3>
                  <ul>
                    <li>🤖 Ask coding questions in Hindi, Tamil, Telugu & more</li>
                    <li>🔊 Listen to AI explanations with Amazon Polly</li>
                    <li>🎤 Speak your questions using mic</li>
                    <li>💾 All chats saved with Amazon DynamoDB</li>
                  </ul>
                </div>
                <a href="https://codesikho-eight.vercel.app" 
                   style="background:linear-gradient(135deg,#4ade80,#3b82f6);color:white;padding:12px 30px;border-radius:8px;text-decoration:none;font-weight:bold;">
                  Start Learning Now 🚀
                </a>
                <p style="color:#475569;margin-top:30px;font-size:12px;">
                  Powered by AWS Bedrock · DynamoDB · Translate · Polly · SES
                </p>
              </div>
            `
          }
        }
      }
    }));

    console.log('✅ Welcome email sent via Amazon SES');
    res.status(200).json({ success: true });

  } catch (error) {
    console.error('SES error:', error.message);
    res.status(500).json({ error: error.message });
  }
};