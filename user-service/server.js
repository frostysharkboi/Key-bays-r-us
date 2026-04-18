// JAKUB MINI DISCLAIMER: Większość kodu połączenia z bazą powstało podczas praktyk kiedy rozkminiałem z różnymi tutorialami i kombinowaniem by użyć do tego nowszych bibliotek niż w żródłach z których korzystałem i już nie do końca pamiętam. w pliku config znajdują się kody i detale jak odpalić prawidłowo wszystko chyba że znajdzie się jakaś lepsza metoda

//IMPORT

const express = require("express");
const app = express();
const cors = require("cors");
const mariadb = require("mariadb"); // chyba już w tym miejscu nic nie robi ale lepiej mieć niż nie
const bodyParser = require("body-parser");
const port = process.env.PORT || 3000;
const db = require("./db/db");

// DANE O WARTOŚCIACH

let schema = {};

async function getTables() { // zwraca liste nazw tabel
  const rows = await db.pool.query("SHOW TABLES");
  return rows.map(r => Object.values(r)[0]);
}

async function getColumns(tableName) { // zwraca liste kolumn do danej tabeli
  const rows = await db.pool.query(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,[tableName]);
  return rows.map(r => r.COLUMN_NAME).filter(c => c !== "id");
}

async function loadSchema() { // kombinuje obie listy getTables i getColumns zwracając tablice dwuwymiarową z nazwami kolumn i nazwy tabel jako klucze
  const tables = await getTables();
  for (const table of tables) {
    const cols = await getColumns(table);
    schema[table] = cols;
  }
  // Wypisuje w konosli tak że by było widać jak wczytało strukture
  console.log("Loaded schema:", schema);
}

// UTWORZENIE SERVERA

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(cors());

app.listen(port, async () => {
  await loadSchema();
  console.log(`Server running on port ${port}`);
});

// IMPLEMENTACJA OPERACJI CRUD

// Read
app.get("/games/tagsort", async (req, res) => {
  const { name } = req.query;

  try {
    let sql = "SELECT ";
    const params = [];

    if (name) {
      sql += "g.id `id`, g.title `title`, g.about `about`, g.cover_img `cover_img` FROM games g JOIN game_tags gt ON g.id = gt.game_id JOIN tags t ON gt.tag_id = t.id WHERE t.tag LIKE ?";
      params.push(`%${name}%`);
    }
    else sql == `* FROM games`;

    const result = await db.pool.query(sql, params);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/:table" + "/select", async (req, res) => {
  const { columns, tablecon, where } = req.query;

  try {
    let sql = "SELECT ";

    sql += (columns)? `${columns} FROM ` : "* FROM ";
    sql += (tablecon)? `${tablecon}` : `${req.params.table}`;
    if(where) sql += ` WHERE ${where}`;

    const result = await db.pool.query(sql);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/:table", async (req,res) => {
  const table = req.params.table;
  if(!schema[table]){
    return res.status(404).send("Table not found");
  }
  try {
    const sql = `SELECT * FROM ${table}`;
    const result = await db.pool.query(sql);
    res.json(result);
  } catch(err){
    console.error(err);
    res.status(500).send(err);
  }

});

// Create

app.post("/:table", async (req,res) => {
  const table = req.params.table;
  const data = req.body;
  if(!schema[table]) return res.status(404).send("Table not found");
  const tableColumns = [...schema[table]];
  if(tableColumns.includes("publisher") && (!data.publisher || data.publisher.length === 0)){
    data.publisher = data.developer || null;
  }
  const columns = tableColumns.filter(col => col in data);
  try {
    const setList = columns.join(", ");
    const valList = columns.map(() => "?").join(",");
    const sql = `INSERT INTO ${table} (${setList}) VALUES (${valList})`;
    const values = columns.map(col => data[col]);
    const result = await db.pool.query(sql, values);
    const safeResult = JSON.parse(JSON.stringify(result, (_, v) => typeof v === 'bigint' ? v.toString() : v)); // Bo był jakiś problem z BigInt
    res.json(safeResult);
  } catch(err){
    console.error(err);
    res.status(500).send(err);
  }
});

// Update

app.patch("/:table/:id", async (req,res) => {
  const table = req.params.table;
  const id = Number(req.params.id);
  const data = req.body;
  if(!schema[table]) return res.status(404).send("Table not found");
  const columns = schema[table].filter(col => data[col] !== undefined);
  try{
    const setList = columns.map(col => `${col}=?`).join(", ");
    const sql = `UPDATE ${table} SET ${setList} WHERE id=?`;

    // Wartości wraz z wyjątkami
    const values = columns.map(col => {
        if(col === "publisher"){
            return (data.publisher && data.publisher.length > 0) ? data.publisher : data.developer;
        }
        return data[col];
    });

    const result = await db.pool.query(sql,[...values,id]);
    const safeResult = JSON.parse(JSON.stringify(result, (_, v) => typeof v === 'bigint' ? v.toString() : v));
    res.json(safeResult);
  } catch(err){
    console.error(err);
    res.status(500).send(err);
  }
});

// Destroy

app.delete("/:table/:id", async (req,res) => {
  const table = req.params.table;
  const id = Number(req.params.id);
  if(!schema[table]) return res.status(404).send("Table not found");
  try{
    const sql = `DELETE FROM ${table} WHERE id=?`;
    const result = await db.pool.query(sql,[id]);
    const safeResult = JSON.parse(JSON.stringify(result, (_, v) => typeof v === 'bigint' ? v.toString() : v));
    res.json(safeResult);
  } catch(err){
    console.error(err);
    res.status(500).send(err);
  }
});