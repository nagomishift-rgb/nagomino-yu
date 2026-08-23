import { quiz } from "./quiz-data.mjs";

const hints = {
  q1: "24時間より少し短い営業時間です。",
  q2: "5,000冊より多く、8,000冊より少ない冊数です。",
  q3: "選択肢の中で最も高い濃度です。",
  q4: "黒い鉱石をイメージさせる名前です。",
  q5: "北欧の森林を思い浮かべてみてください。",
  q6: "お母さんのお腹の中をイメージした名前です。",
  q7: "6種類より多く、9種類より少ない数です。",
  q8: "上下ではなく、左右方向に風を送るのが特徴です。",
  q9: "3回より多く、6回より少ない回数です。",
  q10: "『なごみ』とスパを組み合わせた名前です。"
};

export default async (request) => {
  if (request.method !== "POST") {
    return Response.json(
      { error: "Method Not Allowed" },
      { status: 405 }
    );
  }

  try {
    const { questionId, selectedIndex } = await request.json();

    const question = quiz.find(
      q => q.id === String(questionId)
    );

    if (!question) {
      return Response.json(
        { error: "問題が見つかりません。" },
        { status: 404 }
      );
    }

    const index = Number(selectedIndex);
    const correct = index === question.correctIndex;

    return Response.json({
      correct,
      hint: correct ? "" : hints[question.id] || "もう一度考えてみてください。"
    });

  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "回答判定に失敗しました。" },
      { status: 500 }
    );
  }
};
