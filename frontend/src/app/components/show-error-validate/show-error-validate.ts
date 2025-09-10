import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-show-error-validate',
    imports: [],
  templateUrl: './show-error-validate.html',
  styleUrl: './show-error-validate.scss'
})
export class ShowErrorValidate {
  @Input() inputField: any = null;
  @Input() fieldName: string = '';
  @Input() minLength: number = 0;
  @Input() maxLength: number = 0;
}
