require("dotenv").config();

const cors = require("cors")

const {
    findAll,
    findOne,
    findBySlug,
    create,
    update,
    remove,
} = require("../client/database");
const express = require("express");
const bodyParser = require("body-parser");
const { Tables } = require("../utils/constants");

const app = express();
const port = process.env.PORT;

app.use(bodyParser.json());

app.use(cors());

const tables = Tables;
const slugTables = ["exposicao", "residencia"];

app.get("/", async (req, res) => {
 res.json("Hello world")
})

app.get("/api/debug-env", (req, res) => {
  res.json({
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY ? "EXISTS" : "MISSING",
  });
});


app.get("/api/:table", async (req, res) => {
  try {
    const { table } = req.params;
    if(!tables.includes(table)){
        res.status(400).json({ message: "Tabela inválida"})
        return;
    };
    const data = await findAll(table);
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

app.get("/api/:table/:id", async (req, res) => {
  try {
    const { id, table } = req.params;
//TODO: validar o id e table como em cima
    const data = await findOne(table, id);

    if (!data){
        res.status(400).json({ message: "Não existe"});
        return;
    };

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/:table", async (req, res) => {
  try {

    const newTask = await create(table, req.body);
    res.status(201).json(newTask);
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/:table/:id", async (req, res) => {
  try {
    const { id, table } = req.params;

    await update(table, id, req.body);

    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/:table/:id", async (req, res) => {
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