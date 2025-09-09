// features.component.ts
import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-features',
  templateUrl: './feature.html',
  styleUrls: ['./features.css'],
  standalone: true,
  imports: [CommonModule, MatIconModule]
})
export class FeaturesComponent implements OnInit {
  private isBrowser: boolean;
  isNavScrolled: boolean = false;
  isMobileMenuOpen: boolean = false;
  currentYear: number = new Date().getFullYear();

  features = [
    {
      icon: 'lock',
      title: 'Secure Deposit Protection',
      description: 'Your deposits are safely stored in escrow accounts and released only after approved move-out inspections.',
      benefits: [
        'Escrow account protection',
        'Digital inspection process',
        'Automated release system',
        'Dispute resolution support'
      ]
    },
    {
      icon: 'chat',
      title: 'Integrated Communication Hub',
      description: 'All parties communicate directly through one secure platform - no more lost WhatsApp messages.',
      benefits: [
        'Direct messaging between all parties',
        'Document sharing',
        'Notification system',
        'Message history & backup'
      ]
    },
    {
      icon: 'description',
      title: 'Digital Document Management',
      description: 'All rental agreements, receipts, and important documents stored securely in the cloud.',
      benefits: [
        'Digital lease agreements',
        'Payment receipts',
        'Inspection reports',
        'Legal document templates'
      ]
    },
    {
      icon: 'verified',
      title: 'Verified Vacancy System',
      description: 'Prevent occupancy fraud with digital move-out notices visible to both landlords and caretakers.',
      benefits: [
        'Digital vacancy notices',
        'Real-time status updates',
        'Photo documentation',
        'Fraud prevention alerts'
      ]
    },
    {
      icon: 'store',
      title: 'Community Marketplace',
      description: 'Buy, sell, and advertise services within your neighborhood through our integrated marketplace.',
      benefits: [
        'Local trading platform',
        'Service advertisements',
        'Neighbor-to-neighbor commerce',
        'Secure transaction system'
      ]
    },
    {
      icon: 'star',
      title: 'Rating & Review System',
      description: 'Transparent accountability through tenant ratings of landlords and caretakers.',
      benefits: [
        'Landlord ratings',
        'Caretaker reviews',
        'Property condition reports',
        'Community feedback system'
      ]
    }
  ];

  howItWorks = [
    {
      step: '01',
      title: 'Sign Up & Verify',
      description: 'Create your account and verify your identity through our secure KYC process.',
      icon: 'person_add'
    },
    {
      step: '02',
      title: 'Connect Your Property',
      description: 'Add your property details or search for available rentals in your preferred area.',
      icon: 'home'
    },
    {
      step: '03',
      title: 'Secure Transaction',
      description: 'All deposits and payments are processed through our secure escrow system.',
      icon: 'security'
    },
    {
      step: '04',
      title: 'Manage Digitally',
      description: 'Handle all communications, documents, and property management through our platform.',
      icon: 'dashboard'
    }
  ];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;
    
    setTimeout(() => {
      this.setupScrollAnimations();
    }, 100);
  }

  // Navigation methods
  navigateToHome(): void {
    this.router.navigate(['/home']);
  }

  navigateToPricing(): void {
    this.router.navigate(['/pricing']);
  }

  navigateToContact(): void {
    this.router.navigate(['/contact']);
  }

  navigateToAbout(): void {
    this.router.navigate(['/about']);
  }

  navigateToServices(): void {
    this.router.navigate(['/services']);
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
 navigateToFeatures(): void {
    this.router.navigate(['/features']);
  }
  scrollToTop(): void {
    if (!this.isBrowser) return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  private setupScrollAnimations(): void {
    if (!this.isBrowser) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            target.style.opacity = '1';
            target.style.transform = 'translateY(0)';
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    setTimeout(() => {
      const animateElements = document.querySelectorAll('.feature-card, .step-card');
      animateElements.forEach(el => {
        const target = el as HTMLElement;
        target.style.opacity = '0';
        target.style.transform = 'translateY(30px)';
        target.style.transition = 'all 0.6s ease';
        observer.observe(target);
      });
    }, 500);
  }
}