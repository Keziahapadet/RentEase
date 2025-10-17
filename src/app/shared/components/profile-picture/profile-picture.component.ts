import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ProfilePictureService, UserProfile } from '../../../services/profile-picture.service';

@Component({
  selector: 'app-profile-picture',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './profile-picture.component.html',
  styleUrls: ['./profile-picture.component.scss']
})
export class ProfilePictureComponent implements OnInit {
  @Input() editable: boolean = false;
  @Input() showName: boolean = false;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  
  @Output() pictureUpdated = new EventEmitter<string>();
  @Output() pictureDeleted = new EventEmitter<void>();

  userProfile: UserProfile | null = null;
  imageUrl: string | null = null;
  uploading: boolean = false;
  uploadProgress: number = 0;
  loading: boolean = true;

  constructor(private profilePictureService: ProfilePictureService) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.loading = true;
    this.profilePictureService.getCurrentUserProfile().subscribe({
      next: (profile) => {
        this.userProfile = profile;
        this.loadProfilePicture();
      },
      error: (error) => {
        console.error('Failed to load user profile:', error);
        this.loading = false;
        this.imageUrl = this.profilePictureService.getDefaultAvatar();
      }
    });
  }

  loadProfilePicture(): void {
    this.profilePictureService.getProfilePicture().subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
         
          const pictureUrl = response.imageUrl || response.pictureUrl;
          if (pictureUrl) {
            this.imageUrl = pictureUrl;
          } else {
            this.imageUrl = this.profilePictureService.getDefaultAvatar();
          }
        } else {
          this.imageUrl = this.profilePictureService.getDefaultAvatar();
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Failed to load profile picture:', error);
        this.imageUrl = this.profilePictureService.getDefaultAvatar();
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (!this.isValidFileType(file)) {
        alert('Please select a valid image file (JPEG, PNG, GIF)');
        return;
      }
      
      if (!this.isValidFileSize(file)) {
        alert('File size should be less than 5MB');
        return;
      }

      this.uploadProfilePicture(file);
    }
  }

  isValidFileType(file: File): boolean {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    return allowedTypes.includes(file.type);
  }

  isValidFileSize(file: File): boolean {
    const maxSize = 5 * 1024 * 1024; 
    return file.size <= maxSize;
  }

  uploadProfilePicture(file: File): void {
    this.uploading = true;
    this.uploadProgress = 0;

    this.profilePictureService.uploadProfilePicture(file).subscribe({
      next: (response) => {
        this.uploading = false;
        if (response.success) {
          const pictureUrl = response.imageUrl || response.pictureUrl;
          if (pictureUrl) {
            this.imageUrl = pictureUrl;
            this.pictureUpdated.emit(pictureUrl);
          }
        }
      },
      error: (error) => {
        this.uploading = false;
        console.error('Upload failed:', error);
        alert('Failed to upload profile picture. Please try again.');
      }
    });
  }

  deletePicture(): void {
    if (confirm('Are you sure you want to delete your profile picture?')) {
      this.profilePictureService.deleteProfilePicture().subscribe({
        next: (response) => {
          if (response.success) {
            this.imageUrl = this.profilePictureService.getDefaultAvatar();
            this.pictureDeleted.emit();
          }
        },
        error: (error) => {
          console.error('Delete failed:', error);
          alert('Failed to delete profile picture. Please try again.');
        }
      });
    }
  }

  onImageError(): void {
    this.imageUrl = this.profilePictureService.getDefaultAvatar();
  }

  getInitials(): string {
    if (!this.userProfile?.fullName) return '?';
    
    const names = this.userProfile.fullName.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  }

  getUserRole(): string {
    return this.userProfile?.role || 'user';
  }

  getUserName(): string {
    return this.userProfile?.fullName || 'User';
  }

 
  isDefaultAvatar(): boolean {
    return !this.imageUrl || this.imageUrl.includes('svg+xml') || this.imageUrl.includes('default-');
  }
}