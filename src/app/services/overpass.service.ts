import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class OverpassService {

  api = 'https://overpass-api.de/api/interpreter?data=';

  constructor(
    private http: HttpClient,

  ) { }

  getNodes(nodeType: string, lat1, lon1, lat2, lon2, timeout = 10, out = 'json'): Observable<any> {
    const query =
      '[bbox:' + lat1 + ',' + lon1 + ',' + lat2 + ',' + lon2 + ']' +
      '[out:' + out + ']' +
      '[timeout:' + timeout + '];' +
      'node[' + nodeType + '];' +
      'out;';
    return this.http.get<any>(this.api + encodeURIComponent(query));
  }
}
