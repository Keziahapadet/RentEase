import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandlordDashboardComponent } from './landlord-dashboard';

describe('LandlordDashboard', () => {
  let component: LandlordDashboardComponent;
  let fixture: ComponentFixture<LandlordDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandlordDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LandlordDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
