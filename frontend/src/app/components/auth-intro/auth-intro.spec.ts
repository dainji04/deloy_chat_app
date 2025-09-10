import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthIntro } from './auth-intro';

describe('AuthIntro', () => {
  let component: AuthIntro;
  let fixture: ComponentFixture<AuthIntro>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthIntro]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthIntro);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
