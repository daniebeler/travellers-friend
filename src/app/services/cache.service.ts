import { Injectable } from '@angular/core';
import { OsmNode } from '../models/OsmNode';

@Injectable({ providedIn: 'root' })
export class CacheService {
  private cache = new Map<string, { nodes: OsmNode[], timestamp: number }>();
  private readonly CACHE_TTL = 1000 * 60 * 60; // 1 hour
  private readonly GRID_SIZE = 0.01; // Approx 1.1km squares

  getGridKey(lat: number, lon: number, category: string): string {
  // Rounding to 2 decimal places creates roughly 1.1km x 1.1km chunks
  const gridLat = Math.floor(lat * 100);
  const gridLon = Math.floor(lon * 100);
  return `${category}-${gridLat}-${gridLon}`;
}

  get(key: string): OsmNode[] | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > this.CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }
    return entry.nodes;
  }

  set(key: string, nodes: OsmNode[]) {
    this.cache.set(key, { nodes, timestamp: Date.now() });
  }
}
