import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { HugeiconsIconComponent } from '@hugeicons/angular';
import { TagDisplay } from 'src/app/models/TagDisplay';

@Component({
  selector: 'app-tag-info',
  imports: [CommonModule, HugeiconsIconComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './tag-info.component.html',
})
export class TagInfoComponent {
 readonly tag = input.required<TagDisplay>();
}
