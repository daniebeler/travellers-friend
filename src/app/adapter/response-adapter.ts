import { Injectable } from '@angular/core';
import { Adapter } from './adapter';
import { OsmNode } from '../models/OsmNode';

@Injectable({
  providedIn: 'root',
})
export class ResponseAdapter implements Adapter<OsmNode | null> {
  adapt(item: any): OsmNode | null {
    if (!item) return null;

    const tags = item.tags || {};

    if (item.type === 'node' && typeof item.lat === 'number' && typeof item.lon === 'number') {
      return new OsmNode(item.id, item.lat, item.lon, tags);
    }

    if (item.type === 'way' && item.center?.lat != null && item.center?.lon != null) {
      return new OsmNode(item.id, item.center.lat, item.center.lon, tags);
    }

    console.warn(`[ResponseAdapter] Skipping unhandled or malformed element:`, item);
    return null;
  }
}
