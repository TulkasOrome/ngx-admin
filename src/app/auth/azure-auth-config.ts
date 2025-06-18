// src/app/auth/azure-auth-config.ts
import { 
  PublicClientApplication, 
  InteractionType, 
  BrowserCacheLocation,
  LogLevel 
} from '@azure/msal-browser';
import { environment } from '../../environments/environment';

export function MSALInstanceFactory(): PublicClientApplication {
  return new PublicClientApplication({
    auth: {
      clientId: environment.azure.clientId,
      authority: `https://login.microsoftonline.com/${environment.azure.tenantId}`,
      redirectUri: environment.azure.redirectUri,
      postLogoutRedirectUri: environment.azure.postLogoutRedirectUri
    },
    cache: {
      cacheLocation: BrowserCacheLocation.LocalStorage,
      storeAuthStateInCookie: false
    },
    system: {
      loggerOptions: {
        loggerCallback: (level, message, containsPii) => {
          if (containsPii) {
            return;
          }
          switch (level) {
            case LogLevel.Error:
              console.error(message);
              return;
            case LogLevel.Info:
              console.info(message);
              return;
            case LogLevel.Verbose:
              console.debug(message);
              return;
            case LogLevel.Warning:
              console.warn(message);
              return;
          }
        }
      }
    }
  });
}

export const msalConfig = {
  interactionType: InteractionType.Redirect,
  authRequest: {
    scopes: environment.azure.scopes
  }
};

export const loginRequest = {
  scopes: environment.azure.scopes
};