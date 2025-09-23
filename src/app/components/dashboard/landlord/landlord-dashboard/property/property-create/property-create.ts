// src/app/components/property-create/property-create.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PropertyService } from '../../../../../../services/property.service';
import { AuthService } from '../../../../../../services/auth.service';
import { PropertyRequest } from '../../../../../../services/auth-interfaces';
import { Subscription } from 'rxjs';

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
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './property-create.html',
  styleUrls: ['./property-create.scss']
})
export class PropertyCreateComponent implements OnInit, OnDestroy {
  propertyForm!: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  private subscriptions = new Subscription();

  propertyTypes = [
    { value: 'APARTMENT', label: 'Apartment' },
    { value: 'HOUSE', label: 'House' },
    { value: 'bungallow', label: 'Bungalow' }, // Match your backend exactly
    { value: 'COMMERCIAL', label: 'Commercial' },
    { value: 'CONDO', label: 'Condominium' },
    { value: 'TOWNHOUSE', label: 'Townhouse' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    public propertyService: PropertyService,
    public authService: AuthService
  ) {}

  ngOnInit() {
    this.initializeForm();
    this.checkPermissions();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  private initializeForm() {
    this.propertyForm = this.fb.group({
      name: ['', [Validators.required, this.notBlankValidator]],
      location: ['', [Validators.required, this.notBlankValidator]],
      propertyType: ['', [Validators.required]],
      totalUnits: ['', [Validators.required, Validators.min(1), Validators.max(10000)]],
      description: ['', [Validators.maxLength(1000)]]
    });

    // Clear messages when user starts typing
    this.subscriptions.add(
      this.propertyForm.valueChanges.subscribe(() => {
        this.clearMessages();
      })
    );
  }

  private checkPermissions() {
    // More thorough permission check
    const currentUser = this.authService.getCurrentUser();
    const isAuthenticated = this.authService.isAuthenticated();
    const canManage = this.propertyService.canManageProperties();

    console.log('Permission check:', {
      currentUser,
      isAuthenticated,
      canManage,
      userRole: currentUser?.role
    });

    if (!isAuthenticated) {
      this.errorMessage = 'You are not logged in. Please log in first.';
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
      return;
    }

    if (!canManage) {
      this.errorMessage = 'You do not have permission to create properties. Only landlords can create properties.';
      setTimeout(() => {
        this.router.navigate(['/dashboard']);
      }, 3000);
      return;
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
    this.clearMessages();

    console.log('Form submission started');
    console.log('Form valid:', this.propertyForm.valid);
    console.log('Form values:', this.propertyForm.value);

    if (this.propertyForm.valid) {
      this.isSubmitting = true;
      
      // Trim whitespace from string fields and ensure proper data types
      const formData = {
        name: this.propertyForm.value.name?.trim() || '',
        location: this.propertyForm.value.location?.trim() || '',
        propertyType: this.propertyForm.value.propertyType,
        totalUnits: parseInt(this.propertyForm.value.totalUnits, 10), // Ensure integer
        description: this.propertyForm.value.description?.trim() || ''
      };

      console.log('Processed form data:', formData);

      // Validate data using service
      const validationErrors = this.propertyService.validatePropertyData(formData);
      if (validationErrors.length > 0) {
        this.errorMessage = validationErrors.join(', ');
        this.isSubmitting = false;
        return;
      }

      // Additional validation for totalUnits
      if (isNaN(formData.totalUnits) || formData.totalUnits < 1) {
        this.errorMessage = 'Please enter a valid number for total units (at least 1)';
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
      
      // Log form errors for debugging
      console.log('Form errors:', this.getFormErrors());
    }
  }

  private createProperty(propertyData: any) {
    const propertyRequest: PropertyRequest = {
      name: propertyData.name,
      location: propertyData.location,
      propertyType: propertyData.propertyType,
      totalUnits: propertyData.totalUnits,
      description: propertyData.description
    };

    console.log('Creating property with request:', propertyRequest);
    console.log('Current user:', this.authService.getCurrentUser());
    console.log('Auth token exists:', !!this.authService.getToken());

    const createSub = this.propertyService.createProperty(propertyRequest).subscribe({
      next: (response) => {
        console.log('Property creation response:', response);
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
        this.handlePropertyCreationError(error);
      }
    });

    this.subscriptions.add(createSub);
  }

  private handlePropertyCreationError(error: any) {
    console.error('Property creation error details:', {
      error,
      status: error?.status,
      message: error?.message,
      errorObject: error?.error
    });

    // Handle different types of errors
    if (error.status === 401 || error.status === 403) {
      this.errorMessage = 'You are not authorized to perform this action. Please log in again.';
      setTimeout(() => {
        this.authService.logout();
        this.router.navigate(['/login']);
      }, 2000);
    } else if (error.status === 400) {
      // Validation errors from backend
      this.errorMessage = error.error?.message || 'Invalid property data. Please check your inputs.';
    } else if (error.status === 409) {
      // Conflict - property might already exist
      this.errorMessage = 'A property with this name already exists at this location.';
    } else if (error.status === 500) {
      this.errorMessage = 'Server error occurred. Please try again later.';
    } else if (error.status === 0) {
      // Network error
      this.errorMessage = 'Network error. Please check your internet connection.';
    } else if (error.message) {
      this.errorMessage = error.message;
    } else if (error.error?.message) {
      this.errorMessage = error.error.message;
    } else {
      this.errorMessage = 'Failed to create property. Please try again later.';
    }

    // Log error for debugging (remove in production)
    console.error('Failed to create property:', error);
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

  private clearMessages() {
    this.errorMessage = '';
    this.successMessage = '';
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

  // Debug helper to get all form errors
  private getFormErrors(): any {
    const errors: any = {};
    Object.keys(this.propertyForm.controls).forEach(key => {
      const controlErrors = this.propertyForm.get(key)?.errors;
      if (controlErrors) {
        errors[key] = controlErrors;
      }
    });
    return errors;
  }

  // Method to refresh permissions if needed
  refreshPermissions(): void {
    this.checkPermissions();
  }

  // Getter methods for template access
  get currentUser() {
    return this.authService.getCurrentUser();
  }

  get hasToken(): boolean {
    return !!this.authService.getToken();
  }

  get isUserAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  get canManageProps(): boolean {
    return this.propertyService.canManageProperties();
  }

  get tokenLength(): number {
    return this.authService.getToken()?.length || 0;
  }

  // Method to reset form
  resetForm(): void {
    this.propertyForm.reset();
    this.clearMessages();
    
    // Reset form state
    Object.keys(this.propertyForm.controls).forEach(key => {
      this.propertyForm.get(key)?.setErrors(null);
      this.propertyForm.get(key)?.markAsUntouched();
    });
  }

  // Method to check if user can submit based on current state
  canSubmit(): boolean {
    return this.isFormValid && 
           this.isUserAuthenticated && 
           this.canManageProps && 
           !this.errorMessage;
  }

  // Method to handle form field focus for better UX
  onFieldFocus(fieldName: string): void {
    // Clear field-specific error when user focuses on it
    const field = this.propertyForm.get(fieldName);
    if (field?.errors) {
      // Optionally clear the general error message too
      if (this.errorMessage.includes(fieldName)) {
        this.errorMessage = '';
      }
    }
  }

  // Method to validate individual field
  validateField(fieldName: string): void {
    const field = this.propertyForm.get(fieldName);
    if (field) {
      field.markAsTouched();
      field.updateValueAndValidity();
    }
  }
}