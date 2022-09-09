import { Component, OnInit } from '@angular/core';
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  modalIsOpen = false;

  constructor() { }

  ngOnInit(): void {

  }

  test() {
    console.log("test successful");
    this.modalIsOpen = true;
  }
  closeModal() {
    console.log("closing");
    
    this.modalIsOpen = false;
  }
}
