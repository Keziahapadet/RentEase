import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TenantDashboard } from './tenant-dashboard';

describe('TenantDashboard', () => {
  let component: TenantDashboard;
  let fixture: ComponentFixture<TenantDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TenantDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TenantDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
