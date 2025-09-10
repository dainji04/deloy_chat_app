import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-auth-intro',
  standalone: true,
  imports: [],
  templateUrl: './auth-intro.html',
  styleUrl: './auth-intro.scss',
})
export class AuthIntroComponent {
  @Input() title: string = 'Welcome to Our App';
  @Input() description: string =
    'Please sign up or log in to continue using our application.';
}
