import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [RouterOutlet],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true
})
export class AppComponent {
  constructor() {}
}
