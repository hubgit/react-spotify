const generateState = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const values = new Uint8Array(32)
  window.crypto.getRandomValues(values)
  const output = []
  for (const value of values) {
    output.push(chars[value % chars.length])
  }
  return output.join('')
}

export const authorize = (clientID: string, scope: string) => {
  const state = generateState()
  window.localStorage.setItem('state', state)

  const params = new URLSearchParams()
  params.set('response_type', 'token')
  params.set('client_id', clientID)
  params.set(
    'redirect_uri',
    `${window.location.origin}${window.location.pathname}`
  )
  params.set('scope', scope)
  params.set('state', state)

  window.location.href =
    'https://accounts.spotify.com/authorize?' + params.toString()
}

export const validateState = (state: string) => {
  const storedState = window.localStorage.getItem('state')
  window.localStorage.removeItem('state')

  return state && state === storedState
}
