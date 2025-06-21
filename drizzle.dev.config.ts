import { defineConfig } from 'drizzle-kit';
import * as fs from 'fs';
import * as path from 'path';

function findD1DatabaseUrl() {
  const dir = path.resolve('.wrangler/state/v3/d1/miniflare-D1DatabaseObject');
  const files = fs.readdirSync(dir);
  const sqliteFile = files.find((f) => f.endsWith('.sqlite'));
  if (!sqliteFile) {
    throw new Error('No .sqlite file found in .wrangler/state/v3/d1');
  }

  return path.join(dir, sqliteFile);
}

export default defineConfig({
  out: './db/migrations',
  schema: './db/schema.ts',
  dialect: 'sqlite',
  dbCredentials: {
    url: findD1DatabaseUrl(),
  },
});
