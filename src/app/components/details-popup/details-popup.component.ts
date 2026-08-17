
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { TagDisplay } from 'src/app/models/TagDisplay';
import { Tags } from 'src/app/models/Tags';
import { TagInfoComponent } from '../tag-info/tag-info.component';
import { BikeIcon, ClockIcon, GlobeIcon, Milestone, MoneyIcon, TagIcon, ToolsIcon, UserIcon, WaterPumpIcon, WheelchairIcon } from '@hugeicons/core-free-icons';

@Component({
  selector: 'app-details-popup',
  imports: [TagInfoComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './details-popup.component.html',
})
export class DetailsPopupComponent {
  readonly freeOfChargeIcon = MoneyIcon;
  readonly wheelchairIcon = WheelchairIcon;
  readonly elevatorOperatorIcon = UserIcon;
  readonly openingHoursIcon = ClockIcon;
  readonly nameIcon = TagIcon;
  readonly drinkingWaterIcon = WaterPumpIcon;
  readonly websiteIcon = GlobeIcon;
  readonly pumpIcon = BikeIcon;
  readonly toolsIcon = ToolsIcon;
  readonly bicycleStandIcon = BikeIcon;
  readonly levelIcon = Milestone;

  @Input() tags: Tags;
  @Input() nodeId: number;

  get tagDisplayList(): TagDisplay[] {
    if (!this.tags) return [];

    return [
      {
        icon: this.freeOfChargeIcon,
        label: "Free of charge",
        color: 'bg-green-600',
        show: this.tags.fee === "no",
      },
      {
        icon: this.freeOfChargeIcon,
        label: `Costs ${this.tags.charge}`,
        color: 'bg-orange-600',
        show: !!this.tags.charge,
      },
      {
        icon: this.wheelchairIcon,
        label: "Unrestricted wheelchair access",
        color: 'bg-green-600',
        show: this.tags.wheelchair === "yes",
      },
      {
        icon: this.wheelchairIcon,
        label: "Limited wheelchair access",
        color: 'bg-orange-600',
        show: this.tags.wheelchair === "limited",
      },
      {
        icon: this.wheelchairIcon,
        label: "No wheelchair access",
        color: 'bg-red-500',
        show: this.tags.wheelchair === "no",
      },
      {
        icon: this.pumpIcon,
        label: "Has bicycle pump",
        color: 'bg-green-600',
        show: this.tags['service:bicycle:pump'] === "yes",
      },
      {
        icon: this.pumpIcon,
        label: "Has no bicycle pump",
        color: 'bg-orange-600',
        show: this.tags['service:bicycle:pump'] === "no",
      },
      {
        icon: this.toolsIcon,
        label: "Has tools",
        color: 'bg-green-600',
        show: this.tags['service:bicycle:tools'] === "yes",
      },
      {
        icon: this.toolsIcon,
        label: "Has no tools",
        color: 'bg-orange-600',
        show: this.tags['service:bicycle:tools'] === "no",
      },
      {
        icon: this.toolsIcon,
        label: "Has chain tool",
        color: 'bg-green-600',
        show: this.tags['service:bicycle:chain_tool'] === "yes",
      },
      {
        icon: this.toolsIcon,
        label: "Has no chain tool",
        color: 'bg-orange-600',
        show: this.tags['service:bicycle:chain_tool'] === "no",
      },
      {
        icon: this.bicycleStandIcon,
        label: "Has bicycle stand",
        color: 'bg-green-600',
        show: this.tags['service:bicycle:stand'] === "yes",
      },
      {
        icon: this.bicycleStandIcon,
        label: "Has no bicycle stand",
        color: 'bg-orange-600',
        show: this.tags['service:bicycle:stand'] === "no",
      },
      {
        icon: this.openingHoursIcon,
        label: this.tags.opening_hours ? `Open ${this.tags.opening_hours}` : '',
        color: 'bg-gray-600',
        show: !!this.tags.opening_hours,
      },
      {
        icon: this.drinkingWaterIcon,
        label: 'Drinking water',
        color: 'bg-blue-600',
        show: this.tags.drinking_water === 'yes',
      },
      {
        icon: this.elevatorOperatorIcon,
        label: this.tags.operator ? `Operated by ${this.tags.operator}` : '',
        color: 'bg-gray-600',
        show: !!this.tags.operator,
      },
      {
        icon: this.levelIcon,
        label: "On level " + this.tags.level,
        color: 'bg-gray-600',
        show: !!this.tags.level,
      },
      {
        icon: this.nameIcon,
        label: this.tags.name || '',
        color: 'bg-gray-600',
        show: !!this.tags.name,
      },
      {
        icon: this.nameIcon,
        label: this.tags.brand || '',
        color: 'bg-gray-600',
        show: !!this.tags.brand,
      },
      {
        icon: this.websiteIcon,
        label: this.tags.website || '',
        color: 'bg-gray-600',
        show: !!this.tags.website,
      },
    ];
  }
}
