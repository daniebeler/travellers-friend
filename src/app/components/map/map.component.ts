import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import * as L from 'leaflet';
import { OsmNode } from 'src/app/models/OsmNode';
import { OverpassService } from 'src/app/services/overpass.service';

const toiletIcon: L.Icon = L.icon({
  iconSize: [48, 48],
  iconAnchor: [24, 48],
  popupAnchor: [2, -40],
  iconUrl:
    'https://www.shareicon.net/data/48x48/2015/09/21/644170_pointer_512x512.png',
});

const freeToiletIcon: L.Icon = L.icon({
  iconSize: [48, 48],
  iconAnchor: [24, 48],
  popupAnchor: [2, -40],
  iconUrl:
    'https://img.freepik.com/premium-vector/icon-toilet-flat-bathroom-toilet-sign-wc-toilet-icon-vector-illustration_485380-483.jpg?w=2000',
});

const paidToiletIcon: L.Icon = L.icon({
  iconSize: [48, 48],
  iconAnchor: [24, 48],
  popupAnchor: [2, -40],
  iconUrl:
    'https://cdn.w600.comps.canstockphoto.at/home-toilet-icon-rot-stock-illustration_csp66985768.jpg',
});

const waterIcon: L.Icon = L.icon({
  iconSize: [20, 40],
  iconAnchor: [24, 48],
  popupAnchor: [2, -40],
  iconUrl:
    'https://www.freeiconspng.com/thumbs/water-bottle-png/water-bottle-png-8.png',
});

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit {

  @Output() markerClicked = new EventEmitter<string>();

  map;
  private toiletLayerGroup: L.LayerGroup = L.layerGroup();
  private waterLayerGroup: L.LayerGroup = L.layerGroup();

  constructor(private overpassService: OverpassService) {}

  ngOnInit() {
    this.initializeMap();
  }

  initializeMap() {
    let latitude = 47.404391;
    let longitude = 9.744025;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
      });
    }

    this.map = L.map('map', {
      center: [latitude, longitude],
      zoom: 20,
      renderer: L.canvas(),
    });

    try{
      L.control.locate({ flyTo: true, keepCurrentZoomLevel: true }).addTo(this.map).start();
    }
    catch{console.log('ses');}

    this.map.on('moveend', () => {
      this.getNewNodes();
    });

    const tiles = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        maxZoom: 18,
        minZoom: 3,
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }
    );

    tiles.addTo(this.map);

    setTimeout(() => {
      this.map.invalidateSize();
    }, 0);
  }

  getNewNodes() {
    const mapBounds = this.map.getBounds();
    console.log('Requested new nodes');

    this.overpassService
      .getNodes(
        '"amenity"="toilets"',
        mapBounds.getSouthWest().lat,
        mapBounds.getSouthWest().lng,
        mapBounds.getNorthEast().lat,
        mapBounds.getNorthEast().lng
      )
      .subscribe((nodes) => {
        console.log('New nodes are here');
        this.setToiletMarker(nodes);
      });


      this.overpassService
      .getNodes(
        '"amenity"="drinking_water"',
        mapBounds.getSouthWest().lat,
        mapBounds.getSouthWest().lng,
        mapBounds.getNorthEast().lat,
        mapBounds.getNorthEast().lng
      )
      .subscribe((nodes) => {
        console.log('New nodes are here');
        this.setWaterMarker(nodes);
      });
  }

  setToiletMarker(nodes: OsmNode[]) {
    this.toiletLayerGroup.clearLayers();
    nodes.forEach((node: OsmNode) => {
      let markerIcon = toiletIcon;

      if (node.tags.fee === 'no') {
        markerIcon = freeToiletIcon;
      } else if (node.tags.fee === 'yes') {
        markerIcon = paidToiletIcon;
      }

      const marker = L.marker([node.lat, node.lon], { icon: markerIcon }).on('click', event => {
        console.log('clicked marker: ', node.lat, node.lon);
        this.callParent(node);
      });
      this.toiletLayerGroup.addLayer(marker).addTo(this.map);
    });
  }

  setWaterMarker(nodes: OsmNode[]) {
    this.waterLayerGroup.clearLayers();
    nodes.forEach((node) => {
      const markerIcon = waterIcon;
      const marker = L.marker([node.lat, node.lon], { icon: markerIcon }).on('click', event => {
        console.log('clicked marker: ', node.lat, node.lon);
        this.callParent(node);
      });
      this.waterLayerGroup.addLayer(marker).addTo(this.map);
    });
  }

  callParent(data: OsmNode) {
    this.markerClicked.emit(data.tags);
  }
}
