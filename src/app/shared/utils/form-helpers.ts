import { FormGroup, AbstractControl } from '@angular/forms';
import { ERROR_MESSAGES } from './constants';

export class FormHelpers {
  
  /**
   * Marks all fields in a form group as touched to trigger validation display
   */
  static markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control && 'controls' in control) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }

  /**
   * Gets user-friendly error message for a form field
   */
  static getFieldError(formGroup: FormGroup, fieldName: string): string {
    const field = formGroup.get(fieldName);
    if (!field?.errors || !field?.touched) return '';

    const errors = field.errors;
    const fieldDisplayName = this.getFieldDisplayName(fieldName);
    
    // Check for specific error types and return appropriate messages
    if (errors['required']) return `${fieldDisplayName} is required`;
    if (errors['email']) return ERROR_MESSAGES.EMAIL;
    if (errors['invalidEmail']) return ERROR_MESSAGES.EMAIL;
    if (errors['invalidPhoneNumber']) return ERROR_MESSAGES.PHONE;
    if (errors['kenyaPhoneNumber']) return errors['kenyaPhoneNumber'].message;
    if (errors['invalidNationalId']) return ERROR_MESSAGES.NATIONAL_ID;
    if (errors['invalidFullName']) return ERROR_MESSAGES.FULL_NAME;
    if (errors['fullNameTwoWords']) return ERROR_MESSAGES.FULL_NAME_TWO_WORDS;
    if (errors['invalidOTP']) return ERROR_MESSAGES.OTP_INVALID;
    if (errors['passwordStrength']) return ERROR_MESSAGES.PASSWORD_STRENGTH;
    if (errors['invalidBusinessRegistration']) return ERROR_MESSAGES.BUSINESS_REGISTRATION;
    
    if (errors['minlength']) {
      const requiredLength = errors['minlength'].requiredLength;
      return `${fieldDisplayName} must be at least ${requiredLength} characters`;
    }
    
    if (errors['maxlength']) {
      const requiredLength = errors['maxlength'].requiredLength;
      return `${fieldDisplayName} must be no more than ${requiredLength} characters`;
    }
    
    if (errors['pattern']) return `${fieldDisplayName} format is invalid`;
    
    return `${fieldDisplayName} is invalid`;
  }

  /**
   * Gets all validation errors for a form group
   */
  static getAllFormErrors(formGroup: FormGroup): { [key: string]: string } {
    const errors: { [key: string]: string } = {};
    
    Object.keys(formGroup.controls).forEach(key => {
      const error = this.getFieldError(formGroup, key);
      if (error) {
        errors[key] = error;
      }
    });
    
    return errors;
  }

  /**
   * Checks if a specific field has errors and is touched
   */
  static hasFieldError(formGroup: FormGroup, fieldName: string): boolean {
    const field = formGroup.get(fieldName);
    return !!(field?.errors && field?.touched);
  }

  /**
   * Formats phone number for display
   */
  static formatPhoneNumber(phoneNumber: string): string {
    if (!phoneNumber) return '';
    
    // Remove any non-digits
    const digits = phoneNumber.replace(/\D/g, '');
    
    // Format based on length
    if (digits.length >= 10) {
      // Kenya format: +254 700 000 000
      const countryCode = digits.startsWith('254') ? '254' : '254';
      const number = digits.startsWith('254') ? digits.substring(3) : digits.substring(1);
      return `+${countryCode} ${number.substring(0, 3)} ${number.substring(3, 6)} ${number.substring(6)}`;
    }
    
    return phoneNumber;
  }

  /**
   * Formats phone number to international format for API
   */
  static normalizePhoneNumber(phoneNumber: string): string {
    if (!phoneNumber) return '';
    
    const digits = phoneNumber.replace(/\D/g, '');
    
    if (digits.startsWith('254') && digits.length === 12) {
      return `+${digits}`;
    } else if (digits.startsWith('0') && digits.length === 10) {
      return `+254${digits.substring(1)}`;
    } else if (digits.length === 9) {
      return `+254${digits}`;
    }
    
    return phoneNumber;
  }

  /**
   * Validates that all required fields in a form are filled
   */
  static validateRequiredFields(formGroup: FormGroup, requiredFields: string[]): boolean {
    return requiredFields.every(fieldName => {
      const field = formGroup.get(fieldName);
      return field?.value && field?.valid;
    });
  }

  /**
   * Resets form to initial state
   */
  static resetForm(formGroup: FormGroup): void {
    formGroup.reset();
    formGroup.markAsUntouched();
    formGroup.markAsPristine();
  }

  /**
   * Gets user-friendly field display name
   */
  private static getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      fullName: 'Full Name',
      email: 'Email Address',
      phoneNumber: 'Phone Number',
      nationalId: 'National ID/Passport',
      registrationType: 'Registration Type',
      termsAccepted: 'Terms and Conditions',
      otpCode: 'OTP Code',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      businessName: 'Business Name',
      businessType: 'Business Type',
      registrationNumber: 'Registration Number'
    };
    
    return displayNames[fieldName] || fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
  }

  /**
   * Debounces form input for better performance
   */
  static debounce(func: Function, wait: number): Function {
    let timeout: any;
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Converts form data to API format
   */
  static prepareFormDataForAPI(formData: any): any {
    const apiData = { ...formData };
    
    // Normalize phone number
    if (apiData.phoneNumber) {
      apiData.phoneNumber = this.normalizePhoneNumber(apiData.phoneNumber);
    }
    
    // Trim string fields
    Object.keys(apiData).forEach(key => {
      if (typeof apiData[key] === 'string') {
        apiData[key] = apiData[key].trim();
      }
    });
    
    // Remove empty fields
    Object.keys(apiData).forEach(key => {
      if (apiData[key] === '' || apiData[key] === null || apiData[key] === undefined) {
        delete apiData[key];
      }
    });
    
    return apiData;
  }
}
