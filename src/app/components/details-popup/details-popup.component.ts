import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Tags } from 'src/app/models/Tags';

@Component({
  selector: 'app-details-popup',
  imports: [CommonModule],
  templateUrl: './details-popup.component.html',
})
export class DetailsPopupComponent {
  @Input() tags: Tags;
  @Input() nodeId: number;
}
