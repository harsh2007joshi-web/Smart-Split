import app from './app';

const PORT = parseInt(process.env.PORT || '5001', 10);

const server = app.listen(PORT, () => {
  console.log(`\n============================================================`);
  console.log(`🚀 SplitSmart AI API Server is running on http://localhost:${PORT}`);
  console.log(`⚡ PayPal AI Hackathon Backend Initialized`);
  console.log(`📊 Persistent Database Layer: Ready (server/data/splitsmart_db.json)`);
  console.log(`============================================================\n`);
});

server.on('error', (err: any) => {
  if (err.code === 'EADDRINUSE' || err.code === 'EACCES') {
    const nextPort = PORT + 1;
    console.warn(`⚠️ Port ${PORT} busy/restricted, auto-switching to http://localhost:${nextPort}...`);
    app.listen(nextPort, () => {
      console.log(`🚀 SplitSmart AI API Server is running on http://localhost:${nextPort}`);
    });
  }
});
