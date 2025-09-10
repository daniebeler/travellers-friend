import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-headline',
    templateUrl: './headline.component.html',
    styleUrls: ['./headline.component.scss'],
    standalone: false
})
export class HeadlineComponent {

  @Input() headline = '';
  @Input() color = '';
}
