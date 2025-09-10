import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BackgroundConversation } from './background-conversation';

describe('BackgroundConversation', () => {
  let component: BackgroundConversation;
  let fixture: ComponentFixture<BackgroundConversation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BackgroundConversation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BackgroundConversation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
