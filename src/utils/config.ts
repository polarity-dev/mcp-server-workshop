const port = 3000

export const config = {
  port,
  host: "0.0.0.0",
  baseUrl: `http://localhost:${port}`,
  keycloak: {
    realm: "mcpworkshop",
    baseUrl: "http://localhost:8080",
    clientId: "mcp-workshop",
  },
  minio: {
    endpoint: "http://localhost:9000",
    accessKeyId: "minioadmin",
    secretAccessKey: "minioadmin",
    bucket: "docs",
  },
} as const

export const keycloakUrls = {
  discovery: `${config.keycloak.baseUrl}/realms/${config.keycloak.realm}/.well-known/openid-configuration`,
  authorization: `${config.keycloak.baseUrl}/realms/${config.keycloak.realm}/protocol/openid-connect/auth`,
  token: `${config.keycloak.baseUrl}/realms/${config.keycloak.realm}/protocol/openid-connect/token`,
  jwks: `${config.keycloak.baseUrl}/realms/${config.keycloak.realm}/protocol/openid-connect/certs`,
  userinfo: `${config.keycloak.baseUrl}/realms/${config.keycloak.realm}/protocol/openid-connect/userinfo`,
  issuer: `${config.keycloak.baseUrl}/realms/${config.keycloak.realm}`,
} as const

export const methodNotAllowedResponse = {
  jsonrpc: "2.0",
  error: { code: -32000, message: "Method not allowed." },
  id: null,
}

// OAuth 2.0 Protected Resource Metadata (RFC 9728)
export const protectedResourceMetadata = {
  resource: `${config.baseUrl}/mcp`,
  authorization_servers: [
    `${config.keycloak.baseUrl}/realms/${config.keycloak.realm}`,
  ],
  scopes_supported: ["openid", "profile", "email"],
  bearer_methods_supported: ["header"],
} as const
