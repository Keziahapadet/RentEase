import { TestBed } from '@angular/core/testing';

import { AuthFlow } from './auth-flow';

describe('AuthFlow', () => {
  let service: AuthFlow;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthFlow);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
