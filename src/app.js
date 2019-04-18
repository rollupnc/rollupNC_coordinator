var express = require("express");
var bodyParser = require("body-parser");

var router = express.Router();
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//receives all token transfers
app.get("/transfer", function(req, res) {
  // push the transfer to the queue

  res.json({ message: "transfer" });
});

app.listen(3000);
