# なごみの湯クイズ検定 ～第1弾～ LINE + Netlify

添付の10問を4択クイズとして出題するLIFFアプリです。

## 構成
- HTML / CSS / JavaScript
- LINE LIFF SDK v2
- Netlify Functions
- LINE IDトークンをサーバー側で検証
- 正解判定をサーバー側で実施

## LINE Developers
1. LINE Loginチャネルを作成
2. LIFFアプリを追加
3. Endpoint URLをNetlify公開URLに設定
4. LIFF IDを取得
5. LINE LoginチャネルIDを確認
6. LIFFのopenid scopeを有効化

## Netlify環境変数
- LINE_CHANNEL_ID = LINE LoginチャネルID

LIFF_IDは `public/config.js` に設定します。

## 注意
添付資料には「問題・正解」のみが記載されています。
そのため4択の不正解候補はアプリ用に作成しています。公開前に運営側で最終確認してください。

## デプロイ
GitHubへアップロードしてNetlifyでImportするだけで利用できます。
