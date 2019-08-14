import * as React from 'react'
import { SpotifyProfileProvider } from './SpotifyProfileProvider'
import { SpotifyClientProvider } from './SpotifyClientProvider'

export const SpotifyProvider: React.FC<{
  clientID: string
  scopes: string[]
}> = ({ children, clientID, scopes }) => {
  return (
    <SpotifyClientProvider clientID={clientID} scopes={scopes}>
      <SpotifyProfileProvider>{children}</SpotifyProfileProvider>
    </SpotifyClientProvider>
  )
}
