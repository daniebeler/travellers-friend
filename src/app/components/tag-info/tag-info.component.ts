import { CommonModule } from '@angular/common';
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { HugeiconsIconComponent } from '@hugeicons/angular';
import { TagDisplay } from 'src/app/models/TagDisplay';

@Component({
  selector: 'app-tag-info',
  imports: [CommonModule, HugeiconsIconComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './tag-info.component.html',
})
export class TagInfoComponent {
 @Input() tag!: TagDisplay;
}
