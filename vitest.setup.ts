function ensureEnv(name: string, value: string) {
  if (!process.env[name]) {
    process.env[name] = value
  }
}

// `src/lib/env.ts` has required env parsing at module load time.
// Provide defaults so tests can import env-dependent modules safely.
ensureEnv('BASE_URL', 'https://example.com/')
ensureEnv('SCRAPBOX_INDEX_PAGE', 'Index')
ensureEnv('SCRAPBOX_PROJECT', 'project')
ensureEnv('SITE_NAME', 'Maillard')
