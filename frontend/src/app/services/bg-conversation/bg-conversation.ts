import { Injectable } from '@angular/core';
import { Api } from '../api/api';

import { background } from '../../model/background';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BgConversation {
  private backgrounds: background[] = [];

  constructor(private api: Api) { 
    this.getAllBackgrounds();
  }

  getBackgroundList(): background[] {
    console.log(this.backgrounds);
    return this.backgrounds;
  }

  getAllBackgrounds() {
    this.api.get('backgrounds').subscribe((res: any) => {
      this.backgrounds = res.data;
    });
  }

  changeBackground(conversationId: string, backgroundId: string): Observable<any> {
    return this.api.put('backgrounds/change', { conversationId, backgroundId });
  }
}
