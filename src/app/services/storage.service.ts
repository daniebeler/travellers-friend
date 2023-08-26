import { Injectable } from '@angular/core';
import { Coordinates } from '../models/Coordinates';

const COORDINATES_KEY = 'token1';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { }

  setCoordinates(lat: number, long: number): void {
    const coordinates = new Coordinates(lat, long)
    localStorage.setItem(COORDINATES_KEY, JSON.stringify(coordinates));
  }

  getCoordinates(): Coordinates {
    let elem = localStorage.getItem(COORDINATES_KEY);
    if (elem) {
      return JSON.parse(elem) as Coordinates
    } else {
      return new Coordinates(47.404391, 9.744025)
    }
  }
}
