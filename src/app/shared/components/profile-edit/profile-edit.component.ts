import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ProfilePictureComponent } from '../../../shared/components/profile-picture/profile-picture.component';
import { AuthService } from '../../../services/auth.service';
import { PropertyService } from '../../../services/property.service';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    ProfilePictureComponent
  ],
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.scss']
})
export class ProfileEditComponent implements OnInit, OnDestroy {
  @Output() goBackEvent = new EventEmitter<void>(); 
  
  profileForm: FormGroup;
  user: any = null;
  isSubmitting = false;
  isLoadingUserData = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private propertyService: PropertyService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.profileForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadUserData();
  }

  ngOnDestroy(): void {}

  private loadUserData(): void {
    this.user = this.authService.getCurrentUser();
    if (!this.user) {
      this.snackBar.open('Please log in to continue', 'Close', { duration: 3000 });
      this.router.navigate(['/login']);
      return;
    }

    this.populateForm();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [
        Validators.pattern(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/),
        Validators.minLength(10)
      ]],
      bio: ['', [Validators.maxLength(500)]]
    });
  }

  private populateForm(): void {
    if (this.user) {
      this.profileForm.patchValue({
        fullName: this.user.fullName || '',
        email: this.user.email || '',
        phoneNumber: this.user.phoneNumber || '',
        bio: this.user.bio || ''
      });
    }
  }

  onPictureUpdated(imageUrl: string): void {
    console.log('Profile picture updated:', imageUrl);
    this.snackBar.open('Profile picture updated successfully!', 'Close', { duration: 3000 });
  }

  onPictureDeleted(): void {
    console.log('Profile picture deleted');
    this.snackBar.open('Profile picture removed successfully!', 'Close', { duration: 3000 });
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      this.snackBar.open('Please fill in all required fields correctly', 'Close', { duration: 3000 });
      return;
    }

    this.isSubmitting = true;

    const updatedData = {
      fullName: this.profileForm.value.fullName,
      email: this.profileForm.value.email,
      phoneNumber: this.profileForm.value.phoneNumber,
      bio: this.profileForm.value.bio
    };

   
    setTimeout(() => {
      this.isSubmitting = false;
      
      const updatedUser = {
        ...this.user,
        ...updatedData
      };
      
      const isPermanent = !!localStorage.getItem('userData');
      const storage = isPermanent ? localStorage : sessionStorage;
      storage.setItem('userData', JSON.stringify(updatedUser));
      
      this.snackBar.open('Profile updated successfully!', 'Close', { duration: 2000 });
      
      setTimeout(() => {
        this.goBack(); 
      }, 500);
      
    }, 1500);
  }


  goBack(): void {
    this.goBackEvent.emit(); 
  }

  cancel(): void {
    if (this.profileForm.dirty) {
      if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
        this.goBack(); 
      }
    } else {
      this.goBack(); 
    }
  }

  getRoleDisplay(role: string): string {
    const roleMap: { [key: string]: string } = {
      'landlord': 'Landlord',
      'tenant': 'Tenant',
      'caretaker': 'Caretaker',
      'admin': 'Administrator',
      'business': 'Business',
      'user': 'User'
    };
    return roleMap[role] || 'User';
  }

  get fullName() { return this.profileForm.get('fullName'); }
  get email() { return this.profileForm.get('email'); }
  get phoneNumber() { return this.profileForm.get('phoneNumber'); }
  get bio() { return this.profileForm.get('bio'); }
}