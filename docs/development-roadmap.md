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
- [x] リクエスト/レスポンス用DTO（`ExpenseRequest` / `ExpenseResponse`）+ `@Valid` でバリデーション
  - 必須: date / title / amount / paymentType（wireframeの「*必須」に合わせる）
  - record で実装。異常系（amount:0 / title空 → 400）を確認済み
- [x] `ExpenseController`
  - `POST /api/expenses` … 登録（201 + id 入り body を確認済み）
  - `GET  /api/expenses` … 一覧（新しい順）
- [x] `curl` で登録 → 一覧取得を確認（POST→201/id:1、GET→200 を確認 2026-06-28）

**ゴール**: ターミナルから支出を登録でき、一覧で返ってくる。フロントはまだ無関係。

---

## Phase 2. フロントの土台 ✅ 完了

画面を作る前に共通部分を用意する。ここを先にやると各画面が一気に作りやすくなる。

- [x] ルーティング導入（`react-router-dom`）: `/`（ホーム）・`/new`（入力）・`/transactions`（一覧）・`/transactions/:id`（詳細）
- [x] 共通レイアウト（wireframe上部のナビ「家計簿 / ホーム / 一覧」）
- [x] APIクライアント（`fetch` の薄いラッパ。ベースURL・JSON処理・エラー処理を一箇所に）
- [x] 型定義（`Expense`・`Category`・`PaymentType` を TS で。バックエンドのenumと一致させる）
- [x] Vite の dev proxy 設定（`/api` をバックエンドへ）

**ゴール**: 空ページでもルーティングで画面遷移でき、APIを呼ぶ準備が整う。

### ハマりどころメモ

- `<Routes>` を使うには、その外側（`main.tsx`）を **`<BrowserRouter>` で囲む**必要がある。
  囲まないと描画ごと落ちて**画面が真っ白**になる。同じ形（Provider を天井に置く）は ThemeProvider 等でも共通。
- **白画面が出たら、まず F12 → Console** を見る。原因がほぼ一発で分かる。
- `shadcn add` の直後は Vite が再最適化で固まることがある。**再起動**で直る（`rm -rf node_modules/.vite` も有効）。
- スタイルは **Tailwind + shadcn のトークンに統一**（`bg-background` / `text-muted-foreground` / `text-destructive` 等）。
  生の色を直書きしないことでダークモードが自動で効く。

---

## Phase 3. 入力画面（`input_wireframe_v6.html`）✅ 完了

最初の「画面 × API」連携。Phase1のPOSTにつなぐ。

- [x] フォームUI（日付・タイトル・金額・カテゴリselect・支払方法トグル・備考）
- [x] 入力state管理（バリデーションはバックエンドに一元化 ← 下記の方針を参照）
- [x] 登録ボタン → `POST /api/expenses` → 成功で一覧へ遷移
- [x] エラー時の表示（項目別 + 総括の二段構え）
- [x] 必須項目の `*必須` 表示

**ゴール**: ブラウザから支出を登録できる。

### 決めた方針：バリデーションはバックエンドに一元化

フロントでは業務ルール（必須・1以上など）を**判定しない**。理由:

- バックエンドの検証はどのみち必須（`curl` で直接叩かれるため省けない）。同じルールを2か所に書くと**二重管理**になり食い違う。
- フロントの仕事は「ユーザーが入力した状態を、"空っぽ"も含めて**正直にサーバーへ伝える**」こと。妥当性の判定はバックエンド。
- そのため `ExpenseInput` は `date: string | null` のように **null を許容する型**にして、空欄はそのまま `null` で送る。
  フロントで `if (!x) return;` と握りつぶすと「押しても無反応」の silent failure になるので**置かない**。
- `<Input required>`（HTML標準の必須属性）も**使わない**。ブラウザが送信自体をブロックしてしまい、
  バックエンドのメッセージが永久に出なくなるため。代わりに `aria-required` を使う。

### エラーメッセージの流れ（2系統が並走）

