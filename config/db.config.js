const mysql = require("mysql");


const dbConn = mysql.createPool({
  host: '68.178.155.50',
  user: 'HRMGalo',
  password: 'FlkumUAxazRW',
  database: 'HRMGaloDev',
 
});

dbConn.getConnection(function (error) {
  if (error) {
    console.log(error, "ERROR");
    throw error;
  }
  console.log("Database Connected Successfully!!!");
});

module.exports = dbConn;
