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
      // UPDATED: Using the portal key for all API requests
      portalKey: 'portal-Ht8nK5jR2wY9xL3mQ7aE4vS6d',
      
      // Legacy keys (kept for reference but not used)
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
      multiRegion: 'datazoo-multi-all-regions-Zn9kX3mR7wT5vE2xQ8aL4pY',
      masterKey: 'datazoo-master-key-Yx8wK5nT3mR9vE2aQ7hL4pJ'
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