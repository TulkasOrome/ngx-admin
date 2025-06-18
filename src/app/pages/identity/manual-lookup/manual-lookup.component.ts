import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { IdentityPulseService, IdentityVerificationResponse } from '../../../@core/services/identitypulse.service';
import { NbToastrService } from '@nebular/theme';

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
    private toastr: NbToastrService
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
}