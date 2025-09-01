import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class PhoneValidator {
  
  // Kenya specific phone number validation
  static kenyaPhoneNumber(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;
      
      // Remove any spaces, dashes, or parentheses
      const cleanedValue = value.replace(/[\s\-\(\)]/g, '');
      
      // Check for Kenya phone number patterns
      const kenyaPatterns = [
        /^0[17]\d{8}$/, // 0700000000, 0100000000 format
        /^[17]\d{8}$/, // 700000000, 100000000 format
        /^\+254[17]\d{8}$/, // +254700000000 format
        /^254[17]\d{8}$/ // 254700000000 format
      ];
      
      const isValid = kenyaPatterns.some(pattern => pattern.test(cleanedValue));
      
      if (!isValid) {
        return {
          kenyaPhoneNumber: {
            value: control.value,
            message: 'Please enter a valid Kenya phone number'
          }
        };
      }
      
      return null;
    };
  }
  
  // International phone number validation
  static internationalPhoneNumber(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;
      
      // Basic international phone number validation
      const internationalRegex = /^\+?[1-9]\d{6,14}$/;
      
      if (!internationalRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
        return {
          internationalPhoneNumber: {
            value: control.value,
            message: 'Please enter a valid international phone number'
          }
        };
      }
      
      return null;
    };
  }
  
  // Format phone number for display
  static formatKenyaPhoneNumber(phoneNumber: string): string {
    if (!phoneNumber) return '';
    
    // Remove any non-digits
    const digits = phoneNumber.replace(/\D/g, '');
    
    // Handle different formats
    if (digits.startsWith('254') && digits.length === 12) {
      // 254700000000 -> +254 700 000 000
      return `+254 ${digits.substring(3, 6)} ${digits.substring(6, 9)} ${digits.substring(9)}`;
    } else if (digits.startsWith('0') && digits.length === 10) {
      // 0700000000 -> +254 700 000 000
      return `+254 ${digits.substring(1, 4)} ${digits.substring(4, 7)} ${digits.substring(7)}`;
    } else if (digits.length === 9) {
      // 700000000 -> +254 700 000 000
      return `+254 ${digits.substring(0, 3)} ${digits.substring(3, 6)} ${digits.substring(6)}`;
    }
    
    return phoneNumber;
  }
  
  // Normalize phone number to international format
  static normalizeKenyaPhoneNumber(phoneNumber: string): string {
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
}