```
                    ┌─ errors{}  → fieldErrors → 各項目の下（FieldError）
バリデーション失敗 ──┤
                    └─ title     → err.message → 登録ボタン上（総括）

その他のエラー ──── detail or 既定文言 → err.message → 登録ボタン上
（通信断・500など）
```

- **項目別**: DTO の `@NotBlank(message="...")` → `GlobalExceptionHandler` が `fe.getDefaultMessage()` で取り出し
  → `pd.setProperty("errors", ...)` で JSON に載せる → api.ts が `ApiError.fieldErrors` に保持 → `<FieldError>` で表示。
- **総括**: `pd.setTitle(...)` → `body.title` → `ApiError.message` → 登録ボタン上に表示。
- `"errors"` というキー名は**独自の拡張メンバー**（RFC 7807 が明示的に許可）。Java 側とフロント側で名前を一致させる契約。
- ⚠️ `spring.mvc.problemdetails.enabled=true` は**入れないこと**。Spring 標準ハンドラが
  `MethodArgumentNotValidException` を横取りし、`errors` が消えて項目別表示が全部壊れる（検証済み）。

---

## Phase 4. 取引一覧画面（`transaction_list_wireframe.html`）✅ 完了

- [x] `GET /api/expenses` を取得して表に描画（日付・タイトル・カテゴリ・金額）
- [x] 合計支出バーの表示（絞り込み後の合計）
- [x] 絞り込み（月 / カテゴリ / カテゴリなし）
  - フロントでフィルタ。件数が増えたらAPIにクエリパラメータを追加（`?month=&category=`）
  - 月の選択肢はデータから自動生成。**今月は必ず選択肢に含める**（データ0件でも選べるように）
  - 初期値は今月（`currentMonth()`）
  - 「カテゴリなし」は番兵値 `"none"` を使う。**radix の `SelectItem` は `value=""` を受け付けない**ため
- [x] 金額の `¥` 表記・日付フォーマットの整形ヘルパー（`lib/format.ts` / `lib/labels.ts`）
- [x] 空状態（`filtered.length === 0`。「まだ登録がありません」と「この条件の取引はありません」を出し分け）

**ゴール**: 登録した支出が一覧で見え、月・カテゴリで絞れる。

### データ取得の定型（Phase 5・7 でも同じ形を使う）

```tsx
useEffect(() => {
    let cancelled = false;                  // ← 取得結果が不要になったことを示す目印
    (async () => {
        try   { const d = await api.xxx(); if (!cancelled) setData(d); }
        catch (e) { if (!cancelled) setError(...); }
        finally   { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };     // ← クリーンアップ関数
}, []);                                     // ← 空配列 = マウント時1回だけ
```

- **依存配列を書き忘れると無限ループ**（描画→取得→state更新→描画…）。
- `cancelled` は「画面を離れた後に `setState` してしまう」「StrictMode の2回実行で
  古い結果が新しい結果を上書きする」のを防ぐ。
- クリーンアップ関数が呼ばれるのは **①アンマウント時** と **②依存配列が変わって effect を再実行する直前**。
- `loading` / `error` / データ の**3状態**を必ず持つ。
- `map` でリストを描くときは `key` が必須。

---

## Phase 5. 取引詳細画面（`transaction_detail_wireframe.html`）✅ 完了

- [x] `GET /api/expenses/{id}` をバックエンドに追加
- [x] 一覧の行クリック → 詳細へ遷移して1件表示
- [x] 登録日時（createdAt）の表示

**ゴール**: 1件の詳細が見られる。

### 学んだこと

**URL の値の渡し方**
- パス（`/api/expenses/5` → `@PathVariable`）＝「どのリソースか」を特定する
- クエリ（`?month=2026-07` → `@RequestParam`）＝「どう絞り込むか」
- `@GetMapping("/id")` は `{}` が無いので**文字通り `/api/expenses/id`** というパスになる（プレースホルダにならない）

