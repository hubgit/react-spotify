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

export const authorizationURL = (
  clientID: string,
  redirectURI: string,
  scopes: string[]
) => {
  const state = generateState()
  window.localStorage.setItem('state', state)

  const params = new URLSearchParams()
  params.set('response_type', 'token')
  params.set('client_id', clientID)
  params.set('redirect_uri', redirectURI)
  params.set('scope', scopes.join(','))
  params.set('state', state)

  return 'https://accounts.spotify.com/authorize?' + params.toString()
}

export const refresh = (
  src: string,
  setToken: (token: string) => void,
  handleExpiry: () => void
) => {
  const iframe = document.createElement('iframe')

  iframe.addEventListener('load', () => {
    if (iframe.contentWindow) {
      const token = readAccessToken(iframe.contentWindow.location, handleExpiry)

      if (token) {
        setToken(token)
      }
    }
  })

  iframe.src = src
}

export const validateState = (state: string) => {
  const storedState = window.localStorage.getItem('state')
  window.localStorage.removeItem('state')

  return state && state === storedState
}

export const readAccessToken = (
  location: Location,
  handleExpiry: () => void
) => {
  const hash = location.hash.substring(1)

  if (!hash) {
    return
  }

  const params = new URLSearchParams(hash)

  if (window.top === window.self) {
    window.history.replaceState(null, '', ' ')
  }

  const state = params.get('state')

  if (state) {
    if (!validateState(state)) {
      throw new Error('Invalid state')
    }

    const error = params.get('error')

    if (error) {
      throw new Error(error)
    }

    const token = params.get('access_token')

    if (token) {
      window.localStorage.setItem('access_token', token)

      const expires = params.get('expires')

      if (expires) {
        window.localStorage.setItem('expires', expires)

        window.setInterval(handleExpiry, Number(expires) * 1000)
      }

      return token
    }
  }
}
