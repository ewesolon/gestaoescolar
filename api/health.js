// Health check endpoint
module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  res.json({
    status: "ok",
    message: "Backend funcionando!",
    timestamp: new Date().toISOString(),
    environment: "production",
    platform: "vercel",
    version: "3.0"
  });
};