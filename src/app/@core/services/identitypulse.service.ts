import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface IdentityVerificationRequest {
  FirstName: string;
  LastName?: string;
  DateOfBirth: string;
  Country: string;
  NationalId?: string;
  Email?: string;
  Phone?: string;
  Mobile?: string;
  AddressLine?: string;
  City?: string;
  State?: string;
  PostCode?: string;
  MatchStrictness?: 'strict' | 'normal' | 'loose';
}

export interface FieldScore {
  FieldName: string;
  Score: string;
}

export interface IdentityVerificationResponse {
  TotalScore: string;
  ConfidenceLevel: string;
  MatchTier: string;
  MatchCondition: string;
  RawScore?: string;
  document: FieldScore[];
  MatchingContext: {
    StrictnessLevel: string;
    ConfidenceAssessment: string;
    ConditionName: string;
    SpecialHandling?: string[];
  };
  WarningMessage?: string;
  PartialMatchReasons?: any[];
  AlternativeMatches?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class IdentityPulseService {
  
  private apiConfig = environment.identityPulseApi;

  constructor(private http: HttpClient) {}

  /**
   * Verify identity using IdentityPulse API
   */
  verifyIdentity(request: IdentityVerificationRequest): Observable<IdentityVerificationResponse[]> {
    // Use relative URL in development to work with proxy
    const isDevelopment = !environment.production;
    const baseUrl = isDevelopment ? '' : this.apiConfig.baseUrl;
    const url = `${baseUrl}${this.apiConfig.endpoint}?code=${this.apiConfig.functionCode}`;
    
    // Select appropriate API key based on country
    const apiKey = this.getApiKeyForCountry(request.Country);
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'x-api-key': apiKey
    });

    console.log('API Request:', {
      url: url,
      headers: headers,
      body: request
    });

