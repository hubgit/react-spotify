import * as React from 'react'
import { SpotifyPlaybackContext } from './SpotifyPlaybackProvider'

export const SpotifyStateContext = React.createContext<
  Spotify.PlaybackState | undefined
>(undefined)

export const SpotifyStateProvider: React.FC = ({ children }) => {
  const [state, setState] = React.useState<Spotify.PlaybackState>()

  const { player } = React.useContext(SpotifyPlaybackContext)

  React.useEffect(() => {
    const handleStateChange: Spotify.PlaybackStateListener = state => {
      console.log({ state })
      setState(state)
    }

    if (player) {
      player.addListener('player_state_changed', handleStateChange)
    }

    return () => {
      if (player) {
        player.removeListener('player_state_changed', handleStateChange)
      }
    }
  }, [player])

  return (
    <SpotifyStateContext.Provider value={state}>
      {children}
    </SpotifyStateContext.Provider>
  )
}
