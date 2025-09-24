export const environment = {
  production: false,
  identityPulseApi: {
    baseUrl: process.env['IDENTITYPULSE_API_BASE_URL'] || 'https://identitypulse-api-v3.azurewebsites.net',
    endpoint: process.env['IDENTITYPULSE_API_ENDPOINT'] || '/api/identity_match',
    azureFunctionKey: process.env['AZURE_FUNCTION_KEY'] || '',
    apiKeys: {
      // Single country keys
      australia: process.env['API_KEY_AUSTRALIA'] || '',
      indonesia: process.env['API_KEY_INDONESIA'] || '',
      malaysia: process.env['API_KEY_MALAYSIA'] || '',
      japan: process.env['API_KEY_JAPAN'] || '',
      saudiArabia: process.env['API_KEY_SAUDI_ARABIA'] || '',
      turkey: process.env['API_KEY_TURKEY'] || '',
      mexico: process.env['API_KEY_MEXICO'] || '',
      southAfrica: process.env['API_KEY_SOUTH_AFRICA'] || '',
      egypt: process.env['API_KEY_EGYPT'] || '',
      thailand: process.env['API_KEY_THAILAND'] || '',
      philippines: process.env['API_KEY_PHILIPPINES'] || '',
      czech: process.env['API_KEY_CZECH'] || '',
      france: process.env['API_KEY_FRANCE'] || '',
      morocco: process.env['API_KEY_MOROCCO'] || '',
      newZealand: process.env['API_KEY_NEW_ZEALAND'] || '',
      canada: process.env['API_KEY_CANADA'] || '',
      vietnam: process.env['API_KEY_VIETNAM'] || '',
      qatar: process.env['API_KEY_QATAR'] || '',
      pakistan: process.env['API_KEY_PAKISTAN'] || '',
      
      // Multi-region keys
      multiRegion: process.env['API_KEY_MULTI_REGION'] || '',
      masterKey: process.env['API_KEY_MASTER'] || '',
      seAsiaHub: process.env['API_KEY_SE_ASIA_HUB'] || '',
      middleEastHub: process.env['API_KEY_MIDDLE_EAST_HUB'] || '',
      europeHub: process.env['API_KEY_EUROPE_HUB'] || '',
      apacHub: process.env['API_KEY_APAC_HUB'] || '',
      americasHub: process.env['API_KEY_AMERICAS_HUB'] || ''
    }
  },
  azure: {
    clientId: process.env['AZURE_CLIENT_ID'] || '',
    tenantId: process.env['AZURE_TENANT_ID'] || '',
    redirectUri: 'http://localhost:4200',
    postLogoutRedirectUri: 'http://localhost:4200',
    scopes: ['user.read', 'User.ReadBasic.All', 'Directory.Read.All']
  }
};