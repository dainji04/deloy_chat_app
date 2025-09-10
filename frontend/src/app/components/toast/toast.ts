import { Component } from '@angular/core';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [ToastModule],
  template: `
    <p-toast 
      position="top-right"
      [breakpoints]="{'920px': {width: '100%', right: '0', left: '0'}}"
    ></p-toast>
  `,
  styles: [`
    ::ng-deep .p-toast {
      z-index: 9999;
    }
    
    ::ng-deep .p-toast-message {
      margin: 0 0 1rem 0;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      border-radius: 8px;
    }
  `]
})
export class ToastComponent {}