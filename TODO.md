- zapisywanie chatu z AI w TaskDetailModal.tsx (idb-keyval)
- edytowanie task'u {note.content} w TaskDetailModal.tsx (MDEditor)
- markdown w  <p className="text-gray-600 text-sm mb-4">{note.content}</p> w TaskDetailModal.tsx
    import MDEditor from "@uiw/react-md-editor";
    import Markdown from "react-markdown";
    import remarkGfm from "remark-gfm";
     <Markdown remarkPlugins={[remarkGfm]}>{text}</Markdown>
- dodac wybór w ConfigModal.tsx miedzy ollama/gemini

```ts
async function generateWithGemini(
  prompt: string,
  { apikey, model }: GeminiConfig,
): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apikey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    },
  );
  const data: GeminiResponse = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim().replace(/\s+/g, " ") || "";
}

```