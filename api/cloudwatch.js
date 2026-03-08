const { CloudWatchClient, PutMetricDataCommand } = require('@aws-sdk/client-cloudwatch');

const cloudwatchClient = new CloudWatchClient({
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

  const { metric = 'ChatRequest', value = 1 } = req.body || {};

  try {
    await cloudwatchClient.send(new PutMetricDataCommand({
      Namespace: 'CodeSikho/App',
      MetricData: [{
        MetricName: metric,
        Value: value,
        Unit: 'Count',
        Timestamp: new Date(),
        Dimensions: [{
          Name: 'Environment',
          Value: 'Production'
        }],
      }],
    }));

    console.log('✅ CloudWatch metric logged:', metric);
    res.status(200).json({ success: true, metric });

  } catch (error) {
    console.error('CloudWatch error:', error.message);
    res.status(500).json({ error: error.message });
  }
};