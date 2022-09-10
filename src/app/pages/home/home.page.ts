import { Component } from '@angular/core';
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  modalIsOpen = false;
  nodeTags: Array<any>;

  constructor() { }

  openModal(tags: any) {
    this.nodeTags = new Array();
    for (const tag in tags) {
      if (tags.hasOwnProperty(tag)) {
        this.nodeTags.push({ key: tag, value: tags[tag] });
      }
    }
    this.modalIsOpen = true;
  }
}
