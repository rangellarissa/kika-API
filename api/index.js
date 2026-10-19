require("dotenv").config();

const cors = require("cors")

const {
    supabase,
    findAll,
    findOne,
    findBySlug,
    create,
    update,
    remove,
} = require("../client/database");
const express = require("express");
const bodyParser = require("body-parser");
const { requireAdmin } = require("./auth");
const { Tables, PrivateTables, WritableTables, StorageBucket } = require("../utils/constants");

const app = express();
const port = process.env.PORT;

app.use(bodyParser.json());

app.use(cors());

const tables = Tables;
app.use("/api", (req, res, next) => {
  if (req.method !== "GET") res.set("Cache-Control", "no-store");
  next();
});

const slugTables = ["exposicao", "residencia"];

app.get("/", async (req, res) => {
 res.json("Hello world")
})

// Only admins can read private tables or write anything.
function validateTable(tableList) {
  return (req, res, next) => {
    if (!tableList.includes(req.params.table)) {
      return res.status(400).json({ message: "Tabela inválida" });
    }
    next();
  };
}

const readTable = (req, res, next) => {
  if (PrivateTables.includes(req.params.table)) {
    return requireAdmin(req, res, next);
  }
  next();
};

// Lets the admin UI check whether the logged-in user is an admin.
app.get("/api/auth/me", requireAdmin, (req, res) => {
  res.json({ id: req.user.id, email: req.user.email, role: "admin" });
});

// Returns a one-time URL so the browser uploads the file straight to Storage
// (avoids Vercel's request body limit). Afterwards, POST /api/imagem with publicUrl.
app.post("/api/upload-url", requireAdmin, async (req, res) => {
  try {
    const { filename } = req.body;
    if (!filename) {
      return res.status(400).json({ message: "filename é obrigatório" });
    }
    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${Date.now()}-${safeName}`;

    const { data, error } = await supabase.storage
      .from(StorageBucket)
      .createSignedUploadUrl(path);
    if (error) throw error;

    const { data: pub } = supabase.storage.from(StorageBucket).getPublicUrl(path);

    res.json({
      path,
      token: data.token,
      signedUrl: data.signedUrl,
      publicUrl: pub.publicUrl,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/:table", validateTable(Tables), readTable, async (req, res) => {
  try {
    const data = await findAll(req.params.table);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/:table/by-slug/:slug", async (req, res) => {
  try {
    const { table, slug } = req.params;

    if (!tables.includes(table)) {
      return res.status(400).json({
        message: "Tabela inválida"
      });
    }

    if (!slugTables.includes(table)) {
      return res.status(400).json({
        message: "Slug não habilitado para esta tabela",
      });
    }

    const data = await findBySlug(table, slug);

    if (!data) {
      return res.status(404).json({
        message: "Não encontrado",
      });
    }

    res.json(data);

  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

app.get("/api/:table/:id", validateTable(Tables), readTable, async (req, res) => {
  try {
    const { id, table } = req.params;

    const data = await findOne(table, id);

    if (!data) {
      return res.status(404).json({ message: "Não existe" });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/:table", requireAdmin, validateTable(WritableTables), async (req, res) => {
  try {
    const created = await create(req.params.table, req.body);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/:table/:id", requireAdmin, validateTable(WritableTables), async (req, res) => {
  try {
    const { id, table } = req.params;

    const updated = await update(table, id, req.body);

    if (!updated || updated.length === 0) {
      return res.status(404).json({ message: "Não existe" });
    }

    res.json(updated[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/:table/:id", requireAdmin, validateTable(WritableTables), async (req, res) => {
  try {
    const { table, id } = req.params;

    await remove(table, id);

    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

if(port) {
  app.listen(port, () => { 
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
  })
}

module.exports = app;