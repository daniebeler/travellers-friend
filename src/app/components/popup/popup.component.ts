import { animate, style, transition, trigger } from '@angular/animations';

import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ChangeDetectionStrategy
} from '@angular/core';
import { HugeiconsIconComponent } from '@hugeicons/angular';
import { X } from '@hugeicons/core-free-icons';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  imports: [HugeiconsIconComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  animations: [
    trigger('fadeScale', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
      transition(':leave', [
        animate(
          '150ms ease-in',
          style({ opacity: 0, transform: 'scale(0.95)' })
        ),
      ]),
    ]),
    trigger('fadeBackdrop', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-out', style({ opacity: 1 })),
      ]),
      transition(':leave', [animate('150ms ease-in', style({ opacity: 0 }))]),
    ]),
  ],
})
export class PopupComponent implements OnChanges, OnDestroy {
  readonly closeIcon = X;

  @Input() show = false;
  @Input() title = '';
  @Output() close = new EventEmitter<void>();

  ngOnChanges(changes: SimpleChanges) {
    if (changes['show']) {
      if (this.show) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }
  }

  ngOnDestroy() {
    document.body.style.overflow = '';
  }

  closePopup() {
    this.close.emit();
  }
}
