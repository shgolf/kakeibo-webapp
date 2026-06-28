# 家計簿アプリ 開発ロードマップ

自力で開発を進めるための「作る順番」のメモ。詳細設計書ではなく、迷ったときに立ち返るための道標。

## 全体の方針（なぜこの順番か）

1. **縦割りで作る** … 1つの機能を「DB → API → 画面」まで一気通貫で完成させてから次へ進む。
   横割り（全API先に作る → 全画面後で作る）より、常に動くものが手元にあって達成感も得やすい。
2. **データを作る画面から先に** … 「入力」を最初に通す。一覧・詳細・ホームは *データが存在して初めて意味が出る* ので、
   入力ができてから表示系を作ると、毎回テストデータを手で投入する手間が消える。
3. **集計（ホームのサマリー）は最後** … カテゴリ別・支払方法別の合計はCRUDが揃ってから。一番ロジックが重く、データも必要。
4. **画面は「単純で独立したもの」から** … 入力画面は他画面に依存せず完結するので最初に向いている。

> 進め方のコツ: 各フェーズの最後に必ず「動作確認」を入れる。バックエンドは `curl`、フロントはブラウザで。
> 1フェーズ＝1コミット（または小さなPR）を目安にすると履歴が追いやすい。

---

## Phase 0. 基盤の疎通確認 ✅ 完了（2026-06-27）

コードを書く前に「環境が動く」ことだけ確認する。

- [x] `docker compose up -d` で PostgreSQL（5433）が起動する
- [x] `schema.sql` が DB に適用される（`spring.sql.init.mode: always` で起動時に毎回実行）
- [x] バックエンドが起動し DB に接続できる（HikariPool → PostgreSQL、Tomcat 8080）
- [x] フロントが起動する（Vite、5173）
- [ ] 動作確認用の疎通エンドポイント（例: `GET /api/health` が `ok` を返す）← Phase 1 の最初の練習に

**ゴール**: 4つ（DB / API / フロント）が全部立ち上がる。← 達成

### 起動手順（毎回これでOK）

```bash
# 1. DB（初回 or 停止後）
docker compose up -d            # 5433 で PostgreSQL

# 2. バックエンド（8080）
cd server
./gradlew bootRun
# ※ IntelliJ の Gradle パネルから bootRun してもOK
#   （application.yaml にローカル用デフォルト値を入れたので env の export は不要）

# 3. フロント（5173）。別ターミナルで
cd client
pnpm install                    # 初回のみ
pnpm dev
```

### ハマりどころメモ（Phase 0 で実際に踏んだ）

- **`.env` は git 管理外** なので、`git worktree` で作業ディレクトリを分けると **新しい worktree には `.env` が無い**。
  無ければ以下を worktree 直下に作る（値は起動中のコンテナと一致させること）:
  ```
  POSTGRES_USER=kakeibo
  POSTGRES_PASSWORD=kakeibo_local_dev
  POSTGRES_DB=kakeibo
  ```
- **Spring Boot は `.env` を自動で読まない**。`application.yaml` は `${POSTGRES_USER:kakeibo}` の形で
  **デフォルト値**（`:` の右）を持たせてあるので、env を渡さなくてもローカルでは起動する。
  IntelliJ の Gradle パネルから bootRun したとき env が無くて `password authentication failed for user "${POSTGRES_USER}"`
  （プレースホルダが未置換）になるのを防ぐため。`.env` を source すればそちらが優先される。
- コンテナは初回作成時の `.env` の値を保持する。後から `.env` を変えても **既存コンテナには反映されない**
  （作り直すなら `docker compose down -v` でボリュームごと消す → 再 `up`）。

---

## Phase 1. 支出の「登録」と「一覧取得」API（バックエンド）

CRUD の C（Create）と R（Read=一覧）。まずはサーバーだけで完結させる。

- [x] `ExpenseRepository`（`JdbcTemplate` でINSERT / SELECT、`RowMapper` で `Expense` に詰める）
- [x] `ExpenseService`（業務ロジックの置き場。今は薄くてよい）
- [ ] リクエスト/レスポンス用DTO（`ExpenseRequest` / `ExpenseResponse`）+ `@Valid` でバリデーション ← 次の改善
  - 必須: date / title / amount / paymentType（wireframeの「*必須」に合わせる）
  - 今はエンティティ直結で動かしている。`id`/`createdAt` を送らせない & バリデーションのため後で差し替える
- [x] `ExpenseController`
  - `POST /api/expenses` … 登録（201 + id 入り body を確認済み）
  - `GET  /api/expenses` … 一覧（新しい順）
