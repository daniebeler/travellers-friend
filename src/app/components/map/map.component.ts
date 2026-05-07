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
import { CacheService } from 'src/app/services/cache.service';
import { debounce, Subject, timer } from 'rxjs';

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

  private readonly CHUNK_SIZE = 0.01;

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

  private reloadSubject = new Subject<void>();
  private readonly MIN_ZOOM = 12;
  private readonly DEBOUNCE_MS = 800;

  constructor(
    private overpassService: OverpassService,
    private settingsService: SettingsService,
    private storageService: StorageService,
    private cacheService: CacheService,
  ) {
    this.initialCoords = this.storageService.getCoordinates();

    this.reloadSubject
      .pipe(debounce(() => timer(this.DEBOUNCE_MS)))
      .subscribe(() => {
        this.reloadNodes();
      });
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
    console.log('Stored positions');

    if (currentZoom < this.MIN_ZOOM) {
      console.warn('Zoom level too low, skipping fetch');
      return;
    }

    this.reloadSubject.next();
  }

  reloadNodes() {
    if (!this.mapInstance || !this.settings) return;

    const bounds = this.mapInstance.getBounds();
    const zoom = this.mapInstance.getZoom();

    // Guard: Don't fetch data if zoomed out too far (prevents API abuse)
    if (zoom < 13) return;

    // Identify which categories the user wants to see
    const activeCategories = this.mapSources.filter(
      (s) => this.settings[s.id as keyof Settings],
    );

    activeCategories.forEach((source) => {
      this.fetchDataForCategory(source.id, bounds);
    });
  }

  private async fetchDataForCategory(
    categoryId: string,
    bounds: maplibregl.LngLatBounds,
  ) {
    const chunks = this.calculateRequiredChunks(bounds);
    const allNodesForCategory: OsmNode[] = [];

    for (const chunk of chunks) {
      const key = this.cacheService.getGridKey(
        chunk.lat,
        chunk.lon,
        categoryId,
      );
      const cachedData = this.cacheService.get(key);

      if (cachedData) {
        allNodesForCategory.push(...cachedData);
        this.updateSource(categoryId, allNodesForCategory);
      } else {
        const lat1 = chunk.lat;
        const lon1 = chunk.lon;
        const lat2 = chunk.lat + this.CHUNK_SIZE;
        const lon2 = chunk.lon + this.CHUNK_SIZE;

        this.callOverpassByCategory(
          categoryId,
          lat1,
          lon1,
          lat2,
          lon2,
        ).subscribe((nodes) => {
          this.cacheService.set(key, nodes);

          allNodesForCategory.push(...nodes);
          this.updateSource(categoryId, allNodesForCategory);
        });
      }
    }
  }

  calculateRequiredChunks(
    bounds: maplibregl.LngLatBounds,
  ): Array<{ lat: number; lon: number }> {
    const center = bounds.getCenter();

    // Find the South-West corner of the chunk the center is currently in
    const lat = this.snapToGrid(center.lat);
    const lon = this.snapToGrid(center.lng);

    return [
      {
        // Using parseFloat/toFixed to prevent floating point errors (e.g. 47.1200000004)
        lat: parseFloat(lat.toFixed(4)),
        lon: parseFloat(lon.toFixed(4)),
      },
    ];
  }

  private snapToGrid(val: number): number {
    return Math.floor(val / this.CHUNK_SIZE) * this.CHUNK_SIZE;
  }

  private callOverpassByCategory(
    id: string,
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ) {
    switch (id) {
      case 'toilets':
        return this.overpassService.getNodes(
          '"amenity"="toilets"',
          lat1,
          lon1,
          lat2,
          lon2,
        );

      case 'water':
        return this.overpassService.getNodesOr(
          '"amenity"="drinking_water"',
          '"man_made"="water_tap"',
          lat1,
          lon1,
          lat2,
          lon2,
        );

      case 'bike':
        return this.overpassService.getNodes(
          '"amenity"="bicycle_repair_station"',
          lat1,
          lon1,
          lat2,
          lon2,
        );

      case 'atm':
        return this.overpassService.getNodesOr(
          '"amenity"="atm"',
          '"amenity"="bank"',
          lat1,
          lon1,
          lat2,
          lon2,
        );

      case 'pingpong':
        return this.overpassService.getNodes(
          '"sport"="table_tennis"',
          lat1,
          lon1,
          lat2,
          lon2,
        );

      case 'fitness':
        return this.overpassService.getNodes(
          '"leisure"="fitness_station"',
          lat1,
          lon1,
          lat2,
          lon2,
        );

      default:
        return this.overpassService.getNodes(
          `"amenity"="${id}"`,
          lat1,
          lon1,
          lat2,
          lon2,
        );
    }
  }

  private updateSource(sourceId: string, nodes: OsmNode[]) {
    const uniqueNodes = Array.from(
      new Map(nodes.map((node) => [node.id, node])).values(),
    );
    const source = this.mapInstance.getSource(
      sourceId,
    ) as maplibregl.GeoJSONSource;
    if (!source) {
      console.error(`Source ${sourceId} not found in map style`);
      return;
    }

    const geojson: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: uniqueNodes.map((n) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [n.lon, n.lat],
        },
        properties: { 'icon-name': 'custom-' + sourceId },
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
