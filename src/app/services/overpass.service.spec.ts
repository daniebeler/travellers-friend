import { TestBed } from '@angular/core/testing';

import { OverpassService } from './overpass.service';

describe('OverpassService', () => {
  let service: OverpassService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OverpassService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
