import { AfterViewInit, Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { OverpassService } from 'src/app/services/overpass.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit, AfterViewInit {
  map;
  private initialized: boolean = false;
  // eslint-disable-next-line @typescript-eslint/member-ordering
  public locateOptions:  L.Control.LocateOptions = {
    flyTo: false,
    keepCurrentZoomLevel: false,
    locateOptions: {
                 enableHighAccuracy: true,
               },
    icon: 'material-icons md-18 target icon',
    clickBehavior: {inView: 'stop',
                    outOfView: 'setView',
                    inViewNotFollowing: 'setView'}
  };

  constructor(private overpassService: OverpassService) { }

  ngOnInit() {

    if(navigator.geolocation) {
      navigator.geolocation.watchPosition(this.setGeoLocation.bind(this));
    }
  }


  setGeoLocation(position: { coords: { latitude: any; longitude: any } }) {
    const {
       coords: { latitude, longitude },
    } = position;

    if(!this.initialized){
      this.map = L.map('map', {
        center: [latitude, longitude],
        zoom: 13,
        renderer: L.canvas()
      });
      this.initialized = true;

      this.map.on('moveend', () => {
        const bounds = this.map.getBounds();
        console.log(bounds.getSouthWest());
        console.log(bounds.getNorthEast());


        this.overpassService.getNodes(
          '"amenity"="toilets"',
          bounds.getSouthWest().lat,
          bounds.getSouthWest().lng,
          bounds.getNorthEast().lat,
          bounds.getNorthEast().lng
        ).subscribe((data) => {
          console.log('fief is here: ');

          console.log(data);

        });;
      });

    }

    console.log(position);

    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      minZoom: 3,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    tiles.addTo(this.map);

    setTimeout(() => {
      this.map.invalidateSize();
    }, 0);

    }

  ngAfterViewInit(): void {
    // this.initMap();
  }

  // private initMap(): void {
    // this.map = L.map('map', {
    //   center: [51.505, -0.09],
    //   zoom: 13,
    //   renderer: L.canvas()
    // });

    // const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    //   maxZoom: 18,
    //   minZoom: 3,
    //   attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    // });

    // tiles.addTo(this.map);

    // setTimeout(() => {
    //   this.map.invalidateSize();
    // }, 0);
  // }
}
