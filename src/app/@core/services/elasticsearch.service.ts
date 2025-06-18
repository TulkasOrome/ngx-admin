import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError, forkJoin } from 'rxjs';
import { map, catchError, timeout } from 'rxjs/operators';

export interface ElasticsearchServer {
  name: string;
  url: string;
  country: string;
  ip: string;
  internalIp: string;
  status?: 'online' | 'offline' | 'maintenance';
  responseTime?: number;
  lastChecked?: Date;
}

export interface IdentitySearchRequest {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  country: string;
  identificationNumber?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface IdentitySearchResponse {
  overallMatch: number;
  fieldMatches: {
    name: number;
    dateOfBirth: number;
    address: number;
    identification: number;
    email?: number;
    phone?: number;
  };
  searchTime: number;
  server: string;
  documents?: any[];
  raw?: any;
}

export interface ServerHealthResponse {
  status: 'online' | 'offline' | 'maintenance';
  responseTime: number;
  clusterHealth?: any;
  indices?: {
    count: number;
    docs: {
      count: number;
      deleted: number;
    };
    store: {
      size: string;
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class ElasticsearchService {
  
  private servers: ElasticsearchServer[] = [
    {
      name: 'Australia',
      url: this.getServerUrl('australia'),
      country: 'Australia',
      ip: '68.218.20.143',
      internalIp: '10.0.0.8'
    },
    {
      name: 'Indonesia',
      url: this.getServerUrl('indonesia'),
      country: 'Indonesia',
      ip: '4.194.177.159',
      internalIp: '10.1.0.8'
    },
    {
      name: 'Japan',
      url: this.getServerUrl('japan'),
      country: 'Japan',
      ip: '130.33.64.251',
      internalIp: '10.3.0.8'
    },
    {
      name: 'Malaysia',
      url: this.getServerUrl('malaysia'),
      country: 'Malaysia',
      ip: '52.148.66.168',
      internalIp: '10.1.0.9'
    }
  ];

  private getServerUrl(country: string): string {
    // Check if we're in development mode
    if (this.isDevelopment()) {
      // Use SSH tunnel ports for local development
      const tunnelPorts = {
        'australia': 9201,
        'indonesia': 9202,
        'japan': 9203,
        'malaysia': 9204
      };
      return `http://localhost:${tunnelPorts[country.toLowerCase()]}`;
    } else if (this.isAzureDeployment()) {
      // Use internal IPs when deployed in Azure
      const internalIps = {
        'australia': '10.0.0.8',
        'indonesia': '10.1.0.8',
        'japan': '10.3.0.8',
        'malaysia': '10.1.0.9'
      };
      return `http://${internalIps[country.toLowerCase()]}:9200`;
    } else {
      // Use public IPs for other deployments (not recommended for production)
      const publicIps = {
        'australia': '68.218.20.143',
        'indonesia': '4.194.177.159',
        'japan': '130.33.64.251',
        'malaysia': '52.148.66.168'
      };
      return `http://${publicIps[country.toLowerCase()]}:9200`;
    }
  }

  private isDevelopment(): boolean {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1';
  }

  private isAzureDeployment(): boolean {
    return window.location.hostname.includes('azure') ||
           window.location.hostname.includes('azurewebsites') ||
           window.location.hostname.includes('azurestaticapps');
  }

  constructor(private http: HttpClient) {}

  /**
   * Get all configured Elasticsearch servers
   */
  getServers(): ElasticsearchServer[] {
    return this.servers;
  }

  /**
   * Get server by country
   */
  getServerByCountry(country: string): ElasticsearchServer | undefined {
    return this.servers.find(s => s.country.toLowerCase() === country.toLowerCase());
  }

  /**
   * Check health status of a specific server
   */
  checkServerHealth(server: ElasticsearchServer): Observable<ServerHealthResponse> {
    const startTime = Date.now();
    
    return this.http.get(`${server.url}/_cluster/health`, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }).pipe(
      timeout(5000),
      map((response: any) => {
        const responseTime = Date.now() - startTime;
        return {
          status: response.status === 'green' || response.status === 'yellow' ? 'online' : 'maintenance',
          responseTime,
          clusterHealth: response
        } as ServerHealthResponse;
      }),
      catchError(() => {
        return of({
          status: 'offline',
          responseTime: -1
        } as ServerHealthResponse);
      })
    );
  }

  /**
   * Check health status of all servers
   */
  checkAllServersHealth(): Observable<Map<string, ServerHealthResponse>> {
    const healthChecks = this.servers.map(server => 
      this.checkServerHealth(server).pipe(
        map(health => ({ server: server.name, health }))
      )
    );

    return forkJoin(healthChecks).pipe(
      map(results => {
        const healthMap = new Map<string, ServerHealthResponse>();
        results.forEach(({ server, health }) => {
          healthMap.set(server, health);
        });
        return healthMap;
      })
    );
  }

  /**
   * Search for identity in the appropriate Elasticsearch server
   */
  searchIdentity(request: IdentitySearchRequest): Observable<IdentitySearchResponse> {
    const server = this.getServerByCountry(request.country);
    
    if (!server) {
      return throwError('No server available for the selected country');
    }

    const startTime = Date.now();
    
    // Build Elasticsearch query
    const query = this.buildIdentityQuery(request);
    
    return this.http.post(`${server.url}/identity-${request.country.toLowerCase()}/_search`, query, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }).pipe(
      timeout(10000),
      map((response: any) => {
        const searchTime = Date.now() - startTime;
        return this.processSearchResponse(response, request, server.name, searchTime);
      }),
      catchError(error => {
        console.error('Elasticsearch search error:', error);
        return throwError('Failed to search identity records');
      })
    );
  }

  /**
   * Get server statistics
   */
  getServerStats(server: ElasticsearchServer): Observable<any> {
    return this.http.get(`${server.url}/_stats`, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }).pipe(
      timeout(5000),
      catchError(() => of(null))
    );
  }

