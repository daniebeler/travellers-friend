import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import * as L from 'leaflet';
import { OsmNode } from 'src/app/models/osmNode';
import { OverpassService } from 'src/app/services/overpass.service';

const toiletIcon: L.Icon = L.icon({
  iconSize: [48, 48],
  iconAnchor: [24, 48],
  popupAnchor: [2, -40],
  iconUrl: 'https://www.shareicon.net/data/48x48/2015/09/21/644170_pointer_512x512.png'
});

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit {
  
  @Output() markerClicked = new EventEmitter<string>();

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
      const marker = L.marker([node.lat, node.lon], { icon: toiletIcon }).on('click', event => {
        console.log("clicked marker: ", node.lat, node.lon);
        this.callParent();
      });
      this.layerGroup.addLayer(marker).addTo(this.map);
    });
  }

  callParent() {
    this.markerClicked.emit('eventDesc');
  }
}
