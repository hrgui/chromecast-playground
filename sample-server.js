//const express = require("express");
//const bodyParser = require("body-parser");
import express from "express";
import bodyParser from "body-parser";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse incoming JSON data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Endpoint to handle sendBeacon requests
app.post("/api/beacon", (req, res) => {
  const data = req.body;
  console.log("Received beacon data:", data);

  // Send a response to acknowledge receipt
  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
