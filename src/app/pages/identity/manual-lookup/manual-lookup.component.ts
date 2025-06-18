import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ElasticsearchService, IdentitySearchResponse } from '../../../@core/services/elasticsearch.service';
import { NbToastrService } from '@nebular/theme';

@Component({
  selector: 'ngx-manual-lookup',
  templateUrl: './manual-lookup.component.html',
  styleUrls: ['./manual-lookup.component.scss']
})
export class ManualLookupComponent implements OnInit {
  identityForm: FormGroup;
  isSubmitting = false;
  result: IdentitySearchResponse | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private elasticsearchService: ElasticsearchService,
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
      address: [''],
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
      
      const searchRequest = this.identityForm.value;
      
      this.elasticsearchService.searchIdentity(searchRequest).subscribe(
        (response: IdentitySearchResponse) => {
          this.isSubmitting = false;
          this.result = response;
          
          if (response.overallMatch >= 80) {
            this.toastr.success(`Identity verified with ${response.overallMatch}% confidence`, 'Verification Successful');
          } else if (response.overallMatch >= 60) {
            this.toastr.warning(`Partial match found with ${response.overallMatch}% confidence`, 'Partial Match');
          } else {
            this.toastr.danger('No matching records found', 'No Match');
          }
        },
        error => {
          this.isSubmitting = false;
          this.toastr.danger(error || 'Failed to search identity records', 'Search Error');
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
    this.identityForm.reset();
    this.result = null;
  }

  getMatchStatus(score: number): string {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'danger';
  }
}