  /**
   * Build Elasticsearch query for identity search
   */
  private buildIdentityQuery(request: IdentitySearchRequest): any {
    const must = [];
    const should = [];

    // Name matching with fuzzy search
    if (request.firstName) {
      must.push({
        multi_match: {
          query: request.firstName,
          fields: ['firstName^3', 'firstName.phonetic^2', 'firstName.fuzzy'],
          type: 'best_fields',
          fuzziness: 'AUTO'
        }
      });
    }

    if (request.lastName) {
      must.push({
        multi_match: {
          query: request.lastName,
          fields: ['lastName^3', 'lastName.phonetic^2', 'lastName.fuzzy'],
          type: 'best_fields',
          fuzziness: 'AUTO'
        }
      });
    }

    // Date of birth matching
    if (request.dateOfBirth) {
      must.push({
        term: {
          dateOfBirth: request.dateOfBirth
        }
      });
    }

    // Optional fields with boost
    if (request.identificationNumber) {
      should.push({
        term: {
          'identificationNumber.keyword': {
            value: request.identificationNumber,
            boost: 2.0
          }
        }
      });
    }

    if (request.email) {
      should.push({
        term: {
          'email.keyword': {
            value: request.email.toLowerCase(),
            boost: 1.5
          }
        }
      });
    }

    if (request.phone) {
      should.push({
        match: {
          phone: {
            query: request.phone,
            fuzziness: '1'
          }
        }
      });
    }

    if (request.address) {
      should.push({
        match: {
          address: {
            query: request.address,
            fuzziness: 'AUTO'
          }
        }
      });
    }

    return {
      query: {
        bool: {
          must,
          should,
          minimum_should_match: should.length > 0 ? 1 : 0
        }
      },
      size: 10,
      _source: true,
      explain: true
    };
  }

  /**
   * Process Elasticsearch response and calculate match scores
   */
  private processSearchResponse(
    response: any, 
    request: IdentitySearchRequest, 
    serverName: string,
    searchTime: number
  ): IdentitySearchResponse {
    
    const hits = response.hits?.hits || [];
    
    if (hits.length === 0) {
      return {
        overallMatch: 0,
        fieldMatches: {
          name: 0,
          dateOfBirth: 0,
          address: 0,
          identification: 0
        },
        searchTime,
        server: serverName,
        documents: []
      };
    }

    // Take the best match
    const bestMatch = hits[0];
    const source = bestMatch._source;
    const score = bestMatch._score;
    const maxScore = response.hits.max_score || 1;
    
    // Calculate field-specific match scores
    const fieldMatches = {
      name: this.calculateNameMatch(request, source),
      dateOfBirth: this.calculateDateMatch(request.dateOfBirth, source.dateOfBirth),
      address: request.address ? this.calculateStringMatch(request.address, source.address) : 0,
      identification: request.identificationNumber ? 
        this.calculateExactMatch(request.identificationNumber, source.identificationNumber) : 0,
      email: request.email ? this.calculateExactMatch(request.email?.toLowerCase(), source.email?.toLowerCase()) : 0,
      phone: request.phone ? this.calculatePhoneMatch(request.phone, source.phone) : 0
    };

    // Calculate overall match score
    const overallMatch = Math.min(100, Math.round((score / maxScore) * 100));

    return {
      overallMatch,
      fieldMatches,
      searchTime,
      server: serverName,
      documents: hits.map((hit: any) => ({
        ...hit._source,
        _id: hit._id,
        _score: hit._score
      })),
      raw: response
    };
  }

  /**
   * Calculate name match percentage
   */
  private calculateNameMatch(request: IdentitySearchRequest, source: any): number {
    const firstNameMatch = this.calculateStringMatch(request.firstName, source.firstName);
    const lastNameMatch = this.calculateStringMatch(request.lastName, source.lastName);
    return Math.round((firstNameMatch + lastNameMatch) / 2);
  }

  /**
   * Calculate string similarity match
   */
  private calculateStringMatch(str1: string, str2: string): number {
    if (!str1 || !str2) return 0;
    
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();
    
    if (s1 === s2) return 100;
    
    // Simple Levenshtein-based similarity
    const maxLen = Math.max(s1.length, s2.length);
    const distance = this.levenshteinDistance(s1, s2);
    return Math.round((1 - distance / maxLen) * 100);
  }

  /**
   * Calculate exact match
   */
  private calculateExactMatch(str1: string, str2: string): number {
    if (!str1 || !str2) return 0;
    return str1.trim() === str2.trim() ? 100 : 0;
  }

  /**
   * Calculate date match
   */
  private calculateDateMatch(date1: string, date2: string): number {
    if (!date1 || !date2) return 0;
    return date1 === date2 ? 100 : 0;
  }

  /**
   * Calculate phone match with normalization
   */
  private calculatePhoneMatch(phone1: string, phone2: string): number {
    if (!phone1 || !phone2) return 0;
    
    const normalize = (phone: string) => phone.replace(/\D/g, '');
    const p1 = normalize(phone1);
    const p2 = normalize(phone2);
    
    if (p1 === p2) return 100;
    
    // Check if one contains the other (country codes)
    if (p1.includes(p2) || p2.includes(p1)) return 80;
    
    return 0;
  }

  /**
   * Calculate Levenshtein distance
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }
}