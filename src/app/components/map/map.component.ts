import {
  Component,
  OnInit,
  signal,
  ChangeDetectionStrategy,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NgxMapLibreGLModule,
} from '@maplibre/ngx-maplibre-gl';
import * as maplibregl from 'maplibre-gl';

import geohash from 'ngeohash';
import { OsmNode } from 'src/app/models/OsmNode';
import { Settings } from 'src/app/models/Settings';
import { OverpassService } from 'src/app/services/overpass.service';
import { SettingsService } from 'src/app/services/settings.service';
import { StorageService } from 'src/app/services/storage.service';
import { CacheService } from 'src/app/services/cache.service';
import {
  catchError,
  debounce,
  from,
  mergeMap,
  Observable,
  of,
  Subject,
  tap,
  timer,
} from 'rxjs';
import { CategoryType } from 'src/app/models/Category';
import { HugeiconsIconComponent } from '@hugeicons/angular';
import { LocationIcon, LocationOfflineIcon } from '@hugeicons/core-free-icons';
import { setWorkerUrl, StyleSpecification } from 'maplibre-gl';

const SATELLITE_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    'esri-satellite': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      attribution: 'Tiles &copy; Esri',
    },
  },
  layers: [
    {
      id: 'esri-satellite-layer',
      type: 'raster',
      source: 'esri-satellite',
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [CommonModule, NgxMapLibreGLModule, HugeiconsIconComponent],
})
export class MyMapComponent implements OnInit {

  readonly locateIcon = LocationIcon;
  readonly locateFixedIcon = LocationOfflineIcon;
  readonly locateOffIcon = LocationIcon;

  readonly markerClicked = output<OsmNode>();
  readonly openSettingsModal = output<void>();

  settings: Settings = new Settings();
  currentStyle: string | maplibregl.StyleSpecification = 'https://tiles.openfreemap.org/styles/bright';
  initialCoords: { lat: number; long: number };
  currentPosition: [number, number] | null = null;
  isAtCurrentLocation = false;
  private mapInstance!: maplibregl.Map;

  private sourcesReady = false;

  requestCount = signal<number>(0);

  // Unified data state for the map sources
  mapSources: { id: CategoryType; color: string }[] = [
    { id: 'toilets', color: '#e11d48' },
    { id: 'water', color: '#2563eb' },
    { id: 'bike', color: '#16a34a' },
    { id: 'atm', color: '#9333ea' },
    { id: 'pingpong', color: '#ea580c' },
    { id: 'fitness', color: '#0891b2' },
  ];

