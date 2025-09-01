// landing.component.ts
import { Component, OnInit, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.html',
  styleUrls: ['./landing.css'],
  standalone: true,
  imports: [CommonModule]
})
export class LandingComponent implements OnInit {
  private isBrowser: boolean;

  // Navbar state
  isNavScrolled = false;
  isMobileMenuOpen = false;

  // Stats data
  stats = [
    { current: '24/7', suffix: '', label: 'Platform Availability' },
    { current: '100', suffix: '%', label: 'Secure & Encrypted' },
    { current: '2', suffix: '%', label: 'Transaction Fee Only' },
    { current: '0', suffix: '', label: 'Hidden Fees' }
  ];

  currentYear = new Date().getFullYear();

  constructor(
    @Inject(PLATFORM_ID) private platformId: any,
    private router: Router
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    console.log('Landing component loaded successfully');
    if (this.isBrowser) {
      setTimeout(() => {
        this.setupScrollAnimations();
      }, 100);
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (this.isBrowser) {
      this.isNavScrolled = window.scrollY > 50;
    }
  }

  scrollToSection(sectionId: string) {
    console.log('scrollToSection called with:', sectionId);
    if (this.isBrowser) {
      const element = document.getElementById(sectionId);
      console.log('Element found:', element);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        this.isMobileMenuOpen = false;
      } else {
        console.log('Element not found for id:', sectionId);
      }
    }
  }

  scrollToTop() {
    console.log('scrollToTop called');
    if (this.isBrowser) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  toggleMobileMenu() {
    console.log('toggleMobileMenu called');
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  navigateToRegister() {
    console.log('navigateToRegister called');
    alert('Navigating to registration...');
    this.router.navigate(['/registration']);
  }

  onContactSubmit(event: Event) {
    console.log('Contact form submitted');
    event.preventDefault();
    
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    console.log('Contact form data:', data);
    alert('Thank you for your message! We will get back to you within 24 hours.');
    form.reset();
  }

  private setupScrollAnimations() {
    if (!this.isBrowser) return;

    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).style.opacity = '1';
          (entry.target as HTMLElement).style.transform = 'translateY(0)';
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