// JAKUB MINI DISCLAIMER: Większość kodu połączenia z bazą powstało podczas praktyk kiedy rozkminiałem z różnymi tutorialami i kombinowaniem by użyć do tego nowszych bibliotek niż w żródłach z których korzystałem i już nie do końca pamiętam. w pliku config znajdują się kody i detale jak odpalić prawidłowo wszystko chyba że znajdzie się jakaś lepsza metoda

//IMPORT

const express = require("express");
const app = express();
const cors = require("cors");
const mariadb = require("mariadb"); // chyba już w tym miejscu nic nie robi ale lepiej mieć niż nie
const bodyParser = require("body-parser");
const axios = require("axios"); // DODANO IMPORT BIBLIOTEKI AXIOS DLA ZAPYTAŃ DO STEAM API

const port = process.env.PORT || 3000;
const db = require("./db/db");

// DANE O WARTOŚCIACH

let schema = {};

async function getTables() { // zwraca liste nazw tabel
  const rows = await db.pool.query("SHOW TABLES");
  return rows.map(r => Object.values(r)[0]);
}

async function getColumns(tableName) { // zwraca liste kolumn do danej tabeli
  const rows = await db.pool.query(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`, [tableName]);
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

// UTWORZENIE SERVERA i KONFIGURACJA CORS
// (Wszystkie app.use MUSZĄ być przed definicjami tras app.get / app.post)

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors()); // <-- Ta linijka teraz poprawnie zabezpiecza również poniższy endpoint Steam

// =========================================================================
// ENDPOINT PROXY STEAM (Teraz pod app.use(cors()), dzięki czemu CORS zadziała)
// =========================================================================
app.get('/api/steam-rating', async (req, res) => {
  const { appid } = req.query;

  if (!appid) {
    return res.status(400).json({ error: 'Brak parametru appid' });
  }

  try {
    // Odpytujemy oficjalne, publiczne API Steam (User Reviews), które zwraca czyste statystyki ocen
    const reviewsResponse = await axios.get(`https://store.steampowered.com/appreviews/${appid}?json=1&language=all&purchase_type=all`);

    const reviewSummary = reviewsResponse.data.query_summary;

    if (reviewSummary && reviewSummary.total_reviews > 0) {
      // Obliczamy procent pozytywnych ocen
      const totalReviews = reviewSummary.total_reviews;
      const totalPositive = reviewSummary.total_positive;

      // Przeliczamy procent na skalę 0-5
      const percentage = (totalPositive / totalReviews) * 100;
      const ratingScale5 = (percentage / 20).toFixed(1);

      return res.json({
        success: true,
        score: ratingScale5, // Ocena w skali 0-5 (np. 4.2)
        percent: Math.round(percentage), // Procent (np. 84%)
        review_score_desc: reviewSummary.review_score_desc // Słowny opis (np. "Very Positive")
      });
    } else {
      // Obsługa sytuacji, gdy gra nie ma jeszcze ocen na platformie Steam
      return res.json({
        success: true,
        score: "0.0",
        percent: 0,
        review_score_desc: "Brak recenzji"
      });
    }
  } catch (error) {
    console.error('Błąd Steam API Proxy:', error.message);
    res.status(500).json({ error: 'Błąd połączenia ze Steam API' });
  }
});
// =========================================================================

app.listen(port, async () => {
  await loadSchema();
  console.log(`Server running on port ${port}`);
});

// IMPLEMENTACJA OPERACJI CRUD

// Read

