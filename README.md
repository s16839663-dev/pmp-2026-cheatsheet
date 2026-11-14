# PMP 2026.7 最新ECO 学習メモ & チートシート

**2026年7月9日発効の最新 PMP Exam Content Outline (ECO)** に完全準拠した、スマートフォン対応の学習メモ・ツール/計算式早見表・模擬テスト Web アプリケーションです。

## 主な特徴
- **2026.7 最新ECO 全26タスク網羅**:
  - Domain I: **People** (33% / 8タスク)
  - Domain II: **Process** (41% / 10タスク)
  - Domain III: **Business Environment** (26% / 8タスク)
  - 予測型 vs アジャイル/ハイブリッド（60%重視）の対比、AI活用・サステナビリティ・価値ベースデリバリー等の新傾向を収録。
- **ツール・管理簿・成果物・計算式リスト（全72項目）**:
  - すべて **英語・日本語を併記**。
  - EVM（CPI, SPI, EAC 4パターン, TCPI）、PERT、EMV、NPV/IRR/ROI/BCR/Payback、PTA、クリティカルパス、ベロシティ予測等の計算式・判定基準を網羅。
- **模擬テスト（全30問）**:
  - 2026.7 ECO のドメイン比率・手法比率に準拠したオリジナル問題と詳細解説。
- **モバイルファーストUI**:
  - スマホ親指操作しやすいボトムナビゲーション、日英横断検索、折りたたみアコーディオン、学習済みチェック保存（`localStorage`）に対応。

## ディレクトリ構成
- `docs/` : GitHub Pages 公開用の静的Webサイト一式（`index.html`, `style.css`, `app.js`, `data/*.js`）
- `src/data/` : 正本データ（`eco_tasks.json`, `tools_outputs.json`, `mock_test.json`）
- `src/build_data.py` : `src/data/*.json` から `docs/data/*.js` を生成するスクリプト

## GitHub Pages での公開手順
1. GitHub 上に新規リポジトリを作成し、本プロジェクトをプッシュします。
2. GitHub リポジトリの **Settings > Pages** を開きます。
3. **Build and deployment > Source** で `Deploy from a branch` を選択し、Branch に `main`、フォルダに **`/docs`** を指定して **Save** をクリックします。
4. 数分後に発行される `https://<ユーザー名>.github.io/<リポジトリ名>/` のURLをスマホのブラウザで開いて利用できます（「ホーム画面に追加」でアプリのように使えます）。
