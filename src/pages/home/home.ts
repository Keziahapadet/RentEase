// home.component.ts
import { Component, OnInit, OnDestroy, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, RouterModule]
})
export class HomeComponent implements OnInit, OnDestroy {
  private isBrowser: boolean;
  isNavScrolled: boolean = false;
  isMobileMenuOpen: boolean = false;
  showUninvitedMessage: boolean = false;
  activeMenu: string = 'home';

  setActiveMenu(menu: string) {
    this.activeMenu = menu;
    this.isMobileMenuOpen = false; 
  }

  slides = [
    {
      title: 'Secure & Transparent Rental Management',
      description: 'Eliminate rental fraud and connect landlords, tenants, and caretakers securely with Kenya\'s most trusted digital property management platform.',
      image: '/images/slide1.jpg'
    },
    {
      title: 'Secure Deposits',
      description: 'Protect your rental deposits with our escrow system and eliminate deposit fraud with transparent, automated processes.',
      image: '/images/slide2.jpg'
    },
    {
      title: 'Modern Properties',
      description: 'Find your perfect home in our verified listings with transparent pricing and authentic property information.',
      image: '/images/slide3.jpg'
    }
  ];
  
  currentSlide = 0;
  totalSlides = this.slides.length;
  autoSlideInterval: any;

  stats = [
    { current: '24/7', suffix: '', label: 'Platform Availability' },
    { current: '100', suffix: '%', label: 'Secure & Encrypted' },
    { current: '2', suffix: '%', label: 'Transaction Fee Only' },
    { current: '0', suffix: '', label: 'Hidden Fees' }
  ];

  // Services data (comprehensive rental management solutions)
  services = [
    {
      id: 'secure-deposits',
      icon: 'account_balance_wallet',
      title: 'Secure Deposit Management',
      description: 'Eliminate deposit fraud with our blockchain-based escrow system that ensures transparency and security for all parties.',
      badge: 'Most Popular',
      benefits: [
        'Blockchain-secured deposit escrow',
        'Transparent deposit tracking',
        'Legal protection for all parties',
        
      ]
    },
   
  
    {
      id: 'communication-hub',
      icon: 'forum',
      title: 'Integrated Communication',
      description: 'Centralized communication platform connecting landlords, tenants, and caretakers with real-time messaging and notifications.',
      benefits: [
        'Real-time messaging platform',
        'Automated notification system',
        'Multi-party group communications',
        'Document sharing capabilities',
        'Communication history tracking'
      ]
    },
    {
      id: 'community-marketplace',
      icon: 'store',
      title: 'Community Marketplace',
      description: 'Local marketplace where tenants can buy, sell, and exchange items within their residential communities.',
      badge: 'New',
      benefits: [
        'Hyperlocal buying and selling',
        'Community-verified sellers',
        'In-app secure transactions',
        'Delivery within residential areas',
        'Rating and review system'
      ]
    }
  ];

  currentYear: number = new Date().getFullYear();

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    private matIconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      this.matIconRegistry.addSvgIcon('facebook', this.sanitizer.bypassSecurityTrustResourceUrl('icons/facebook.svg'));
      this.matIconRegistry.addSvgIcon('twitter', this.sanitizer.bypassSecurityTrustResourceUrl('icons/twitter.svg'));
      this.matIconRegistry.addSvgIcon('instagram', this.sanitizer.bypassSecurityTrustResourceUrl('icons/instagram.svg'));
    }
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;

    setTimeout(() => {
      this.setupScrollAnimations();
      this.startHeroCarousel();
      this.updateSlideClasses();
    }, 100);
  }

  ngOnDestroy(): void {
    this.stopHeroCarousel();
  }

  startHeroCarousel(): void {
    this.autoSlideInterval = setInterval(() => {
      this.nextSlide();
    }, 4000);
  }

  stopHeroCarousel(): void {
    if (this.autoSlideInterval) clearInterval(this.autoSlideInterval);
  }

  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
    this.updateSlideClasses();
  }

  prevSlide(): void {
    this.currentSlide = this.currentSlide === 0 ? this.totalSlides - 1 : this.currentSlide - 1;
    this.updateSlideClasses();
  }

  goToSlide(index: number): void {
    this.currentSlide = index;
    this.updateSlideClasses();
    this.stopHeroCarousel();
    this.startHeroCarousel();
  }

  private updateSlideClasses(): void {
    if (!this.isBrowser) return;
    setTimeout(() => {
      const slides = document.querySelectorAll('.carousel-slide');
      slides.forEach((slide, index) => {
        const slideElement = slide as HTMLElement;
        slideElement.classList.remove('active', 'prev');
        
        if (index === this.currentSlide) {
          slideElement.classList.add('active');
        } else if (index < this.currentSlide) {
          slideElement.classList.add('prev');
        }
      });
    }, 0);
  }

  onCarouselMouseEnter(): void {
    this.stopHeroCarousel();
  }

  onCarouselMouseLeave(): void {
    this.startHeroCarousel();
  }

  // Method to scroll to a specific section
  scrollToSection(sectionId: string): void {
    if (!this.isBrowser) return;
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  }

  // Method to handle service "Learn More" clicks
  learnMoreAboutService(serviceId: string): void {
    // Navigate to features page with specific service highlighted
    this.router.navigate(['/features'], { 
      queryParams: { service: serviceId },
      fragment: serviceId 
    });
  }

  // Navigation methods
  navigateToFeatures(): void {
    this.scrollToSection('services');
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

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  navigateToRegister(): void {
    this.router.navigate(['/registration']);
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    if (!this.isBrowser) return;
    this.isNavScrolled = window.scrollY > 50;
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
      const animateElements = document.querySelectorAll('.stat-item, .service-card, .benefit-item');
      animateElements.forEach(el => {
        const target = el as HTMLElement;
        target.style.opacity = '0';
        target.style.transform = 'translateY(30px)';
        target.style.transition = 'all 0.6s ease';
        observer.observe(target);
      });
    }, 500);
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft') this.prevSlide();
    else if (event.key === 'ArrowRight') this.nextSlide();
    else if (event.key === 'Escape' && this.isMobileMenuOpen) this.isMobileMenuOpen = false;
  }

  onGetStartedClick(role: string, invitationToken?: string) {
    if (role === 'tenant' || role === 'caretaker') {
      if (!invitationToken || !this.isValidInvitation(invitationToken)) {
        // Show uninvited message
        this.showUninvitedMessage = true;
        return;
      } else {
        // invited user
        this.router.navigate(['/register'], { queryParams: { token: invitationToken } });
      }
    } else {
      // Landlord / Business
      this.router.navigate(['/register'], { queryParams: { role } });
    }
  }

  navigateToLanding() {
    this.showUninvitedMessage = false;
    this.router.navigate(['/home']);
  }

  contactLandlord() {
    this.router.navigate(['/contact']);
  }

  isValidInvitation(token: string): boolean {
    // TODO: Replace with actual backend check
    return false;
  }
}