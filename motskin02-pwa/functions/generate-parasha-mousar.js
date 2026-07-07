// motskin02-pwa/functions/generate-parasha-mousar.js
//
// Génère, en un seul appel Claude :
//   - un résumé de la paracha de la semaine
//   - 2 à 3 points de moussar (leçons de vie)
//   - un résumé de la haftara
//
// Appelée par App.js (fetchParachaSemaineMousar), une fois par semaine :
// le cache côté client (localStorage) est gardé par clé de semaine (dimanche),
// donc cette fonction n'est en pratique appelée qu'une fois par semaine et par paracha.
//
// Nécessite la variable d'environnement Netlify : ANTHROPIC_API_KEY (avec crédits disponibles).

exports.handler = async function (event) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: "Method Not Allowed" };
  }

  try {
    const { paracha, haftara } = JSON.parse(event.body || "{}");
    if (!paracha) {
      return {
        statusCode: 400,
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ error: "paracha manquante" }),
      };
    }

    const prompt = `Tu es un enseignant de Torah pour une synagogue séfarade francophone (Edot HaMizrach).
Pour la paracha "${paracha}"${haftara ? ` et sa haftara (référence : ${haftara})` : ""}, rédige en français :

1. "summary" : un résumé clair et vivant de la paracha de la semaine (8 à 12 lignes maximum), accessible à tous, sans jargon excessif.
2. "mousar" : exactement 2 à 3 points de moussar (leçons de vie / enseignement éthique) tirés de cette paracha, courts (1 à 2 phrases chacun), concrets et applicables au quotidien.
3. "haftaraSummary" : un résumé court de la haftara (5 à 8 lignes), expliquant si possible son lien avec la paracha.

Réponds UNIQUEMENT avec un objet JSON valide, sans aucun texte avant ou après, sans balises markdown ni retour à la ligne en dehors des chaînes, au format exact :
{"summary": "...", "mousar": ["...", "...", "..."], "haftaraSummary": "..."}`;

    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 1200,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await resp.json();

    if (!resp.ok) {
      console.error("Anthropic API error:", data);
      return {
        statusCode: 502,
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Erreur API Claude", details: data }),
      };
    }

    const raw = data?.content?.find((b) => b.type === "text")?.text || "";
    const clean = raw.replace(/```json|```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(clean);
    } catch (e) {
      // Si le JSON n'a pas pu être parsé, on renvoie au moins le texte brut en résumé
      // plutôt que de faire échouer complètement la réponse.
      parsed = { summary: clean, mousar: [], haftaraSummary: "" };
    }

    return {
      statusCode: 200,
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        summary: parsed.summary || "",
        mousar: Array.isArray(parsed.mousar) ? parsed.mousar : [],
        haftaraSummary: parsed.haftaraSummary || "",
      }),
    };
  } catch (e) {
    console.error("generate-parasha-mousar error:", e);
    return {
      statusCode: 500,
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ error: e.message }),
    };
  }
};
