import { Component } from '@angular/core';
import { OverpassService } from 'src/app/services/overpass.service';
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor(
    private overpassService: OverpassService,
  ) { }

  ngOnInit(): void {
    this.test();
  }

  test() {
    console.log('hola');
    this.overpassService.getNodes(
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
}
