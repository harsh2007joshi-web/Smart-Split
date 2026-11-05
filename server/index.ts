import app from './app';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n============================================================`);
  console.log(`🚀 SplitSmart AI API Server is running on http://localhost:${PORT}`);
  console.log(`⚡ PayPal AI Hackathon Backend Initialized`);
  console.log(`📊 Persistent Database Layer: Ready (server/data/splitsmart_db.json)`);
  console.log(`============================================================\n`);
});
