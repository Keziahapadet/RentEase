// landing.component.ts
import { Component, OnInit, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.html',
  styleUrls: ['./landing.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class LandingComponent implements OnInit {
  // Detect browser for SSR compatibility
  private isBrowser: boolean;

  // Navbar state
  isNavScrolled: boolean = false;
  isMobileMenuOpen: boolean = false;

  // Stats data for template
  stats = [
    { current: '24/7', suffix: '', label: 'Platform Availability' },
    { current: '100', suffix: '%', label: 'Secure & Encrypted' },
    { current: '2', suffix: '%', label: 'Transaction Fee Only' },
    { current: '0', suffix: '', label: 'Hidden Fees' }
  ];

  // Footer current year
  currentYear: number = new Date().getFullYear();

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      setTimeout(() => this.setupScrollAnimations(), 100);
    }
  }

  // Navbar scroll listener
  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    if (this.isBrowser) {
      this.isNavScrolled = window.scrollY > 50;
    }
  }

  // Scroll to top
  scrollToTop(): void {
    if (this.isBrowser) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // Scroll to a specific section by ID
  scrollToSection(sectionId: string): void {
    if (this.isBrowser) {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        this.isMobileMenuOpen = false;
      }
    }
  }

  // Toggle mobile menu
  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  // Navigate to registration page
  navigateToRegister(): void {
    this.router.navigateByUrl('/registration');
  }

  // Handle contact form submission
  onContactSubmit(event: Event): void {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    console.log('Contact form submitted:', data);
    alert('Thank you for your message! We will get back to you within 24 hours.');
    form.reset();
  }

  // Setup scroll animations for stats, features, and pricing
  private setupScrollAnimations(): void {
    if (!this.isBrowser) return;

    const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = entry.target as HTMLElement;
          target.style.opacity = '1';
          target.style.transform = 'translateY(0)';
        }
      });
    }, observerOptions);

    setTimeout(() => {
      const animateElements = document.querySelectorAll('.feature-card, .pricing-card, .stat-item');
      animateElements.forEach(el => {
        const element = el as HTMLElement;
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'all 0.6s ease';
        observer.observe(element);
      });
    }, 500);
  }
}
