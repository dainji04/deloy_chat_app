import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IncomingCallData } from '../../model/call';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-incoming-call',
  templateUrl: './incoming-call.html',
  styleUrl: './incoming-call.scss',
  imports: [RouterLink]
})
export class IncomingCall {
  @Input() data!: IncomingCallData;

  @Output() rejectCall = new EventEmitter<void>();

  reject() {
    this.rejectCall.emit();
  }
}