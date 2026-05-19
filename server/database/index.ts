import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm'
import * as schema from './schema'

let _db: ReturnType<typeof drizzle> | null = null

function getDb() {
  if (_db) return _db

  const config = useRuntimeConfig()

  const client = createClient({
    url: config.tursoUrl || 'file:./local.db',
    authToken: config.tursoAuthToken,
  })

  _db = drizzle(client, { schema })

  return _db
}

export const db = getDb()
export { schema }