import { Injectable } from '@angular/core';
import { Adapter } from './adapter';
import { OsmNode } from '../models/OsmNode';

@Injectable({
  providedIn: 'root',
})
export class ResponseAdapter implements Adapter<OsmNode> {
  adapt(item: any): OsmNode {
    if (item.type === 'node') {
      return new OsmNode(item.id, item.lat, item.lon, item.tags);
    }

    if (item.type === 'way' && item.center) {
      return new OsmNode(item.id, item.center.lat, item.center.lon, item.tags);
    }

    throw new Error(`Unsupported or invalid Overpass element type: ${item?.type}`);
  }
}
