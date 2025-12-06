// Simple backend using Firebase Admin - optional
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const bodyParser = require("body-parser");

const serviceAccount = require("./serviceAccountKey.json"); // descarga de Firebase Admin

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get("/health", (req, res) => res.json({ ok: true }));

// Example: get user doc (secured production: add auth)
app.get("/user/:uid", async (req, res) => {
  const { uid } = req.params;
  const doc = await db.collection("usuarios").doc(uid).get();
  if (!doc.exists) return res.status(404).json({ error: "Not found" });
  res.json(doc.data());
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log("Server running on", PORT));
