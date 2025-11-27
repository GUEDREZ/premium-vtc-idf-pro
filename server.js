import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ PAGE TEST
app.get("/", (req, res) => {
  res.send("✅ Premium VTC IDF Backend is running");
});

// ✅ FONCTION D’ENVOI TELEGRAM (FETCH NATIF NODE 22 ✅)
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

// ✅ NOTIFICATION APRÈS CLIC SUR "CALCULER"
app.post("/api/calculate", async (req, res) => {
  try {
    const { depart, arrivee, prix } = req.body;

    await sendTelegram(
      `🧮 NOUVEAU CALCUL\n\n📍 Départ: ${depart}\n📍 Arrivée: ${arrivee}\n💰 Prix estimé: ${prix}`
    );

    res.json({ success: true });
  } catch (error) {
    console.error("Erreur TELEGRAM calcul:", error);
    res.status(500).json({ success: false });
  }
});

// ✅ NOTIFICATION APRÈS CLIC SUR "RÉSERVER"
app.post("/api/reservation", async (req, res) => {
  try {
    const { nom, email, telephone, depart, arrivee, date, prix } = req.body;

    await sendTelegram(
      `✅ NOUVELLE RÉSERVATION\n\n👤 Nom: ${nom}\n📧 Email: ${email}\n📞 Téléphone: ${telephone}\n📍 Départ: ${depart}\n📍 Arrivée: ${arrivee}\n🕒 Date: ${date}\n💰 Prix: ${prix}`
    );

    res.json({ success: true });
  } catch (error) {
    console.error("Erreur TELEGRAM réservation:", error);
    res.status(500).json({ success: false });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});
