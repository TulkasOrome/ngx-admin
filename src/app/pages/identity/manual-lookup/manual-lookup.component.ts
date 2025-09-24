// src/app/pages/identity/manual-lookup/manual-lookup.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IdentityPulseService, IdentityVerificationResponse } from '../../../@core/services/identitypulse.service';
import { NbToastrService } from '@nebular/theme';
import { CsvProcessorService, CSVRow } from '../../../@core/services/csv-processor.service';
import { CountryFieldConfig, COUNTRY_CONFIGURATIONS } from '../../../@core/services/country-fields.config';

@Component({
  selector: 'ngx-manual-lookup',
  templateUrl: './manual-lookup.component.html',
  styleUrls: ['./manual-lookup.component.scss']
})
export class ManualLookupComponent implements OnInit, OnDestroy {
  identityForm: FormGroup;
  isSubmitting = false;
  result: any = null;
  rawResponse: IdentityVerificationResponse | null = null;
  selectedCountry: CountryFieldConfig | null = null;
  private destroy$ = new Subject<void>();

  // All possible form fields
  private allFormFields = [
    'country', 'firstName', 'lastName', 'dateOfBirth', 'nationalId',
    'email', 'mobile', 'mobile2', 'mobile3', 'addressLine', 'city', 'state', 
    'postCode', 'matchStrictness',
    // Additional name fields
    'middleName', 'middleName2', 'middleName3',
    'givenName2', 'givenName3', 'givenName4', 'givenName5', 'givenName6', 'givenName7',
    // Japanese name fields
    'nameKanji', 'nameKatakana', 'nameHiragana',
    // Arabic name fields
    'arabicFirstName', 'arabicLastName',
    // Location-specific fields
    'province', 'prefecture', 'department', 'region', 'emirate', 'governorate',
    'district', 'ward', 'postalCode',
    // Special ID fields
    'urn', 'emiratesId', 'qatarId', 'birthNumber', 'insee', 'carteIdentite',
    'cin', 'sin', 'curp', 'residence'
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private identityPulseService: IdentityPulseService,
    private toastr: NbToastrService,
    private csvProcessor: CsvProcessorService
  ) {
    // Initialize form with all possible fields
    const formControls = {};
    this.allFormFields.forEach(field => {
      if (field === 'email') {
        formControls[field] = ['', Validators.email];
      } else if (field === 'matchStrictness') {
        formControls[field] = ['normal'];
      } else if (field === 'country') {
        formControls[field] = ['', Validators.required];
      } else {
        formControls[field] = [''];
      }
    });

    this.identityForm = this.fb.group(formControls);
  }

