import { createYoga } from 'graphql-yoga'
import { readFileSync } from 'fs'
import { join } from 'path'
import { resolvers } from '@/graphql/resolvers'
import { db } from '@/db'

// スキーマファイルの読み込み
const typeDefs = readFileSync(
  join(process.cwd(), 'src/graphql/schema.graphql'),
  'utf8'
)

// Yogaサーバーを作成
const { handleRequest } = createYoga({
  schema: {
    typeDefs,
    resolvers,
  },
  // リクエストのたびにコンテキストを生成
  context: async () => {
    return {
      db,
    }
  },
  // GraphiQL設定（開発環境でのみ有効）
  graphiql: process.env.NODE_ENV !== 'production',
  // ヘッダー設定
  fetchAPI: { Response },
})

// Next.jsのAPIルートハンドラー
export async function GET(request: Request) {
  return handleRequest(request)
}

export async function POST(request: Request) {
  return handleRequest(request)
}

// OPTIONSメソッドもサポート（CORS対応）
export async function OPTIONS(request: Request) {
  return handleRequest(request)
}