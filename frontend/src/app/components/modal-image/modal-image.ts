import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Dialog } from 'primeng/dialog';

@Component({
  selector: 'app-modal-image',
  imports: [Dialog],
  templateUrl: './modal-image.html',
  styleUrl: './modal-image.scss'
})
export class ModalImage {
  @Input() show: boolean = false;
  @Input() url: string = '';
  @Output() close = new EventEmitter<void>();

  onHide() {
    this.close.emit();
  }
}
