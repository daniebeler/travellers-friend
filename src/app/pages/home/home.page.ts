import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MapComponent } from 'src/app/components/map/map.component';
import { Settings } from 'src/app/models/Settings';
import { SettingsService } from 'src/app/services/settings.service';
import { LucideAngularModule, LayersIcon, ListFilterIcon } from 'lucide-angular';
import { PopupComponent } from 'src/app/components/popup/popup.component';

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
    standalone: true,
    imports: [
      CommonModule,
      MapComponent,
      LucideAngularModule,
      PopupComponent
    ]
})
export class HomePage implements OnInit {
  readonly layersIcon = LayersIcon;
  readonly filterIcon = ListFilterIcon;

  modalIsOpen = false;
  isSettingsModalOpen = false;
  isTileLayerModalOpen = false;
  isAboutModalOpen = false;
  nodeTags: Array<any>;
  tags: any;
  nodeId: number;
  heading = '';
  modalClass = '';
  modalColor = '';
  isLoadingData = false;

  settings: Settings;

  tileMode = 0;

  constructor(
    private settingsService: SettingsService
  ) {
  }


  ngOnInit() {
    this.settingsService.getSettings().subscribe(settings => {
      this.settings = settings;
    })

    this.settingsService.getTileMode().subscribe(tileMode => {
      this.tileMode = tileMode;
    })

    this.settingsService.getLoadingState().subscribe(loadingState => {
      this.isLoadingData = loadingState;
    })
  }

  openModal(data: string) {
    this.nodeId = JSON.parse(data).id;
    this.tags = JSON.parse(data).tags;

    if (this.tags.amenity === 'drinking_water') {
      this.heading = 'Drinking Water';
      this.modalClass = 'water-modal';
      this.modalColor = getComputedStyle(document.documentElement).getPropertyValue('--color-water');
    } else if (this.tags.amenity === 'bicycle_repair_station') {
      this.heading = 'Bike Repair Station'
      this.modalClass = 'bike-modal';
      this.modalColor = getComputedStyle(document.documentElement).getPropertyValue('--color-bike');
    } else if (this.tags.amenity === 'atm') {
      this.heading = 'ATM machine'
      this.modalClass = 'atm-modal';
      this.modalColor = getComputedStyle(document.documentElement).getPropertyValue('--color-atm');
    } else if (this.tags.amenity === 'bank') {
      this.heading = 'Bank with ATM'
      this.modalClass = 'atm-modal';
      this.modalColor = getComputedStyle(document.documentElement).getPropertyValue('--color-atm');
    } else if (this.tags.leisure === 'fitness_station') {
      this.heading = 'Outdoor Gym'
      this.modalClass = 'fitness-modal';
      this.modalColor = getComputedStyle(document.documentElement).getPropertyValue('--color-fitness');
    } else if (this.tags.leisure === 'pitch') {
      this.heading = 'Table Tennis Table'
      this.modalClass = 'tabletennis-modal';
      this.modalColor = getComputedStyle(document.documentElement).getPropertyValue('--color-tabletennis');
    } else if (this.tags.fee === 'no') {
      this.heading = 'Free Toilet';
      this.modalClass = 'toilet-modal';
      this.modalColor = getComputedStyle(document.documentElement).getPropertyValue('--color-toilet');
    } else if (this.tags.fee === 'yes') {
      this.heading = 'Paid Toilet';
      this.modalClass = 'toilet-modal';
      this.modalColor = getComputedStyle(document.documentElement).getPropertyValue('--color-toilet');
    } else {
      this.heading = 'Toilet';
      this.modalClass = 'toilet-modal';
      this.modalColor = getComputedStyle(document.documentElement).getPropertyValue('--color-toilet');
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

  settingsChanged(key: string, event: any) {

    if (key === 'water') {
      this.settings.water = event.target.checked
      this.settingsService.updateSettings(this.settings)
    }

    if (key === 'toilets') {
      this.settings.toilets = event.target.checked
      this.settingsService.updateSettings(this.settings)
    }

    if (key === 'bikeStations') {
      this.settings.bikeStations = event.target.checked
      this.settingsService.updateSettings(this.settings)
    }

    if (key === 'atm') {
      this.settings.atm = event.target.checked
      this.settingsService.updateSettings(this.settings)
    }

    if (key === 'tabletennis') {
      this.settings.tabletennis = event.target.checked
      this.settingsService.updateSettings(this.settings)
    }

    if (key === 'fitness') {
      this.settings.fitness = event.target.checked
      this.settingsService.updateSettings(this.settings)
    }
  }
}
