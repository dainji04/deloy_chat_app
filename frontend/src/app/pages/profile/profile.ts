import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-profile',
  imports: [DatePipe],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit {
  user: any = null;

  ngOnInit(): void {
    this.user = JSON.parse(localStorage.getItem('user') || '{}');
  }
}
