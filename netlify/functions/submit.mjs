import {quiz} from "./quiz-data.mjs";

async function verifyLineIdToken(idToken){
  if(!idToken) throw Error("LINE ID token is required");
  const channelId=process.env.LINE_CHANNEL_ID;
  if(!channelId) throw Error("LINE_CHANNEL_ID is not configured");
  const body=new URLSearchParams({id_token:idToken,client_id:channelId});
  const response=await fetch("https://api.line.me/oauth2/v2.1/verify",{
    method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body
  });
  if(!response.ok) throw Error("Invalid LINE ID token");
  return response.json();
}

export default async request=>{
  if(request.method!=="POST") return Response.json({error:"Method Not Allowed"},{status:405});
  try{
    const {idToken,answers}=await request.json();
    const lineUser=await verifyLineIdToken(idToken);
    if(!Array.isArray(answers)) return Response.json({error:"answers must be an array"},{status:400});
    const selected=new Map(answers.map(a=>[String(a.questionId),Number(a.selectedIndex)]));
    let score=0;
    for(const q of quiz) if(selected.get(q.id)===q.correctIndex) score++;
    return Response.json({score,total:quiz.length,perfect:score===quiz.length,lineUserId:lineUser.sub},
      {headers:{"Cache-Control":"no-store"}});
  }catch(e){
    console.error(e);
    return Response.json({error:"認証または採点に失敗しました。"},{status:401});
  }
};