// Pobieranie wszystkich ofert (dla administratora lub ogólnej listy)
app.get('/key_offers/allOffers', async (req, res) => {
  const { userId, userRole, scope } = req.query;
  var sql = `SELECT ko.id, ko.game_id, g.title, ko.seller_id, u.login AS seller, ko.game_key, ko.other, ko.status, ko.suggested_price, u.login AS seller_login FROM key_offers ko LEFT JOIN games g ON ko.game_id = g.id LEFT JOIN users u ON ko.seller_id = u.id`;
  if (userRole == "seller" || (userRole == "admin" && scope == "my")) sql += ` WHERE ko.seller_id = ${userId}`;
  try {
    const result = await db.pool.query(sql);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

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

// Pobieranie recenzji wraz z loginami użytkowników dla danej gry
app.get('/api/reviews', async (req, res) => {
  const { gameId } = req.query;
  try {
    const sql = `SELECT r.*, u.login FROM ratings r JOIN users u ON r.user_id = u.id WHERE r.game_id = ${gameId}`;
    const result = await db.pool.query(sql);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

// Sprawdzanie, czy użytkownik kupił grę (Status: Success)
app.get('/api/transactions/check-purchase', async (req, res) => {
  const userId = Number(req.query.userId);
  const gameId = Number(req.query.gameId);

  if (isNaN(userId) || isNaN(gameId)) {
    console.log(`Błąd: brak danej: ${isNaN(userId) ? "userId" : "gameId"}`);
    return res.json({ hasPurchased: false });
  }

  try {
    const sql = `SELECT COUNT(t.id) AS amount FROM transactions t JOIN key_offers ko ON t.offer_id = ko.id WHERE t.reciever_id = ${userId} AND ko.game_id = ${gameId} AND t.status = 'Success'`;

    const [result] = await db.pool.query(sql);
    res.json({ hasPurchased: parseInt(result.amount) > 0 });
  } catch (err) {
    console.error("Błąd bazy danych:", err);
    res.status(500).send(err);
  }
});

//pobieranie wszystkich pozostałych danych o grach

// axios.get("http://localhost:3000/games/alldata", { params: { game_id: int }}).then((res) => {setGameData(res.data);});

app.get("/games/alldata", async (req, res) => {
  const { game_id } = req.query;

  try {
    const sql = `SELECT DISTINCT g.id "id", g.title "title", g.steam_rating "steam_rating", g.developer "developer", g.publisher "publisher", g.about "about", DATE_FORMAT(g.release_date, "%Y-%m-%d") "release_date", g.cover_img "cover_img", g.icon "icon", o.gpu "opt_gpu", o.cpu "opt_cpu", o.ram "opt_ram", o.size "opt_size", o.os "opt_os", o.other "opt_other", r.gpu "min_gpu", r.cpu "min_cpu", r.ram "min_ram", r.size "min_size", r.os "min_os", r.other "min_other" FROM opt_req o JOIN games g ON o.game_id = g.id JOIN min_req r ON r.game_id = g.id WHERE g.id LIKE ${game_id}`;
    const result = await db.pool.query(sql);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

//pobieranie grafik gier do karuzeli

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

//POLECENIA DOTYCZĄCE WISHLISTY
//Wybierz dane z tabeli, gdzie id usera jest podobne do podanego id.

app.get("/wishlist/wishlistData", async (req, res) => {
  const { id } = req.query;

  try {
    const sql = `SELECT g.id "id", title, cover_img, developer, about FROM wishlist w JOIN games g ON game_id = g.id WHERE user_id LIKE ${id};`;
    const result = await db.pool.query(sql);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// id gier na wisliscie użytkownika
app.get("/wishlist", async (req, res) => {
  const { user_id } = req.query;
  try {
    const sql = `SELECT game_id FROM wishlist WHERE user_id = ${user_id}`;
    const rows = await db.pool.query(sql);
    res.json(rows.map(row => row.game_id));
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

//Polecenie pobierające dane potrzenych do ofert
app.get("/key_offers/offersForGames", async (req, res) => {
  const { id } = req.query;

  try {
    const sql = `SELECT ko.*, u.login, u.discord_tag FROM key_offers as ko JOIN users u ON ko.seller_id = u.id WHERE game_id LIKE ${id};`;
    const result = await db.pool.query(sql);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


//POLECENIA DOTYCZĄCE TRANSAKCJI

//obsługa tabeli transakcji.
app.get("/transactions/transactionsByType", async (req, res) => {
  const { type, id } = req.query;

  try {
    if (!type) return res.status(400).json({ error: "Parametr 'type' jest wymagany." });
    if (type !== 'admin' && !id) return res.status(400).json({ error: "Parametr 'id' jest wymagany dla tego typu widoku." });

    let sql = `SELECT t.id AS transaction_id, t.status AS transaction_status, t.reciever_id, ko.id AS offer_id, ko.suggested_price, ko.game_key, g.id AS game_id, g.title AS game_title, CONCAT(u_seller.login, " (", u_seller.discord_tag, ")") AS seller_login, CONCAT(u_reciever.login, " (", u_reciever.discord_tag, ")") AS reciever_login, CONCAT(u_buyer.login, " (", u_buyer.discord_tag, ")") AS buyer_login FROM transactions t JOIN key_offers ko ON t.offer_id = ko.id JOIN users u_seller ON ko.seller_id = u_seller.id JOIN users u_reciever ON t.reciever_id = u_reciever.id JOIN users u_buyer ON t.buyer_id = u_buyer.id JOIN games g ON ko.game_id = g.id`;

    if (type === 'buyer') sql += ` WHERE t.buyer_id = ${id}`;
    else if (type === 'reciever') sql += ` WHERE t.reciever_id = ${id}`;
    else if (type === 'seller') sql += ` WHERE ko.seller_id = ${id}`;
    else if (type !== 'admin') return res.status(400).json({ error: "Nieprawidłowy parametr 'type'." });

    sql += ` GROUP BY t.id;`;

    const dbResponse = await db.pool.query(sql);

    let finalRows = [];

    // coś szwankowało z zwracaniem wyników jako tablica
    if (Array.isArray(dbResponse)) {
      if (Array.isArray(dbResponse[0])) {
        finalRows = dbResponse[0];
      } else {
        finalRows = dbResponse;
      }
    } else if (dbResponse && Array.isArray(dbResponse.rows)) {
      finalRows = dbResponse.rows;
    } else if (dbResponse && typeof dbResponse === 'object') {
      finalRows = [dbResponse];
    }

    res.json(finalRows);

  } catch (err) {
    console.error("[BACKEND ERROR] Wystąpił błąd podczas procesowania SQL:", err);
    res.status(500).json({ error: err.message });
  }
});

//domyślny select * dowolnej tabeli

// axios.get("http://localhost:3000/table").then((res) => {setTable(res.data)})

app.get("/:table", async (req, res) => {
  const table = req.params.table;
  if (!schema[table]) {
    return res.status(404).send("Table not found");
  }
  try {
    const sql = `SELECT * FROM ${table}`;
    const result = await db.pool.query(sql);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }

});

// Create

// Zatwierdzenie transakcji
app.post("/transactions/confirm", async (req, res) => {
  const { transactionId, enteredKey } = req.body;

  if (!transactionId || !enteredKey) return res.status(400).json({ error: "Brak wymaganych danych transakcji lub klucza." });

  try {
    const verifySql = `SELECT ko.game_key, t.offer_id FROM transactions t JOIN key_offers ko ON t.offer_id = ko.id WHERE t.id = ${transactionId} AND t.status = 'Pending'`;
    const rows = await db.pool.query(verifySql);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Nie znaleziono aktywnej transakcji." });
    }

    const { game_key, offer_id } = rows[0];

    if (enteredKey !== game_key) {
      return res.status(400).json({ error: "Wprowadzony klucz gry jest niepoprawny!" });
    }

    await db.pool.query(`UPDATE transactions SET status = 'Success' WHERE id = ${transactionId}`);
    await db.pool.query(`UPDATE transactions SET status = 'Cancelled' WHERE offer_id = ${offer_id} AND id != ${transactionId}`);
    await db.pool.query(`UPDATE key_offers SET status = 'Closed' WHERE id = ${offer_id}`);

    res.json({ success: true, message: "Transakcja została pomyślnie zatwierdzona!" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Błąd serwera podczas przetwarzania transakcji." });
  }
});

//dodanie recenzji
app.post('/api/reviews', async (req, res) => {
  const { game_id, user_id, rating, other } = req.body;
  try {
    const sql = `INSERT INTO ratings (game_id, user_id, rating, other) VALUES (${game_id}, ${user_id}, '${rating}', '${other}')`;
    await db.pool.query(sql);
    res.sendStatus(201);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

//Dodawanie ofert
app.post("/key_offers/add", async (req, res) => {
  const { key, price, other, seller_id, game_id, status, } = req.body;

  try {
    const columns = ["seller_id", "game_id", "game_key", "other", "status", "suggested_price"];
    const values = [seller_id, game_id, key, other, String(status), price];

    const sql = `INSERT INTO key_offers (${columns.join(", ")}) VALUES (${values.join(", ")})`;

    const result = db.pool.query(sql, values);
    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Błąd serwera"
    });
  }
});

//Dodawanie transakcji
app.post("/transactions/add", async (req, res) => {
  const { offerId, buyerId, receiverId, status, } = req.body;

  try {
    const columns = ["offer_id", "buyer_id", "reciever_id", "status"];
    const values = [offerId, buyerId, receiverId, String(status)];

    const sql = `INSERT INTO transactions (${columns.join(", ")}) VALUES (${values.join(", ")})`;

    const result = db.pool.query(sql, values);
    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Błąd serwera"
    });
  }
});

//Zmiana danych usera
app.post("/users/updateUser", async (req, res) => {
  const { id, login, email, pass, phone, discord_tag } = req.body;

  try {
    const columns = ["login", "email", "pass", "phone", "discord_tag"];
    const values = [login, email, pass, phone, discord_tag];

    let sql = `UPDATE users SET ${columns[0]} = "${values[0]}", ${columns[1]} = "${values[1]}", ${columns[2]} = "${values[2]}", ${columns[3]} = "${values[3]}", ${columns[4]} = "${values[4]}" WHERE id = ${id};`;

    if (phone == null && discord_tag == null) {
      sql = `UPDATE users SET ${columns[0]} = "${values[0]}", ${columns[1]} = "${values[1]}", ${columns[2]} = "${values[2]}" WHERE id = ${id}`;
    } else if (discord_tag == null && phone != null) {
      sql = `UPDATE users SET ${columns[0]} = "${values[0]}", ${columns[1]} = "${values[1]}", ${columns[2]} = "${values[2]}", ${columns[3]} = "${values[3]}" WHERE id = ${id}`;
    } else if (phone == null && discord_tag != null) {
      sql = `UPDATE users SET ${columns[0]} = "${values[0]}", ${columns[1]} = "${values[1]}", ${columns[2]} = "${values[2]}", ${columns[4]} = "${values[4]}" WHERE id = ${id}`;
    }

    const result = db.pool.query(sql);

    res.json({ success: true, message: "Transakcja została pomyślnie zatwierdzona!" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Błąd serwera podczas przetwarzania transakcji." });
  }
});

// dodanie użytkowników

// await axios.post("http://localhost:3000/users/adduser",{ login: "", email: "", pass: "", phone: "", discord_tag: "" });

app.post("/users/adduser", async (req, res) => {
  const { login, email, pass, phone, discord_tag } = req.body;

  try {
    const columns = ["login", "email", "pass"];
    const values = [login, email, pass];

    if (phone) {
      columns.push("phone");
      values.push(`"${phone}"`);
    }

    if (discord_tag) {
      columns.push("discord_tag");
      values.push(`"${discord_tag}"`);
    }

    const sql = `INSERT INTO users (${columns.join(", ")}) VALUES (${values.join(", ")})`;

    const result = db.pool.query(sql);
    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

// standardowy do wszystkich kolumn tabeli

app.post("/:table", async (req, res) => {
  const table = req.params.table;
  const data = req.body;
  if (!schema[table]) return res.status(404).send("Table not found");
  const tableColumns = [...schema[table]];
  if (tableColumns.includes("publisher") && (!data.publisher || data.publisher.length === 0)) {
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
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

// Update

// aktualizacja ocen
app.put('/api/reviews', async (req, res) => {
  const { game_id, user_id, rating, other } = req.body;
  try {
    const sql = `UPDATE ratings SET rating = '${rating}', other = '${other}' WHERE game_id = ${game_id} AND user_id = ${user_id}`;
    await db.pool.query(sql);
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

// Aktualizacja statusu konkretnej oferty
app.patch('/key_offers/updateStatus', async (req, res) => {
  const { offerId, newStatus } = req.body;

  if (!offerId || !newStatus) return res.status(400).json({ error: "Brak offerId lub newStatus w żądaniu." });
  try {
    const sql = `UPDATE key_offers SET status = ${newStatus} WHERE id = ${offerId};`;
    const result = await db.pool.query(sql);

    res.json({ success: true, message: "Status został zaktualizowany." });
  } catch (err) {
    console.error("Błąd podczas aktualizacji statusu:", err);
    res.status(500).json({ error: err.message });
  }
});

app.patch("/:table/:id", async (req, res) => {
  const table = req.params.table;
  const id = Number(req.params.id);
  const data = req.body;
  if (!schema[table]) return res.status(404).send("Table not found");
  const columns = schema[table].filter(col => data[col] !== undefined);
  try {
    const setList = columns.map(col => `${col}=?`).join(", ");
    const sql = `UPDATE ${table} SET ${setList} WHERE id=${id}`;

    const values = columns.map(col => {
      if (col === "publisher") {
        return (data.publisher && data.publisher.length > 0) ? data.publisher : data.developer;
      }
      return data[col];
    });

    const result = await db.pool.query(sql, [...values, id]);
    const safeResult = JSON.parse(JSON.stringify(result, (_, v) => typeof v === 'bigint' ? v.toString() : v));
    res.json(safeResult);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

// Destroy

//usuwanie recenzji
app.delete('/api/reviews', async (req, res) => {
  const { gameId, userId } = req.query;
  try {
    const sql = `DELETE FROM ratings WHERE game_id = ${gameId} AND user_id = ${userId}`;
    await db.pool.query(sql);
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

// usuwanie z wishlisty
app.delete("/wishlist/remove", async (req, res) => {
  const { user_id, game_id } = req.query;
  try {
    const sql = `DELETE FROM wishlist WHERE user_id = ${user_id} AND game_id = ${game_id};`;
    await db.pool.query(sql);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

//domyślny
app.delete("/:table/:id", async (req, res) => {
  const table = req.params.table;
  const id = Number(req.params.id);
  if (!schema[table]) return res.status(404).send("Table not found");
  try {
    const sql = `DELETE FROM ${table} WHERE id=${id};`;
    const result = await db.pool.query(sql);
    const safeResult = JSON.parse(JSON.stringify(result, (_, v) => typeof v === 'bigint' ? v.toString() : v));
    res.json(safeResult);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});