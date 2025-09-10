import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { background } from '../../model/background';
import { BgConversation } from '../../services/bg-conversation/bg-conversation';
import { Dialog } from 'primeng/dialog';
import { Button } from 'primeng/button';

@Component({
    selector: 'app-background-conversation',
    imports: [Dialog, Button],
    template: `
    <div class="body__option change-background">
        <div class="title cursor" (click)="getBackgroundConversation()">
            <p>Backgrounds</p>
            <i class="fa-solid fa-chevron-right"></i>
        </div>
        <p-dialog header="Header" [modal]="true" [(visible)]="isShowBackgrounds" [style]="{ width: '50rem' }" [breakpoints]="{ '1199px': '75vw', '575px': '90vw' }">
          <div class="background-container">
            @for (bg of backgrounds; track bg._id) {
                <div 
                  class="bg-item" 
                  [class.selected]="isSelected(bg)" 
                  (click)="selectBackground(bg)"
                >
                    <div class="bg-image-wrapper">
                        <img [src]="bg.url" [alt]="bg.name" />
                        <div class="overlay">
                            <i class="pi pi-check"></i>
                        </div>
                    </div>
                    <p class="bg-name">{{ bg.name }}</p>
                </div>
            }
            
            @if (backgrounds.length === 0) {
                <div class="no-backgrounds">
                    <i class="pi pi-image"></i>
                    <p>No backgrounds available</p>
                </div>
            }
        </div>
         <div class="dialog-footer">
          <p-button label="Cancel" severity="secondary" (click)="isShowBackgrounds = false" />
          <p-button label="Save" (click)="changeBackgroundEventEmit()" />
      </div>
      </p-dialog>
    </div>`,
    styleUrls: ['./background-conversation.scss'],
})
export class BackgroundConversation {
    @Output() changeBackgroundEvent = new EventEmitter<background>();

    isShowBackgrounds: boolean = false;
    backgrounds: background[] = [];
    loadingInOption: boolean = false;
    selectedBackground: background | null = null;

    constructor(private backgroundService: BgConversation) {}

    getBackgroundConversation() {
      this.isShowBackgrounds = !this.isShowBackgrounds;
      this.getAllBackgrounds();
    }

    getAllBackgrounds() {
      this.backgrounds = this.backgroundService.getBackgroundList();
    }

    changeBackground(url: string) {
      console.log(url);
    }

    selectBackground(background: background) {
      this.selectedBackground = background;
    }
    
    isSelected(background: background): boolean {
      return this.selectedBackground?._id === background._id;
    }

    changeBackgroundEventEmit() {
      if (this.selectedBackground) {
        this.isShowBackgrounds = false;
        this.changeBackgroundEvent.emit(this.selectedBackground);
      }
    }
}
