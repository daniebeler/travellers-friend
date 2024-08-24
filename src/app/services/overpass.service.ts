import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { OsmNode } from '../models/OsmNode';

const TIMEOUT = 10;

@Injectable({
  providedIn: 'root'
})
export class OverpassService {

  api = 'https://overpass-api.de/api/interpreter?data=';


  constructor(
    private http: HttpClient,

  ) { }

  getNodes(nodeType: string, lat1, lon1, lat2, lon2): Observable<OsmNode[]> {
    const query =
      '[bbox:' + lat1 + ',' + lon1 + ',' + lat2 + ',' + lon2 + ']' +
      '[out:json]' +
      '[timeout:' + TIMEOUT + '];' +
      'node[' + nodeType + '];' +
      'out;';
    return this.http.get<any>(this.api + encodeURIComponent(query)).pipe(map(
      data => data.elements.map(element => new OsmNode(element)))
    );
  }

  getNodes2(nodeType1: string, nodeType2: string, lat1, lon1, lat2, lon2): Observable<OsmNode[]> {
    const query =
      '[bbox:' + lat1 + ',' + lon1 + ',' + lat2 + ',' + lon2 + ']' +
      '[out:json]' +
      '[timeout:' + TIMEOUT + '];' +
      'node[' + nodeType1 + '][' + nodeType2 + '];' +
      'out;';
    return this.http.get<any>(this.api + encodeURIComponent(query)).pipe(map(
      data => data.elements.map(element => new OsmNode(element)))
    );
  }

  getNodesOr(nodeType1: string, nodeType2: string, lat1, lon1, lat2, lon2): Observable<OsmNode[]> {
    const query =
      '[bbox:' + lat1 + ',' + lon1 + ',' + lat2 + ',' + lon2 + ']' +
      '[out:json]' +
      '[timeout:' + TIMEOUT + '];' +
      '(node[' + nodeType1 + '];' +
      'node[' + nodeType2 + '];);' +
      'out;';
    return this.http.get<any>(this.api + encodeURIComponent(query)).pipe(map(
      data => data.elements.map(element => new OsmNode(element)))
    );
  }
}
