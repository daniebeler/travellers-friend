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

  async onMapLoad(map: maplibregl.Map) {
    this.mapInstance = map;

    map.once('idle', () => {
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

    // 1. Always save position
    this.storageService.setCoordinates(currentCenter.lat, currentCenter.lng);

    return;

    // 2. Initial load
    if (!this.lastPreloadingCenter || this.lastPreloadingZoom === null) {
      this.lastPreloadingCenter = currentCenter;
      this.lastPreloadingZoom = currentZoom;
      this.reloadNodes();
      return;
    }

    // 3. Calculate changes
    const distance = this.lastPreloadingCenter.distanceTo(currentCenter);
    const zoomDiff = Math.abs(this.lastPreloadingZoom - currentZoom);

    // 4. Trigger if either threshold is hit
    if (
      distance > this.MOVE_THRESHOLD_METERS ||
      zoomDiff > this.ZOOM_THRESHOLD
    ) {
      this.lastPreloadingCenter = currentCenter;
      this.lastPreloadingZoom = currentZoom;
      this.reloadNodes();
    }
  }

  // --- NODE FETCHING & GEOJSON CONVERSION ---

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

  private updateSource(sourceId: string, nodes: any[]) {
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
          coordinates: [n.lon, n.lat], // CRITICAL: Ensure this is [Longitude, Latitude]
        },
        properties: {},
      })),
    };

    source.setData(geojson);
    console.log(`Updated ${sourceId} with ${nodes.length} dots.`);
  }

  // --- MAP INTERACTION ---

  onMarkerClick(evt: any) {
    const feature = evt.features[0];
    if (feature) {
      this.markerClicked.emit(JSON.stringify(feature.properties.originalNode));
    }
  }

  async zoomToCluster(evt: any, sourceId: string) {
    // Get the cluster feature that was clicked
    const features = this.mapInstance.queryRenderedFeatures(evt.point, {
      layers: [sourceId + '-cluster'],
    });

    if (!features.length) return;

    const clusterId = features[0].properties['cluster_id'];
    const source = this.mapInstance.getSource(
      sourceId,
    ) as maplibregl.GeoJSONSource;

    try {
      // Modern MapLibre: getClusterExpansionZoom returns a Promise
      const zoom = await source.getClusterExpansionZoom(clusterId);

      // We cast geometry to any to access coordinates easily
      const coordinates = (features[0].geometry as any).coordinates;

      this.mapInstance.easeTo({
        center: coordinates,
        zoom: zoom + 0.5, // Adding a tiny bit extra zoom for a better view
        duration: 500, // Smooth transition in milliseconds
      });
    } catch (err) {
      console.error('Error expanding cluster:', err);
    }
  }

  goToCurrentLocation() {
    if (this.currentPosition) {
      this.mapInstance.flyTo({ center: this.currentPosition, zoom: 18 });
    }
  }
}
