// src/app/components/property-create/property-create.component.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { PropertyService } from '../../../../../../services/property.service';
import { PropertyRequest } from '../../../../../../services/auth-interfaces';

@Component({
  selector: 'app-property-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  templateUrl: './property-create.html',
  styleUrls: ['./property-create.css']
})
export class PropertyCreateComponent implements OnInit {
  propertyForm!: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  propertyTypes = [
    { value: 'APARTMENT', label: 'Apartment' },
    { value: 'HOUSE', label: 'House' },
    { value: 'bungallow', label: 'Bungalow' }, // Match your backend
    { value: 'COMMERCIAL', label: 'Commercial' },
    { value: 'CONDO', label: 'Condominium' },
    { value: 'TOWNHOUSE', label: 'Townhouse' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    public propertyService: PropertyService
  ) {}

  ngOnInit() {
    this.initializeForm();
    this.checkPermissions();
  }

  private initializeForm() {
    this.propertyForm = this.fb.group({
      name: ['', [Validators.required, this.notBlankValidator]],
      location: ['', [Validators.required, this.notBlankValidator]],
      propertyType: ['', [Validators.required]],
      totalUnits: ['', [Validators.required, Validators.min(1), Validators.max(10000)]],
      description: ['', [Validators.maxLength(1000)]]
    });
  }

  private checkPermissions() {
    if (!this.propertyService.canManageProperties()) {
      this.errorMessage = 'You do not have permission to create properties.';
      setTimeout(() => {
        this.router.navigate(['/dashboard']);
      }, 3000);
    }
  }

  // Custom validator to match @NotBlank behavior
  private notBlankValidator(control: any) {
    if (control.value && typeof control.value === 'string' && control.value.trim().length === 0) {
      return { notBlank: true };
    }
    return null;
  }

  // Get error message for form field
  getErrorMessage(fieldName: string): string {
    const field = this.propertyForm.get(fieldName);
    
    if (field?.hasError('required')) {
      switch (fieldName) {
        case 'name': return 'Property name is required';
        case 'location': return 'Location is required';
        case 'propertyType': return 'Property type is required';
        case 'totalUnits': return 'Total units is required';
        default: return 'This field is required';
      }
    }
    
    if (field?.hasError('notBlank')) {
      switch (fieldName) {
        case 'name': return 'Property name cannot be empty';
        case 'location': return 'Location cannot be empty';
        default: return 'This field cannot be empty';
      }
    }
    
    if (field?.hasError('min')) {
      return 'Total units must be at least 1';
    }

    if (field?.hasError('max')) {
      return 'Total units cannot exceed 10,000';
    }

    if (field?.hasError('maxlength')) {
      return 'Description cannot exceed 1000 characters';
    }
    
    return '';
  }

  // Check if field has error and is touched
  hasFieldError(fieldName: string): boolean {
    const field = this.propertyForm.get(fieldName);
    return !!(field?.invalid && (field?.dirty || field?.touched));
  }

  onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.propertyForm.valid) {
      this.isSubmitting = true;
      
      // Trim whitespace from string fields
      const formData = {
        ...this.propertyForm.value,
        name: this.propertyForm.value.name?.trim(),
        location: this.propertyForm.value.location?.trim(),
        description: this.propertyForm.value.description?.trim() || ''
      };

      // Validate data using service
      const validationErrors = this.propertyService.validatePropertyData(formData);
      if (validationErrors.length > 0) {
        this.errorMessage = validationErrors.join(', ');
        this.isSubmitting = false;
        return;
      }

      this.createProperty(formData);
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.propertyForm.controls).forEach(key => {
        this.propertyForm.get(key)?.markAsTouched();
      });
      this.errorMessage = 'Please fix the errors above before submitting.';
    }
  }

  private createProperty(propertyData: any) {
    const propertyRequest: PropertyRequest = {
      name: propertyData.name,
      location: propertyData.location,
      propertyType: propertyData.propertyType,
      totalUnits: parseInt(propertyData.totalUnits),
      description: propertyData.description
    };

    console.log('Creating property:', propertyRequest);

    this.propertyService.createProperty(propertyRequest).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        
        if (response.success) {
          this.successMessage = response.message || 'Property created successfully!';
          
          // Show success message and redirect
          setTimeout(() => {
            this.router.navigate(['/landlord-dashboard/property']);
          }, 2000);
        } else {
          this.errorMessage = response.message || 'Failed to create property. Please try again.';
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Property creation error:', error);
        
        // Handle different types of errors
        if (error.message) {
          this.errorMessage = error.message;
        } else {
          this.errorMessage = 'Failed to create property. Please try again later.';
        }
      }
    });
  }

  onCancel() {
    if (this.propertyForm.dirty) {
      const confirmLeave = confirm('You have unsaved changes. Are you sure you want to leave?');
      if (!confirmLeave) {
        return;
      }
    }
    this.router.navigate(['/landlord-dashboard/property']);
  }

  // Helper method to check if form is ready to submit
  get isFormValid(): boolean {
    return this.propertyForm.valid && !this.isSubmitting;
  }

  // Helper method to get remaining characters for description
  getRemainingCharacters(): number {
    const description = this.propertyForm.get('description')?.value || '';
    return 1000 - description.length;
  }

  // Helper method to check if description is getting close to limit
  isDescriptionNearLimit(): boolean {
    return this.getRemainingCharacters() < 100;
  }
}