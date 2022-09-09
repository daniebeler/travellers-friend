import { AfterViewInit, Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { OverpassService } from 'src/app/services/overpass.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit, AfterViewInit {
  private map: L.map;

  constructor(private overpassService: OverpassService) { }

  ngOnInit() { }

  ngAfterViewInit(): void {
    this.initMap();

    this.map.on('moveend', () => {
      const bounds = this.map.getBounds();
      console.log(bounds.getSouthWest());
      console.log(bounds.getNorthEast());


      this.overpassService.getNodes(
        '"amenity"="toilets"',
        bounds.getSouthWest().lat,
        bounds.getSouthWest().lng,
        bounds.getNorthEast().lat,
        bounds.getNorthEast().lng
      ).subscribe((data) => {
        console.log('fief is here: ');

        console.log(data);

      });;
    });
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [51.505, -0.09],
      zoom: 13,
      renderer: L.canvas()
    });

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
}
