
import { Component, ChangeDetectionStrategy, input } from '@angular/core';
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

  readonly tags = input<Tags>();
  readonly nodeId = input<number>();

  get tagDisplayList(): TagDisplay[] {
    const tags = this.tags();
    if (!tags) return [];

    return [
      {
        icon: this.freeOfChargeIcon,
        label: "Free of charge",
        color: 'bg-green-600',
        show: tags.fee === "no",
      },
      {
        icon: this.freeOfChargeIcon,
        label: `Costs ${tags.charge}`,
        color: 'bg-orange-600',
        show: !!tags.charge,
      },
      {
        icon: this.wheelchairIcon,
        label: "Unrestricted wheelchair access",
        color: 'bg-green-600',
        show: tags.wheelchair === "yes",
      },
      {
        icon: this.wheelchairIcon,
        label: "Limited wheelchair access",
        color: 'bg-orange-600',
        show: tags.wheelchair === "limited",
      },
      {
        icon: this.wheelchairIcon,
        label: "No wheelchair access",
        color: 'bg-red-500',
        show: tags.wheelchair === "no",
      },
      {
        icon: this.pumpIcon,
        label: "Has bicycle pump",
        color: 'bg-green-600',
        show: tags['service:bicycle:pump'] === "yes",
      },
      {
        icon: this.pumpIcon,
        label: "Has no bicycle pump",
        color: 'bg-orange-600',
        show: tags['service:bicycle:pump'] === "no",
      },
      {
        icon: this.toolsIcon,
        label: "Has tools",
        color: 'bg-green-600',
        show: tags['service:bicycle:tools'] === "yes",
      },
      {
        icon: this.toolsIcon,
        label: "Has no tools",
        color: 'bg-orange-600',
        show: tags['service:bicycle:tools'] === "no",
      },
      {
        icon: this.toolsIcon,
        label: "Has chain tool",
        color: 'bg-green-600',
        show: tags['service:bicycle:chain_tool'] === "yes",
      },
      {
        icon: this.toolsIcon,
        label: "Has no chain tool",
        color: 'bg-orange-600',
        show: tags['service:bicycle:chain_tool'] === "no",
      },
      {
        icon: this.bicycleStandIcon,
        label: "Has bicycle stand",
        color: 'bg-green-600',
        show: tags['service:bicycle:stand'] === "yes",
      },
      {
        icon: this.bicycleStandIcon,
        label: "Has no bicycle stand",
        color: 'bg-orange-600',
        show: tags['service:bicycle:stand'] === "no",
      },
      {
        icon: this.openingHoursIcon,
        label: tags.opening_hours ? `Open ${tags.opening_hours}` : '',
        color: 'bg-gray-600',
        show: !!tags.opening_hours,
      },
      {
        icon: this.drinkingWaterIcon,
        label: 'Drinking water',
        color: 'bg-blue-600',
        show: tags.drinking_water === 'yes',
      },
      {
        icon: this.elevatorOperatorIcon,
        label: tags.operator ? `Operated by ${tags.operator}` : '',
        color: 'bg-gray-600',
        show: !!tags.operator,
      },
      {
        icon: this.levelIcon,
        label: "On level " + tags.level,
        color: 'bg-gray-600',
        show: !!tags.level,
      },
      {
        icon: this.nameIcon,
        label: tags.name || '',
        color: 'bg-gray-600',
        show: !!tags.name,
      },
      {
        icon: this.nameIcon,
        label: tags.brand || '',
        color: 'bg-gray-600',
        show: !!tags.brand,
      },
      {
        icon: this.websiteIcon,
        label: tags.website || '',
        color: 'bg-gray-600',
        show: !!tags.website,
      },
    ];
  }
}
