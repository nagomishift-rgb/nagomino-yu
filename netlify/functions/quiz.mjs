import {quiz} from "./quiz-data.mjs";
export default async()=>Response.json(
  quiz.map(({id,question,options})=>({id,question,options})),
  {headers:{"Cache-Control":"no-store"}}
);
