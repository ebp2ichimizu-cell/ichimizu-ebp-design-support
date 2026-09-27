# いちみず会 EBP実践設計支援

GitHub Pages向けの静的サイトです。外部AI APIは使わず、入力内容からマスタープロンプトをブラウザ内で生成します。

## 主な仕様
- 初期入力フォーム
- 各項目に記載例
- 個人情報・捜査情報・未公表情報等を入力しない旨を明示
- 「内容を確認」でブラウザ内スキャン
- 電話番号、メール、郵便番号、詳細住所らしい記載はコピー停止
- 捜査・未公表・秘密情報等の注意語は要確認
- 入力内容の確認画面
- 「入力に戻る」
- 「この内容でプロンプトをコピー」
- 特定AIへのリンクは設置しない
- コピー後、利用中のAIへ貼り付ける方式
- 入力内容はサーバーへ送信しない

## ファイル
- index.html
- styles.css
- app.js
- prompt-template.js
- resource-links.js

## GitHub Pages
リポジトリ直下に全ファイルを置き、Settings → Pages → Deploy from a branch → main / root を指定してください。

## 更新箇所
### マスタープロンプト
`prompt-template.js`

### いちみず会関連URL台帳
`resource-links.js`

### 簡易スキャン規則
`app.js` の `highRiskRules` と `warningKeywords`

## 注意
ブラウザ内の簡易スキャンは完全な個人情報・機微情報検出を保証しません。利用者自身による最終確認を前提としています。
