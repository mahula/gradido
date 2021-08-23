// ATTENTION: DO NOT PUT ANY SECRETS IN HERE (or the .env)

import dotenv from 'dotenv'
dotenv.config()

const server = {
  PORT: process.env.PORT || 4000,
  JWT_SECRET: process.env.JWT_SECRET || 'secret123',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '10m',
  GRAPHIQL: process.env.GRAPHIQL === 'true' || false,
  LOGIN_API_URL: process.env.LOGIN_API_URL || 'http://login-server:1201/',
  COMMUNITY_API_URL: process.env.COMMUNITY_API_URL || 'http://ngninx/api/',
  GDT_API_URL: process.env.GDT_API_URL || 'https://gdt.gradido.net',
  KLICKTTIPP_API_URL: process.env.KLICKTIPP_API_URL || 'https://api.klicktipp.com',
  KLICKTIPP_USER: process.env.KLICKTIPP_USER || 'mbaier-heinehannes',
  KLICKTIPP_PASSWORD: process.env.KLICKTIPP_PASSWORD || 'Ynq9m8HCP',
  KLICKTIPP_APIKEY_DE: process.env.KLICKTIPP_APIKEY_DE || '4vgozlkpz8z726a',
  KLICKTIPP_APIKEY_EN: process.env.KLICKTIPP_APIKEY_EN || '4vgpzlkpz8zb79c',
}

// This is needed by graphql-directive-auth
process.env.APP_SECRET = server.JWT_SECRET

const CONFIG = { ...server }

export default CONFIG
