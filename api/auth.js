const { supabase } = require("../client/database");

// Admin = Supabase Auth user whose app_metadata.role is "admin".
// app_metadata can only be changed server-side, so users can't promote themselves.
async function requireAdmin(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Não autenticado" });
  }

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data?.user) {
    return res.status(401).json({ message: "Token inválido" });
  }

  if (data.user.app_metadata?.role !== "admin") {
    return res.status(403).json({ message: "Acesso negado" });
  }

  req.user = data.user;
  next();
}

module.exports = { requireAdmin };
