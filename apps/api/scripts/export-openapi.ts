/**
 * Write the API's OpenAPI spec to packages/client/openapi.json, the source the client's
 * types are generated from. Run through `pnpm gen:api-types` at the repository root.
 */
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { app } from '../src/index'

const out = join(import.meta.dirname, '../../../packages/client/openapi.json')
const spec = await (await app.request('/openapi.json')).json()
writeFileSync(out, `${JSON.stringify(spec, null, '\t')}\n`)
console.log(`Wrote ${out}`)
