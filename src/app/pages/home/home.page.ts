import { Component, OnInit } from '@angular/core';
import { Settings } from 'src/app/models/Settings';
import { SettingsService } from 'src/app/services/settings.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  modalIsOpen = false;
  isSettingsModalOpen = false;
  nodeTags: Array<any>;
  tags: any;
  nodeId: number;
  heading = '';
  isLoadingData = false;

  settings: Settings;

  constructor(
    private settingsService: SettingsService
  ) {
  }


  ngOnInit() {
    this.settingsService.getSettings().subscribe(settings => {
      this.settings = settings;
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
    } else if (this.tags.amenity === 'bicycle_repair_station') {
      this.heading = 'Bike Repair Station'
    } else if (this.tags.fee === 'no') {
      this.heading = 'Free Toilet';
    } else if (this.tags.fee === 'yes') {
      this.heading = 'Paid Toilet';
    } else {
      this.heading = 'Toilet';
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
  }
}
