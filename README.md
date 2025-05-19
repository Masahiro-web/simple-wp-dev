# WordPress + Vite + Docker 開発環境

Docker、Vite、WP-Envを使用してWordPressのローカル開発環境を構築します。
`theme/src`ディレクトリ内のscssとjsの最適化及びトランスパイルを実行します。
開発環境ではsrcディレクトリの変更はホットリロードに対応しています。（Mac未検証）
tailwindcss v4がインストールされます。

## 開発環境側でインストールが必要なもの

- Node.js (v14以上)
- Docker と Docker Compose
- npm または yarn

## セットアップ

1. リポジトリをクローン
2. 依存関係のインストール
    ```bash
    npm install
    ```
3. WordPress環境の起動
    ```bash
    npm run wp-env start
    ```
4. フロントエンド開発サーバーの起動
    ```bash
    npm run dev
    ```
   または、一度に両方を起動
    ```bash
    npm run start
    ```

### データベースのバックアップ
SQLファイルとしてデータベースをエクスポートするには、以下のコマンドを使用します。
バックアップファイルはsqlディレクトリに日付付きのファイル名（例: backup-20250519.sql）で保存されます。

```bash
# Linux/Mac環境の場合
npm run backup-db

# Windows環境の場合
npm run backup-db-win
```

### データベースのリストア
バックアップからデータベースを復元するには、以下のコマンドを使用します。
```bash
# 特定のファイルを指定して復元
npm run restore-db ./sql/バックアップファイル名.sql

# 例
npm run restore-db ./sql/backup-20250519.sql
```

## 開発

- WordPress環境は `http://localhost:8888` でアクセスできます
  - 管理画面: `http://localhost:8888/wp-admin/`
  - ユーザー名: `admin`
  - パスワード: `password`
- フロントエンドの開発には Vite を使用します（`http://localhost:3000`）
- テーマの変更は `./theme` ディレクトリ内で行います
- ソースファイルは `./theme/src` ディレクトリにあります

## 主なnpmコマンド

- `npm run start` - WordPress環境とVite開発サーバーを同時に起動
- `npm run wp-env start` - WordPressのDocker環境のみを起動
- `npm run dev` - Vite開発サーバーのみを起動
- `npm run stop` - WordPress環境を停止
- `npm run destroy` - WordPress環境を完全に削除（データも削除）

## ビルド

本番環境用にビルドするには、以下のコマンドを実行してください。

```bash
npm run build
```

これにより、`theme/dist` ディレクトリにビルドされたアセットが生成されます。

## フォルダ構造

```plaintext
.
├── theme/                  # WordPressテーマディレクトリ
│   ├── dist/              # ビルドされたアセット（JS, CSS）
│   ├── src/               # ソースファイル
│   │   ├── js/           # JavaScriptファイル
│   │   │   └── main.js   # メインのJavaScriptファイル
│   │   └── scss/         # SCSSファイル
│   │       └── style.scss # メインのスタイルファイル
│   ├── functions.php     # WordPressテーマ機能
│   ├── index.php         # メインテンプレートファイル
│   └── ...               # その他のテーマファイル
├── sql/                    # データベースバックアップ
│   └── backup-*.sql       # バックアップファイル
├── package.json            # npm設定とスクリプト
├── vite.config.js          # Vite設定ファイル
├── tailwind.config.js      # Tailwind CSS設定
├── postcss.config.js       # PostCSS設定
└── .wp-env.json            # WordPress環境設定
```

## 注意事項

- 初回のビルドには時間がかかる場合があります。
- キャッシュの問題で変更が反映されない場合があります。その際はブラウザのキャッシュをクリアしてください。
