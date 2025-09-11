import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MapComponent } from 'src/app/components/map/map.component';
import { Settings } from 'src/app/models/Settings';
import { SettingsService } from 'src/app/services/settings.service';
import {
  LucideAngularModule,
  LayersIcon,
  ListFilterIcon,
} from 'lucide-angular';
import { PopupComponent } from 'src/app/components/popup/popup.component';
import { Category } from 'src/app/models/Category';
import { Tags } from 'src/app/models/Tags';
import { DetailsPopupComponent } from 'src/app/components/details-popup/details-popup.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  standalone: true,
  imports: [
    CommonModule,
    MapComponent,
    LucideAngularModule,
    PopupComponent,
    DetailsPopupComponent,
  ],
})
export class HomePage implements OnInit {
  readonly layersIcon = LayersIcon;
  readonly filterIcon = ListFilterIcon;

  modalIsOpen = false;
  isSettingsModalOpen = false;
  isTileLayerModalOpen = false;
  isAboutModalOpen = false;
  nodeTags: Array<any>;
  tags: Tags;
  nodeId: number;
  heading = '';
  modalClass = '';
  modalColor = '';
  isLoadingData = false;

  settings: Settings;

  tileMode = 0;

  categories: Category[] = [
    { key: 'water', label: 'Drinking Water', color: 'bg-water' },
    { key: 'toilets', label: 'Toilets', color: 'bg-toilet' },
    { key: 'bikeStations', label: 'Bike Repair Stations', color: 'bg-bike' },
    { key: 'atm', label: 'ATMs', color: 'bg-atm' },
    {
      key: 'tabletennis',
      label: 'Table Tennis Tables',
      color: 'bg-tabletennis',
    },
    { key: 'fitness', label: 'Outdoor Gyms', color: 'bg-fitness' },
  ];

  constructor(private settingsService: SettingsService) {}

  ngOnInit() {
    this.settingsService.getSettings().subscribe((settings) => {
      this.settings = settings;
    });

    this.settingsService.getTileMode().subscribe((tileMode) => {
      this.tileMode = tileMode;
    });

    this.settingsService.getLoadingState().subscribe((loadingState) => {
      this.isLoadingData = loadingState;
    });
  }

  openModal(data: string) {
    this.nodeId = JSON.parse(data).id;
    this.tags = JSON.parse(data).tags;

    console.log(this.tags)

    if (this.tags.amenity === 'drinking_water') {
      this.heading = 'Drinking Water';
      this.modalClass = 'water-modal';
    } else if (this.tags.amenity === 'bicycle_repair_station') {
      this.heading = 'Bike Repair Station';
      this.modalClass = 'bike-modal';
    } else if (this.tags.amenity === 'atm') {
      this.heading = 'ATM machine';
      this.modalClass = 'atm-modal';
    } else if (this.tags.amenity === 'bank') {
      this.heading = 'Bank with ATM';
      this.modalClass = 'atm-modal';
    } else if (this.tags.leisure === 'fitness_station') {
      this.heading = 'Outdoor Gym';
      this.modalClass = 'fitness-modal';
    } else if (this.tags.leisure === 'pitch') {
      this.heading = 'Table Tennis Table';
      this.modalClass = 'tabletennis-modal';
    } else if (this.tags.fee === 'no') {
      this.heading = 'Free Toilet';
      this.modalClass = 'toilet-modal';
    } else if (this.tags.fee === 'yes') {
      this.heading = 'Paid Toilet';
      this.modalClass = 'toilet-modal';
    } else {
      this.heading = 'Toilet';
      this.modalClass = 'toilet-modal';
    }

    this.nodeTags = new Array();
    for (const tag in this.tags) {
      if (this.tags.hasOwnProperty(tag)) {
        if (tag !== 'amenity') {
          const obj = { key: tag, value: this.tags[tag] };
          if (obj.key === 'access' && obj.value === 'yes') {
            obj.value = 'public';
          }
          this.nodeTags.push(obj);
        }
      }
    }
    this.modalIsOpen = true;
  }

  openSettingsModal() {
    this.isSettingsModalOpen = true;
  }

  openTileLayerModal() {
    this.isTileLayerModalOpen = true;
  }

  openAboutModal() {
    this.isAboutModalOpen = true;
  }

  tileLayerChanged(mode: number) {
    this.settingsService.updateTileMode(mode);
  }

  toggleSetting(key: keyof Settings) {
    this.settings[key] = !this.settings[key];
    this.settingsService.updateSettings(this.settings);
  }
}
