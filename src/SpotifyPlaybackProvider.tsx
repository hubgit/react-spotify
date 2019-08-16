import * as React from 'react'
import { SpotifyClientContext } from './SpotifyClientProvider'
import { SpotifyProfileContext } from './SpotifyProfileProvider'
import { SpotifyStateProvider } from './SpotifyStateProvider'

interface SpotifyPlaybackContextValue {
  player?: Spotify.SpotifyPlayer
  state?: Spotify.PlaybackState
  error?: string
  play: (uris: string[]) => Promise<unknown> | undefined
}

export const SpotifyPlaybackContext = React.createContext<
  SpotifyPlaybackContextValue
>({
  play: () => undefined,
})

export const SpotifyPlaybackProvider: React.FC<{
  deviceName: string
}> = ({ children, deviceName }) => {
  const [playerInstance, setPlayerInstance] = React.useState<
    Spotify.WebPlaybackInstance
  >()

  const [player, setPlayer] = React.useState<Spotify.SpotifyPlayer>()

  const [error, setError] = React.useState()

  const client = React.useContext(SpotifyClientContext)
  const profile = React.useContext(SpotifyProfileContext)

  React.useEffect(() => {
    if (profile.data) {
      if (!document.getElementById('spotify-web-playback-sdk')) {
        window.onSpotifyWebPlaybackSDKReady = () => {
          console.log('player sdk ready')

          const player = new window.Spotify.Player({
            name: deviceName,
            volume: 1.0,
            getOAuthToken: done => {
              console.log('getOAuthToken')
              // TODO: force a new token if invalid?
              client.getNewToken().then(token => {
                done(token.access_token)
              }, client.logout)
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
        script.setAttribute('id', 'spotify-web-playback-sdk')
        script.setAttribute('src', 'https://sdk.scdn.co/spotify-player.js')
        document.body.appendChild(script)
      }
    }

    return () => {
      if (player) {
        player.disconnect()
      }
    }
  }, [deviceName, player, profile])

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

  React.useEffect(() => {
    if (player && !profile.data) {
      player.pause()
    }
  }, [player, profile])

  return (
    <SpotifyPlaybackContext.Provider value={{ player, error, play }}>
      <SpotifyStateProvider>{children}</SpotifyStateProvider>
    </SpotifyPlaybackContext.Provider>
  )
}
