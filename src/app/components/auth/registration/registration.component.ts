import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Auth, createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from '@angular/fire/auth';
import { Firestore, doc, setDoc, serverTimestamp } from '@angular/fire/firestore';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';

@Component({
  selector: 'app-registration',
  standalone: true,
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css'],
  imports: [CommonModule, FormsModule, MatIconModule, MatFormFieldModule, MatInputModule, MatButtonModule]
})
export class RegistrationComponent {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private storage = inject(Storage);

  selectedRole: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  agreedToTerms: boolean = false;
  agreedToPrivacy: boolean = false;
  agreedToMarketing: boolean = false;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  formData: any = {
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    
    landlord: {
      businessName: '',
      numProperties: null,
      propertyTypes: '',
      businessRegNumber: '',
      taxPin: ''
    },
    
    caretaker: {
      employer: '',
      propertiesManaged: null,
      referenceContact: ''
    },
    
    business: {
      officialName: '',
      registrationNumber: '',
      registrationCertificate: null,
      taxPinCertificate: null,
      earbLicense: '',
      propertiesManaged: null,
      numEmployees: null,
      bankAccount: '',
      primaryContact: '',
      description: ''
    }
  };

  constructor(private router: Router) {}
  
  togglePassword(field: string) {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else if (field === 'confirm') {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      console.log('File uploaded:', file.name, file.size, file.type);
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        event.target.value = '';
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please upload only JPG, PNG, or PDF files');
        event.target.value = '';
        return;
      }
      
      // Store file reference based on input name
      const inputName = event.target.name || event.target.getAttribute('data-field');
      
      if (this.selectedRole === 'business') {
        if (event.target.previousElementSibling?.textContent?.includes('Registration Certificate')) {
          this.formData.business.registrationCertificate = file;
        } else if (event.target.previousElementSibling?.textContent?.includes('Tax PIN')) {
          this.formData.business.taxPinCertificate = file;
        }
      }
    }
  }

  validateForm(): boolean {
    this.errorMessage = '';

    if (!this.selectedRole) {
      this.errorMessage = 'Please select a role.';
      return false;
    }

    if (!this.formData.fullName.trim()) {
      this.errorMessage = 'Please enter your full name.';
      return false;
    }

    if (!this.formData.email.trim() || !this.isValidEmail(this.formData.email)) {
      this.errorMessage = 'Please enter a valid email address.';
      return false;
    }

    if (!this.formData.phone.trim() || !this.isValidKenyanPhone(this.formData.phone)) {
      this.errorMessage = 'Please enter a valid Kenyan phone number.';
      return false;
    }

    if (!this.formData.password || this.formData.password.length < 8) {
      this.errorMessage = 'Password must be at least 8 characters long.';
      return false;
    }

    if (this.formData.password !== this.formData.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return false;
    }

    if (!this.agreedToTerms || !this.agreedToPrivacy) {
      this.errorMessage = 'Please agree to the Terms & Conditions and Privacy Policy.';
      return false;
    }

    switch (this.selectedRole) {
      case 'landlord':
        if (!this.formData.landlord.numProperties || this.formData.landlord.numProperties < 1) {
          this.errorMessage = 'Please enter the number of properties you own.';
          return false;
        }
        if (!this.formData.landlord.propertyTypes) {
          this.errorMessage = 'Please select your primary property type.';
          return false;
        }
        break;
        
      case 'caretaker':
        if (!this.formData.caretaker.employer.trim()) {
          this.errorMessage = 'Please provide your employer information.';
          return false;
        }
        break;
        
      case 'business':
        if (!this.formData.business.officialName.trim()) {
          this.errorMessage = 'Please enter your official business name.';
          return false;
        }
        if (!this.formData.business.registrationNumber.trim()) {
          this.errorMessage = 'Please enter your business registration number.';
          return false;
        }
        if (!this.formData.business.propertiesManaged || this.formData.business.propertiesManaged < 1) {
          this.errorMessage = 'Please enter the number of properties you manage.';
          return false;
        }
        if (!this.formData.business.registrationCertificate) {
          this.errorMessage = 'Please upload your company registration certificate.';
          return false;
        }
        if (!this.formData.business.taxPinCertificate) {
          this.errorMessage = 'Please upload your Tax PIN certificate.';
          return false;
        }
        break;
    }

    return true;
  }

  async uploadFile(file: File, path: string): Promise<string> {
    try {
      const fileName = `${path}/${Date.now()}_${file.name}`;
      const storageRef = ref(this.storage, fileName);
      
      console.log('Uploading file to:', fileName);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      console.log('File uploaded successfully. URL:', downloadURL);
      return downloadURL;
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  }

  async createUserDocument(uid: string, userData: any) {
    try {
      const userDocRef = doc(this.firestore, `users/${uid}`);
      await setDoc(userDocRef, {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isEmailVerified: false,
        isPhoneVerified: false,
        accountStatus: 'pending_verification'
      });
      
      console.log('User document created in Firestore');
    } catch (error) {
      console.error('Firestore error:', error);
      throw error;
    }
  }

  async submitForm() {
    console.log('Submit form called for role:', this.selectedRole);
    
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      console.log('Starting Firebase registration process...');

      const formattedPhone = this.formatPhoneNumber(this.formData.phone);

      // 1. Create Firebase Auth user
      console.log('Creating Firebase Auth user...');
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        this.formData.email.trim().toLowerCase(),
        this.formData.password
      );

      const user = userCredential.user;
      console.log('Firebase Auth user created with UID:', user.uid);

      // 2. Update user profile name
      await updateProfile(user, {
        displayName: this.formData.fullName.trim()
      });
      console.log('User profile updated');

      // 3. Handle file uploads for business role
      let uploadedFiles: any = {};
      if (this.selectedRole === 'business') {
        if (this.formData.business.registrationCertificate) {
          console.log('Uploading business registration certificate...');
          uploadedFiles.registrationCertificateUrl = await this.uploadFile(
            this.formData.business.registrationCertificate, 
            `business-documents/${user.uid}/registration`
          );
        }
        
        if (this.formData.business.taxPinCertificate) {
          console.log('Uploading tax PIN certificate...');
          uploadedFiles.taxPinCertificateUrl = await this.uploadFile(
            this.formData.business.taxPinCertificate, 
            `business-documents/${user.uid}/tax-pin`
          );
        }
      }

      // 4. Prepare user data for Firestore
      const userData = {
        uid: user.uid,
        role: this.selectedRole,
        personalInfo: {
          fullName: this.formData.fullName.trim(),
          email: this.formData.email.trim().toLowerCase(),
          phone: formattedPhone
        },
        roleSpecificData: {},
        preferences: {
          marketingEmails: this.agreedToMarketing
        },
        agreements: {
          terms: this.agreedToTerms,
          privacy: this.agreedToPrivacy,
          marketing: this.agreedToMarketing
        }
      };

      // Add role-specific data
      if (this.selectedRole === 'tenant') {
        userData.roleSpecificData = {
          preferences: {
            propertyTypes: [],
            budgetRange: { min: 0, max: 0 },
            preferredLocations: []
          }
        };
      } else if (this.selectedRole === 'business') {
        userData.roleSpecificData = {
          ...this.formData.business,
          ...uploadedFiles
        };
      } else {
        userData.roleSpecificData = this.formData[this.selectedRole];
      }

      // 5. Save user data to Firestore
      console.log('Saving user data to Firestore...');
      await this.createUserDocument(user.uid, userData);

      // 6. Send email verification
      console.log('Sending email verification...');
      await sendEmailVerification(user);

      // 7. Success
      this.successMessage = 'Account created successfully! Please check your email for verification.';
      console.log('Registration completed successfully for:', user.email);

      // 8. Navigate to verification page
      setTimeout(() => {
        this.router.navigate(['/verify-otp'], { 
          queryParams: { 
            phone: formattedPhone,
            email: user.email,
            role: this.selectedRole,
            uid: user.uid
          }
        });
      }, 2000);

    } catch (error: any) {
      console.error('Registration failed:', error);
      
      // Handle specific Firebase errors
      if (error.code === 'auth/email-already-in-use') {
        this.errorMessage = 'An account with this email already exists. Please try logging in instead.';
      } else if (error.code === 'auth/weak-password') {
        this.errorMessage = 'Password is too weak. Please choose a stronger password.';
      } else if (error.code === 'auth/invalid-email') {
        this.errorMessage = 'Invalid email address format.';
      } else {
        this.errorMessage = error.message || 'Registration failed. Please try again.';
      }
    } finally {
      this.isLoading = false;
    }
  }

  // Utility methods
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidKenyanPhone(phone: string): boolean {
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    const patterns = [
      /^\+254[17]\d{8}$/,
      /^254[17]\d{8}$/,
      /^0[17]\d{8}$/,
      /^[17]\d{8}$/
    ];
    return patterns.some(pattern => pattern.test(cleaned));
  }

  formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('254')) {
      return '+' + cleaned;
    } else if (cleaned.startsWith('0')) {
      return '+254' + cleaned.substring(1);
    } else if (cleaned.length === 9 && (cleaned.startsWith('7') || cleaned.startsWith('1'))) {
      return '+254' + cleaned;
    }
    return phone;
  }

  getPasswordStrength(password: string): string {
    if (!password) return '';
    if (password.length < 6) return 'weak';
    if (password.length < 8) return 'fair';
    
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    const strength = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
    
    if (strength >= 3 && password.length >= 8) return 'strong';
    if (strength >= 2) return 'good';
    return 'fair';
  }

  onRoleChange() {
    // Clear previous role-specific data when role changes
    this.formData.landlord = {
      businessName: '', numProperties: null, propertyTypes: '', businessRegNumber: '', taxPin: ''
    };
    this.formData.caretaker = {
      employer: '', propertiesManaged: null, referenceContact: ''
    };
    this.formData.business = {
      officialName: '', registrationNumber: '', registrationCertificate: null, taxPinCertificate: null,
      earbLicense: '', propertiesManaged: null, numEmployees: null, bankAccount: '', primaryContact: '', description: ''
    };
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  navigateToTerms() {
    this.router.navigate(['/terms']);
  }

  navigateToPrivacy() {
    this.router.navigate(['/privacy']);
  }
}