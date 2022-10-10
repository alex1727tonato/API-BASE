export const DEVELOPMENT_ENV =
  process.env.APIALEXENV !== 'production' || !!_DEV_

function getDatabaseURI() {
  return `mongodb://127.0.0.1:27017/to-do-test`
}

export default {
  name: 'api-alex',
  version: '0.0.1',
  port: process.env.PORT || '3001',
  databaseURI: getDatabaseURI(),
  databaseAttempts: 20,
}

export const secret = 'Ap1al3xD3kr1pTer'
export const cookie = 'katggadr'
