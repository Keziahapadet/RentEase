// landing.component.ts
import { Component, OnInit, OnDestroy, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.html',
  styleUrls: ['./landing.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule]
})
export class LandingComponent implements OnInit, OnDestroy {
  private isBrowser: boolean;
  isNavScrolled: boolean = false;
  isMobileMenuOpen: boolean = false;

  // Hero Carousel (Silqu-inspired)
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

  // Legacy slider (backward compatibility)
  sliderItems: NodeListOf<Element> = [] as any;
  sliderDots: NodeListOf<Element> = [] as any;
  sliderInterval: any;

  // Stats
  stats = [
    { current: '24/7', suffix: '', label: 'Platform Availability' },
    { current: '100', suffix: '%', label: 'Secure & Encrypted' },
    { current: '2', suffix: '%', label: 'Transaction Fee Only' },
    { current: '0', suffix: '', label: 'Hidden Fees' }
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
      // Register SVG icons
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
      this.updateSlideClasses(); // Initialize slide positions

      // Initialize legacy slider
      this.sliderItems = document.querySelectorAll('.slider-item');
      this.sliderDots = document.querySelectorAll('.dot');
      if (this.sliderItems.length > 0) this.startSlider();
    }, 100);
  }

  ngOnDestroy(): void {
    this.stopHeroCarousel();
    if (this.sliderInterval) clearInterval(this.sliderInterval);
  }

  /*** Hero Carousel Methods - Silqu Style Sliding ***/
  startHeroCarousel(): void {
    this.autoSlideInterval = setInterval(() => {
      this.nextSlide();
    }, 3000);
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
    
    // Use setTimeout to ensure DOM is updated
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

  /*** Navigation Methods ***/
  navigateToHome(): void {
    this.router.navigateByUrl('/home');
  }

  navigateToFeatures(): void {
    this.router.navigateByUrl('/features');
  }

  navigateToPricing(): void {
    this.router.navigateByUrl('/pricing');
  }

  navigateToContact(): void {
    this.router.navigateByUrl('/contact');
  }

  navigateToAbout(): void {
    this.router.navigateByUrl('/about');
  }

  navigateToSupport(): void {
    this.router.navigateByUrl('/support');
  }

  navigateToLogin(): void {
    this.router.navigateByUrl('/login');
  }

  navigateToRegister(): void {
    this.router.navigateByUrl('/registration');
    
  }

  /*** Legacy Slider Methods ***/
  startSlider(): void {
    this.sliderInterval = setInterval(() => this.nextSliderSlide(), 5000);
  }

  nextSliderSlide(): void {
    if (!this.sliderItems.length) return;
    this.sliderItems[this.currentSlide].classList.remove('active');
    this.sliderDots[this.currentSlide].classList.remove('active');
    this.currentSlide = (this.currentSlide + 1) % this.sliderItems.length;
    this.sliderItems[this.currentSlide].classList.add('active');
    this.sliderDots[this.currentSlide].classList.add('active');
  }

  prevSliderSlide(): void {
    if (!this.sliderItems.length) return;
    this.sliderItems[this.currentSlide].classList.remove('active');
    this.sliderDots[this.currentSlide].classList.remove('active');
    this.currentSlide = (this.currentSlide - 1 + this.sliderItems.length) % this.sliderItems.length;
    this.sliderItems[this.currentSlide].classList.add('active');
    this.sliderDots[this.currentSlide].classList.add('active');
  }

  goToSliderSlide(index: number): void {
    if (!this.sliderItems.length) return;
    this.sliderItems[this.currentSlide].classList.remove('active');
    this.sliderDots[this.currentSlide].classList.remove('active');
    this.currentSlide = index;
    this.sliderItems[this.currentSlide].classList.add('active');
    this.sliderDots[this.currentSlide].classList.add('active');
  }

  /*** Navigation & Scroll ***/
  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    if (!this.isBrowser) return;
    this.isNavScrolled = window.scrollY > 50;
  }

  scrollToTop(): void {
    if (!this.isBrowser) return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  scrollToSection(sectionId: string): void {
    if (!this.isBrowser) return;
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      this.isMobileMenuOpen = false;
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  /*** Contact Form ***/
  onContactSubmit(event: Event): void {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    console.log('Contact form submitted:', data);
    alert('Thank you for your message! We will get back to you within 24 hours.');
    form.reset();
  }

  /*** Scroll Animations ***/
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
      const animateElements = document.querySelectorAll('.feature-card, .pricing-card, .stat-item');
      animateElements.forEach(el => {
        const target = el as HTMLElement;
        target.style.opacity = '0';
        target.style.transform = 'translateY(30px)';
        target.style.transition = 'all 0.6s ease';
        observer.observe(target);
      });
    }, 500);
  }

  /*** Utility ***/
  formatNumber(num: any): string {
    if (typeof num === 'string') return num;
    return Math.floor(num).toLocaleString();
  }

  /*** Keyboard Navigation ***/
  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft') this.prevSlide();
    else if (event.key === 'ArrowRight') this.nextSlide();
    else if (event.key === 'Escape' && this.isMobileMenuOpen) this.isMobileMenuOpen = false;
  }
}