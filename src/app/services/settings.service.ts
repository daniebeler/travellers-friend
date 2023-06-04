import { Injectable } from '@angular/core';
import { Settings } from '../models/Settings';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  private settings = new BehaviorSubject<Settings>(new Settings());

  constructor() { }

  getSettings(): Observable<Settings> {
    return this.settings;
  }

  updateSettings(newSettings: Settings) {
    this.settings.next(newSettings);
  }
}
