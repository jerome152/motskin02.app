// Netlify function: generates a 5-sentence French summary of the Torah reading
// for a given day of the week (0=Sunday→Rishon, 1=Monday→Sheni, etc.)
// Uses Claude AI and Hebcal API for the current paracha name.

exports.handler = async function(event) {
  const CLAUDE_API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!CLAUDE_API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: "No API key" }) };
  }

  let paracha = "";
  let dayOfWeek = 0;

  try {
    const body = JSON.parse(event.body || "{}");
    paracha = body.paracha || "";
    dayOfWeek = body.dayOfWeek ?? new Date().getDay(); // 0=Sunday, 6=Saturday
  } catch {}

  if (!paracha) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing paracha name" }) };
  }

  // Map day of week to aliyah name
  const aliyahNames = ["Rishon (1ère)", "Cheni (2ème)", "Chelishi (3ème)", "Revi'i (4ème)", "Hamichi (5ème)", "Chichi (6ème)", "Chevi'i (7ème)"];
  const aliyah = aliyahNames[dayOfWeek] || aliyahNames[0];

  const prompt = `Tu es un expert en Torah. La paracha lue cette semaine en Israël est : "${paracha}".

Aujourd'hui c'est le ${["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"][dayOfWeek]}.

Résume en exactement 5 phrases en français, claires et accessibles, le contenu de l'aliyah ${aliyah} de la paracha ${paracha} (selon le calendrier israélien).

Si cette semaine on lit deux parachiot ensemble (ex: Matot-Massé, Nitsavim-Vayelekh), adapte le découpage des aliyot en conséquence pour le double-sidra israélien.

Réponds UNIQUEMENT avec les 5 phrases, séparées par des retours à la ligne, sans titre ni introduction.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 400,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    const summary = data.content?.[0]?.text || "";

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ summary, paracha, aliyah }),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
