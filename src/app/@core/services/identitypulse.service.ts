// src/app/@core/services/identitypulse.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface IdentityVerificationRequest {
  FirstName?: string;
  LastName?: string;
  MiddleName?: string;
  MiddleName2?: string;
  MiddleName3?: string;
  GivenName2?: string;
  GivenName3?: string;
  GivenName4?: string;
  GivenName5?: string;
  GivenName6?: string;
  GivenName7?: string;
  DateOfBirth?: string;
  Country: string;
  NationalId?: string;
  Email?: string;
  Phone?: string;
  Mobile?: string;
  Mobile2?: string;
  Mobile3?: string;
  AddressLine?: string;
  City?: string;
  State?: string;
  Province?: string;
  Prefecture?: string;
  Department?: string;
  Region?: string;
  Emirate?: string;
  Governorate?: string;
  District?: string;
  Ward?: string;
  PostCode?: string;
  PostalCode?: string;
  // Special ID fields
  URN?: string;
  EmiratesId?: string;
  QatarId?: string;
  BirthNumber?: string;
  INSEE?: string;
  CarteIdentite?: string;
  CIN?: string;
  SIN?: string;
  CURP?: string;
  Residence?: string;
  // Japanese name fields
  NameKanji?: string;
  NameKatakana?: string;
  NameHiragana?: string;
  // Arabic name fields
  ArabicFirstName?: string;
  ArabicLastName?: string;
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
    const url = `${baseUrl}${this.apiConfig.endpoint}?code=${this.apiConfig.azureFunctionKey}`;
    
    // UPDATED: Always use the portal key for all countries
    const apiKey = this.apiConfig.apiKeys.portalKey;
    
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

    // Get country code (already in correct format from form)
    const countryCode = formData.country;

    const request: IdentityVerificationRequest = {
      Country: countryCode,
      MatchStrictness: formData.matchStrictness || 'normal'
    };

    // Add name fields
    if (formData.firstName) request.FirstName = formData.firstName;
    if (formData.lastName) request.LastName = formData.lastName;
    if (formData.middleName) request.MiddleName = formData.middleName;
    if (formData.middleName2) request.MiddleName2 = formData.middleName2;
    if (formData.middleName3) request.MiddleName3 = formData.middleName3;
    
    // Add given names
    for (let i = 2; i <= 7; i++) {
      const fieldName = `givenName${i}`;
      if (formData[fieldName]) {
        request[`GivenName${i}`] = formData[fieldName];
      }
    }

    // Date of birth
    if (dateOfBirth) request.DateOfBirth = dateOfBirth;

    // National ID - map based on country
    if (formData.identificationNumber) {
      request.NationalId = formData.identificationNumber;
    } else if (formData.emiratesId) {
      request.EmiratesId = formData.emiratesId;
    } else if (formData.qatarId) {
      request.QatarId = formData.qatarId;
    } else if (formData.birthNumber) {
      request.BirthNumber = formData.birthNumber;
    } else if (formData.insee) {
      request.INSEE = formData.insee;
    } else if (formData.carteIdentite) {
      request.CarteIdentite = formData.carteIdentite;
    } else if (formData.cin) {
      request.CIN = formData.cin;
    } else if (formData.sin) {
      request.SIN = formData.sin;
    } else if (formData.curp) {
      request.CURP = formData.curp;
    }

    // Special fields
    if (formData.urn) request.URN = formData.urn;
    if (formData.residence) request.Residence = formData.residence;

    // Contact information
    if (formData.email) request.Email = formData.email;
    if (formData.phone) {
      request.Phone = formData.phone;
      request.Mobile = formData.phone; // Send as both
    }
    if (formData.mobile) {
      request.Mobile = formData.mobile;
      if (!formData.phone) {
        request.Phone = formData.mobile; // Some countries use Phone instead of Mobile
      }
    }
    if (formData.mobile2) request.Mobile2 = formData.mobile2;
    if (formData.mobile3) request.Mobile3 = formData.mobile3;

    // Address information
    if (formData.address) request.AddressLine = formData.address;
    if (formData.city) request.City = formData.city;
    
    // State/Province/Region etc.
    if (formData.state) request.State = formData.state;
    if (formData.province) request.Province = formData.province;
    if (formData.prefecture) request.Prefecture = formData.prefecture;
    if (formData.department) request.Department = formData.department;
    if (formData.region) request.Region = formData.region;
    if (formData.emirate) request.Emirate = formData.emirate;
    if (formData.governorate) request.Governorate = formData.governorate;
    if (formData.district) request.District = formData.district;
    if (formData.ward) request.Ward = formData.ward;
    
    // Post code
    if (formData.postCode) request.PostCode = formData.postCode;
    if (formData.postalCode) request.PostalCode = formData.postalCode;

    // Japanese name fields
    if (formData.nameKanji) request.NameKanji = formData.nameKanji;
    if (formData.nameKatakana) request.NameKatakana = formData.nameKatakana;
    if (formData.nameHiragana) request.NameHiragana = formData.nameHiragana;

    // Arabic name fields
    if (formData.arabicFirstName) request.ArabicFirstName = formData.arabicFirstName;
    if (formData.arabicLastName) request.ArabicLastName = formData.arabicLastName;

    return request;
  }

  /**
   * Get user-friendly error message
   */
  private getErrorMessage(error: any): string {
    if (error.status === 400) {
      if (error.error?.message) {
        return error.error.message;
      }
      return 'Invalid request. Please check all required fields for the selected country.';
    } else if (error.status === 401) {
      return 'Authentication failed. Invalid API key.';
    } else if (error.status === 404) {
      return 'API endpoint not found. Please check configuration.';
    } else if (error.status === 500) {
      return 'Server error. Please try again later.';
    } else if (error.status === 0) {
      return 'Network error. Please check your connection or API configuration.';
    }
    return error.error?.message || 'An error occurred while verifying identity.';
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
        case 'givenname':
        case 'familyname':
          fieldMatches.name = Math.max(fieldMatches.name, score);
          break;
        case 'dateofbirth':
        case 'dob':
          fieldMatches.dateOfBirth = score;
          break;
        case 'addressline':
        case 'address':
        case 'city':
        case 'state':
        case 'postcode':
          fieldMatches.address = Math.max(fieldMatches.address, score);
          break;
        case 'nationalid':
        case 'emiratesid':
        case 'qatarid':
        case 'cin':
        case 'curp':
        case 'identificationnumber':
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