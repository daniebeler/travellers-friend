import { Injectable } from '@angular/core';
import { Settings } from '../models/Settings';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  private settings = new BehaviorSubject<Settings>(new Settings());
  private isLoadingData = new BehaviorSubject<boolean>(false);

  constructor() { }

  getSettings(): Observable<Settings> {
    return this.settings;
  }

  updateSettings(newSettings: Settings) {
    this.settings.next(newSettings);
  }

  getLoadingState(): Observable<boolean> {
    return this.isLoadingData;
  }

  updateLoadingState(newState: boolean) {
    this.isLoadingData.next(newState);
  }
}
