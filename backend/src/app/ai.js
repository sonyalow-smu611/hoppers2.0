// // PURPOSE OF AI:
// // return cafe recommendations based on user preferences(filter UX), using the Deepseek API to understand and match the user's needs with the cafe attributes.

// // Calling OpenAI Library
// import OpenAI from "openai";
// // Calling the dotenv library -> allows me to read from env variables
// import "dotenv/config";
// // Importing express library
// import express from "express"

// const app = express();
// app.use(express.json());

// const client = new OpenAI({
//   baseURL: "https://api.deepseek.com",
//   apiKey: process.env.DEEPSEEK_API_KEY,
// });

// async function recommendCafes(cafes, preferences) {
//   const prompt = `
// You are a cafe recommendation assistant.

// Here are the available cafes:
// ${JSON.stringify(cafes, null, 2)}

// Here are the user's preferences:
// ${JSON.stringify(preferences, null, 2)}

// Return the cafes as a JSON array (no markdown, no extra text) with this structure:
// [
//   {
//     "name": "Cafe Name",
//     "matchScore": <number from 1 to 5>,
//     "summary": "<1–2 sentence explanation of why this cafe suits the user>"
//   }
// ]

// Rank them by match score (highest first). Be specific in the summary.
// `;

//   const response = await client.chat.completions.create({
//     model: "deepseek-chat", // or "deepseek-reasoner" for R1
//     messages: [{ role: "user", content: prompt }],
//     max_tokens: 1024,
//   });

//   console.log(response);

//   const raw = response.choices[0].message.content.trim();

//   // Strip markdown fences if the model adds them despite instructions
//   const clean = raw.replace(/^```json\n?|```$/g, "").trim();

//   return JSON.parse(clean);
// }

// app.post("/api/recommend", async (req, res) => {
//   try {
//     const { cafes, preferences } = req.body;

//     if (!Array.isArray(cafes) || !preferences || !cafes) {
//       return res.status(400).json({
//         error: "Request body must include 'cafes' (array) and 'preferences' (object).",
//       });
//     }

//     const results = await recommendCafes(cafes, preferences);
//     console.log(results)
//     res.json({ results });
//   } catch (err) {
//     console.error("Error generating recommendations:", err);
//     res.status(500).json({ error: "Failed to generate recommendations." });
//   }
// });

// app.get('/', (req, res) => {
//   res.send('Hello World!');
// });


// const PORT = process.env.PORT || 4000;
// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });

