import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MapComponent } from './map.component';
import { NgxLeafletLocateModule } from '@runette/ngx-leaflet-locate';
import { HeadlineComponent } from '../headline/headline.component';

@NgModule({
  declarations: [
    MapComponent,
    HeadlineComponent
  ],
  exports: [
    MapComponent,
    HeadlineComponent
  ],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule,
    NgxLeafletLocateModule
  ],
  providers: [
    Geolocation
  ]
})
export class ComponentsModule { }
