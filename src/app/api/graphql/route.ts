import { createYoga } from 'graphql-yoga'
import { readFileSync } from 'fs'
import { join } from 'path'
import { resolvers } from '@/graphql/resolvers'
import { db } from '@/db'
import { makeExecutableSchema } from '@graphql-tools/schema'

// スキーマファイルの読み込み
const typeDefs = readFileSync(
  join(process.cwd(), 'src/graphql/schema.graphql'),
  'utf8'
)

// スキーマを作成
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
})

// Yogaサーバーを作成
const { handleRequest } = createYoga({
  schema,
  // リクエストのたびにコンテキストを生成
  context: async () => {
    return {
      db,
    }
  },
  // GraphiQL設定（開発環境でのみ有効）
  graphiql: process.env.NODE_ENV !== 'production',
  // ヘッダー設定
  graphqlEndpoint: '/api/graphql',
})

// Next.jsのAPIルートハンドラー
export const GET = handleRequest
export const POST = handleRequest
export const OPTIONS = handleRequest
