import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-access-denied',
  template: `
    <div class="access-denied-container">
      <h1>Access Denied</h1>
      <p>You don't have permission to access this page.</p>
      <button (click)="goBack()">Go Back</button>
    </div>
  `,
  styles: [`
    .access-denied-container {
      text-align: center;
      padding: 50px;
    }
  `]
})
export class AccessDeniedComponent {
  constructor(private router: Router) {}

  goBack() {
    this.router.navigate(['/']);
  }
}