import { Client, ClientBuilder } from '@iota/client'
import { MessageWrapper } from '@iota/client/lib/types'

import { CONFIG } from '@/config'
import { backendLogger as logger } from '@/server/logger'

// Source: https://refactoring.guru/design-patterns/singleton/typescript/example
// and ../federation/client/FederationClientFactory.ts
/**
 * A Singleton class defines the `getInstance` method that lets clients access
 * the unique singleton instance.
 */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
class IotaClientSingleton {
  private static IotaClint: Client

  /**
   * The Singleton's constructor should always be private to prevent direct
   * construction calls with the `new` operator.
   */
  // eslint-disable-next-line no-useless-constructor, @typescript-eslint/no-empty-function
  private constructor() {}

  /**
   * The static method that controls the access to the singleton instance.
   *
   * This implementation let you subclass the Singleton class while keeping
   * just one instance of each subclass around.
   */
  public static getInstance(): Client | null {
    if (!CONFIG.IOTA || !CONFIG.IOTA_API_URL) {
      logger.info(`Iota are disabled via config...`)
      return null
    }
    if (!IotaClientSingleton.IotaClint) {
      IotaClientSingleton.IotaClint = new ClientBuilder().node(CONFIG.IOTA_API_URL).build()
    }

    return IotaClientSingleton.IotaClint
  }
}

/**
 * send data message onto iota tangle
 * use CONFIG.IOTA_COMMUNITY_ALIAS for index
 * @param {string} message - the message as utf based string, will be converted to hex automatically from @iota/client
 * @return {MessageWrapper|null} the iota message as json object with transaction data from iota or null if iota is disabled in config
 */
export const sendDataMessage = (message: string): Promise<MessageWrapper> | null => {
  const client = IotaClientSingleton.getInstance()
  if (!client) {
    return null
  }
  return client.message().index(CONFIG.IOTA_COMMUNITY_ALIAS).data(message).submit()
}

/**
 * receive message for known message id from iota tangle
 * @param {string} messageId - as hex string
 * @return {MessageWrapper|null} the iota message as json object with transaction data from iota or null if iota is disabled in config
 */
export const getMessage = (messageId: string): Promise<MessageWrapper> | null => {
  const client = IotaClientSingleton.getInstance()
  if (!client) {
    return null
  }
  return client.getMessage().data(messageId)
}
/**
 * receive all message ids belonging to our topic from iota tangle
 * @returns array of messageIds
 */
export const getAllMessages = (): Promise<string[]> | null => {
  const client = IotaClientSingleton.getInstance()
  if (!client) {
    return null
  }
  return client.getMessage().index(CONFIG.IOTA_COMMUNITY_ALIAS)
}

/**
 * example for message: 
```json 
{
  message: {
    networkId: '1454675179895816119',
    parentMessageIds: [
      '5f30efecca59fdfef7c103e85ef691b2b1dc474e9eae9056888a6d58605083e7',
      '77cef2fb405daedcd7469e009bb87a6d9a4840e618cdb599cd21a30a9fec88dc',
      '7d2cfb39f40585ba568a29ad7e85c1478b2584496eb736d4001ac344f6a6cacf',
      'c66da602874220dfa26925f6be540d37c0084d37cd04726fcc5be9d80b36f850'
    ],
    payload: {
      type: 2,
      index: '4752414449444f3a205465737448656c6c6f57656c7431',
      data: '48656c6c6f20576f726c64202d20546875204a756e20303820323032332031343a35393a343520474d542b3030303020284b6f6f7264696e69657274652057656c747a65697429'
    },
    nonce: '13835058055282465157'
  },
  messageId: '5498130bc3918e1a7143969ce05805502417e3e1bd596d3c44d6a0adeea22710'
}
```
 */
