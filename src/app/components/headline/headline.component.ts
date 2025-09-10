import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-headline',
    templateUrl: './headline.component.html',
    standalone: true,
    imports: [
      CommonModule
    ]
})
export class HeadlineComponent {

  @Input() headline = '';
  @Input() color = '';
}
