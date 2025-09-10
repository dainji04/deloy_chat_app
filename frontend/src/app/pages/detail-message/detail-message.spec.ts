import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailMessage } from './detail-message';

describe('DetailMessage', () => {
  let component: DetailMessage;
  let fixture: ComponentFixture<DetailMessage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailMessage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailMessage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
