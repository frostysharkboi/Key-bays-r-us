const mariadb = require("mariadb");

//connect to mariadb

const pool = mariadb.createPool({
    host:"localhost",
    user:"root",
    password:"",
    database:"keybay", //BAZA DANYCH
    port:3306
});

module.exports=Object.freeze(
    {pool:pool}
);