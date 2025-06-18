// src/environments/environment.prod.ts
export const environment = {
  production: true,
  identityPulseApi: {
    baseUrl: 'https://identitypulse-api20.azurewebsites.net',
    endpoint: '/api/identity_match',
    functionCode: 's9h3SDa1Qf4kL8Ex6Lz0QHJ-YahTbO4pddhGsWVMRxfKAzFu0KJoJA==',
    apiKeys: {
      australia: 'datazoo-o8KaftfnHMOdLTEmQHB82Q',
      indonesia: 'datazoo-indonesia-bb060cFuWCPOoL18kBMTza',
      malaysia: 'datazoo-malaysia-KmN8pQr4TvX2wY6hBzL9sE',
      japan: 'datazoo-japan-Xk7mP3nQ9RtL5WsYhG8zAe',
      multiRegion: 'datazoo-multi-all-regions-Yt2vF7wEaQx6LpH3mR9jH'
    }
  },
  azure: {
    clientId: '23c5ab21-6d6d-47a2-abed-87dc774329b6',
    tenantId: '8bdc18c6-bf77-4267-adea-209af623f4fb',
    redirectUri: 'https://identitypulse.azurestaticapps.net',
    postLogoutRedirectUri: 'https://identitypulse.azurestaticapps.net',
    scopes: ['user.read']
  }
};