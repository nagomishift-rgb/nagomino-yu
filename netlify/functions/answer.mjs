import { quiz } from "./quiz-data.mjs";

const hints = {
  q1: "10：30開店～翌9：00閉店",
  q2: "幅広いジャンルを取り揃えています。",
  q3: "都内最高レベルの炭酸濃度　　炭酸泉前の案内掲示板に表示",
  q4: "露天風呂に温泉名が掲示されています。　黒い鉱石をイメージさせる名前です。",
  q5: "部屋名を象徴する木（オブジェ）が部屋の中央にあります。",
  q6: "5階岩盤浴ラウンジ内にある７つの部屋の内の１つ　館内に部屋の紹介ボードあります。",
  q7: "盤浴の各部屋（彩・緑彩・楼蘭）の前に設置している鉱石名が表示されています。",
  q8: "部屋が円形の構造であり、お客様との距離が近いことから、このスタイルを採用しました。",
  q9: "3ロッカールームや黒龍前（5階）にプログラムを掲示してあります。",
  q10: "ウナ後の水分補給にぴったりなオリジナルドリンクで毎月このドリンクにちなんだ『〇〇スパ』の日（半額Day）』があります。
"
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
