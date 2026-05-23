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

//Wyswietlanie gier po kategoriach (by wyszukiwanie wciąż działało osobno);

//    axios.get("http://localhost:3000/games/tagsort", { params: { tags: array[string] }, paramsSerializer: params => {return "tags=" + params.tags.join("&tags=");}}).then((res) => {setGames(res.data);});

app.get("/games/tagsort", async (req, res) => {

  // Jakub DEBUG: był problem z formatowaniem przesłanych danych więc jest tu masa przetwarzana które pewnie nic nie robi - ale działa i boje się tego tykać
  console.log("RAW QUERY:", req.query);
  console.log("TAGS:", req.query.tags);
  let tags = req.query.tags;
  if (!tags) {
    const result = await db.pool.query("SELECT * FROM games");
    return res.json(result);
  }
  tags = Array.isArray(tags) ? tags : [tags];
  tags = tags.filter(Boolean);

  if (tags.length === 0) {
    const result = await db.pool.query("SELECT * FROM games");
    return res.json(result);
  }

  try {
    const placeholders = req.query.tags;
    console.log(placeholders);
    const sql = `SELECT DISTINCT g.id "id", g.title "title", g.about "about", g.cover_img "cover_img" FROM games g JOIN game_tags t ON g.id = t.game_id GROUP BY g.id, t.tag_id HAVING t.tag_id IN (${placeholders}) ORDER BY g.id ASC`;
    const result = await db.pool.query(sql);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

//pobieranie tagów do gry po id

// axios.get("http://localhost:3000/games/tagnames", { params: { game_id: int }}).then((res) => {setGameTags(res.data);});

app.get("/games/tagnames", async (req, res) => {
  const { game_id } = req.query;

  try {
    const sql = `SELECT DISTINCT t.id "id", t.tag "tag" FROM games g JOIN game_tags gt ON g.id = gt.game_id JOIN tags t ON t.id = gt.tag_id WHERE g.id LIKE ${game_id}`;
    const result = await db.pool.query(sql);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

//pobieranie ofert do gier po id

// axios.get("http://localhost:3000/games/activeoffers", { params: { game_id: int }}).then((res) => {setGameOffers(res.data);});

app.get("/games/activeoffers", async (req, res) => {
  const { game_id } = req.query;

  try {
    const sql = `SELECT DISTINCT o.id "id", s.login "seller", o.suggested_price "price", o.other "other", s.email "email" FROM key_offers o JOIN users s ON o.seller_id = s.id WHERE o.game_id LIKE ${game_id} AND o.status LIKE "Active";`;
    const result = await db.pool.query(sql);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

//pobieranie mediów do gier po id

// axios.get("http://localhost:3000/games/media", { params: { game_id: int }}).then((res) => {setGameMedia(res.data);});

app.get("/games/media", async (req, res) => {
  const { game_id } = req.query;

  try {
    const sql = `SELECT DISTINCT source FROM media WHERE game_id LIKE ${game_id}`;
    const result = await db.pool.query(sql);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

//pobieranie recenzji do gry po id

// axios.get("http://localhost:3000/games/reviews", { params: { game_id: int }}).then((res) => {setGameTags(res.data);});

app.get("/games/reviews", async (req, res) => {
  const { game_id } = req.query;

  try {
    const sql = `SELECT DISTINCT u.login "user", r.rating "rating", r.other "other" FROM ratings r JOIN users u ON u.id = r.user_id WHERE game_id LIKE ${game_id}`;
    const result = await db.pool.query(sql);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

//pobieranie wszystkich pozostałych danych o grach

// axios.get("http://localhost:3000/games/alldata", { params: { game_id: int }}).then((res) => {setGameData(res.data);});

app.get("/games/alldata", async (req, res) => {
  const { game_id } = req.query;

  try {
    const sql = `SELECT DISTINCT g.id "id", g.title "title", g.developer "developer", g.publisher "publisher", g.about "about", DATE_FORMAT(g.release_date, "%Y-%m-%d") "release_date", g.cover_img "cover_img", g.icon "icon", o.gpu "opt_gpu", o.cpu "opt_cpu", o.ram "opt_ram", o.size "opt_size", o.os "opt_os", o.other "opt_other", r.gpu "min_gpu", r.cpu "min_cpu", r.ram "min_ram", r.size "min_size", r.os "min_os", r.other "min_other" FROM opt_req o JOIN games g ON o.game_id = g.id JOIN min_req r ON r.game_id = g.id WHERE g.id LIKE ${game_id}`;
    const result = await db.pool.query(sql);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

//pobieranie jedynie grafik gier

// axios.get("http://localhost:3000/games/cover").then((res) => {setGameTags(res.data);});

app.get("/games/cover", async (req, res) => {
  try {
    const sql = `SELECT id, title, about, cover_img FROM games ORDER BY RAND() LIMIT 5;`;
    const result = await db.pool.query(sql);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

//pobieranie danych jednego użytkownika po id

// axios.get("http://localhost:3000/users/byid", { params: { id: int }}).then((res) => {setUserData(res.data);});

app.get("/users/byid", async (req, res) => {
  const { id } = req.query;

  try {
    const sql = `SELECT * FROM users WHERE id = "${id}"`;
    const result = await db.pool.query(sql);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

//Zapytanie wypluwające tabelę users

app.get("/users/byemail", async (req, res) => {
  const { email } = req.query;

  try {
    const sql = `SELECT * FROM users WHERE email = "${email}"`;
    const result = await db.pool.query(sql);
    res.json(result);
  } catch (err) {
    console.log(err);
    res.status(500).json({error: err.message});
  }
});

//POLECENIA DOTYCZĄCE WISHLISTY
//Wybierz dane z tabeli, gdzie id usera jest podobne do podanego id.

app.get("/wishlist/wishlistData", async (req, res) => {
  
  try {
    const userId = 1;
    const sql = `SELECT g.id "id", title, cover_img, developer, about FROM wishlist w JOIN games g ON game_id = g.id WHERE user_id LIKE ${userId};`;
    const result = await db.pool.query(sql);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

//domyślny select * dowolnej tabeli

// axios.get("http://localhost:3000/table").then((res) => {setTable(res.data)})

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


// Reszta bardziej pod stronke admina

// Dodawanie do Rejestracji
app.post("/users/adduser", async (req, res) => {
  const {
    login,
    email,
    pass,
    phone,
    discord_tag
  } = req.body;

  try {
    const columns = ["login", "email", "pass"];
    const values = [login, email, pass];
    const placeholders = ["?", "?", "?"];

    if (phone) {
      columns.push("phone");
      values.push(phone);
      placeholders.push("?");
    }

    if (discord_tag) {
      columns.push("discord_tag");
      values.push(discord_tag);
      placeholders.push("?");
    }

    const sql = `
      INSERT INTO users (${columns.join(", ")})
      VALUES (${placeholders.join(", ")})
    `;

    const [result] = await db.pool.query(sql, values);

    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Błąd serwera"
    });
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