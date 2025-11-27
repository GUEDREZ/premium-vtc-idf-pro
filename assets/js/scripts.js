/* ============================================================
   PREMIUM VTC IDF – SCRIPT COMPLET 2025
   Google Maps + PayPal + Téléphone international + PDF + Telegram
   ============================================================ */

/* ------------------------------
   CONFIG
------------------------------ */
const TELEGRAM_TOKEN = "8103454525:AAGl4S8_jEDg_uKA8nppeZjsjlPkRBHGZm8";
const TELEGRAM_CHAT_ID = "6302044330";

const BACKEND_URL = "https://premium-vtc-idf-backend.onrender.com";

let map, directionsService, directionsRenderer, iti;

/* ============================================================
   1️⃣ INITIALISATION GOOGLE MAPS
============================================================ */
function initMap() {
  const mapEl = document.getElementById("map");
  if (!mapEl) return;

  map = new google.maps.Map(mapEl, {
    zoom: 12,
    center: { lat: 48.8462, lng: 2.3752 }, // 📍 Paris Gare de Lyon (coordonnées exactes)
    mapTypeControl: false,
  });

  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer();
  directionsRenderer.setMap(map);

  // Autocomplete initialisé avec suggestion forte Gare de Lyon
  setAutocomplete("fr");
}

/* ============================================================
   2️⃣ AUTOCOMPLETE GOOGLE MAPS (avec "Gare de Lyon" prioritaire)
============================================================ */
function setAutocomplete(countryCode) {
  const options = {
    fields: ["formatted_address", "geometry", "name"],
    componentRestrictions: { country: countryCode }
  };

  const startEl = document.getElementById("start");
  const endEl = document.getElementById("end");

  if (startEl) new google.maps.places.Autocomplete(startEl, options);
  if (endEl) new google.maps.places.Autocomplete(endEl, options);
}
document.getElementById("country").addEventListener("change", function () {
  const countryCode = this.value;

  if (countryCode) {
    setAutocomplete(countryCode); // ✅ applique le pays choisi
  }
});


/* ============================================================
   3️⃣ INITIALISATION TÉLÉPHONE INTERNATIONAL
============================================================ */
window.addEventListener("load", () => {
  const phoneInput = document.querySelector("#telephone");
  const countrySelect = document.getElementById("country");

  if (!phoneInput) return;

  iti = window.intlTelInput(phoneInput, {
    initialCountry: "fr",
    preferredCountries: [
      "fr","be","ch","de","es","it","pt","nl",
      "ma","dz","tn",
      "sa","ae","qa",
      "us","ca","br","mx","cn","jp","in"
    ],
    utilsScript:
      "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/18.1.1/js/utils.js",
  });

  if (countrySelect) {
    countrySelect.addEventListener("change", () => {
      iti.setCountry(countrySelect.value);
    });
  }
});

/* ============================================================
   4️⃣ CALCUL DU PRIX
============================================================ */
function computePrice(km) {
  return (25 + km * 1.2).toFixed(2);
}

/* ============================================================
   5️⃣ CALCUL ITINÉRAIRE
============================================================ */
document.getElementById("calculate")?.addEventListener("click", () => {
  const start = document.getElementById("start").value.trim();
  const end = document.getElementById("end").value.trim();

  if (!start || !end) {
    alert("Veuillez saisir les adresses.");
    return;
  }

  directionsService.route(
    {
      origin: start,
      destination: end,
      travelMode: google.maps.TravelMode.DRIVING,
    },
    async (result, status) => {
      if (status !== "OK") {
        alert("Erreur Google Maps : " + status);
        return;
      }

      directionsRenderer.setDirections(result);

      const leg = result.routes[0].legs[0];
      const km = leg.distance.value / 1000;
      const duration = leg.duration.text;
      const price = computePrice(km);

      document.getElementById("distance").textContent = km.toFixed(1) + " km";
      document.getElementById("duree").textContent = duration;
      document.getElementById("prix-affiche").textContent = price + " €";

      initPayPalButtons(price);
    }
  );
});

