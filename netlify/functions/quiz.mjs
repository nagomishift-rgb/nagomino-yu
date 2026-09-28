import { quiz } from "./quiz-data.mjs";

export default async () => Response.json(
  quiz.map(({ id, question, options, comment }) => ({ id, question, options, comment })),
  { headers: { "Cache-Control": "no-store" } }
);
