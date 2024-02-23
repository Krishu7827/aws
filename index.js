const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const router = express.Router();
require("dotenv").config();
const path = require("path");


const port = process.env.PORT || 9696;

app.use(bodyParser.urlencoded({ extended: true }));

// parse request data content type application/json
app.use(bodyParser.json());

app.use(cors());
app.use(express.static("images"));

const files = require("./route");

files(router);

// Have Node serve the files for our built React app
app.use(express.static(path.resolve(__dirname, "./build")));




app.use("/api", router);

app.listen(port, () => {
  console.log(`Express is running at port ${port}`);
});


