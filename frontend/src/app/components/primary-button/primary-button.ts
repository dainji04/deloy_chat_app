import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-primary-button',
  standalone: true,
  imports: [],
  template: `
    <button [disabled]="disabled" class="primary-btn">
      {{text}}
    </button>
  `,
  styleUrl: './primary-button.scss',
})
export class PrimaryButton {
  @Input() text: string = 'Click Me';
  @Input() disabled: boolean = false;
}
