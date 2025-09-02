import { Component } from '@angular/core';


interface NavItem {
  title: string;
  icon: string;
  active?: boolean;
  badge?: string;
}

interface StatItem {
  title: string;
  icon: string;
  type: string;
  value: string;
  trend: 'up' | 'down';
  change: string;
}

interface Property {
  name: string;
  units: number;
  address: string;
  occupancyRate: number;
}

interface Activity {
  title: string;
  time: string;
  icon: string;
}

@Component({
  selector: 'app-landlord-dashboard',
  imports: [],
  templateUrl: './landlord-dashboard.html',
  styleUrl: './landlord-dashboard.css'
})
export class LandlordDashboard {
  user = {
   name: 'John Doe',
    role: 'Landlord',
    email: 'john.doe@rentease.com',
    avatar: 'JD'
  };

  navItems: NavItem[] = [
    { title: 'Dashboard', icon: 'fas fa-th-large', active: true },
    { title: 'Financials', icon: 'fas fa-dollar-sign', badge: '3' },
    { title: 'Tenants', icon: 'fas fa-users' },
    { title: 'Properties', icon: 'fas fa-building' },
    { title: 'Documents', icon: 'fas fa-file-contract', badge: 'BETA' },
    { title: 'Maintenance', icon: 'fas fa-tools' },
    { title: 'Communication', icon: 'fas fa-comment-alt', badge: '5' },
    { title: 'Marketplace', icon: 'fas fa-store' },
    { title: 'Reviews', icon: 'fas fa-star' },
    { title: 'Settings', icon: 'fas fa-cog' }
  ];

  stats: StatItem[] = [
    { 
      title: 'TOTAL RENT COLLECTED', 
      icon: 'fas fa-dollar-sign', 
      type: 'rent', 
      value: '$24,560', 
      trend: 'up', 
      change: '12% from last month' 
    },
    { 
      title: 'ACTIVE TENANTS', 
      icon: 'fas fa-users', 
      type: 'tenants', 
      value: '18', 
      trend: 'up', 
      change: '2 new this month' 
    },
    { 
      title: 'VACANCY RATE', 
      icon: 'fas fa-home', 
      type: 'vacancy', 
      value: '5.2%', 
      trend: 'up', 
      change: '1.5% from last month' 
    },
    { 
      title: 'MAINTENANCE REQUESTS', 
      icon: 'fas fa-tools', 
      type: 'maintenance', 
      value: '7', 
      trend: 'down', 
      change: '3 resolved this week' 
    }
  ];

  properties: Property[] = [
    { 
      name: 'Oceanview Apartments', 
      units: 8, 
      address: '124 Ocean Ave', 
      occupancyRate: 92 
    },
    { 
      name: 'Hillside Manor', 
      units: 12, 
      address: '356 Hill Street', 
      occupancyRate: 100 
    },
    { 
      name: 'Downtown Lofts', 
      units: 6, 
      address: '789 Main St', 
      occupancyRate: 67 
    }
  ];

  activities: Activity[] = [
    { 
      title: 'Rent received from Sarah Johnson', 
      time: 'Today, 10:30 AM', 
      icon: 'fas fa-dollar-sign' 
    },
    { 
      title: 'Maintenance request for Unit 3B', 
      time: 'Yesterday, 3:45 PM', 
      icon: 'fas fa-tools' 
    },
    { 
      title: 'Lease renewal signed by Michael Chen', 
      time: 'Oct 12, 2023', 
      icon: 'fas fa-file-signature' 
    },
    { 
      title: 'New review received for Oceanview Apartments', 
      time: 'Oct 11, 2023', 
      icon: 'fas fa-star' 
    }
  ];

  selectNavItem(item: NavItem): void {
    // Deactivate all items
    this.navItems.forEach(i => i.active = false);

    // Activate the selected item
    item.active = true;

    // Navigation logic would go here in a real app
    console.log(`Navigating to ${item.title}`);
  }
}

