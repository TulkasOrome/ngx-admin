import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { IdentityPulseService, IdentityVerificationResponse } from '../../../@core/services/identitypulse.service';
import { NbToastrService } from '@nebular/theme';
import { CsvProcessorService, CSVRow } from '../../../@core/services/csv-processor.service';

@Component({
  selector: 'ngx-manual-lookup',
  templateUrl: './manual-lookup.component.html',
  styleUrls: ['./manual-lookup.component.scss']
})
export class ManualLookupComponent implements OnInit {
  identityForm: FormGroup;
  isSubmitting = false;
  result: any = null;
  rawResponse: IdentityVerificationResponse | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private identityPulseService: IdentityPulseService,
    private toastr: NbToastrService,
    private csvProcessor: CsvProcessorService
  ) {
    this.identityForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      country: ['', Validators.required],
      identificationNumber: [''],
      email: ['', Validators.email],
      phone: [''],
      mobile: [''],
      address: [''],
      city: [''],
      state: [''],
      postCode: [''],
      matchStrictness: ['normal']
    });
  }

  ngOnInit(): void {
    // Check if country is passed as query parameter
    this.route.queryParams.subscribe(params => {
      if (params['country']) {
        this.identityForm.patchValue({
          country: params['country']
        });
      }
    });
  }

  onSubmit() {
    if (this.identityForm.valid) {
      this.isSubmitting = true;
      this.result = null;
      this.rawResponse = null;
      
      // Format request for API
      const apiRequest = this.identityPulseService.formatRequest(this.identityForm.value);
      
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
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.identityForm.controls).forEach(key => {
        this.identityForm.get(key).markAsTouched();
      });
    }
  }

  resetForm() {
    this.identityForm.reset({
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
        request: this.identityForm.value,
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