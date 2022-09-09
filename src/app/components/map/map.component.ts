import { AfterViewInit, Component, OnInit } from '@angular/core';
import { IonGrid } from '@ionic/angular';
import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit, AfterViewInit {
  private map: L.map;
  private initialized: boolean = false;

  constructor() { }

  ngOnInit() {
    if(navigator.geolocation) {
      navigator.geolocation.watchPosition(this.setGeoLocation.bind(this));
    }
   }


  setGeoLocation(position: { coords: { latitude: any; longitude: any } }) {
    const {
       coords: { latitude, longitude },
    } = position;

    console.log(position);

    if(!this.initialized){
      this.map = L.map('map', {
        center: [latitude, longitude],
        zoom: 13,
        renderer: L.canvas()
      });
      this.initialized = true;
    }

    let circle = L.circle([latitude, longitude], {
      color: 'blue',
      fillColor: 'lightblue',
      radius: 5
    }
      ).addTo(this.map);

    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      minZoom: 3,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    tiles.addTo(this.map);

    setTimeout(() => {
      this.map.invalidateSize();
    }, 0);

    }

  ngAfterViewInit(): void {
    // this.initMap();
  }

  // private initMap(): void {
    // this.map = L.map('map', {
    //   center: [51.505, -0.09],
    //   zoom: 13,
    //   renderer: L.canvas()
    // });

    // const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    //   maxZoom: 18,
    //   minZoom: 3,
    //   attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    // });

    // tiles.addTo(this.map);

    // setTimeout(() => {
    //   this.map.invalidateSize();
    // }, 0);
  // }
}
