
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      erro: "Use o método POST."
    });
  }

  try {
    const texto = req.body?.texto;

    if (typeof texto !== "string" || !texto.trim()) {
      return res.status(400).json({
        erro: "Texto inválido."
      });
    }

    if (!process.env.FISH_API_KEY) {
      return res.status(500).json({
        erro: "Chave da Fish Audio não configurada."
      });
    }

    const resposta = await fetch(
      "https://api.fish.audio/v1/tts",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.FISH_API_KEY}`,
          "Content-Type": "application/json",
          "model": "s2.1-pro-free"
        },
        body: JSON.stringify({
          text: texto.trim(),
          reference_id: "82d13948027e4be69892dd3d0104e",
          format: "mp3"
        })
      }
    );

    if (!resposta.ok) {
      return res.status(502).json({
        erro: "Não foi possível gerar a voz.",
        status: resposta.status
      });
    }

    const audio = Buffer.from(
      await resposta.arrayBuffer()
    );

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "no-store");

    return res.status(200).send(audio);

  } catch (erro) {
    return res.status(500).json({
      erro: "Erro ao gerar o áudio."
    });
  }
}
