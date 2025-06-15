import { makeExecutableSchema } from '@graphql-tools/schema'
import { readFileSync } from 'fs'
import type { GraphQLSchema } from 'graphql'
import { createYoga } from 'graphql-yoga'
import { join } from 'path'

import { db } from '@/db'
import { resolvers } from '@/graphql/resolvers'

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
  schema: schema as GraphQLSchema,
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
export async function GET(request: Request) {
  return handleRequest(request, {})
}

export async function POST(request: Request) {
  return handleRequest(request, {})
}

export async function OPTIONS(request: Request) {
  return handleRequest(request, {})
}
