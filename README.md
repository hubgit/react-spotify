## Example

```jsx
<SpotifyProvider clientID={'your-client-id'} redirectURI={window.location.origin} scope={'streaming'}>
    <SpotifyPlaybackProvider deviceName={'your-device-name'}>
        <App />
    </SpotifyPlaybackProvider>
</SpotifyProvider>
```
