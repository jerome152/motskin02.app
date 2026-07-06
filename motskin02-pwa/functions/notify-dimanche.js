// Scheduled Netlify function: every Sunday at 09:00 Israel time (07:00 UTC)
// Sends a push notification via OneSignal reminding to update Minha times

exports.handler = async function() {
  const APP_ID = process.env.ONESIGNAL_APP_ID;
  const API_KEY = process.env.ONESIGNAL_REST_API_KEY;

  if (!APP_ID || !API_KEY) {
    console.error("Missing OneSignal credentials");
    return { statusCode: 500 };
  }

  try {
    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${API_KEY}`,
      },
      body: JSON.stringify({
        app_id: APP_ID,
        included_segments: ["All"],
        headings: { fr: "⏰ Actualisation des horaires" },
        contents: { fr: "Pensez à vérifier et mettre à jour l'heure de Minha pour cette semaine." },
      }),
    });
    const data = await response.json();
    console.log("Notification sent:", data);
    return { statusCode: 200 };
  } catch (err) {
    console.error("Error:", err);
    return { statusCode: 500 };
  }
};
