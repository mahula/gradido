/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import { ApolloLogPlugin, LogMutateData } from 'apollo-log'

const copyInstance = (instance: any) => {
  const data = Object.assign(
    Object.create(Object.getPrototypeOf(instance)),
    JSON.parse(JSON.stringify(instance)),
  )
  return data
}

const plugins = [
  {
    requestDidStart() {
      return {
        willSendResponse(requestContext: any) {
          const { setHeaders = [] } = requestContext.context
          setHeaders.forEach(({ key, value }: { [key: string]: string }) => {
            if (requestContext.response.http.headers.get(key)) {
              requestContext.response.http.headers.set(key, value)
            } else {
              requestContext.response.http.headers.append(key, value)
            }
          })
          return requestContext
        },
      }
    },
  },
  ApolloLogPlugin({
    mutate: (data: LogMutateData) => {
      // We need to deep clone the object in order to not modify the actual request
      const dataCopy = copyInstance(data)

      // mask password if part of the query
      if (dataCopy.context.request.variables && dataCopy.context.request.variables.password) {
        dataCopy.context.request.variables.password = '***'
      }

      // mask token at all times
      dataCopy.context.context.token = '***'

      return dataCopy
    },
  }),
]

export default plugins
