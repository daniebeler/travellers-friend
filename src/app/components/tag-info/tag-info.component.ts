import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { HugeiconsIconComponent } from '@hugeicons/angular';
import { LucideAngularModule } from 'lucide-angular';
import { TagDisplay } from 'src/app/models/TagDisplay';

@Component({
  selector: 'app-tag-info',
  imports: [CommonModule, HugeiconsIconComponent],
  templateUrl: './tag-info.component.html',
})
export class TagInfoComponent {
 @Input() tag!: TagDisplay;
}