    return this.http.post<IdentityVerificationResponse[]>(url, request, { headers })
      .pipe(
        catchError(error => {
          console.error('IdentityPulse API error:', error);
          return throwError(this.getErrorMessage(error));
        })
      );
  }

  /**
   * Format form data to API request format
   */
  formatRequest(formData: any): IdentityVerificationRequest {
    // Convert date from YYYY-MM-DD to YYYYMMDD
    const dateOfBirth = formData.dateOfBirth ? 
      formData.dateOfBirth.replace(/-/g, '') : '';

    // Map country to country code
    const countryCode = this.getCountryCode(formData.country);

    const request: IdentityVerificationRequest = {
      FirstName: formData.firstName,
      LastName: formData.lastName || '',
      DateOfBirth: dateOfBirth,
      Country: countryCode,
      MatchStrictness: formData.matchStrictness || 'normal'
    };

    // Add optional fields if provided
    if (formData.identificationNumber) {
      request.NationalId = formData.identificationNumber;
    }
    if (formData.email) {
      request.Email = formData.email;
    }
    if (formData.phone) {
      // For countries that prefer Mobile field
      const mobilePreferredCountries = ['ID', 'JP', 'TH', 'VN', 'PH', 'BD', 'MY', 'SG'];
      if (mobilePreferredCountries.includes(countryCode)) {
        request.Mobile = formData.phone;
      } else {
        request.Phone = formData.phone;
      }
    }
    if (formData.mobile) {
      request.Mobile = formData.mobile;
    }
    if (formData.address) {
      request.AddressLine = formData.address;
    }
    if (formData.city) {
      request.City = formData.city;
    }
    if (formData.state) {
      request.State = formData.state;
    }
    if (formData.postCode) {
      request.PostCode = formData.postCode;
    }

    return request;
  }

  /**
   * Get API key for specific country
   */
  private getApiKeyForCountry(countryCode: string): string {
    // Map country codes to their specific API keys
    // Using the multi-region key for countries without specific keys
    const countryKeyMap = {
      'AU': this.apiConfig.apiKeys.australia,
      'NZ': this.apiConfig.apiKeys.newZealand || this.apiConfig.apiKeys.multiRegion,
      'ID': this.apiConfig.apiKeys.indonesia,
      'MY': this.apiConfig.apiKeys.malaysia,
      'SG': this.apiConfig.apiKeys.singapore || this.apiConfig.apiKeys.multiRegion,
      'TH': this.apiConfig.apiKeys.thailand || this.apiConfig.apiKeys.multiRegion,
      'VN': this.apiConfig.apiKeys.vietnam || this.apiConfig.apiKeys.multiRegion,
      'PH': this.apiConfig.apiKeys.philippines || this.apiConfig.apiKeys.multiRegion,
      'JP': this.apiConfig.apiKeys.japan,
      'KR': this.apiConfig.apiKeys.southKorea || this.apiConfig.apiKeys.multiRegion,
      'HK': this.apiConfig.apiKeys.hongKong || this.apiConfig.apiKeys.multiRegion,
      'BD': this.apiConfig.apiKeys.bangladesh || this.apiConfig.apiKeys.multiRegion,
      'LK': this.apiConfig.apiKeys.sriLanka || this.apiConfig.apiKeys.multiRegion,
      'SA': this.apiConfig.apiKeys.saudiArabia || this.apiConfig.apiKeys.multiRegion,
      'AE': this.apiConfig.apiKeys.uae || this.apiConfig.apiKeys.multiRegion,
      'TR': this.apiConfig.apiKeys.turkey || this.apiConfig.apiKeys.multiRegion,
      'EG': this.apiConfig.apiKeys.egypt || this.apiConfig.apiKeys.multiRegion,
      'QA': this.apiConfig.apiKeys.qatar || this.apiConfig.apiKeys.multiRegion,
      'MA': this.apiConfig.apiKeys.morocco || this.apiConfig.apiKeys.multiRegion,
      'ZA': this.apiConfig.apiKeys.southAfrica || this.apiConfig.apiKeys.multiRegion,
      'FR': this.apiConfig.apiKeys.france || this.apiConfig.apiKeys.multiRegion,
      'CZ': this.apiConfig.apiKeys.czechRepublic || this.apiConfig.apiKeys.multiRegion,
      'CA': this.apiConfig.apiKeys.canada || this.apiConfig.apiKeys.multiRegion,
      'MX': this.apiConfig.apiKeys.mexico || this.apiConfig.apiKeys.multiRegion
    };

    return countryKeyMap[countryCode] || this.apiConfig.apiKeys.multiRegion;
  }

  /**
   * Convert country name to code
   */
  private getCountryCode(country: string): string {
    const countryMap = {
      // Asia-Pacific
      'australia': 'AU',
      'new-zealand': 'NZ',
      'indonesia': 'ID',
      'malaysia': 'MY',
      'singapore': 'SG',
      'thailand': 'TH',
      'vietnam': 'VN',
      'philippines': 'PH',
      'japan': 'JP',
      'south-korea': 'KR',
      'hong-kong': 'HK',
      'bangladesh': 'BD',
      'sri-lanka': 'LK',
      // Middle East & North Africa
      'saudi-arabia': 'SA',
      'uae': 'AE',
      'turkey': 'TR',
      'egypt': 'EG',
      'qatar': 'QA',
      'morocco': 'MA',
      // Africa
      'south-africa': 'ZA',
      // Europe
      'france': 'FR',
      'czech-republic': 'CZ',
      // Americas
      'canada': 'CA',
      'mexico': 'MX'
    };

    return countryMap[country.toLowerCase()] || 'AU';
  }

  /**
   * Get user-friendly error message
   */
  private getErrorMessage(error: any): string {
    if (error.status === 400) {
      return 'Invalid request. Please check all required fields.';
    } else if (error.status === 401) {
      return 'Authentication failed. Invalid API key.';
    } else if (error.status === 429) {
      return 'Rate limit exceeded. Please try again later.';
    } else if (error.status === 500) {
      return 'Server error. Please try again later.';
    }
    return 'An error occurred while verifying identity.';
  }

  /**
   * Calculate overall match percentage from response
   */
  getOverallMatchPercentage(response: IdentityVerificationResponse): number {
    return Math.round(parseFloat(response.TotalScore) * 100);
  }

  /**
   * Get field match scores as percentages
   */
  getFieldMatches(response: IdentityVerificationResponse): any {
    const fieldMatches = {
      name: 0,
      dateOfBirth: 0,
      address: 0,
      identification: 0,
      email: 0,
      phone: 0
    };

    response.document.forEach(field => {
      const score = Math.round(parseFloat(field.Score) * 100);
      
      switch (field.FieldName.toLowerCase()) {
        case 'firstname':
        case 'lastname':
          fieldMatches.name = Math.max(fieldMatches.name, score);
          break;
        case 'dateofbirth':
          fieldMatches.dateOfBirth = score;
          break;
        case 'addressline':
        case 'city':
        case 'state':
        case 'postcode':
          fieldMatches.address = Math.max(fieldMatches.address, score);
          break;
        case 'nationalid':
          fieldMatches.identification = score;
          break;
        case 'email':
          fieldMatches.email = score;
          break;
        case 'phone':
        case 'mobile':
          fieldMatches.phone = Math.max(fieldMatches.phone, score);
          break;
      }
    });

    return fieldMatches;
  }

  /**
   * Get country display name from code
   */
  getCountryDisplayName(countryCode: string): string {
    const codeToName = {
      'AU': 'Australia',
      'NZ': 'New Zealand',
      'ID': 'Indonesia',
      'MY': 'Malaysia',
      'SG': 'Singapore',
      'TH': 'Thailand',
      'VN': 'Vietnam',
      'PH': 'Philippines',
      'JP': 'Japan',
      'KR': 'South Korea',
      'HK': 'Hong Kong',
      'BD': 'Bangladesh',
      'LK': 'Sri Lanka',
      'SA': 'Saudi Arabia',
      'AE': 'United Arab Emirates',
      'TR': 'Turkey',
      'EG': 'Egypt',
      'QA': 'Qatar',
      'MA': 'Morocco',
      'ZA': 'South Africa',
      'FR': 'France',
      'CZ': 'Czech Republic',
      'CA': 'Canada',
      'MX': 'Mexico'
    };

    return codeToName[countryCode] || countryCode;
  }
}