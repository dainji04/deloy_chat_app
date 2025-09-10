import { TestBed } from '@angular/core/testing';

import { BgConversation } from './bg-conversation';

describe('BgConversation', () => {
  let service: BgConversation;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BgConversation);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
