import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import * as L from 'leaflet';
import { OsmNode } from 'src/app/models/OsmNode';
import { Settings } from 'src/app/models/Settings';
import { OverpassService } from 'src/app/services/overpass.service';
import { SettingsService } from 'src/app/services/settings.service';
import { StorageService } from 'src/app/services/storage.service';

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

const atmIcon: L.Icon = L.icon({
  iconSize: [48, 48],
  iconAnchor: [24, 48],
  popupAnchor: [2, -40],
  iconUrl: 'assets/pointer/atm.svg',
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
  atmsLoaded = false;
  accessibleToiletsMode = false;
  private toiletLayerGroup: L.LayerGroup = L.layerGroup();
  private waterLayerGroup: L.LayerGroup = L.layerGroup();
  private bikeStationsLayerGroup: L.LayerGroup = L.layerGroup();
  private atmLayerGroup: L.LayerGroup = L.layerGroup();
  private lastPreloadingBounds = { lat1: 0, lng1: 0, lat2: 0, lng2: 0 };

  constructor(
    private overpassService: OverpassService,
    private settingsService: SettingsService,
    private storageService: StorageService
  ) { }

  ngOnInit() {

    this.initializeMap()

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;


        this.map.flyTo([latitude, longitude])
      });
    }


    this.settingsService.getSettings().subscribe(settings => {
      this.settings = settings;
      // this.reloadNodes();
    })
  }

  initializeMap(latitude: number = 47.404391, longitude: number = 9.744025) {
    console.log("init started")

    const savedPosition = this.storageService.getCoordinates()
    const lat = savedPosition.lat
    const long = savedPosition.long

      this.map = L.map('map', {
        center: [lat, long],
        zoom: 18,
        attributionControl: false,
        preferCanvas: true
      });

    L.control.locate({ flyTo: true, keepCurrentZoomLevel: true, locateOptions: { enableHighAccuracy: true }, icon: "fa fa-location-arrow" }).addTo(this.map).start();

    this.map.on('moveend', () => {

      this.storageService.setCoordinates(this.map.getBounds().getCenter().lat, this.map.getBounds().getCenter().lng)

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

    if (!this.settings.atm) {
      this.atmLayerGroup.clearLayers();
    }

    this.updateLoadingState()

    const mapCenter = this.map.getBounds().getCenter();

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
          this.bikeStationsLoaded = true;
          this.updateLoadingState()
          this.setBikeStationsMarker(nodes);
        });
    }

    if (this.settings.atm) {
      this.overpassService
        .getNodes(
          '"amenity"="atm"',
          mapCenter.lat - preloadingRadius,
          mapCenter.lng - preloadingRadius,
          mapCenter.lat + preloadingRadius,
          mapCenter.lng + preloadingRadius
        )
        .subscribe((nodes) => {
          this.atmsLoaded = true;
          this.updateLoadingState()
          this.setAtmMarker(nodes);
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
        this.callParent(node);
      });
      this.bikeStationsLayerGroup.addLayer(marker).addTo(this.map);
    });
  }

  setAtmMarker(nodes: OsmNode[]) {
    this.atmLayerGroup.clearLayers();
    nodes.forEach((node) => {
      const markerIcon = atmIcon;
      const marker = L.marker([node.lat, node.lon], { icon: markerIcon }).on('click', event => {
        this.callParent(node);
      });
      this.atmLayerGroup.addLayer(marker).addTo(this.map);
    });
  }

  callParent(data: OsmNode) {
    this.markerClicked.emit(JSON.stringify(data));
  }

  openSettingsModalInParent() {
    this.openSettingsModal.emit();
  }

  updateLoadingState() {
    const newLoadingState = (!this.watersLoaded && this.settings.water) || (!this.toiletsLoaded && this.settings.toilets) || (!this.bikeStationsLoaded && this.settings.bikeStations) || (!this.atmsLoaded && this.settings.atm);
    this.settingsService.updateLoadingState(newLoadingState)
  }
}
