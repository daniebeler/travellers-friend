import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { OsmNode } from '../models/OsmNode';

@Injectable({
  providedIn: 'root'
})
export class OverpassService {

  api = 'https://overpass-api.de/api/interpreter?data=';

  constructor(
    private http: HttpClient,

  ) { }

  getNodes(nodeType: string, lat1, lon1, lat2, lon2, timeout = 10, out = 'json'): Observable<OsmNode[]> {
    const query =
      '[bbox:' + lat1 + ',' + lon1 + ',' + lat2 + ',' + lon2 + ']' +
      '[out:' + out + ']' +
      '[timeout:' + timeout + '];' +
      'node[' + nodeType + '];' +
      'out;';
    return this.http.get<any>(this.api + encodeURIComponent(query)).pipe(map(
      data => data.elements.map(element => new OsmNode(element)))
    );
  }
}