  ngOnInit(): void {
    // Watch for country changes
    this.identityForm.get('country').valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(countryCode => {
        this.onCountryChange(countryCode);
      });

    // Check if country is passed as query parameter
    this.route.queryParams.subscribe(params => {
      if (params['country']) {
        // Map country name to code if needed
        const countryCode = this.getCountryCodeFromParam(params['country']);
        this.identityForm.patchValue({
          country: countryCode
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private getCountryCodeFromParam(param: string): string {
    // Handle both codes and names
    const upperParam = param.toUpperCase();
    if (COUNTRY_CONFIGURATIONS[upperParam]) {
      return upperParam;
    }
    
    // Try to find by name
    for (const code in COUNTRY_CONFIGURATIONS) {
      if (COUNTRY_CONFIGURATIONS[code].name.toLowerCase() === param.toLowerCase()) {
        return code;
      }
    }
    
    return param;
  }

  onCountryChange(countryCode: string): void {
    if (countryCode && COUNTRY_CONFIGURATIONS[countryCode]) {
      this.selectedCountry = COUNTRY_CONFIGURATIONS[countryCode];
      this.updateFormValidators();
    } else {
      this.selectedCountry = null;
      this.clearFormValidators();
    }
  }

  private updateFormValidators(): void {
    if (!this.selectedCountry) return;

    // Clear all validators first
    this.clearFormValidators();

    // Set required validators based on country
    this.selectedCountry.requiredFields.forEach(field => {
      const control = this.identityForm.get(field);
      if (control) {
        if (field === 'email') {
          control.setValidators([Validators.required, Validators.email]);
        } else {
          control.setValidators([Validators.required]);
        }
        control.updateValueAndValidity({ emitEvent: false });
      }
    });

    // Update form validity
    this.identityForm.updateValueAndValidity({ emitEvent: false });
  }

  private clearFormValidators(): void {
    this.allFormFields.forEach(field => {
      if (field !== 'country' && field !== 'matchStrictness') {
        const control = this.identityForm.get(field);
        if (control) {
          if (field === 'email') {
            control.setValidators([Validators.email]);
          } else {
            control.clearValidators();
          }
          control.updateValueAndValidity({ emitEvent: false });
        }
      }
    });
  }

  isFieldRequired(fieldName: string): boolean {
    return this.selectedCountry?.requiredFields?.includes(fieldName) || false;
  }

  showField(fieldName: string): boolean {
    if (!this.selectedCountry) return false;
    
    const allFields = [
      ...(this.selectedCountry.requiredFields || []),
      ...(this.selectedCountry.optionalFields || [])
    ];
    
    return allFields.includes(fieldName);
  }

  getFieldStatus(fieldName: string): string {
    const control = this.identityForm.get(fieldName);
    if (!control) return 'basic';
    
    if (control.invalid && control.touched) {
      return 'danger';
    }
    return 'basic';
  }

  showFieldError(fieldName: string): boolean {
    const control = this.identityForm.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }

  getFieldHint(fieldName: string): string {
    return this.selectedCountry?.hints?.[fieldName] || '';
  }

  getFieldDisplayName(field: string): string {
    const displayNames = {
      firstName: 'First Name / Given Name',
      lastName: 'Last Name / Family Name',
      dateOfBirth: 'Date of Birth',
      nationalId: 'National ID',
      email: 'Email Address',
      mobile: 'Mobile/Phone Number',
      addressLine: 'Street Address',
      city: 'City',
      state: 'State/Province',
      postCode: 'Post Code',
      middleName: 'Middle Name',
      province: 'Province',
      prefecture: 'Prefecture',
      department: 'Department',
      region: 'Region',
      emirate: 'Emirate',
      governorate: 'Governorate'
    };
    return displayNames[field] || field;
  }

  showMultipleGivenNames(): boolean {
    if (!this.selectedCountry) return false;
    const countries = ['ID', 'MY', 'PH', 'TH', 'TR', 'AE', 'FR', 'MX'];
    return countries.includes(this.selectedCountry.code);
  }

  getGivenNameIndices(): number[] {
    if (!this.selectedCountry) return [];
    
    const maxNames = this.selectedCountry.specificRequirements?.multipleGivenNames;
    if (!maxNames) return [];
    
    const indices = [];
    for (let i = 2; i <= Math.min(maxNames, 7); i++) {
      indices.push(i);
    }
    return indices;
  }

  showJapaneseNameFields(): boolean {
    return this.selectedCountry?.code === 'JP';
  }

  showArabicNameFields(): boolean {
    if (!this.selectedCountry) return false;
    const arabicCountries = ['SA', 'AE', 'EG', 'QA', 'MA'];
    return arabicCountries.includes(this.selectedCountry.code);
  }

  showVietnameseLocationFields(): boolean {
    return this.selectedCountry?.code === 'VN';
  }

  showMultipleMobileFields(): boolean {
    return this.selectedCountry?.code === 'ZA';
  }

  showSpecialIdFields(): boolean {
    if (!this.selectedCountry) return false;
    const specialIdCountries = ['NZ', 'FR', 'CZ'];
    return specialIdCountries.includes(this.selectedCountry.code);
  }

  getNationalIdLabel(): string {
    if (!this.selectedCountry) return 'National ID';
    
    const labels = {
      'AU': 'ID Number (Optional)',
      'ID': 'KTP Number',
      'MY': 'MyKad Number',
      'TH': 'Thai National ID',
      'VN': 'National ID',
      'SA': 'Saudi ID / Iqama',
      'TR': 'T.C. Kimlik No',
      'AE': 'Emirates ID',
      'EG': 'Egyptian National ID',
      'QA': 'Qatar ID',
      'CZ': 'Birth Number',
      'MA': 'CIN',
      'CA': 'SIN',
      'MX': 'CURP',
      'ZA': 'SA ID Number'
    };
    
    return labels[this.selectedCountry.code] || 'National ID';
  }

  getNationalIdPlaceholder(): string {
    if (!this.selectedCountry) return 'Enter national ID';
    
    const placeholders = {
      'ID': 'Enter 16-digit KTP',
      'MY': 'Enter 12-digit MyKad',
      'TH': 'Enter 13-digit ID',
      'TR': 'Enter 11-digit T.C. Kimlik No',
      'AE': 'Enter 15-digit Emirates ID',
      'EG': 'Enter 14-digit ID',
      'MX': 'Enter 18-character CURP',
      'ZA': 'Enter 13-digit SA ID'
    };
    
    return placeholders[this.selectedCountry.code] || 'Enter identification number';
  }

  getNationalIdHint(): string {
    return this.getFieldHint('nationalId');
  }

  getMobileLabel(): string {
    if (!this.selectedCountry) return 'Mobile/Phone';
    
    const labels = {
      'AU': 'Mobile Number',
      'NZ': 'Mobile Number',
      'JP': 'Mobile Number',
      'CA': 'Phone Number'
    };
    
    return labels[this.selectedCountry.code] || 'Mobile Number';
  }

  getMobilePlaceholder(): string {
    if (!this.selectedCountry) return 'Enter mobile number';
    
    const placeholders = {
      'AU': '04XXXXXXXX or 614XXXXXXXX',
      'JP': '819XXXXXXXXX',
      'ID': '8XXXXXXXXXX',
      'MY': '01XXXXXXXXX',
      'PH': '09XXXXXXXXX',
      'SA': '966XXXXXXXXX',
      'TR': '905XXXXXXXXX',
      'CA': '14165551234',
      'MX': '521XXXXXXXXXX',
      'ZA': '27XXXXXXXXX'
    };
    
    return placeholders[this.selectedCountry.code] || 'Enter mobile number';
  }

  getCityLabel(): string {
    if (!this.selectedCountry) return 'City';
    
    const labels = {
      'VN': 'City/District',
      'ID': 'City/Regency',
      'PH': 'City/Municipality'
    };
    
    return labels[this.selectedCountry.code] || 'City';
  }

  getCityPlaceholder(): string {
    return 'Enter city';
  }

  getStateLabel(): string {
    if (!this.selectedCountry) return 'State/Province';
    
    const labels = {
      'AU': 'State',
      'US': 'State',
      'CA': 'Province',
      'ID': 'Province',
      'MY': 'State',
      'PH': 'Province/Region',
      'TH': 'Province',
      'VN': 'Province',
      'SA': 'Region',
      'TR': 'Province',
      'AE': 'Emirate',
      'EG': 'Governorate',
      'CZ': 'Region',
      'FR': 'Department',
      'MA': 'Region',
      'MX': 'State',
      'ZA': 'Province',
      'JP': 'Prefecture'
    };
    
    return labels[this.selectedCountry.code] || 'State/Province';
  }

  getStatePlaceholder(): string {
    if (!this.selectedCountry) return 'Enter state/province';
    
    const placeholders = {
      'AU': 'e.g., NSW, VIC, QLD',
      'CA': 'e.g., ON, QC, BC',
      'US': 'e.g., CA, NY, TX',
      'AE': 'e.g., Dubai, Abu Dhabi',
      'ZA': 'e.g., Gauteng, Western Cape'
    };
    
    return placeholders[this.selectedCountry.code] || 'Enter state/province';
  }

  getPostCodeLabel(): string {
    if (!this.selectedCountry) return 'Post Code';
    
    const labels = {
      'US': 'ZIP Code',
      'CA': 'Postal Code',
      'AU': 'Postcode',
      'NZ': 'Postcode'
    };
    
    return labels[this.selectedCountry.code] || 'Post Code';
  }

  getPostCodePlaceholder(): string {
    if (!this.selectedCountry) return 'Enter post code';
    
    const placeholders = {
      'AU': 'e.g., 2000',
      'CA': 'e.g., M5V 3A8',
      'US': 'e.g., 10001',
      'CZ': 'e.g., 110 00',
      'FR': 'e.g., 75001'
    };
    
    return placeholders[this.selectedCountry.code] || 'Enter post code';
  }

  getRequiredFieldsList(): string[] {
    return this.selectedCountry?.requiredFields || [];
  }

  getSpecificRequirements(): { key: string; value: string }[] {
    if (!this.selectedCountry?.specificRequirements) return [];
    
    return Object.entries(this.selectedCountry.specificRequirements).map(([key, value]) => ({
      key: this.formatRequirementKey(key),
      value: String(value)
    }));
  }

  private formatRequirementKey(key: string): string {
    // Convert camelCase to Title Case
    return key.replace(/([A-Z])/g, ' $1')
              .replace(/^./, str => str.toUpperCase())
              .trim();
  }

  onSubmit() {
    // Mark all fields as touched to show validation errors
    Object.keys(this.identityForm.controls).forEach(key => {
      this.identityForm.get(key).markAsTouched();
    });

    if (!this.identityForm.valid) {
      this.toastr.danger('Please fill in all required fields', 'Validation Error');
      return;
    }
    
    this.isSubmitting = true;
    this.result = null;
    this.rawResponse = null;
    
    // Format request for API
    const formData = this.prepareFormData();
    const apiRequest = this.identityPulseService.formatRequest(formData);
    
    this.identityPulseService.verifyIdentity(apiRequest).subscribe(
      (responses: IdentityVerificationResponse[]) => {
        this.isSubmitting = false;
        
        if (responses && responses.length > 0) {
          const response = responses[0]; // Take the first/best match
          this.rawResponse = response;
          
          // Check if it's a no match response
          if (response.TotalScore === '0.00' || response.ConfidenceLevel === 'NO_MATCH') {
            this.result = {
              overallMatch: 0,
              fieldMatches: {
                name: 0,
                dateOfBirth: 0,
                address: 0,
                identification: 0,
                email: 0,
                phone: 0
              },
              confidenceLevel: 'NO_MATCH',
              matchTier: 'No Match Found',
              warningMessage: response.WarningMessage || 'No matching records found in the database'
            };
            this.toastr.danger('No matching records found', 'No Match');
          } else {
            // Process response for display
            this.result = {
              overallMatch: this.identityPulseService.getOverallMatchPercentage(response),
              fieldMatches: this.identityPulseService.getFieldMatches(response),
              confidenceLevel: response.ConfidenceLevel,
              matchTier: response.MatchTier,
              warningMessage: response.WarningMessage
            };
            
            // Show appropriate toast message
            if (response.ConfidenceLevel === 'VERY_HIGH' || response.ConfidenceLevel === 'CONFIRMED_MATCH') {
              this.toastr.success(
                `Identity verified with ${response.ConfidenceLevel} confidence`, 
                'Verification Successful'
              );
            } else if (response.ConfidenceLevel === 'HIGH' || response.ConfidenceLevel === 'MEDIUM') {
              this.toastr.warning(
                `Partial match found with ${response.ConfidenceLevel} confidence`, 
                'Partial Match'
              );
            } else {
              this.toastr.danger(
                'Low confidence match. Manual review recommended.', 
                'Low Confidence'
              );
            }
          }
          
          // Store result in history
          this.storeVerificationResult(apiRequest, this.result);
        } else {
          // No results returned at all
          this.result = {
            overallMatch: 0,
            fieldMatches: {
              name: 0,
              dateOfBirth: 0,
              address: 0,
              identification: 0,
              email: 0,
              phone: 0
            },
            confidenceLevel: 'NO_MATCH',
            matchTier: 'No Match Found',
            warningMessage: 'No matching records found in the database'
          };
          this.toastr.danger('No matching records found', 'No Match');
        }
      },
      error => {
        this.isSubmitting = false;
        console.error('API Error:', error);
        this.toastr.danger(error || 'Failed to verify identity', 'Verification Error');
      }
    );
  }

  private prepareFormData(): any {
    const formValue = this.identityForm.value;
    const cleanData: any = {
      country: formValue.country,
      matchStrictness: formValue.matchStrictness
    };

    // Map form fields to API fields based on country
    if (formValue.firstName) cleanData.firstName = formValue.firstName;
    if (formValue.lastName) cleanData.lastName = formValue.lastName;
    if (formValue.dateOfBirth) cleanData.dateOfBirth = formValue.dateOfBirth;
    if (formValue.email) cleanData.email = formValue.email;

    // Handle mobile/phone fields
    if (formValue.mobile) {
      cleanData.mobile = formValue.mobile;
      cleanData.phone = formValue.mobile; // Some countries use phone instead
    }
    if (formValue.mobile2) cleanData.mobile2 = formValue.mobile2;
    if (formValue.mobile3) cleanData.mobile3 = formValue.mobile3;

    // Handle address fields
    if (formValue.addressLine) cleanData.address = formValue.addressLine;
    if (formValue.city) cleanData.city = formValue.city;
    if (formValue.postCode) cleanData.postCode = formValue.postCode;

    // Handle state/province/region based on country
    const stateField = this.getStateFieldName();
    if (formValue.state) cleanData[stateField] = formValue.state;

    // Handle national ID based on country
    if (formValue.nationalId) {
      const idFieldName = this.getNationalIdFieldName();
      cleanData[idFieldName] = formValue.nationalId;
    }

    // Handle additional name fields
    if (formValue.middleName) cleanData.middleName = formValue.middleName;
    if (formValue.middleName2) cleanData.middleName2 = formValue.middleName2;
    if (formValue.middleName3) cleanData.middleName3 = formValue.middleName3;

    // Handle given names
    for (let i = 2; i <= 7; i++) {
      const fieldName = `givenName${i}`;
      if (formValue[fieldName]) {
        cleanData[fieldName] = formValue[fieldName];
      }
    }

    // Handle special fields
    if (formValue.nameKanji) cleanData.nameKanji = formValue.nameKanji;
    if (formValue.nameKatakana) cleanData.nameKatakana = formValue.nameKatakana;
    if (formValue.nameHiragana) cleanData.nameHiragana = formValue.nameHiragana;
    if (formValue.arabicFirstName) cleanData.arabicFirstName = formValue.arabicFirstName;
    if (formValue.arabicLastName) cleanData.arabicLastName = formValue.arabicLastName;
    if (formValue.district) cleanData.district = formValue.district;
    if (formValue.ward) cleanData.ward = formValue.ward;

    return cleanData;
  }

  private getStateFieldName(): string {
    if (!this.selectedCountry) return 'state';
    
    const fieldNames = {
      'JP': 'prefecture',
      'FR': 'department',
      'AE': 'emirate',
      'EG': 'governorate',
      'SA': 'region',
      'MA': 'region',
      'CZ': 'region',
      'ID': 'province',
      'TH': 'province',
      'VN': 'province',
      'PH': 'province',
      'TR': 'province',
      'CA': 'province',
      'ZA': 'province'
    };
    
    return fieldNames[this.selectedCountry.code] || 'state';
  }

  private getNationalIdFieldName(): string {
    if (!this.selectedCountry) return 'identificationNumber';
    
    const fieldNames = {
      'AE': 'emiratesId',
      'QA': 'qatarId',
      'CZ': 'birthNumber',
      'FR': 'insee',
      'MA': 'cin',
      'CA': 'sin',
      'MX': 'curp'
    };
    
    return fieldNames[this.selectedCountry.code] || 'identificationNumber';
  }

  resetForm() {
    const currentCountry = this.identityForm.get('country').value;
    this.identityForm.reset({
      country: currentCountry,
      matchStrictness: 'normal'
    });
    this.result = null;
    this.rawResponse = null;
  }

  getMatchStatus(score: number): string {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'danger';
  }

  downloadReport() {
    if (this.rawResponse) {
      const report = {
        timestamp: new Date().toISOString(),
        country: this.selectedCountry?.name,
        request: this.prepareFormData(),
        response: this.rawResponse
      };
      
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `identity-verification-${Date.now()}.json`;
      link.click();
      window.URL.revokeObjectURL(url);
    }
  }

  private storeVerificationResult(request: any, result: any) {
    try {
      // Get existing history from localStorage
      const historyStr = localStorage.getItem('verificationHistory');
      const history = historyStr ? JSON.parse(historyStr) : [];
      
      // Add new result
      const newEntry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        country: request.Country,
        name: `${request.FirstName} ${request.LastName}`.trim(),
        matchScore: result.overallMatch,
        confidenceLevel: result.confidenceLevel,
        matchTier: result.matchTier,
        request: request,
        response: this.rawResponse
      };
      
      // Add to beginning of array
      history.unshift(newEntry);
      
      // Keep only last 100 entries
      if (history.length > 100) {
        history.splice(100);
      }
      
      // Save back to localStorage
      localStorage.setItem('verificationHistory', JSON.stringify(history));
    } catch (error) {
      console.error('Error storing verification result:', error);
    }
  }

  // Bulk Upload Methods
  openBulkUpload() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.handleBulkUpload(file);
      }
    };
    input.click();
  }

  handleBulkUpload(file: File) {
    if (!file.name.endsWith('.csv')) {
      this.toastr.danger('Please select a CSV file', 'Invalid File');
      return;
    }

    // Read file content
    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        // Parse CSV
        const csvContent = e.target.result;
        const data = this.csvProcessor.parseCSV(csvContent);
        
        // Validate
        const validation = this.csvProcessor.validateCSV(data);
        if (!validation.valid) {
          this.toastr.danger(validation.errors.join('\n'), 'CSV Validation Failed');
          return;
        }

        // Show confirmation
        this.toastr.info(`Found ${data.length} valid rows. Processing...`, 'Processing');

        // Simulate upload for demo purposes
        this.simulateUpload(file, data);
      } catch (error) {
        this.toastr.danger('Failed to parse CSV file', 'Error');
        console.error('CSV parse error:', error);
      }
    };
    
    reader.readAsText(file);
  }

