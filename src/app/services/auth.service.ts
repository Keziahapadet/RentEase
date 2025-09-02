import { Injectable } from '@angular/core';
import { 
  Auth, 
  signInWithPhoneNumber, 
  RecaptchaVerifier, 
  PhoneAuthProvider,
  signInWithCredential,
  sendEmailVerification as firebaseSendEmailVerification
} from '@angular/fire/auth';
import { 
  Firestore, 
  collection, 
  query, 
  where, 
  getDocs,
  doc,
  updateDoc
} from '@angular/fire/firestore';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private recaptchaVerifier: RecaptchaVerifier | null = null;
  private verificationId: string = '';
  private isDevelopmentMode = !environment.production;

  constructor(
    private auth: Auth,
    private firestore: Firestore
  ) {}

  // Check if phone number exists and send OTP
  async sendLoginOTP(phoneNumber: string): Promise<{
    success: boolean;
    message?: string;
    userEmail?: string;
  }> {
    try {
      // Format phone number (ensure it starts with country code)
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      
      // Check if phone number exists in database
      const userExists = await this.checkPhoneExists(formattedPhone);
      
      if (!userExists.exists) {
        return {
          success: false,
          message: 'Phone number not registered. Please create an account first.'
        };
      }

      // Development mode - skip actual Firebase OTP
      if (this.isDevelopmentMode) {
        console.log('Development Mode: Simulating OTP send for', formattedPhone);
        this.verificationId = 'dev-verification-id-' + Date.now();
        return {
          success: true,
          message: 'OTP sent successfully (Dev Mode - use 123456)',
          userEmail: userExists.userEmail
        };
      }

      // Production mode - actual Firebase OTP
      // Setup reCAPTCHA verifier if not already set
      if (!this.recaptchaVerifier) {
        this.setupRecaptchaVerifier();
      }

      // Ensure recaptchaVerifier is not null before using it
      if (!this.recaptchaVerifier) {
        return {
          success: false,
          message: 'reCAPTCHA setup failed. Please refresh and try again.'
        };
      }

      // Send OTP using Firebase
      const confirmationResult = await signInWithPhoneNumber(
        this.auth,
        formattedPhone,
        this.recaptchaVerifier
      );
      
      this.verificationId = confirmationResult.verificationId;

      return {
        success: true,
        message: 'OTP sent successfully',
        userEmail: userExists.userEmail
      };

    } catch (error: any) {
      console.error('Error sending OTP:', error);
      
      // Handle specific Firebase errors
      if (error.code === 'auth/too-many-requests') {
        return {
          success: false,
          message: 'Too many requests. Please try again later.'
        };
      } else if (error.code === 'auth/invalid-phone-number') {
        return {
          success: false,
          message: 'Invalid phone number format.'
        };
      }
      
      return {
        success: false,
        message: 'Failed to send OTP. Please try again.'
      };
    }
  }

  // Verify OTP and complete login
  async verifyLoginOTP(phoneNumber: string, otpCode: string): Promise<{
    success: boolean;
    message?: string;
    user?: any;
    requireEmailVerification?: boolean;
  }> {
    try {
      if (!this.verificationId) {
        return {
          success: false,
          message: 'No verification ID found. Please request OTP again.'
        };
      }

      // Development mode - accept 123456 as valid OTP
      if (this.isDevelopmentMode && otpCode === '123456') {
        console.log('Development Mode: OTP verified for', phoneNumber);
        const userData = await this.getUserData(phoneNumber);
        
        return {
          success: true,
          message: 'Login successful (Dev Mode)',
          user: userData,
          requireEmailVerification: false
        };
      }

      // Production mode - actual Firebase verification
      // Create phone credential
      const credential = PhoneAuthProvider.credential(this.verificationId, otpCode);
      
      // Sign in with credential
      const result = await signInWithCredential(this.auth, credential);
      
      if (result.user) {
        // Get user data from Firestore
        const userData = await this.getUserData(phoneNumber);
        
        return {
          success: true,
          message: 'Login successful',
          user: userData,
          requireEmailVerification: userData?.emailVerificationRequired || false
        };
      }

      return {
        success: false,
        message: 'Verification failed'
      };

    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      
      if (error.code === 'auth/invalid-verification-code') {
        return {
          success: false,
          message: 'Invalid verification code. Please try again.'
        };
      } else if (error.code === 'auth/code-expired') {
        return {
          success: false,
          message: 'Verification code has expired. Please request a new one.'
        };
      }
      
      return {
        success: false,
        message: 'Verification failed. Please try again.'
      };
    }
  }

  // Send email verification
  async sendEmailVerification(email: string): Promise<{
    success: boolean;
    message?: string;
    user?: any;
  }> {
    try {
      const currentUser = this.auth.currentUser;
      
      if (currentUser && !currentUser.emailVerified) {
        await firebaseSendEmailVerification(currentUser);
        
        return {
          success: true,
          message: 'Email verification sent successfully',
          user: currentUser
        };
      }
      
      return {
        success: false,
        message: 'Unable to send email verification'
      };

    } catch (error: any) {
      console.error('Error sending email verification:', error);
      return {
        success: false,
        message: 'Failed to send email verification'
      };
    }
  }

  // Setup reCAPTCHA verifier
  private setupRecaptchaVerifier(): void {
    try {
      // Clear any existing verifier
      if (this.recaptchaVerifier) {
        this.recaptchaVerifier.clear();
        this.recaptchaVerifier = null;
      }

      // Ensure the container exists
      const container = document.getElementById('recaptcha-container');
      if (!container) {
        console.error('reCAPTCHA container not found');
        return;
      }

      this.recaptchaVerifier = new RecaptchaVerifier(
        this.auth,
        'recaptcha-container',
        {
          size: 'invisible',
          callback: () => {
            // reCAPTCHA solved - will proceed with OTP
            console.log('reCAPTCHA solved');
          },
          'expired-callback': () => {
            // Response expired
            console.log('reCAPTCHA expired');
            this.recaptchaVerifier = null;
          }
        }
      );
    } catch (error) {
      console.error('Error setting up reCAPTCHA:', error);
      this.recaptchaVerifier = null;
    }
  }

  // Check if phone number exists in database
  private async checkPhoneExists(phoneNumber: string): Promise<{
    exists: boolean;
    userEmail?: string;
    userData?: any;
  }> {
    try {
      const usersRef = collection(this.firestore, 'users');
      const q = query(usersRef, where('phone', '==', phoneNumber));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        return {
          exists: true,
          userEmail: userData['email'],
          userData: userData
        };
      }
      
      return { exists: false };

    } catch (error) {
      console.error('Error checking phone existence:', error);
      return { exists: false };
    }
  }

  // Get user data from Firestore
  private async getUserData(phoneNumber: string): Promise<any> {
    try {
      const usersRef = collection(this.firestore, 'users');
      const q = query(usersRef, where('phone', '==', phoneNumber));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        return {
          id: querySnapshot.docs[0].id,
          ...userData
        };
      }
      
      return null;

    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  // Format phone number to international format
  private formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // Add country code if not present (assuming Kenya +254)
    if (cleaned.startsWith('0')) {
      cleaned = '254' + cleaned.slice(1);
    } else if (!cleaned.startsWith('254') && !cleaned.startsWith('+254')) {
      cleaned = '254' + cleaned;
    }
    
    // Ensure it starts with +
    if (!cleaned.startsWith('+')) {
      cleaned = '+' + cleaned;
    }
    
    return cleaned;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.auth.currentUser || localStorage.getItem('isAuthenticated') === 'true';
  }

  // Get current user
  getCurrentUser(): any {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      return JSON.parse(storedUser);
    }
    return this.auth.currentUser;
  }

  // Logout
  async logout(): Promise<void> {
    try {
      await this.auth.signOut();
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
      this.cleanupRecaptcha();
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }

  // Clean up reCAPTCHA verifier
  cleanupRecaptcha(): void {
    if (this.recaptchaVerifier) {
      try {
        this.recaptchaVerifier.clear();
      } catch (error) {
        console.error('Error clearing reCAPTCHA:', error);
      }
      this.recaptchaVerifier = null;
    }
    this.verificationId = '';
  }
}