import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { PropertyService } from '../../../../../../services/property.service';
import { PropertyCreateRequest } from '../../../../../../models/property.model';

@Component({
  selector: 'app-property-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    RouterModule
  ],
  templateUrl: './property-create.html',
  styleUrls: ['./property-create.css']
})
export class PropertyCreateComponent implements OnInit {
  propertyForm!: FormGroup;
  isSubmitting = false;
  showSuccessMessage = false;
  showErrorMessage = false;
  
  propertyTypes = [
    'Apartment',
    'House',
    'Condo',
    'Townhouse',
    'Commercial',
    'Office Space',
    'Retail Space',
    'Warehouse',
    'Mixed Use'
  ];

  constructor(
    private fb: FormBuilder,
    private propertyService: PropertyService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  /**
   * Initialize the reactive form with validation rules
   */
  initializeForm(): void {
    this.propertyForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      location: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
      propertyType: ['', [Validators.required]],
      totalUnits: ['', [Validators.required, Validators.min(1), Validators.max(10000)]],
      description: ['', [Validators.maxLength(1000)]]
    });
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.propertyForm.valid) {
      this.isSubmitting = true;
      this.hideMessages();
      
      const propertyData: PropertyCreateRequest = this.propertyForm.value;
      
      this.propertyService.createProperty(propertyData).subscribe({
        next: (response) => {
          console.log('Property created successfully', response);
          this.isSubmitting = false;
          this.showSuccessMessage = true;
          
          // Auto-hide success message and redirect after 2 seconds - USING SINGULAR PROPERTY PATH
          setTimeout(() => {
            this.showSuccessMessage = false;
            this.router.navigate(['/landlord-dashboard/property']);
          }, 2000);
        },
        error: (error) => {
          console.error('Error creating property', error);
          this.isSubmitting = false;
          this.showErrorMessage = true;
          
          // Auto-hide error message after 5 seconds
          setTimeout(() => {
            this.showErrorMessage = false;
          }, 5000);
        }
      });
    } else {
      this.markFormGroupTouched();
      this.scrollToFirstError();
    }
  }

  /**
   * Mark all form controls as touched to show validation errors
   */
  markFormGroupTouched(): void {
    Object.keys(this.propertyForm.controls).forEach(key => {
      const control = this.propertyForm.get(key);
      control?.markAsTouched();
      
      if (control && control.invalid) {
        control.markAsDirty();
      }
    });
  }

  /**
   * Scroll to first form error for better UX
   */
  scrollToFirstError(): void {
    const firstErrorElement = document.querySelector('.is-invalid');
    if (firstErrorElement) {
      firstErrorElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }
  }

  /**
   * Get appropriate error message for form fields
   */
  getErrorMessage(fieldName: string): string {
    const control = this.propertyForm.get(fieldName);
    
    if (control?.errors && (control.touched || control.dirty)) {
      const errors = control.errors;
      
      // Required field errors
      if (errors['required']) {
        switch (fieldName) {
          case 'name': return 'Property name is required';
          case 'location': return 'Location is required';
          case 'propertyType': return 'Property type is required';
          case 'totalUnits': return 'Total units is required';
          default: return 'This field is required';
        }
      }
      
      // Minimum value errors
      if (errors['min']) {
        if (fieldName === 'totalUnits') {
          return 'Total units must be at least 1';
        }
        return `Value must be at least ${errors['min'].min}`;
      }
      
      // Maximum value errors
      if (errors['max']) {
        if (fieldName === 'totalUnits') {
          return 'Total units cannot exceed 10,000';
        }
        return `Value cannot exceed ${errors['max'].max}`;
      }
      
      // String length errors
      if (errors['minlength']) {
        const requiredLength = errors['minlength'].requiredLength;
        if (fieldName === 'name') {
          return `Property name must be at least ${requiredLength} characters`;
        }
        if (fieldName === 'location') {
          return `Location must be at least ${requiredLength} characters`;
        }
        return `Must be at least ${requiredLength} characters`;
      }
      
      if (errors['maxlength']) {
        const requiredLength = errors['maxlength'].requiredLength;
        if (fieldName === 'description') {
          return `Description cannot exceed ${requiredLength} characters`;
        }
        return `Cannot exceed ${requiredLength} characters`;
      }
    }
    
    return '';
  }

  /**
   * Hide all toast messages
   */
  hideMessages(): void {
    this.showSuccessMessage = false;
    this.showErrorMessage = false;
  }

  /**
   * Reset form to initial state
   */
  resetForm(): void {
    this.propertyForm.reset();
    this.hideMessages();
    this.isSubmitting = false;
  }

  /**
   * Check if a specific field has errors and is touched
   */
  hasFieldError(fieldName: string): boolean {
    const control = this.propertyForm.get(fieldName);
    return !!(control?.errors && (control.touched || control.dirty));
  }

  /**
   * Get remaining characters for description field
   */
  getDescriptionCharacterCount(): number {
    const description = this.propertyForm.get('description')?.value || '';
    return 1000 - description.length;
  }

  /**
   * Handle cancel action with confirmation if form has changes - USING SINGULAR PROPERTY PATH
   */
  onCancel(): void {
    if (this.propertyForm.dirty) {
      const confirmLeave = confirm('You have unsaved changes. Are you sure you want to leave?');
      if (confirmLeave) {
        this.router.navigate(['/landlord-dashboard/property']);
      }
    } else {
      this.router.navigate(['/landlord-dashboard/property']);
    }
  }
}