  simulateUpload(file: File, data: CSVRow[]) {
    // Simulate upload progress for demo
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      if (progress <= 100) {
        this.toastr.info(`Upload progress: ${progress}%`, 'Uploading', {
          duration: 1000,
          preventDuplicates: true
        });
      }
      
      if (progress >= 100) {
        clearInterval(interval);
        
        // Simulate successful upload
        this.toastr.success(`Successfully uploaded ${data.length} records`, 'Upload Complete');
        
        // Store upload history
        const mockUrl = `https://stidentitypulsebulk.blob.core.windows.net/bulk-uploads/${Date.now()}-${file.name}`;
        this.storeBulkUploadHistory(file.name, data.length, mockUrl);
      }
    }, 500);
  }

  private storeBulkUploadHistory(filename: string, recordCount: number, url: string) {
    const history = JSON.parse(localStorage.getItem('bulkUploadHistory') || '[]');
    history.unshift({
      id: Date.now(),
      filename,
      recordCount,
      url,
      uploadDate: new Date().toISOString(),
      status: 'uploaded'
    });
    
    // Keep only last 50 uploads
    if (history.length > 50) {
      history.splice(50);
    }
    
    localStorage.setItem('bulkUploadHistory', JSON.stringify(history));
  }

  downloadSampleCSV() {
    const csvContent = this.csvProcessor.generateSampleCSV();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'identitypulse-sample.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  }
}