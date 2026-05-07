import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NgxMapLibreGLModule,
  MapComponent as MglMapComponent,
} from '@maplibre/ngx-maplibre-gl';
import {
  LucideAngularModule,
  LocateIcon,
  LocateFixedIcon,
  LocateOffIcon,
} from 'lucide-angular';
import * as maplibregl from 'maplibre-gl';

import { OsmNode } from 'src/app/models/OsmNode';
import { Settings } from 'src/app/models/Settings';
import { OverpassService } from 'src/app/services/overpass.service';
import { SettingsService } from 'src/app/services/settings.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  standalone: true,
  imports: [CommonModule, NgxMapLibreGLModule, LucideAngularModule],
})
export class MyMapComponent implements OnInit {
  @ViewChild(MglMapComponent) mapComponent!: MglMapComponent;

  readonly locateIcon = LocateIcon;
  readonly locateFixedIcon = LocateFixedIcon;
  readonly locateOffIcon = LocateOffIcon;

  @Output() markerClicked = new EventEmitter<string>();
  @Output() openSettingsModal = new EventEmitter();

  settings: Settings;
  currentStyle = 'https://tiles.openfreemap.org/styles/bright';
  initialCoords: { lat: number; long: number };
  currentPosition: [number, number] | null = null;
  isAtCurrentLocation = false;
  private mapInstance: maplibregl.Map;

  private sourcesReady = false;

  // Unified data state for the map sources
  mapSources = [
    { id: 'toilets', color: '#e11d48' },
    { id: 'water', color: '#2563eb' },
    { id: 'bike', color: '#16a34a' },
    { id: 'atm', color: '#9333ea' },
    { id: 'pingpong', color: '#ea580c' },
    { id: 'fitness', color: '#0891b2' },
  ];

  constructor(
    private overpassService: OverpassService,
    private settingsService: SettingsService,
    private storageService: StorageService,
  ) {
    this.initialCoords = this.storageService.getCoordinates();
  }

  ngOnInit() {
    this.settingsService.getSettings().subscribe((s) => {
      this.settings = s;
      //this.reloadNodes();
    });
    this.settingsService.getTileMode().subscribe((v) => {
      this.currentStyle =
        v === 1
          ? 'https://tiles.openfreemap.org/styles/bright'
          : 'https://tiles.openfreemap.org/styles/hybrid'; // Or Esri URL
    });

    if (navigator.geolocation) {
      navigator.geolocation.watchPosition((pos) => {
        this.currentPosition = [pos.coords.longitude, pos.coords.latitude];
      });
    }
  }

  private async registerMarkerIcons() {
    const PREFIX = 'custom-';
    const icons = [
      { id: 'toilets', url: 'assets/pointer/toilet.png' },
      { id: 'water', url: 'assets/pointer/water.png' },
      { id: 'bike', url: 'assets/pointer/bike-station.png' },
      { id: 'atm', url: 'assets/pointer/atm.png' },
      { id: 'pingpong', url: 'assets/pointer/table-tennis.png' },
      { id: 'fitness', url: 'assets/pointer/fitness.png' },
    ];

    for (const icon of icons) {
      if (this.mapInstance.hasImage(PREFIX + icon.id)) continue;

      const image = await this.mapInstance.loadImage(icon.url);

      if (!image || !image.data) continue;

      this.mapInstance.addImage(PREFIX + icon.id, image.data);
    }
  }

  async onMapLoad(map: maplibregl.Map) {
    this.mapInstance = map;

    map.once('idle', async () => {
      await this.registerMarkerIcons();
      this.initializeSources();
      this.sourcesReady = true;
      this.reloadNodes();
    });
  }

  private initializeSources() {
    if (!this.mapInstance) return;

    for (const source of this.mapSources) {
      if (!this.mapInstance.getSource(source.id)) continue;

      const empty: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: [],
      };

      (
        this.mapInstance.getSource(source.id) as maplibregl.GeoJSONSource
      ).setData(empty);

      console.log(
        'checking source:',
        source.id,
        this.mapInstance.getSource(source.id),
      );
    }

    console.log('sources available:', this.mapInstance.getStyle().sources);
  }

  private lastPreloadingCenter: maplibregl.LngLat | null = null;
  private lastPreloadingZoom: number | null = null;
  private readonly MOVE_THRESHOLD_METERS = 500;
  private readonly ZOOM_THRESHOLD = 0.5;

  onMapMove(event: any) {
    const map = event.target as maplibregl.Map;
    const currentCenter = map.getCenter();
    const currentZoom = map.getZoom();
    this.storageService.setCoordinates(currentCenter.lat, currentCenter.lng);
  }

  reloadNodes() {
    if (!this.mapInstance || !this.settings) return;

    const bounds = this.mapInstance.getBounds();
    const mapCenter = bounds.getCenter();
    const radius = 0.05;

    if (this.settings.toilets) {
      this.overpassService
        .getNodes(
          '"amenity"="toilets"',
          mapCenter.lat - radius,
          mapCenter.lng - radius,
          mapCenter.lat + radius,
          mapCenter.lng + radius,
        )
        .subscribe((nodes) => {
          this.updateSource('toilets', nodes);
        });
    }

    if (this.settings.water) {
      this.overpassService
        .getNodesOr(
          '"amenity"="drinking_water"',
          '"man_made"="water_tap"',
          mapCenter.lat - radius,
          mapCenter.lng - radius,
          mapCenter.lat + radius,
          mapCenter.lng + radius,
        )
        .subscribe((nodes) => {
          this.updateSource('water', nodes);
        });
    }
  }

  private updateSource(sourceId: string, nodes: OsmNode[]) {
    const source = this.mapInstance.getSource(
      sourceId,
    ) as maplibregl.GeoJSONSource;
    if (!source) {
      console.error(`Source ${sourceId} not found in map style`);
      return;
    }

    const geojson: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: nodes.map((n) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [n.lon, n.lat],
        },
        properties: { 'icon-name': 'custom-' + sourceId, },
      })),
    };

    source.setData(geojson);
    console.log(`Updated ${sourceId} with ${nodes.length} dots.`);
  }


  onMarkerClick(evt: any) {
    const feature = evt.features[0];
    if (feature) {
      this.markerClicked.emit(feature.properties.originalNode);
    }
  }

  goToCurrentLocation() {
    if (this.currentPosition) {
      this.mapInstance.flyTo({ center: this.currentPosition, zoom: 18 });
    }
  }
}