  private loadedGeohashCategories = new Set<string>();
  private pendingGeohashCategories = new Set<string>();
  private categoryNodes = new Map<string, Map<number, OsmNode>>();

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
    setWorkerUrl(new URL('maplibre-gl-worker.mjs', document.baseURI).href);
    this.settingsService.getSettings().subscribe((s) => {
      this.settings = s;

      this.updateVisibleLayers();
      if (this.sourcesReady) {
        this.reloadNodes();
      }
    });
    this.settingsService.getTileMode().subscribe((v) => {
      this.currentStyle =
        v === 1
          ? 'https://tiles.openfreemap.org/styles/bright'
          : SATELLITE_STYLE;
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
      this.updateVisibleLayers();
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

  private updateVisibleLayers() {
    if (!this.mapInstance) return;

    const activeCategories = this.mapSources
      .filter((s) => this.settings[s.id as keyof Settings])
      .map((s) => s.id);

    for (const source of this.mapSources) {
      if (!activeCategories.includes(source.id)) {
        // Clear layer if deactivated in settings
        const mapSource = this.mapInstance.getSource(
          source.id,
        ) as maplibregl.GeoJSONSource;
        if (mapSource)
          mapSource.setData({ type: 'FeatureCollection', features: [] });
      } else {
        // Re-apply nodes if re-activated
        this.updateMapSource(source.id);
      }
    }
  }

  reloadNodes() {
    if (!this.mapInstance || !this.settings) return;

    const bounds = this.mapInstance.getBounds();
    const zoom = this.mapInstance.getZoom();

    // Guard: Don't fetch data if zoomed out too far (prevents API abuse)
    if (zoom < 13) return;

    const activeCategories: CategoryType[] = this.mapSources
      .filter((s) => this.settings[s.id as keyof Settings])
      .map((s) => s.id);

    if (activeCategories.length === 0) return;

    const visibleGeohashes = this.calculateRequiredChunks(bounds);
    const tasks = new Map<string, CategoryType[]>();

    // Determine strictly what needs to be fetched
    for (const hash of visibleGeohashes) {
      const missingForHash = activeCategories.filter(
        (cat) =>
          !this.loadedGeohashCategories.has(`${hash}_${cat}`) &&
          !this.pendingGeohashCategories.has(`${hash}_${cat}`),
      );

      if (missingForHash.length > 0) {
        tasks.set(hash, missingForHash);
      }
    }

    // Guard: Only fetch if there's actual missing data in the current bounds
    if (tasks.size === 0) return;

    const taskArray = Array.from(tasks.entries());

    from(taskArray)
      .pipe(
        mergeMap(([hash, categories]) => {
          return this.fetchDataForGeohash(hash, categories);
        }, 2),
      )
      .subscribe();
  }

  private fetchDataForGeohash(
    geohashKey: string,
    activeCategories: CategoryType[],
  ): Observable<any> {
    const { cached, missing } = this.cacheService.getAvailableAndMissing(
      geohashKey,
      activeCategories,
    );

    // 1. Daten aus dem Cache verarbeiten & loggen
    if (cached.length > 0) {
      const cachedCategories = cached.map((c) => c.categoryId).join(', ');
      console.log(
        `[CACHE] Hit for geohash '${geohashKey}' -> Categories: [${cachedCategories}]`,
      );

      const cachedCategoriesUpdated = new Set<string>();

      for (const res of cached) {
        this.addNodesToGlobalList(res.categoryId, res.nodes);
        this.loadedGeohashCategories.add(`${geohashKey}_${res.categoryId}`);
        cachedCategoriesUpdated.add(res.categoryId);
      }

      this.updateMapSources(Array.from(cachedCategoriesUpdated));
    }

    // 2. Fehlende Kategorien per API abrufen & loggen
    if (missing.length > 0) {
      console.log(
        `[API] Request for geohash '${geohashKey}' -> Fetching missing categories: [${missing.join(', ')}]`,
      );

      for (const cat of missing) {
        this.pendingGeohashCategories.add(`${geohashKey}_${cat}`);
      }

      this.requestCount.update((count) => count + 1);

      return this.overpassService.getNodesByGeohash(geohashKey, missing).pipe(
        tap({
          next: (results) => {
            console.log(
              `[API] Success for geohash '${geohashKey}' -> Received ${results.length} category dataset(s)`,
            );

            const apiCategoriesUpdated = new Set<string>();
            for (const res of results) {
              this.cacheService.set(geohashKey, res.categoryId, res.nodes);
              this.addNodesToGlobalList(res.categoryId, res.nodes);
              this.loadedGeohashCategories.add(
                `${geohashKey}_${res.categoryId}`,
              );
              apiCategoriesUpdated.add(res.categoryId);

              this.pendingGeohashCategories.delete(
                `${geohashKey}_${res.categoryId}`,
              );
            }
            if (apiCategoriesUpdated.size > 0) {
              this.updateMapSources(Array.from(apiCategoriesUpdated));
            }
          },
          error: (err) => {
            console.error(
              `[API] Failed to fetch data for geohash '${geohashKey}':`,
              err,
            );

            for (const cat of missing) {
              this.pendingGeohashCategories.delete(`${geohashKey}_${cat}`);
            }
          },
        }),
        catchError(() => of(null)),
      );
    } else {
      console.log(
        `[CACHE] All requested categories for geohash '${geohashKey}' served from cache. No API request needed.`,
      );

      return of(null);
    }
  }

  calculateRequiredChunks(bounds: maplibregl.LngLatBounds): string[] {
    const south = bounds.getSouth();
    const west = bounds.getWest();
    const north = bounds.getNorth();
    const east = bounds.getEast();

    return geohash.bboxes(south, west, north, east, 5);
  }

  private addNodesToGlobalList(categoryId: string, nodes: OsmNode[]) {
    if (!this.categoryNodes.has(categoryId)) {
      this.categoryNodes.set(categoryId, new Map());
    }
    const catMap = this.categoryNodes.get(categoryId)!;
    for (const node of nodes) {
      catMap.set(node.id, node);
    }
  }

  private updateMapSources(categoryIds: string[]) {
    for (const catId of categoryIds) {
      this.updateMapSource(catId);
    }
  }

  private updateMapSource(sourceId: string) {
    if (!this.mapInstance) return;
    const source = this.mapInstance.getSource(
      sourceId,
    ) as maplibregl.GeoJSONSource;
    if (!source) return;

    const catMap = this.categoryNodes.get(sourceId);
    const nodes = catMap ? Array.from(catMap.values()) : [];

    const geojson: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: nodes.map((n) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [n.lon, n.lat],
        },
        properties: {
          'icon-name': 'custom-' + sourceId,
          originalNode: JSON.stringify(n),
        },
      })),
    };

    source.setData(geojson);
  }

  onMarkerClick(evt: any) {
    const feature = evt.features[0];
    if (feature && feature.properties?.originalNode) {
      try {
        const originalNode =
          typeof feature.properties.originalNode === 'string'
            ? JSON.parse(feature.properties.originalNode)
            : feature.properties.originalNode;

        this.markerClicked.emit(originalNode);
      } catch (e) {
        console.error('Error parsing marker node data:', e);
      }
    }
  }

  goToCurrentLocation() {
    if (this.currentPosition) {
      this.mapInstance.flyTo({ center: this.currentPosition, zoom: 18 });
    }
  }
}
