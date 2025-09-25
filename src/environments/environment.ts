// src/environments/environment.ts
// LOCAL DEVELOPMENT ENVIRONMENT - Non-Production
export const environment = {
  production: false,
  
  // Backend API Configuration for Local Development
  backendApi: {
    baseUrl: 'http://localhost:8000',  // Local backend server
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

  // IdentityPulse API Configuration (for identity verification)
  identityPulseApi: {
    baseUrl: 'https://identitypulse-api-v3.azurewebsites.net',
    endpoint: '/api/identity_match',
    azureFunctionKey: '6oZPyjpfsc1eWigFjgPrPDAYCiQyL-QYdSKaMYNH8xjLAzFuRO847w==',
    apiKeys: {
      // Single country keys
      australia: 'datazoo-o8KaftfnHMOdLTEmQHB82Q',
      indonesia: 'datazoo-indonesia-bb060cFuWCPOoL18kBMTza',
      malaysia: 'datazoo-malaysia-KmN8pQr4TvX2wY6hBzL9sE',
      japan: 'datazoo-japan-Xk7mP3nQ9RtL5WsYhG8zAe',
      saudiArabia: 'datazoo-saudi-Kj8nP4mQ2wX6vBzT9hL3sR',
      turkey: 'datazoo-turkey-Yt5vR7wE3aQ9xLpN8mK2jH',
      mexico: 'datazoo-mexico-Xp4mK7nR3wQ9vE2aT8jL5hY',
      southAfrica: 'datazoo-southafrica-Bz9wT3hL5sR7nK4mQ2xE8vY',
      egypt: 'datazoo-egypt-Lk9mN3hR7wT5vE2xQ8aY4pJ',
      thailand: 'datazoo-thailand-Vb8nT4hL2sR9wK5mQ3xE7aY',
      philippines: 'datazoo-philippines-Jh7kR3mN9wT2vE5xQ8aL4pY',
      czech: 'datazoo-czech-Rw9tE3mN7hL5vQ2xK8aY4pJ',
      france: 'datazoo-france-Yh7nK4mR9wT2vE5xQ3aL8pJ',
      morocco: 'datazoo-morocco-Nm5kH8jR3wT9vY2xE7aQ4pL',
      newZealand: 'datazoo-newzealand-Lp9mN3hR7wT5vE2xQ8aK4jY',
      canada: 'datazoo-canada-Vt8nK4hL2sR9wE5mQ3xY7aJ',
      vietnam: 'datazoo-vietnam-Hj7kR3mN9wT2vE5xQ8aL4pY',
      qatar: 'datazoo-qatar-Kp8nT4mQ2wX9vE3zR7hL5sY',
      pakistan: 'datazoo-pakistan-Wt5vR7wE3aQ9xL2nK8mJ4hY',
      
      // Multi-region keys
      multiRegion: 'datazoo-multi-all-regions-Zn9kX3mR7wT5vE2xQ8aL4pY',
      masterKey: 'datazoo-master-key-Yx8wK5nT3mR9vE2aQ7hL4pJ',
      seAsiaHub: 'datazoo-seasia-hub-Xt9pL5aY7wQ3mK8nR2vE4hT',
      middleEastHub: 'datazoo-middle-east-hub-Kn8mR4wT7vE2xQ9aL5pY3hJ',
      europeHub: 'datazoo-europe-hub-Qx8wE5rT2yU9iO3pA7sD4fG',
      apacHub: 'datazoo-apac-hub-Bx9wE3rT5yU2iO8pA4sD7fG',
      americasHub: 'datazoo-americas-hub-Qw7eR4tY9uI2oP5aS8dF3gH'
    }
  },

  // Azure Storage Configuration (if needed)
  azureStorage: {
    connectionString: '',  // Add if needed for local testing
    containerName: 'bulk-uploads'
  },

  // Elasticsearch servers (if you need direct access)
  elasticsearchServers: {
    australia: 'http://localhost:9201',  // SSH tunnel ports for local dev
    indonesia: 'http://localhost:9202',
    japan: 'http://localhost:9203',
    malaysia: 'http://localhost:9204'
  },

  // Feature flags
  features: {
    enableDebugMode: true,
    enableMockData: false,
    enableAnalytics: false,
    enableErrorReporting: false
  },

  // URLs for external services
  externalUrls: {
    accessRequest: 'https://access.identitypulse.ai',
    documentation: 'https://docs.identitypulse.ai',
    support: 'https://support.identitypulse.ai'
  }
};