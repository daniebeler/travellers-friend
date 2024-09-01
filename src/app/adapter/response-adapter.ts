import { Injectable } from '@angular/core';
import { Adapter } from './adapter';
import { OsmNode } from '../models/OsmNode';

@Injectable({
  providedIn: 'root',
})

export class ResponseAdapter implements Adapter<OsmNode> {

  adapt(item: any): OsmNode {
    if(item.type == "node") {
      return new OsmNode(item.id, item.lat, item.lon, item.tags);
    }

    else if (item.type == "way") {
        var lat = item.center.lat
        var lon = item.center.lon
        return new OsmNode(item.id, lat, lon, item.tags)
      }
  }
}