- [x] `curl` で登録 → 一覧取得を確認（POST→201/id:1、GET→200 を確認 2026-06-28）

**ゴール**: ターミナルから支出を登録でき、一覧で返ってくる。フロントはまだ無関係。

---

## Phase 2. フロントの土台

画面を作る前に共通部分を用意する。ここを先にやると各画面が一気に作りやすくなる。

- [ ] ルーティング導入（`react-router` を追加）: `/`（ホーム）・`/new`（入力）・`/transactions`（一覧）・`/transactions/:id`（詳細）
- [ ] 共通レイアウト（wireframe上部のナビ「家計簿 / ホーム / 一覧」）
- [ ] APIクライアント（`fetch` の薄いラッパ。ベースURL・JSON処理・エラー処理を一箇所に）
- [ ] 型定義（`Expense`・`Category`・`PaymentType` を TS で。バックエンドのenumと一致させる）
- [ ] Vite の dev proxy 設定（`/api` をバックエンドへ）

**ゴール**: 空ページでもルーティングで画面遷移でき、APIを呼ぶ準備が整う。

---

## Phase 3. 入力画面（`input_wireframe_v6.html`）

最初の「画面 × API」連携。Phase1のPOSTにつなぐ。

- [ ] フォームUI（日付・タイトル・金額・カテゴリselect・支払方法トグル・備考）
- [ ] 入力state管理 + 必須項目のフロント側バリデーション
- [ ] 登録ボタン → `POST /api/expenses` → 成功で一覧へ遷移
- [ ] エラー時の表示（サーバーのバリデーションエラーを画面に出す）

**ゴール**: ブラウザから支出を登録できる。

---

## Phase 4. 取引一覧画面（`transaction_list_wireframe.html`）

- [ ] `GET /api/expenses` を取得して表に描画（日付・タイトル・カテゴリ・金額）
- [ ] 合計支出バーの表示（一覧の合計）
- [ ] 絞り込み（月 / カテゴリ）
  - まずはフロントでフィルタ → 件数が増えそうならAPIにクエリパラメータを追加（`?month=&category=`）
- [ ] 金額の `¥` 表記・日付フォーマットの整形ヘルパー
- [ ] 空状態（データ0件のときの表示）

**ゴール**: 登録した支出が一覧で見え、月・カテゴリで絞れる。

---

## Phase 5. 取引詳細画面（`transaction_detail_wireframe.html`）

- [ ] `GET /api/expenses/{id}` をバックエンドに追加
- [ ] 一覧の行クリック → 詳細へ遷移して1件表示
- [ ] 登録日時（createdAt）の表示

**ゴール**: 1件の詳細が見られる。

---

## Phase 6. 編集・削除（CRUD の U / D）

- [ ] `PUT    /api/expenses/{id}`（更新）と `DELETE /api/expenses/{id}`（削除）をAPIに追加
- [ ] 編集画面（wireframe未作成 → 入力画面を再利用して初期値を流し込むのが楽）
- [ ] 詳細画面の「編集する」「削除する」ボタンを接続
- [ ] 削除前の確認ダイアログ

**ゴール**: 登録した支出を後から直せる・消せる。これでCRUD完成。

---

## Phase 7. ホーム画面サマリー（`home_wireframe_v2.html`）

一番ロジックが重いので最後。CRUDとデータが揃ってから。

- [ ] 集計API: `GET /api/expenses/summary?month=YYYY-MM`
  - 当月合計支出 / 支払方法別（現金・クレジット）/ カテゴリ別合計 / 直近の取引
  - SQLの `GROUP BY` で集計するか、一覧を取ってフロントで集計するかは規模次第（まずはSQL集計がきれい）
- [ ] サマリーカード・カテゴリ別グリッド・直近取引リストの描画
- [ ] 「新規登録」「取引一覧を見る」への導線

**ゴール**: トップを開くと今月の状況が一目で分かる。

---

## Phase 8. 仕上げ

- [ ] ローディング / エラー / 空状態の表示を全画面で統一
- [ ] バリデーションエラー文言の整備
- [ ] 金額・日付フォーマットの共通化
- [ ] （任意）カテゴリのenumを増やす・色分けなど

---

## 困ったときの優先順位

- 「何から手をつける？」→ そのフェーズの **バックエンドAPIを先に** 作り `curl` で固める → 画面をつなぐ。
- 「APIと画面どっちでバグ？」→ `curl` でAPI単体が正しいか先に切り分ける。
- 行き詰まったら、そのフェーズを「APIだけ」「表示だけ」「フォームだけ」にさらに割って1つずつ通す。
  </content>
  </invoke>
