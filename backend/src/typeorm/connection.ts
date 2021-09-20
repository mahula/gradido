import { createConnection, Connection } from 'typeorm'
import CONFIG from '../config'
import path from 'path'

const connection = async (): Promise<Connection> => {
  const con = await createConnection({
    name: 'default',
    type: 'mysql',
    host: CONFIG.DB_HOST,
    port: CONFIG.DB_PORT,
    username: CONFIG.DB_USER,
    password: CONFIG.DB_PASSWORD,
    database: CONFIG.DB_DATABASE,
    entities: [path.join(__dirname, 'entity', '*.ts')],
    synchronize: false,
  })

  // await con.connect()

  return con
}

export default connection
