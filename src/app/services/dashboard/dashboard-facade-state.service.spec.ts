import { TestBed } from '@angular/core/testing';

import { DashboardFacadeStateService } from './dashboard-facade-state.service';

describe('DashboardFacadeStateService', () => {
  let service: DashboardFacadeStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DashboardFacadeStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
