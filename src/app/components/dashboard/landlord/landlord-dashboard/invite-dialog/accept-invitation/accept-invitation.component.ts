import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { InvitationService } from '../../../../../../services/invitation.service';
import { AuthService } from '../../../../../../services/auth.service';

@Component({
  selector: 'app-accept-invitation',
  templateUrl: './accept-invitation.component.html',
  styleUrls: ['./accept-invitation.component.css']
})
export class AcceptInvitationComponent implements OnInit {
  token: string = '';
  loading: boolean = true;
  success: boolean = false;
  error: boolean = false;
  errorMessage: string = '';
  isLoggedIn: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private invitationService: InvitationService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.token = this.route.snapshot.paramMap.get('token') || '';
    this.isLoggedIn = this.authService.isLoggedIn();
    
    if (!this.token) {
      this.error = true;
      this.errorMessage = 'Invalid invitation token';
      this.loading = false;
      return;
    }

    this.loading = false;
  }

  acceptInvitation() {
    this.loading = true;
    this.invitationService.acceptInvitation(this.token).subscribe({
      next: (response) => {
        this.success = true;
        this.loading = false;
      },
      error: (error) => {
        this.error = true;
        this.errorMessage = error.message;
        this.loading = false;
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login'], { 
      queryParams: { returnUrl: `/accept-invitation/${this.token}` }
    });
  }

  goToRegister() {
    this.router.navigate(['/register'], { 
      queryParams: { returnUrl: `/accept-invitation/${this.token}` }
    });
  }

  goToDashboard() {
    const userRole = this.authService.getCurrentUser()?.role;
    if (userRole === 'tenant') {
      this.router.navigate(['/tenant/dashboard']);
    } else if (userRole === 'caretaker') {
      this.router.navigate(['/caretaker/dashboard']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }
}