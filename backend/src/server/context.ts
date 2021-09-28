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

export default context