**「見つからない」の表現＝404**
- `Optional` をそのまま返すと 200 + 空body になり「存在しない」と「たまたま空」が区別できない
- 採用したのは**例外方式**: `orElseThrow(() -> new ExpenseNotFoundException(id))` を投げ、
  `GlobalExceptionHandler` で 404 の `ProblemDetail` に変換。バリデーションエラーと形式が揃い、
  Phase 6 の更新・削除でも同じ例外を使い回せる。
- これで `api.ts` の `body.detail` を読む枝が初めて生きた（404のメッセージがフロントの画面に出る）。
- カスタム例外は **`RuntimeException` を継承**する（検査例外だと呼び出し元に `throws` を強制してしまう）。

**`Optional` は「判断する場所」まで運ぶ乗り物**

| 層 | 戻り値 | 理由 |
|---|---|---|
| Repository | `Optional<Expense>` | 「見つからないことがある」事実を伝える |
| Service | `Optional<Expense>` | まだ判断しない |
| Controller | `ExpenseResponse` | ここで「無いなら404」と判断を下す。以降に不在は存在しない |

- `orElseThrow` を通った後に `Optional.of()` で包み直すのは「開けた箱をまた閉じる」冗長な形。
- ラムダ `() -> new Xxx()` にするのは**遅延生成**のため（中身があるときに無駄な例外オブジェクトを作らない）。

**フロント: `undefined` と `null` は別問題**
- `undefined`（まだ読み込めていない）→ **`if (!expense) return null;` で1回だけ絞り込む**。
  以降の JSX 全体で型が確定するので `?.` を全部 `.` に戻せる。
  **`?.` を散らすのは解決ではなく `undefined` の先送り**（下流の関数で同じエラーが出るだけ）。
- `null`（あるけど値が無い＝`category` / `createdAt` / `memo`）→ **その場で個別に処理**。
- 関数の引数やオブジェクトのキーに渡すときだけ型が厳しくなる。JSX に直接埋めるだけなら `null` はそのまま通る（何も描画されない）。
- `if (!expense) return null` は論理的に到達しない分岐（型の辻褄合わせの番人）。文言を出しても見えないので `null` で十分。

**その他のハマりどころ**
- `createdAt` は `"2026-06-28T11:51:48"` という**日時**形式。`split("-")` する `formatDateLong` に渡すと
  日が `NaN` になる。`formatDateTime` を別途用意し、`split("T")` で日付と時刻に割ってから処理する。
  予防策として日付用フォーマッタの先頭で `iso.split("T")[0]` しておくと静かに壊れない。
- JSX 内のコメントは `{/* ... */}`。`// ...` は**文字列として画面に描画される**。
- `&&` の落とし穴: React は `null`/`undefined`/`false` を描画しないが **`0` は描画する**。
  数値を条件にするときは `amount > 0 &&` のように明示的に比較する。
- flex 内でテキストを折り返すには **`min-w-0`** が必要（子要素は既定で中身より小さくならない）。
  ラベル側には `shrink-0`、値側には `min-w-0 break-words` をセットで。
- `whitespace-pre-wrap` を付けると Textarea で入力された改行がそのまま表示される。

---

## Phase 6. 編集・削除（CRUD の U / D）✅ 完了

- [x] `PUT    /api/expenses/{id}`（更新）と `DELETE /api/expenses/{id}`（削除）をAPIに追加
- [x] 編集画面（wireframe未作成 → 入力画面を再利用して初期値を流し込む）
- [x] 詳細画面の「編集する」「削除する」ボタンを接続
- [x] 削除前の確認ダイアログ（shadcn `AlertDialog`）

**ゴール**: 登録した支出を後から直せる・消せる。これでCRUD完成。

### 学んだこと

**バックエンド**
- `DELETE` は **204 No Content**（消したものは返しようがない）。`@ResponseStatus(HttpStatus.NO_CONTENT)` + 戻り値 `void`。
  付けないと 200 + 空ボディになり、フロントで `res.json()` がパースエラーになる。
  `api.ts` の `res.status === 204 ? undefined : res.json()` の分岐がここで初めて機能した。
