import { neon, type NeonQueryFunction } from '@neondatabase/serverless'
import { requireEnv } from './http.js'

let sql: NeonQueryFunction<false, false> | undefined

/** Neon over HTTP: one round trip per query, no connection to keep open between invocations. */
export function db(): NeonQueryFunction<false, false> {
  sql ??= neon(requireEnv('DATABASE_URL'))
  return sql
}
