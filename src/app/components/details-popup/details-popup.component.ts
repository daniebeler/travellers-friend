import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AccessibilityIcon, ClockIcon, GlassWaterIcon, GlobeIcon, LucideAngularModule, PiggyBankIcon, TagIcon, UserRoundIcon } from 'lucide-angular';
import { Tags } from 'src/app/models/Tags';

@Component({
  selector: 'app-details-popup',
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './details-popup.component.html',
})
export class DetailsPopupComponent {
    readonly freeOfChargeIcon = PiggyBankIcon;
    readonly wheelchairIcon = AccessibilityIcon;
    readonly elevatorOperatorIcon = UserRoundIcon;
    readonly openingHoursIcon = ClockIcon;
    readonly nameIcon = TagIcon;
    readonly drinkingWaterIcon = GlassWaterIcon;
    readonly websiteIcon = GlobeIcon;


  @Input() tags: Tags;
  @Input() nodeId: number;
}
