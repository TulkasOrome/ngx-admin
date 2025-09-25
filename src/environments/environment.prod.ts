// src/environments/environment.prod.ts
// PRODUCTION ENVIRONMENT
export const environment = {
  production: true,
  
  // Backend API Configuration for Production
  backendApi: {
    baseUrl: 'https://identitypulse-backend.azurewebsites.net',
    endpoints: {
      auth: {
        signin: '/api/auth/signin',
        refresh: '/api/auth/refresh',
        signout: '/api/auth/sign-out'
      },
      users: {
        me: '/api/users/me',
        list: '/api/users',
        detail: '/api/users/:id',
        update: '/api/users/:id',
        delete: '/api/users/:id'
      },
      approval: {
        request: '/api/approval/request',
        verify: '/api/approval/verify/:token',
        complete: '/api/approval/complete',
        pending: '/api/approval/pending'
      }
    }
  },

  // IdentityPulse API Configuration
  identityPulseApi: {
    baseUrl: process.env['IDENTITYPULSE_API_BASE_URL'] || 'https://identitypulse-api-v3.azurewebsites.net',
    endpoint: process.env['IDENTITYPULSE_API_ENDPOINT'] || '/api/identity_match',
    azureFunctionKey: process.env['AZURE_FUNCTION_KEY'] || '6oZPyjpfsc1eWigFjgPrPDAYCiQyL-QYdSKaMYNH8xjLAzFuRO847w==',
    apiKeys: {
      // Single country keys - Use environment variables in production
      australia: process.env['API_KEY_AUSTRALIA'] || 'datazoo-o8KaftfnHMOdLTEmQHB82Q',
      indonesia: process.env['API_KEY_INDONESIA'] || 'datazoo-indonesia-bb060cFuWCPOoL18kBMTza',
      malaysia: process.env['API_KEY_MALAYSIA'] || 'datazoo-malaysia-KmN8pQr4TvX2wY6hBzL9sE',
      japan: process.env['API_KEY_JAPAN'] || 'datazoo-japan-Xk7mP3nQ9RtL5WsYhG8zAe',
      saudiArabia: process.env['API_KEY_SAUDI_ARABIA'] || 'datazoo-saudi-Kj8nP4mQ2wX6vBzT9hL3sR',
      turkey: process.env['API_KEY_TURKEY'] || 'datazoo-turkey-Yt5vR7wE3aQ9xLpN8mK2jH',
      mexico: process.env['API_KEY_MEXICO'] || 'datazoo-mexico-Xp4mK7nR3wQ9vE2aT8jL5hY',
      southAfrica: process.env['API_KEY_SOUTH_AFRICA'] || 'datazoo-southafrica-Bz9wT3hL5sR7nK4mQ2xE8vY',
      egypt: process.env['API_KEY_EGYPT'] || 'datazoo-egypt-Lk9mN3hR7wT5vE2xQ8aY4pJ',
      thailand: process.env['API_KEY_THAILAND'] || 'datazoo-thailand-Vb8nT4hL2sR9wK5mQ3xE7aY',
      philippines: process.env['API_KEY_PHILIPPINES'] || 'datazoo-philippines-Jh7kR3mN9wT2vE5xQ8aL4pY',
      czech: process.env['API_KEY_CZECH'] || 'datazoo-czech-Rw9tE3mN7hL5vQ2xK8aY4pJ',
      france: process.env['API_KEY_FRANCE'] || 'datazoo-france-Yh7nK4mR9wT2vE5xQ3aL8pJ',
      morocco: process.env['API_KEY_MOROCCO'] || 'datazoo-morocco-Nm5kH8jR3wT9vY2xE7aQ4pL',
      newZealand: process.env['API_KEY_NEW_ZEALAND'] || 'datazoo-newzealand-Lp9mN3hR7wT5vE2xQ8aK4jY',
      canada: process.env['API_KEY_CANADA'] || 'datazoo-canada-Vt8nK4hL2sR9wE5mQ3xY7aJ',
      vietnam: process.env['API_KEY_VIETNAM'] || 'datazoo-vietnam-Hj7kR3mN9wT2vE5xQ8aL4pY',
      qatar: process.env['API_KEY_QATAR'] || 'datazoo-qatar-Kp8nT4mQ2wX9vE3zR7hL5sY',
      pakistan: process.env['API_KEY_PAKISTAN'] || 'datazoo-pakistan-Wt5vR7wE3aQ9xL2nK8mJ4hY',
      
      // Multi-region keys
      multiRegion: process.env['API_KEY_MULTI_REGION'] || 'datazoo-multi-all-regions-Zn9kX3mR7wT5vE2xQ8aL4pY',
      masterKey: process.env['API_KEY_MASTER'] || 'datazoo-master-key-Yx8wK5nT3mR9vE2aQ7hL4pJ',
      seAsiaHub: process.env['API_KEY_SE_ASIA_HUB'] || 'datazoo-seasia-hub-Xt9pL5aY7wQ3mK8nR2vE4hT',
      middleEastHub: process.env['API_KEY_MIDDLE_EAST_HUB'] || 'datazoo-middle-east-hub-Kn8mR4wT7vE2xQ9aL5pY3hJ',
      europeHub: process.env['API_KEY_EUROPE_HUB'] || 'datazoo-europe-hub-Qx8wE5rT2yU9iO3pA7sD4fG',
      apacHub: process.env['API_KEY_APAC_HUB'] || 'datazoo-apac-hub-Bx9wE3rT5yU2iO8pA4sD7fG',
      americasHub: process.env['API_KEY_AMERICAS_HUB'] || 'datazoo-americas-hub-Qw7eR4tY9uI2oP5aS8dF3gH'
    }
  },

  // Azure Storage Configuration
  azureStorage: {
    connectionString: process.env['AZURE_STORAGE_CONNECTION_STRING'] || '',
    containerName: 'bulk-uploads'
  },

  // Elasticsearch servers (using internal Azure IPs in production)
  elasticsearchServers: {
    australia: 'http://10.0.0.8:9200',
    indonesia: 'http://10.1.0.8:9200',
    japan: 'http://10.3.0.8:9200',
    malaysia: 'http://10.1.0.9:9200'
  },

  // Feature flags
  features: {
    enableDebugMode: false,
    enableMockData: false,
    enableAnalytics: true,
    enableErrorReporting: true
  },

  // URLs for external services
  externalUrls: {
    accessRequest: 'https://access.identitypulse.ai',
    documentation: 'https://docs.identitypulse.ai',
    support: 'https://support.identitypulse.ai'
  }
};