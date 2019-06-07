import axios, { AxiosInstance } from 'axios'
import { useContext, useEffect, useState } from 'react'
import { SpotifyContext } from './SpotifyProvider'

export const useSpotifyClient = () => {
  const { accessToken, logout } = useContext(SpotifyContext)

  const [client, setClient] = useState<AxiosInstance>()

  useEffect(() => {
    if (accessToken) {
      const client = axios.create({
        baseURL: 'https://api.spotify.com/v1',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      client.interceptors.response.use(
        response => response,
        error => {
          if (error.response && error.response.status === 401) {
            logout()
          }

          return Promise.reject(error)
        }
      )

      setClient(() => client)
    }
  }, [accessToken, logout, setClient])

  return client
}
