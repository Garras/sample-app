const express = require("express");
const app = express();
const port = 8080;

app.get("/api", (req, res) => {
  res.send("Backend Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
