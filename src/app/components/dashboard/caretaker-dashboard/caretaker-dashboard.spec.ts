import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaretakerDashboard } from './caretaker-dashboard';

describe('CaretakerDashboard', () => {
  let component: CaretakerDashboard;
  let fixture: ComponentFixture<CaretakerDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CaretakerDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaretakerDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