- `PUT` は **200 + 更新後のデータ**。`@Valid` はそのまま効く。
- **「見つからない」判定は `jdbc.update()` の戻り値＝影響行数**で行う。UPDATE/DELETE は該当行が無くても
  例外を投げず「0行」で正常終了するため。0 なら `ExpenseNotFoundException`（Phase 5 のものを再利用）。
  `findById` で存在確認してから実行する方法もあるが、SQL が2回になるうえ同時削除を取りこぼす。

**踏んだバグ**
- 🔴 **`if (repo.update(...) == 0) {...} else { repo.update(...) }` で UPDATE が2回実行されていた。**
  `if` の条件式でメソッドを呼ぶと**その時点で実行される**。UPDATE は冪等なので結果が正しく見えて気づけない。
  → **副作用のあるメソッドは条件式に直接書かず、一度変数に受ける**（`int affected = ...`）。
- 🔴 `request.category().name()` は category が null のとき **NPE → 500**。`create` 側と同じ null チェックが必要。
  カテゴリは任意項目なので null は正常な入力。
- 404 判定は **Service に集約**した（Controller でも `orElseThrow` すると二重チェックになる）。
  Service が影響行数を知っているので、そこで投げるのが自然。

**フロント**
- 編集画面は `NewExpensePage` を**両用**にした。`useParams()` の `id` の有無でモード判別。
  違うのは「初期値」「送信先（create/update）」「文言」の3点だけ。
  → フォームが複雑化したら `<ExpenseForm initialValue onSubmit>` に切り出す手もある。
- 制御コンポーネントのフォームに既存値を流し込むには **`useEffect` で `setXxx` する**（初期値は初回しか効かないため）。
  日付は **`date` / `month` / `value` の3つ**を更新しないと表示がズレる。`fromISODate` がここで活きた。
- `AlertDialog` の `Cancel` / `Action` は **クリックで自動的に閉じる**（`onClick` は閉じる動作に加えて実行される）。
  開閉状態はコンポーネントが内部で持つので `useState` 不要。失敗時に開いたままにしたいなら `open` / `onOpenChange` で制御する。

**ハマりどころ**
- ⚠️ **リンクの `to` は先頭に `/` を付ける（絶対パス）**。`transactions/5/edit` と書くと現在地からの相対パスになり、
  `/transactions/5/transactions/5/edit` のような URL になって**どのルートにも一致せず何も表示されない**。
- URL の単数/複数の打ち間違い（`transaction` / `transactions`）も同じ症状になる。一致しないと React Router は黙って空を描画する。
- 同じコンポーネントを2用途で使ったら、**両方の入口を確認する**（`/new` が空フォームのままか＝新規モードを壊していないか）。

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
- **バックエンドを直したら bootRun を Stop → Run**（ソース保存だけでは反映されない）。
  「直したのに変わらない」と思ったら、まず再起動を疑う。フロント（Vite）は保存で即反映なので感覚が違う。

---

# 将来の拡張（Phase 8 の後）

## ユーザーがカテゴリを追加・編集できるようにする

現状カテゴリは Java の `enum`（`FOOD` / `TRANSPORT` / `CLOTHING` / `OTHER`）で**コードに固定**されている。
これを「**データとして管理される選択肢**」に変える改修。

- `categories` テーブルを新設（id, name, 表示順, 色 など）
- `expenses.category`（VARCHAR）→ `expenses.category_id`（外部キー）に変更。既存データの移行が必要
- カテゴリの CRUD API と管理画面を追加
- フロントの `client/src/lib/labels.ts` の `CATEGORY_LABELS`（固定マップ）を **API 取得**に置き換え
  - ラベルを1か所に集約してあるのは、この差し替えを楽にするための布石
- 一覧の絞り込み・入力画面の Select も、固定リストではなく取得したカテゴリで生成する

**注意点**: 削除されたカテゴリを参照している支出をどう扱うか（論理削除にする / 「その他」へ寄せる等）を先に決めること。

## その他のアイデア

- 収入の記録（現状は支出のみ）
- 月次の予算設定と超過アラート
- CSV エクスポート / インポート
- グラフ表示（カテゴリ別の円グラフ、月推移の折れ線）
