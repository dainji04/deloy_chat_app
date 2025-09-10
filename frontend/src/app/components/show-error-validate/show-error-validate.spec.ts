import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowErrorValidate } from './show-error-validate';

describe('ShowErrorValidate', () => {
  let component: ShowErrorValidate;
  let fixture: ComponentFixture<ShowErrorValidate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowErrorValidate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShowErrorValidate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
