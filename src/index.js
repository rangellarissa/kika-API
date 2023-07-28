require("dotenv").config();

const cors = require("cors")

const {
    findAll,
    findOne,
    create,
    update,
    remove,
} = require("./client/database");
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT;

app.use(bodyParser.json());

app.use(cors());

const tables = ["Exposicao", "Artista"]

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

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});