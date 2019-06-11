import * as React from 'react'
import { SpotifyPlaybackContext } from './SpotifyPlaybackProvider'

export const SpotifyStateContext = React.createContext<
  Spotify.PlaybackState | undefined
>(undefined)

export const SpotifyStateProvider: React.FC = ({ children }) => {
  const [state, setState] = React.useState<Spotify.PlaybackState>()

  const { player } = React.useContext(SpotifyPlaybackContext)

  React.useEffect(() => {
    if (player) {
      player.addListener('player_state_changed', state => {
        console.log({ state })
        setState(state)
      })
    }
  }, [player])

  return (
    <SpotifyStateContext.Provider value={state}>
      {children}
    </SpotifyStateContext.Provider>
  )
}
