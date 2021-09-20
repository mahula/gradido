/* eslint-disable @typescript-eslint/no-explicit-any */

import 'reflect-metadata'
import express from 'express'
import cors from 'cors'
import { buildSchema } from 'type-graphql'
import { ApolloServer } from 'apollo-server-express'
import { RowDataPacket } from 'mysql2/promise'

import connection from './database/connection'
import typeOrmConnection from './typeorm/connection'
import CONFIG from './config'

// TODO move to extern
import { UserResolver } from './graphql/resolvers/UserResolver'
import { BalanceResolver } from './graphql/resolvers/BalanceResolver'
import { GdtResolver } from './graphql/resolvers/GdtResolver'
import { TransactionResolver } from './graphql/resolvers/TransactionResolver'

import { isAuthorized } from './auth/auth'

// TODO implement
// import queryComplexity, { simpleEstimator, fieldConfigEstimator } from "graphql-query-complexity";

const DB_VERSION = '0002-update_user'

const context = (args: any) => {
  const authorization = args.req.headers.authorization
  let token = null
  if (authorization) {
    token = authorization.replace(/^Bearer /, '')
  }
  const context = {
    token,
    setHeaders: [],
  }
  return context
}

async function main() {
  // check for correct database version
  const con = await connection()
  const [rows] = await con.query(`SELECT * FROM migrations ORDER BY version DESC LIMIT 1;`)
  if (
    (<RowDataPacket>rows).length === 0 ||
    !(<RowDataPacket>rows)[0].fileName ||
    (<RowDataPacket>rows)[0].fileName.indexOf(DB_VERSION) === -1
  ) {
    throw new Error(`Wrong database version - the backend requires '${DB_VERSION}'`)
  }

  const toCon = await typeOrmConnection()
  if (!toCon.isConnected) {
    throw new Error(`Couldn't open typeorm db connection`)
  }

  const schema = await buildSchema({
    resolvers: [UserResolver, BalanceResolver, TransactionResolver, GdtResolver],
    authChecker: isAuthorized,
  })

  // Graphiql interface
  let playground = false
  if (CONFIG.GRAPHIQL) {
    playground = true
  }

  // Express Server
  const server = express()

  const corsOptions = {
    origin: '*',
    exposedHeaders: ['token'],
  }

  server.use(cors(corsOptions))

  const plugins = [
    {
      requestDidStart() {
        return {
          willSendResponse(requestContext: any) {
            const { setHeaders = [] } = requestContext.context
            setHeaders.forEach(({ key, value }: { [key: string]: string }) => {
              requestContext.response.http.headers.append(key, value)
            })
            return requestContext
          },
        }
      },
    },
  ]

  // Apollo Server
  const apollo = new ApolloServer({ schema, playground, context, plugins })
  apollo.applyMiddleware({ app: server })

  // Start Server
  server.listen(CONFIG.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server is running at http://localhost:${CONFIG.PORT}`)
    if (CONFIG.GRAPHIQL) {
      // eslint-disable-next-line no-console
      console.log(`GraphIQL available at http://localhost:${CONFIG.PORT}/graphql`)
    }
  })
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e)
  process.exit(1)
})
