import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MapComponent } from './map.component';

@NgModule({
  declarations: [
    MapComponent
  ],
  exports: [
    MapComponent
  ],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule
  ],
  providers: [
    Geolocation
  ]
})
export class ComponentsModule { }
