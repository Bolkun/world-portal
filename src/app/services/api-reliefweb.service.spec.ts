import { TestBed } from '@angular/core/testing';

import { ApiReliefwebService } from './api-reliefweb.service';

describe('ApiReliefwebService', () => {
  let service: ApiReliefwebService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiReliefwebService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
