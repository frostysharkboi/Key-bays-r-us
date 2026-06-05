const mariadb = require("mariadb");

/*Wersja Lokalnie*/

const pool = mariadb.createPool({
    host: "localhost",
    user: "root",
    password: "",
    //database: "41188776_keysrus", //BAZA DANYCH
    database: "keybay",           //BAZA DANYCH
    port: 3306
});

module.exports = Object.freeze(
    { pool: pool }
);

/* Wersja Na Hoscie * /
const pool = mariadb.createPool({
    host: "serwer2670396.hosting-home.pl",
    user: "41188776_keysrus",
    password: "keysrus1234", //na hostingu: o42mkdEmk //użytkownika: keysrus1234
    database: "41188776_keysrus",

    // home.pl MySQL 8
    port: 3380,

    connectionLimit: 5,

    ssl: false
});

module.exports = Object.freeze({
    pool
});
/**/