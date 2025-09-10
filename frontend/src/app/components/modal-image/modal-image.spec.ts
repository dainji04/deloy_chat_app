import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalImage } from './modal-image';

describe('ModalImage', () => {
  let component: ModalImage;
  let fixture: ComponentFixture<ModalImage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalImage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalImage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
