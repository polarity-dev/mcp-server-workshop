export interface AuthExtra extends Record<string, unknown> {
  sub?: string
  email?: unknown
  preferred_username?: unknown
  name?: unknown
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  id_token: string
  expires_in: number
  token_type: string
}

export function assertString(value: unknown): asserts value is string {
  if (typeof value !== "string") {
    throw new Error(`Expected string, got ${typeof value}`)
  }
}
