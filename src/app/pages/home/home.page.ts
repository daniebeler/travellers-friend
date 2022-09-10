import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  modalIsOpen = false;
  nodeTags: Array<any>;
  nodeId: number;
  heading = '';

  constructor() { }

  openModal(data: string) {
    this.nodeId = JSON.parse(data).id;
    const tags = JSON.parse(data).tags;

    if (tags.fee === 'no') {
      this.heading = 'Free Toilet';
    } else if (tags.fee === 'yes') {
      this.heading = 'Paid Toilet';
    } else if (tags.amenity === 'drinking_water') {
      this.heading = 'Drinking Water';
    } else {
      this.heading = 'Toilet';
    }

    this.nodeTags = new Array();
    for (const tag in tags) {
      if (tags.hasOwnProperty(tag)) {
        this.nodeTags.push({ key: tag, value: tags[tag] });
      }
    }
    this.modalIsOpen = true;
  }

  goToOsm() {
    window.open('https://www.openstreetmap.org/node/' + this.nodeId, '_blank');
  }
}
