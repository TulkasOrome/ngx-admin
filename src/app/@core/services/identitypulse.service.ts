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
      // Use Mobile field for most countries now
      request.Mobile = formData.phone;
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
    const countryKeyMap = {
      'AU': this.apiConfig.apiKeys.australia,
      'NZ': this.apiConfig.apiKeys.newZealand,
      'CA': this.apiConfig.apiKeys.canada,
      'ID': this.apiConfig.apiKeys.indonesia,
      'MY': this.apiConfig.apiKeys.malaysia,
      'JP': this.apiConfig.apiKeys.japan,
      'PH': this.apiConfig.apiKeys.philippines,
      'TH': this.apiConfig.apiKeys.thailand,
      'VN': this.apiConfig.apiKeys.vietnam,
      'SA': this.apiConfig.apiKeys.saudiArabia,
      'TR': this.apiConfig.apiKeys.turkey,
      'AE': this.apiConfig.apiKeys.middleEastHub, // Use hub key for UAE
      'UAE': this.apiConfig.apiKeys.middleEastHub,
      'EG': this.apiConfig.apiKeys.egypt,
      'QA': this.apiConfig.apiKeys.qatar,
      'PK': this.apiConfig.apiKeys.pakistan,
      'MX': this.apiConfig.apiKeys.mexico,
      'ZA': this.apiConfig.apiKeys.southAfrica,
      'CZ': this.apiConfig.apiKeys.czech,
      'FR': this.apiConfig.apiKeys.france,
      'MA': this.apiConfig.apiKeys.morocco
    };

    // Use specific key if available, otherwise use master key
    return countryKeyMap[countryCode] || this.apiConfig.apiKeys.masterKey;
  }

  /**
   * Convert country name to code
   */
  private getCountryCode(country: string): string {
    const countryMap = {
      'australia': 'AU',
      'new-zealand': 'NZ',
      'canada': 'CA',
      'indonesia': 'ID',
      'malaysia': 'MY',
      'japan': 'JP',
      'philippines': 'PH',
      'thailand': 'TH',
      'vietnam': 'VN',
      'saudi-arabia': 'SA',
      'turkey': 'TR',
      'uae': 'UAE',
      'egypt': 'EG',
      'qatar': 'QA',
      'pakistan': 'PK',
      'mexico': 'MX',
      'south-africa': 'ZA',
      'czech-republic': 'CZ',
      'france': 'FR',
      'morocco': 'MA'
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
          fieldMatches.address = score;
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
}