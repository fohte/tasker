// @ts-check

/**
 * Storybook Test Runner設定ファイル
 */
module.exports = {
  /** Storybook URL */
  storybookUrl: 'http://localhost:6006',
  /** ブラウザオプション */
  browserOptions: {
    headless: true,
  },
  /** テスト実行オプション */
  testRunnerOptions: {
    skipSnapshots: true,
  },
}