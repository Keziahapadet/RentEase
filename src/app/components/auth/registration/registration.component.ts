import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { Auth, createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from '@angular/fire/auth';
import { Firestore, doc, setDoc, serverTimestamp } from '@angular/fire/firestore';

interface FormData {
  role: string;
  userName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  accessCode?: string;
  propertyName?: string; // for tenants/caretakers
}

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatSelectModule,
    MatCheckboxModule,
    FormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ]
})
export class RegistrationComponent implements OnInit {
  private auth: Auth = inject(Auth);
  private firestore: Firestore = inject(Firestore);
  private router: Router = inject(Router);
  private route: ActivatedRoute = inject(ActivatedRoute);

  formData: FormData = {
    role: '',
    userName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  };

  showPassword = false;
  showConfirmPassword = false;
  agreedToTerms = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  isInvitation = false;
  invitationToken: string | null = null;

  ngOnInit(): void {
    this.resetForm();
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      if (token) {
        this.invitationToken = token;
        this.isInvitation = true;
        this.loadInvitationData(token);
      }
    });
  }

  resetForm(): void {
    this.formData = {
      role: '',
      userName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: ''
    };
    this.agreedToTerms = false;
    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = false;
  }

  async loadInvitationData(token: string) {
    try {
      const invitationData = await this.mockValidateToken(token);
      this.formData.role = invitationData.role;
      this.formData.email = invitationData.email;
      this.formData.propertyName = invitationData.propertyName || '';
    } catch (err: any) {
      this.errorMessage = err.message || 'Invalid or expired invitation link.';
    }
  }

  async mockValidateToken(token: string) {
    // Mock data; replace with backend API call
    if (token === 'abc123') {
      return { role: 'tenant', email: 'tenant@example.com', propertyName: 'Sunset Apartments Unit 101' };
    } else if (token === 'caretaker456') {
      return { role: 'caretaker', email: 'caretaker@example.com', propertyName: 'Sunset Apartments' };
    } else {
      throw new Error('Invitation token invalid or expired');
    }
  }

  onRoleChange(): void {
    if (this.formData.role !== 'admin') {
      delete this.formData.accessCode;
    }
    this.errorMessage = '';
  }

  togglePasswordVisibility(field: string): void {
    if (field === 'password') this.showPassword = !this.showPassword;
    else if (field === 'confirm') this.showConfirmPassword = !this.showConfirmPassword;
  }

  passwordsMatch(): boolean {
    return this.formData.password === this.formData.confirmPassword && this.formData.confirmPassword !== '';
  }

  validateForm(): boolean {
    this.errorMessage = '';

    if (!this.formData.role) { this.errorMessage = 'Role is required'; return false; }
    if (!this.formData.userName.trim()) { this.errorMessage = 'Full name is required'; return false; }
    if (!this.formData.email.trim()) { this.errorMessage = 'Email is required'; return false; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.formData.email)) { this.errorMessage = 'Invalid email address'; return false; }

    if (!this.formData.phone.trim()) { this.errorMessage = 'Phone number is required'; return false; }
    const phoneRegex = /^(\+254|0)[17]\d{8}$/;
    if (!phoneRegex.test(this.formData.phone.replace(/\s/g, ''))) { this.errorMessage = 'Invalid Kenyan phone number'; return false; }

    if (!this.formData.password) { this.errorMessage = 'Password required'; return false; }
    if (this.formData.password.length < 8) { this.errorMessage = 'Password must be at least 8 characters'; return false; }
    if (!this.formData.confirmPassword) { this.errorMessage = 'Confirm your password'; return false; }
    if (!this.passwordsMatch()) { this.errorMessage = 'Passwords do not match'; return false; }

    if (!this.agreedToTerms) { this.errorMessage = 'Please agree to Terms and Conditions'; return false; }
    if (this.formData.role === 'admin' && this.formData.accessCode !== 'ADMIN2024') {
      this.errorMessage = 'Invalid admin access code'; return false;
    }

    return true;
  }

  async onSubmit(): Promise<void> {
    if (!this.validateForm()) return;
    this.isLoading = true;
    this.errorMessage = '';

    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        this.formData.email.trim().toLowerCase(),
        this.formData.password
      );

      await updateProfile(userCredential.user, { displayName: this.formData.userName.trim() });

      const userRef = doc(this.firestore, 'users', userCredential.user.uid);
      await setDoc(userRef, {
        uid: userCredential.user.uid,
        role: this.formData.role,
        fullName: this.formData.userName.trim(),
        email: this.formData.email.trim().toLowerCase(),
        phone: this.formData.phone.replace(/\s/g, ''),
        accessCode: this.formData.role === 'admin' ? this.formData.accessCode : null,
        propertyName: this.formData.propertyName || null,
        createdAt: serverTimestamp()
      });

      await sendEmailVerification(userCredential.user);

      this.successMessage = 'Account created! Check your email for verification.';
      setTimeout(() => this.router.navigate(['/login']), 2500);

    } catch (error: any) {
      this.errorMessage = error.message || 'Registration failed';
    } finally {
      this.isLoading = false;
    }
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  navigateToTerms(): void {
    window.open('/terms', '_blank');
  }

  navigateToPrivacy(): void {
    window.open('/privacy', '_blank');
  }
}
