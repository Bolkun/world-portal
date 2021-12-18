import { TestBed } from '@angular/core/testing';

import { DashboardState } from './dashboard.state';

describe('DashboardService', () => {
  let service: DashboardState;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DashboardState);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
