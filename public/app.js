const state={questions:[],index:0,answers:[],idToken:null};

const $=id=>document.getElementById(id);

async function init(){
  try{
    if(!window.APP_CONFIG?.LIFF_ID||window.APP_CONFIG.LIFF_ID==="YOUR_LIFF_ID") throw Error("LIFF_ID未設定");
    await liff.init({liffId:window.APP_CONFIG.LIFF_ID});
    if(!liff.isLoggedIn()){ liff.login(); return; }
    state.idToken=liff.getIDToken();
    if(!state.idToken) throw Error("IDトークン取得失敗");
    try{
      const p=await liff.getProfile();
      $("loginStatus").textContent=`${p.displayName} さん、準備OKです。`;
    }catch{$("loginStatus").textContent="LINEログイン済みです。準備OKです。";}
    const res=await fetch("/api/quiz");
    if(!res.ok) throw Error("問題取得失敗");
    state.questions=await res.json();
    $("startBtn").disabled=false;
  }catch(e){
    console.error(e);
    $("loginStatus").textContent="初期化に失敗しました。LIFF設定を確認してください。";
  }
}

function startQuiz(){
  state.index=0;state.answers=[];
  $("startScreen").classList.add("hidden");
  $("resultScreen").classList.add("hidden");
  $("quizScreen").classList.remove("hidden");
  render();
}

function render(){
  const q=state.questions[state.index];
  $("progress").textContent=`第${state.index+1}問 / ${state.questions.length}`;
  $("score").textContent=`正解 ${state.answers.filter(x=>x.correct).length}`;
  $("questionNo").textContent=`Q${state.index+1}`;
  $("questionText").textContent=q.question;
  $("nextBtn").classList.add("hidden");
  $("options").innerHTML="";
  q.options.forEach((label,i)=>{
    const b=document.createElement("button");
    b.className="option";
    b.innerHTML=`<span class="optionLabel">${String.fromCharCode(65+i)}</span>${escapeHtml(label)}`;
    b.onclick=()=>answer(i,b);
    $("options").appendChild(b);
  });
}

function answer(index,clicked){
  const q=state.questions[state.index];
  const buttons=[...document.querySelectorAll(".option")];
  if(buttons.some(b=>b.disabled)) return;
  buttons.forEach(b=>b.disabled=true);
  const correct=index===q.correctIndex;
  clicked.classList.add(correct?"correct":"wrong");
  if(!correct) buttons[q.correctIndex].classList.add("correct");
  state.answers.push({questionId:q.id,selectedIndex:index,correct});
  $("score").textContent=`正解 ${state.answers.filter(x=>x.correct).length}`;
  $("nextBtn").textContent=state.index===state.questions.length-1?"結果を見る":"次の問題へ";
  $("nextBtn").classList.remove("hidden");
}

async function finish(){
  $("quizScreen").classList.add("hidden");
  $("resultScreen").classList.remove("hidden");
  const local=state.answers.filter(x=>x.correct).length;
  showResult(local);
  try{
    const res=await fetch("/api/submit",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
      idToken:state.idToken,
      answers:state.answers.map(x=>({questionId:x.questionId,selectedIndex:x.selectedIndex}))
    })});
    const data=await res.json();
    if(res.ok&&typeof data.score==="number") showResult(data.score);
  }catch(e){console.warn(e);}
}

function showResult(score){
  $("finalScore").textContent=score;
  $("resultMessage").textContent=score===10?"全問正解！なごみの湯マスターです！":score>=7?"すごい！かなりのなごみの湯通です！":"お疲れさまでした！もう一度挑戦してみてください。";
}

function escapeHtml(v){return String(v).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");}

$("startBtn").onclick=startQuiz;
$("retryBtn").onclick=startQuiz;
$("nextBtn").onclick=()=>{if(state.index===state.questions.length-1)finish();else{state.index++;render();}};
$("closeBtn").onclick=()=>{if(window.liff?.isInClient?.())liff.closeWindow();};
init();
