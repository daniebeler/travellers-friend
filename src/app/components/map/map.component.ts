import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ToastController } from '@ionic/angular';
import * as L from 'leaflet';
import { OsmNode } from 'src/app/models/OsmNode';
import { Settings } from 'src/app/models/Settings';
import { OverpassService } from 'src/app/services/overpass.service';
import { SettingsService } from 'src/app/services/settings.service';

const toiletIcon: L.Icon = L.icon({
  iconSize: [48, 48],
  iconAnchor: [24, 48],
  popupAnchor: [2, -40],
  iconUrl: 'assets/pointer/black-toilet.svg',
});

const freeToiletIcon: L.Icon = L.icon({
  iconSize: [48, 48],
  iconAnchor: [24, 48],
  popupAnchor: [2, -40],
  iconUrl: 'assets/pointer/green-toilet.svg',
});

const paidToiletIcon: L.Icon = L.icon({
  iconSize: [48, 48],
  iconAnchor: [24, 48],
  popupAnchor: [2, -40],
  iconUrl: 'assets/pointer/red-toilet.svg',
});

const waterIcon: L.Icon = L.icon({
  iconSize: [48, 48],
  iconAnchor: [24, 48],
  popupAnchor: [2, -40],
  iconUrl: 'assets/pointer/water.svg',
});


const bikeStationsIcon: L.Icon = L.icon({
  iconSize: [48, 48],
  iconAnchor: [24, 48],
  popupAnchor: [2, -40],
  iconUrl: 'assets/pointer/bike-station.svg',
});

const preloadingRadius = 0.05;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit {

  settings: Settings;

  @Output() markerClicked = new EventEmitter<string>();
  @Output() openSettingsModal = new EventEmitter();

  map;
  toiletsLoaded = false;
  watersLoaded = false;
  bikeStationsLoaded = false;
  accessibleToiletsMode = false;
  private toiletLayerGroup: L.LayerGroup = L.layerGroup();
  private waterLayerGroup: L.LayerGroup = L.layerGroup();
  private bikeStationsLayerGroup: L.LayerGroup = L.layerGroup();
  private lastPreloadingBounds = { lat1: 0, lng1: 0, lat2: 0, lng2: 0 };

  constructor(
    private overpassService: OverpassService,
    private settingsService: SettingsService
  ) { }

  ngOnInit() {
    this.initializeMap();

    this.settingsService.getSettings().subscribe(settings => {
      this.settings = settings;
      console.log("Settings updated map", settings)
      this.reloadNodes();
    })
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
      zoom: 18,
      preferCanvas: true
    });

    L.control.locate({ flyTo: true, keepCurrentZoomLevel: true, locateOptions: { enableHighAccuracy: true }, icon: "fa fa-location-arrow" }).addTo(this.map).start();

    this.map.on('moveend', () => {
      if ((this.map.getZoom() > 11) && (
        this.map.getBounds().getCenter().lat < this.lastPreloadingBounds.lat1 ||
        this.map.getBounds().getCenter().lng < this.lastPreloadingBounds.lng1 ||
        this.map.getBounds().getCenter().lat > this.lastPreloadingBounds.lat2 ||
        this.map.getBounds().getCenter().lng > this.lastPreloadingBounds.lng2
      )) {
        this.reloadNodes();
      }
    });

    const tiles = L.tileLayer(
      // eslint-disable-next-line max-len
      'https://tile.jawg.io/jawg-sunny/{z}/{x}/{y}{r}.png?access-token=jf5kUBdghTSZetSsy8bqMOqYMeJ57shUT3rkMG1vGTD3EhD8tk83dglqoYPsBtvL',
      {
        maxZoom: 20,
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

  reloadNodes() {
    this.watersLoaded = false;
    this.toiletsLoaded = false;

    if (!this.settings.toilets) {
      this.toiletLayerGroup.clearLayers();
    }

    if (!this.settings.water) {
      this.waterLayerGroup.clearLayers();
    }

    if (!this.settings.bikeStations) {
      this.bikeStationsLayerGroup.clearLayers();
    }

    this.updateLoadingState()

    const mapCenter = this.map.getBounds().getCenter();
    console.log('Requested new nodes');



    this.lastPreloadingBounds = {
      lat1: mapCenter.lat - preloadingRadius,
      lng1: mapCenter.lng - preloadingRadius,
      lat2: mapCenter.lat + preloadingRadius,
      lng2: mapCenter.lng + preloadingRadius
    };

    if (this.settings.toilets) {

      if (!this.accessibleToiletsMode) {
        this.overpassService
          .getNodes(
            '"amenity"="toilets"',
            mapCenter.lat - preloadingRadius,
            mapCenter.lng - preloadingRadius,
            mapCenter.lat + preloadingRadius,
            mapCenter.lng + preloadingRadius
          )
          .subscribe((nodes) => {
            console.log('New toilets are here');
            this.toiletsLoaded = true;
            this.updateLoadingState()
            this.setToiletMarker(nodes);
          });
      }
      else {
        this.overpassService
          .getNodes(
            '"amenity"="toilets"]["wheelchair"="yes"',
            mapCenter.lat - preloadingRadius,
            mapCenter.lng - preloadingRadius,
            mapCenter.lat + preloadingRadius,
            mapCenter.lng + preloadingRadius
          )
          .subscribe((nodes) => {
            console.log('New toilets are here');
            this.toiletsLoaded = true;
            this.updateLoadingState()
            this.setToiletMarker(nodes);
          });
      }
    }

    if (this.settings.water) {
      this.overpassService
        .getNodes(
          '"amenity"="drinking_water"',
          mapCenter.lat - preloadingRadius,
          mapCenter.lng - preloadingRadius,
          mapCenter.lat + preloadingRadius,
          mapCenter.lng + preloadingRadius
        )
        .subscribe((nodes) => {
          this.watersLoaded = true;
          this.updateLoadingState()
          console.log('New waters are here');
          this.setWaterMarker(nodes);
        });
    }


    if (this.settings.bikeStations) {
      this.overpassService
        .getNodes(
          '"amenity"="bicycle_repair_station"',
          mapCenter.lat - preloadingRadius,
          mapCenter.lng - preloadingRadius,
          mapCenter.lat + preloadingRadius,
          mapCenter.lng + preloadingRadius
        )
        .subscribe((nodes) => {
          console.log(nodes)
          this.bikeStationsLoaded = true;
          this.updateLoadingState()
          console.log('New bikeStations are here');
          this.setBikeStationsMarker(nodes);
        });
    }
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


  setBikeStationsMarker(nodes: OsmNode[]) {
    this.bikeStationsLayerGroup.clearLayers();
    nodes.forEach((node) => {
      const markerIcon = bikeStationsIcon;
      const marker = L.marker([node.lat, node.lon], { icon: markerIcon }).on('click', event => {
        console.log('clicked marker: ', node.lat, node.lon);
        this.callParent(node);
      });
      this.bikeStationsLayerGroup.addLayer(marker).addTo(this.map);
    });
  }

  callParent(data: OsmNode) {
    this.markerClicked.emit(JSON.stringify(data));
  }

  openSettingsModalInParent() {
    this.openSettingsModal.emit();
  }

  updateLoadingState() {
    const newLoadingState = (!this.watersLoaded && this.settings.water) || (!this.toiletsLoaded && this.settings.toilets) || (!this.bikeStationsLoaded && this.settings.bikeStations);
    this.settingsService.updateLoadingState(newLoadingState)
  }
}
