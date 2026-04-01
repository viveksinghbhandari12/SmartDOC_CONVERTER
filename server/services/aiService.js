import OpenAI from "openai";

function getClient() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    const err = new Error("OpenAI API key is not configured");
    err.status = 503;
    err.code = "AI_NOT_CONFIGURED";
    throw err;
  }
  return new OpenAI({ apiKey: key });
}

export async function summarizeText(text, options = {}) {
  const client = getClient();
  const input = (text || "").slice(0, 120_000);
  const completion = await client.chat.completions.create({
    model: options.model || "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a concise assistant. Summarize the user's document in clear bullet points or short paragraphs. Keep the summary faithful and note uncertainty if the input is unclear.",
      },
      { role: "user", content: input },
    ],
    temperature: 0.3,
    max_tokens: 1024,
  });
  return completion.choices[0]?.message?.content?.trim() || "";
}

export async function grammarFixText(text, options = {}) {
  const client = getClient();
  const input = (text || "").slice(0, 120_000);
  const completion = await client.chat.completions.create({
    model: options.model || "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are an editor. Fix grammar, spelling, and clarity. Preserve meaning and tone. Return only the improved text, no preamble.",
      },
      { role: "user", content: input },
    ],
    temperature: 0.2,
    max_tokens: 4096,
  });
  return completion.choices[0]?.message?.content?.trim() || "";
}

/**
 * @param {"hi-en" | "en-hi"} direction
 */
export async function translateText(text, direction, options = {}) {
  const client = getClient();
  const input = (text || "").slice(0, 120_000);
  const dirPrompt =
    direction === "hi-en"
      ? "Translate the following text from Hindi to English."
      : "Translate the following text from English to Hindi.";
  const completion = await client.chat.completions.create({
    model: options.model || "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `${dirPrompt} Return only the translation, no notes.`,
      },
      { role: "user", content: input },
    ],
    temperature: 0.2,
    max_tokens: 4096,
  });
  return completion.choices[0]?.message?.content?.trim() || "";
}
