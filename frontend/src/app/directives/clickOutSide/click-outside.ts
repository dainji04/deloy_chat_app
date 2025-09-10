import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Output,
} from '@angular/core';

@Directive({
  selector: '[appClickOutside]',
})
export class ClickOutside {
  @Output() appClickOutside = new EventEmitter<void>();
  constructor(private elementRef: ElementRef) {}

  @HostListener('document:click', ['$event.target'])
  public onClickOutside(target: EventTarget | null) {
    if (target && target instanceof HTMLElement) {
      const clickedInside = this.elementRef.nativeElement.contains(target);
      if (!clickedInside) {
        this.appClickOutside.emit();
      }
    }
  }
}
