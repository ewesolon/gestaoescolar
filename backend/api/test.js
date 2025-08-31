// Teste simples para Vercel
module.exports = (req, res) => {
  res.json({
    message: "Backend funcionando!",
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    platform: "vercel"
  });
};