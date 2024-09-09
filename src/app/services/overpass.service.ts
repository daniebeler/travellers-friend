import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { OsmNode } from '../models/OsmNode';
import { ResponseAdapter } from '../adapter/response-adapter';

const TIMEOUT = 10;

@Injectable({
  providedIn: 'root'
})
export class OverpassService {

  api = 'https://overpass-api.de/api/interpreter?data=';


  constructor(
    private http: HttpClient,
    private responseAdapter: ResponseAdapter
  ) { }

  getNodes(nodeType: string, lat1, lon1, lat2, lon2): Observable<OsmNode[]> {
    const query =
      '[bbox:' + lat1 + ',' + lon1 + ',' + lat2 + ',' + lon2 + ']' +
      '[out:json]' +
      '[timeout:' + TIMEOUT + '];' +
      '(node[' + nodeType + ']; way[' + nodeType + '];);' +
      'out center;';
    return this.http.get<any>(this.api + encodeURIComponent(query)).pipe(map(
      data => data.elements.map(element => this.responseAdapter.adapt(element)))
    );
  }

  getNodes2(nodeType1: string, nodeType2: string, lat1, lon1, lat2, lon2): Observable<OsmNode[]> {
    const query =
      '[bbox:' + lat1 + ',' + lon1 + ',' + lat2 + ',' + lon2 + ']' +
      '[out:json]' +
      '[timeout:' + TIMEOUT + '];' +
      '(node[' + nodeType1 + '][' + nodeType2 + '];' +
      'way[' + nodeType1 + '][' + nodeType2 + '];);' +
      'out center;';
    return this.http.get<any>(this.api + encodeURIComponent(query)).pipe(map(
      data => data.elements.map(element => this.responseAdapter.adapt(element)))
    );
  }

  getNodesOr(nodeType1: string, nodeType2: string, lat1, lon1, lat2, lon2): Observable<OsmNode[]> {
    const query =
      '[bbox:' + lat1 + ',' + lon1 + ',' + lat2 + ',' + lon2 + ']' +
      '[out:json]' +
      '[timeout:' + TIMEOUT + '];' +
      '(node[' + nodeType1 + '];' +
      'way[' + nodeType1 + '];' +
      'node[' + nodeType2 + '];' +
      'way[' + nodeType2 + '];);' +
      'out center;';
    return this.http.get<any>(this.api + encodeURIComponent(query)).pipe(map(
      data => data.elements.map(element => this.responseAdapter.adapt(element)))
    );
  }
}
