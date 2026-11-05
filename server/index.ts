import app from './app';

const PORT = parseInt(process.env.PORT || '5050', 10);

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n============================================================`);
  console.log(`🚀 SplitSmart AI API Server is running on http://localhost:${PORT}`);
  console.log(`⚡ PayPal AI Hackathon Backend Initialized`);
  console.log(`📊 Persistent Database Layer: Ready (server/data/splitsmart_db.json)`);
  console.log(`============================================================\n`);
});

server.on('error', (err: any) => {
  if (err.code === 'EADDRINUSE' || err.code === 'EACCES') {
    console.error(`\n❌ Error: Port ${PORT} is currently in use or restricted.`);
    console.error(`💡 Tip: Close any existing Node process or specify another port in .env (PORT=xxxx).\n`);
  } else {
    console.error('Server error:', err);
  }
});
