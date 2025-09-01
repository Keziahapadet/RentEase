import { Component, OnInit, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.html',
  styleUrls: ['./landing.css']
})
export class LandingComponent implements OnInit {
  private statsSection: HTMLElement | null = null;
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: any) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    if (this.isBrowser) {
      // Wait for the DOM to be fully rendered
      setTimeout(() => {
        this.statsSection = document.getElementById('stats-section');
        this.checkIfStatsInView();
      }, 0);
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (this.isBrowser) {
      this.checkIfStatsInView();
    }
  }

  checkIfStatsInView() {
    if (!this.isBrowser || !this.statsSection) return;

    try {
      const rect = this.statsSection.getBoundingClientRect();
      const isInView = (
        rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.8 &&
        rect.bottom >= 0
      );

      if (isInView) {
        // Add your animation or tracking logic here
        this.statsSection.classList.add('animate-stats');
        console.log('Stats section is in view!');
      }
    } catch (error) {
      console.error('Error checking if stats are in view:', error);
    }
  }
}