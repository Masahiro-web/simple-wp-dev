/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./theme/**/*.php",    // PHPファイルを確認
    "./theme/src/**/*.js", // JSファイルを確認
    "./theme/index.php",   // 特に重要なファイルを明示的に指定
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}