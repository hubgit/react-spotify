import * as React from 'react'
import { SpotifyClientContext } from './SpotifyClientProvider'
import { SpotifyStateProvider } from './SpotifyStateProvider'

interface SpotifyPlaybackContextValue {
  player?: Spotify.SpotifyPlayer
  state?: Spotify.PlaybackState
  error?: string
  play: (uris: string[]) => Promise<unknown> | undefined
}

const SCRIPT_ID = 'spotify-web-playback-sdk'

export const SpotifyPlaybackContext = React.createContext(
  {} as SpotifyPlaybackContextValue
)

export const SpotifyPlaybackProvider: React.FC<{
  deviceName: string
}> = ({ children, deviceName }) => {
  const [playerInstance, setPlayerInstance] = React.useState<
    Spotify.WebPlaybackInstance
  >()

  const [player, setPlayer] = React.useState<Spotify.SpotifyPlayer>()

  const [error, setError] = React.useState()

  const client = React.useContext(SpotifyClientContext)

  React.useEffect(() => {
    if (!document.getElementById(SCRIPT_ID)) {
      window.onSpotifyWebPlaybackSDKReady = () => {
        console.log('player sdk ready')

        const player = new window.Spotify.Player({
          name: deviceName,
          volume: 1.0,
          getOAuthToken: done => {
            console.log('getOAuthToken')
            client.getNewToken().then(token => {
              if (token) {
                done(token.access_token)
              } else {
                client.logout()
              }
            })
          },
        })

        player.addListener('ready', playerInstance => {
          console.log('player ready')
          setPlayerInstance(playerInstance)
          setPlayer(player)
        })

        player.connect().then((connected: boolean) => {
          console.log('player connected')
          if (!connected) {
            setError('Could not connect')
          }
        })
      }

      const script = document.createElement('script')
      script.setAttribute('id', SCRIPT_ID)
      script.setAttribute('src', 'https://sdk.scdn.co/spotify-player.js')
      document.body.appendChild(script)
    }

    return () => {
      if (player) {
        player.disconnect()
      }
    }
  }, [deviceName, player])

  const play = React.useCallback(
    (uris: string[]) => {
      if (player && playerInstance) {
        return client.request({
          method: 'put',
          url: '/me/player/play',
          data: { uris },
          params: {
            // eslint-disable-next-line @typescript-eslint/camelcase
            device_id: playerInstance.device_id,
          },
        })
      }
    },
    [client, player, playerInstance]
  )

  return (
    <SpotifyPlaybackContext.Provider value={{ player, error, play }}>
      <SpotifyStateProvider>{children}</SpotifyStateProvider>
    </SpotifyPlaybackContext.Provider>
  )
}
