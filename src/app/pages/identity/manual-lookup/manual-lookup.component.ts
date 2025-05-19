import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'ngx-manual-lookup',
  templateUrl: './manual-lookup.component.html',
  styleUrls: ['./manual-lookup.component.scss']
})
export class ManualLookupComponent {
  identityForm: FormGroup;
  isSubmitting = false;
  result = null;

  constructor(private fb: FormBuilder) {
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

  onSubmit() {
    if (this.identityForm.valid) {
      this.isSubmitting = true;
      // Here you would call your identity verification service
      setTimeout(() => {
        this.isSubmitting = false;
        this.result = {
          overallMatch: 85,
          fieldMatches: {
            name: 90,
            dateOfBirth: 100,
            address: 70,
            identification: 80
          }
        };
      }, 2000);
    }
  }
}