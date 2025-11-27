import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ TEST SERVEUR
app.get("/", (req, res) => {
  res.send("✅ Premium VTC IDF Backend is running");
});

// ✅ FONCTION ENVOI TELEGRAM
async function sendTelegram(message) {
  const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
  
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: process.env.TELEGRAM_CHAT_ID,
      text: message
    })
  });
}

// ✅ NOTIFICATION APRÈS CALCUL
app.post("/api/calculate", async (req, res) => {
  const { depart, arrivee, prix } = req.body;

  await sendTelegram(
    `🧮 NOUVEAU CALCUL\n\n📍 Départ: ${depart}\n📍 Arrivée: ${arrivee}\n💰 Prix estimé: ${prix} €`
  );

  res.json({ success: true });
});

// ✅ NOTIFICATION APRÈS RÉSERVATION
app.post("/api/reservation", async (req, res) => {
  const { nom, telephone, depart, arrivee, prix, date } = req.body;

  await sendTelegram(
    `✅ NOUVELLE RÉSERVATION\n\n👤 Client: ${nom}\n📞 Téléphone: ${telephone}\n📍 Départ: ${depart}\n📍 Arrivée: ${arrivee}\n💰 Prix: ${prix} €\n🕒 Date: ${date}`
  );

  res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});
