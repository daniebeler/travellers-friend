import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  api = 'https://overpass-api.de/api/interpreter?data=';

  constructor(
    private http: HttpClient,
  ) { }

  ngOnInit(): void {

  }

  test() {
    console.log('hola');
    this.getNodes(
      '"amenity"="toilets"',
      '47.44027965714996',
      '9.673805236816404',
      '47.517200697839414',
      '9.818687438964844'
    ).subscribe((data) => {
      console.log('Data is here: ');

      console.log(data);

    });
  }



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
