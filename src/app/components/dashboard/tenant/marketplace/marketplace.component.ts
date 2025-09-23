import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MarketplaceItem } from '../../../../models/tenant.models';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-marketplace',
  imports: [
    CommonModule,
    MatIconModule
  ],
  templateUrl: './marketplace.component.html',
  styleUrls: ['./marketplace.component.scss']
})
export class MarketplaceComponent {
  @Input() collapsedSections!: Set<string>;
  @Input() animatingSections!: Set<string>;
  
  @Output() backClick = new EventEmitter<void>();
  @Output() sectionToggle = new EventEmitter<string>();

  activeMarketplaceTab: 'items' | 'services' | 'housing' = 'items';

  marketplaceItems: MarketplaceItem[] = [
    {
      id: '1',
      title: 'Sofa Set - 3 Seater',
      description: 'Comfortable leather sofa in excellent condition',
      price: 35000,
      location: 'Westlands',
      seller: 'Mary Wanjiku',
      category: 'items',
      datePosted: '2024-02-10'
    },
    {
      id: '2',
      title: 'House Cleaning Service',
      description: 'Professional cleaning service for apartments',
      price: 2500,
      location: 'Nairobi CBD',
      seller: 'Clean Pro Services',
      category: 'services',
      datePosted: '2024-02-12'
    },
    {
      id: '3',
      title: '2BR Apartment for Rent',
      description: 'Modern 2-bedroom apartment with parking',
      price: 45000,
      location: 'Karen',
      seller: 'Prime Properties',
      category: 'housing',
      datePosted: '2024-02-08'
    }
  ];

  formatNumber(num: number): string {
    return new Intl.NumberFormat('en-KE').format(num);
  }

  isSectionCollapsed(sectionId: string): boolean {
    return this.collapsedSections.has(sectionId);
  }

  isAnimating(sectionId: string): boolean {
    return this.animatingSections.has(sectionId);
  }

  toggleSection(sectionId: string): void {
    this.sectionToggle.emit(sectionId);
  }

  goBack(): void {
    this.backClick.emit();
  }

  setActiveMarketplaceTab(tab: 'items' | 'services' | 'housing'): void {
    this.activeMarketplaceTab = tab;
  }

  getMarketplaceItems(): MarketplaceItem[] {
    return this.marketplaceItems.filter(item => item.category === this.activeMarketplaceTab);
  }
}