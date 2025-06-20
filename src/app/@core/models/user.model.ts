export interface AzureUser {
  id: string;
  displayName: string;
  mail: string;
  userPrincipalName: string;
  givenName?: string;
  surname?: string;
  jobTitle?: string;
  department?: string;
  officeLocation?: string;
  mobilePhone?: string;
  businessPhones?: string[];
  accountEnabled?: boolean;
}

export interface UserActivity {
  userId: string;
  userEmail: string;
  action: string;
  timestamp: Date;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
}

export interface UserRole {
  id: string;
  displayName: string;
  description: string;
  value: string;
}

export interface UserWithRoles extends AzureUser {
  roles: string[];
  permissions?: string[];
}