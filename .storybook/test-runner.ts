import type { TestRunnerConfig } from '@storybook/test-runner'

const config: TestRunnerConfig = {
  async preRender(page) {
    // ページのロード待ち
    await page.waitForLoadState('networkidle')
  },
  async postRender(page) {
    // アクセシビリティテストの実行（オプション）
    // アクセシビリティテストを使用する場合は必要なパッケージをインストールしてください
    // const { injectAxe, checkA11y } = require('axe-playwright')
    // await injectAxe(page)
    // await checkA11y(page)
  },
}

export default config