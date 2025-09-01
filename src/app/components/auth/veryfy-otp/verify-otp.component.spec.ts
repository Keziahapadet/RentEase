import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { VerifyOtpComponent } from './verify-otp.component';

describe('VerifyOtpComponent', () => {
  let component: VerifyOtpComponent;
  let fixture: ComponentFixture<VerifyOtpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        VerifyOtpComponent,        
        HttpClientTestingModule,   
        RouterTestingModule       
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(VerifyOtpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should not verify OTP if less than 6 digits', () => {
    component.otp = ['1', '2', '3']; // only 3 digits
    spyOn(window, 'alert');          // mock alert
    component.verifyOtp();
    expect(window.alert).toHaveBeenCalledWith('Please enter all 6 digits');
  });

  it('should join OTP digits correctly', () => {
    component.otp = ['1', '2', '3', '4', '5', '6'];
    const joined = component.otp.join('');
    expect(joined).toBe('123456');
  });
});
