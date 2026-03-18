// Token cache — persists within server process lifetime
let cachedToken: string | null = null
let tokenExpiresAt = 0

export async function getOpenSkyToken(): Promise<string | null> {
  const clientId = process.env.OPENSKY_CLIENT_ID
  const clientSecret = process.env.OPENSKY_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return null // Will use anonymous access (lower rate limits)
  }

  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && Date.now() < tokenExpiresAt - 60000) {
    return cachedToken
  }

  try {
    // OAuth2 Client Credentials Flow
    const res = await fetch(
      'https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: clientId,
          client_secret: clientSecret,
        }),
        signal: AbortSignal.timeout(8000),
      }
    )

    if (!res.ok) {
      console.error('[OpenSky Auth] Token request failed:', res.status)
      return null
    }

    const data = await res.json()
    cachedToken = data.access_token
    // expires_in is in seconds
    tokenExpiresAt = Date.now() + (data.expires_in ?? 3600) * 1000

    console.log('[OpenSky Auth] Token refreshed, expires in', data.expires_in, 'seconds')
    return cachedToken
  } catch (error) {
    console.error('[OpenSky Auth] Failed to get token:', error)
    return null
  }
}
