import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
  
  static phoneNumber(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;
      
      // Kenya phone number validation (9 digits after country code)
      const phoneRegex = /^[0-9]{9}$/;
      if (!phoneRegex.test(value)) {
        return { invalidPhoneNumber: { value: control.value } };
      }
      
      return null;
    };
  }

  static nationalId(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;
      
      // Kenya National ID or Passport validation
      const idRegex = /^[A-Z0-9]{6,15}$/i;
      if (!idRegex.test(value)) {
        return { invalidNationalId: { value: control.value } };
      }
      
      return null;
    };
  }

  static fullName(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value?.trim();
      if (!value) return null;
      
      // Allow letters, spaces, hyphens, and apostrophes
      const nameRegex = /^[a-zA-Z\s\-\']{2,50}$/;
      if (!nameRegex.test(value)) {
        return { invalidFullName: { value: control.value } };
      }
      
      // Check for at least two words
      const words = value.split(/\s+/).filter((word: string) => word.length > 0);
      if (words.length < 2) {
        return { fullNameTwoWords: { value: control.value } };
      }
      
      return null;
    };
  }

  static strongEmail(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;
      
      // More comprehensive email validation
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(value)) {
        return { invalidEmail: { value: control.value } };
      }
      
      return null;
    };
  }

  static otpCode(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;
      
      // OTP should be exactly 6 digits
      const otpRegex = /^[0-9]{6}$/;
      if (!otpRegex.test(value)) {
        return { invalidOTP: { value: control.value } };
      }
      
      return null;
    };
  }

  static businessRegistration(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;
      
      // Business registration number validation
      const businessRegex = /^[A-Z0-9]{6,20}$/i;
      if (!businessRegex.test(value)) {
        return { invalidBusinessRegistration: { value: control.value } };
      }
      
      return null;
    };
  }

  static passwordStrength(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;
      
      const errors: any = {};
      
      // At least 8 characters
      if (value.length < 8) {
        errors.minLength = { requiredLength: 8, actualLength: value.length };
      }
      
      // At least one uppercase letter
      if (!/[A-Z]/.test(value)) {
        errors.requiresUppercase = true;
      }
      
      // At least one lowercase letter
      if (!/[a-z]/.test(value)) {
        errors.requiresLowercase = true;
      }
      
      // At least one number
      if (!/\d/.test(value)) {
        errors.requiresNumber = true;
      }
      
      // At least one special character
      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) {
        errors.requiresSpecialChar = true;
      }
      
      return Object.keys(errors).length > 0 ? { passwordStrength: errors } : null;
    };
  }
}