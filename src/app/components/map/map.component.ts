import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { OsmNode } from 'src/app/models/osmNode';
import { OverpassService } from 'src/app/services/overpass.service';

const icon: L.Icon = L.icon({
  iconSize: [25, 41],
  iconAnchor: [10, 41],
  popupAnchor: [2, -40],
  iconUrl: 'https://unpkg.com/leaflet@1.5.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.5.1/dist/images/marker-shadow.png'
});

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit {
  private map: L.map;
  private layerGroup: L.LayerGroup = L.layerGroup();
  private initialized = false;

  constructor(private overpassService: OverpassService) { }

  ngOnInit() {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(this.setGeoLocation.bind(this));
    }
  }

  setGeoLocation(position: { coords: { latitude: any; longitude: any } }) {
    const {
      coords: { latitude, longitude },
    } = position;

    if (!this.initialized) {
      this.map = L.map('map', {
        center: [latitude, longitude],
        zoom: 13,
        renderer: L.canvas()
      });
      this.initialized = true;

      this.map.on('moveend', () => {
        this.getNewNodes();
      });

    }

    L.circle([latitude, longitude], {
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

  getNewNodes() {
    const mapBounds = this.map.getBounds();
    console.log('Requested new nodes');

    this.overpassService.getNodes(
      '"amenity"="toilets"',
      mapBounds.getSouthWest().lat,
      mapBounds.getSouthWest().lng,
      mapBounds.getNorthEast().lat,
      mapBounds.getNorthEast().lng
    ).subscribe((nodes) => {
      console.log('New nodes are here');
      this.setMarker(nodes);
    });
  }

  setMarker(nodes: OsmNode[]) {
    this.layerGroup.clearLayers();
    nodes.forEach((node) => {
      const marker = L.marker([node.lat, node.lon], { icon });
      this.layerGroup.addLayer(marker).addTo(this.map);
    });
  }
}