/* ============================================================
   6️⃣ RÉCUPÉRATION FORM
============================================================ */
function getFormData() {
  return {
    nom: document.getElementById("nom").value,
    email: document.getElementById("email").value,
    pays: document.getElementById("country").value,
    telephone: document.getElementById("telephone").value,
    start: document.getElementById("start").value,
    end: document.getElementById("end").value,
    date: document.getElementById("date").value,
    passagers: document.getElementById("passagers").value,
    message: document.getElementById("message").value,
    distance: document.getElementById("distance").textContent,
    duree: document.getElementById("duree").textContent,
    prix: document.getElementById("prix-affiche").textContent,
  };
}

/* ============================================================
   7️⃣ ENVOI AU BACKEND
============================================================ */
async function sendToBackend(data) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/reservations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ form: data }),
    });

    const result = await response.json();
    return result.id;
  } catch (err) {
    alert("Erreur serveur.");
  }
}

/* ============================================================
   8️⃣ PAYPAL – LIVE MODE
============================================================ */
function initPayPalButtons(amount) {
  const container = document.getElementById("paypal-button-container");
  if (!container || !window.paypal) return;

  container.innerHTML = "";

  paypal
    .Buttons({
      style: {
        color: "gold",
        shape: "rect",
        label: "checkout",
      },

      createOrder: (data, actions) => {
        return actions.order.create({
          purchase_units: [
            {
              amount: { value: amount },
            },
          ],
        });
      },

      onApprove: async (data, actions) => {
        await actions.order.capture();
        alert("Paiement PayPal confirmé.");
      },

      onError: () => {
        alert("Erreur PayPal.");
      },
    })
    .render("#paypal-button-container");
}

/* ============================================================
   9️⃣ TELEGRAM
============================================================ */
async function sendTelegram(text) {
  await fetch(
    `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text,
      }),
    }
  );
}

/* ============================================================
   🔟 PDF
============================================================ */
function generatePDF(data) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  let y = 20;

  doc.setFont("helvetica", "bold");
  doc.text("Confirmation de Réservation - Premium VTC IDF", 20, y);
  y += 15;

  doc.setFont("helvetica", "normal");

  function addLine(label, value) {
    if (!value || value.trim() === "") value = "—";
    doc.text(`${label} : ${value}`, 20, y);
    y += 10;
  }

  addLine("Nom", data.nom);
  addLine("Email", data.email);
  addLine("Téléphone", data.telephone);
  addLine("Pays", data.pays);

  y += 5;
  addLine("Départ", data.start);
  addLine("Arrivée", data.end);
  addLine("Date", data.date);

  addLine("Passagers", data.passagers);

  // Message (multi-ligne sécurisé)
  doc.text("Message :", 20, y);
  y += 8;
  const message = data.message && data.message.trim() !== "" ? data.message : "—";
  const split = doc.splitTextToSize(message, 170);
  doc.text(split, 25, y);
  y += split.length * 7 + 5;

  addLine("Distance", data.distance);
  addLine("Durée", data.duree);
  addLine("Prix", data.prix + " €");

  doc.save("Reservation_PremiumVTC.pdf");
}


/* ============================================================
   1️⃣1️⃣ ENREGISTRER RÉSERVATION
============================================================ */
document.getElementById("reserver")?.addEventListener("click", async () => {
  const data = getFormData();

  if (!data.start || !data.end || data.prix === "— €") {
    alert("Veuillez calculer le prix.");
    return;
  }

  const id = await sendToBackend(data);

  await sendTelegram(
`📌 Nouvelle réservation PREMIUM VTC IDF

👤 Nom : ${data.nom}
📧 Email : ${data.email}
📞 Téléphone : ${data.telephone}
🌍 Pays : ${data.pays}

🚗 Trajet : ${data.start} → ${data.end}
🕒 Date : ${data.date}
👥 Passagers : ${data.passagers}
📝 Message : ${data.message || "Aucun message"}

📏 Distance : ${data.distance}
⏱ Durée : ${data.duree}
💶 Prix : ${data.prix}`
  );

  generatePDF(data);

  alert("Votre réservation a été enregistrée.");
});


