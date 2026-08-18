
import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { Tags } from 'src/app/models/Tags';
import { TagInfoComponent } from '../tag-info/tag-info.component';
import { BikeIcon, ClockIcon, GlobeIcon, Milestone, MoneyIcon, TagIcon, ToolsIcon, UserIcon, WaterPumpIcon, WheelchairIcon } from '@hugeicons/core-free-icons';
import { TagDisplay } from 'src/app/models/TagDisplay';

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

  readonly tagDisplayList = computed<TagDisplay[]>(() => {
    const tags = this.tags();
    if (!tags) return [];

    return [
      {
        id: "free",
        icon: this.freeOfChargeIcon,
        label: "Free of charge",
        color: 'bg-green-600',
        show: tags.fee === "no",
      },
      {
        id: "charge",
        icon: this.freeOfChargeIcon,
        label: `Costs ${tags.charge}`,
        color: 'bg-orange-600',
        show: !!tags.charge,
      },
      {
        id: "wheelchair",
        icon: this.wheelchairIcon,
        label: "Unrestricted wheelchair access",
        color: 'bg-green-600',
        show: tags.wheelchair === "yes",
      },
      {
        id: "limited_wheelchair",
        icon: this.wheelchairIcon,
        label: "Limited wheelchair access",
        color: 'bg-orange-600',
        show: tags.wheelchair === "limited",
      },
      {
        id: "no_wheelchair",
        icon: this.wheelchairIcon,
        label: "No wheelchair access",
        color: 'bg-red-500',
        show: tags.wheelchair === "no",
      },
      {
        id: "pump",
        icon: this.pumpIcon,
        label: "Has bicycle pump",
        color: 'bg-green-600',
        show: tags['service:bicycle:pump'] === "yes",
      },
      {
        id: "no_pump",
        icon: this.pumpIcon,
        label: "Has no bicycle pump",
        color: 'bg-orange-600',
        show: tags['service:bicycle:pump'] === "no",
      },
      {
        id: "tools",
        icon: this.toolsIcon,
        label: "Has tools",
        color: 'bg-green-600',
        show: tags['service:bicycle:tools'] === "yes",
      },
      {
        id: "no_tools",
        icon: this.toolsIcon,
        label: "Has no tools",
        color: 'bg-orange-600',
        show: tags['service:bicycle:tools'] === "no",
      },
      {
        id: "chain_tool",
        icon: this.toolsIcon,
        label: "Has chain tool",
        color: 'bg-green-600',
        show: tags['service:bicycle:chain_tool'] === "yes",
      },
      {
        id: "no_chain_tool",
        icon: this.toolsIcon,
        label: "Has no chain tool",
        color: 'bg-orange-600',
        show: tags['service:bicycle:chain_tool'] === "no",
      },
      {
        id: "bicycle_stand",
        icon: this.bicycleStandIcon,
        label: "Has bicycle stand",
        color: 'bg-green-600',
        show: tags['service:bicycle:stand'] === "yes",
      },
      {
        id: "no_bicycle_stand",
        icon: this.bicycleStandIcon,
        label: "Has no bicycle stand",
        color: 'bg-orange-600',
        show: tags['service:bicycle:stand'] === "no",
      },
      {
        id: "opening_hours",
        icon: this.openingHoursIcon,
        label: tags.opening_hours ? `Open ${tags.opening_hours}` : '',
        color: 'bg-gray-600',
        show: !!tags.opening_hours,
      },
      {
        id: "drinking_water",
        icon: this.drinkingWaterIcon,
        label: 'Drinking water',
        color: 'bg-blue-600',
        show: tags.drinking_water === 'yes',
      },
      {
        id: "operator",
        icon: this.elevatorOperatorIcon,
        label: tags.operator ? `Operated by ${tags.operator}` : '',
        color: 'bg-gray-600',
        show: !!tags.operator,
      },
      {
        id: "level",
        icon: this.levelIcon,
        label: "On level " + tags.level,
        color: 'bg-gray-600',
        show: !!tags.level,
      },
      {
        id: "name",
        icon: this.nameIcon,
        label: tags.name || '',
        color: 'bg-gray-600',
        show: !!tags.name,
      },
      {
        id: "brand",
        icon: this.nameIcon,
        label: tags.brand || '',
        color: 'bg-gray-600',
        show: !!tags.brand,
      },
      {
        id: "website",
        icon: this.websiteIcon,
        label: tags.website || '',
        color: 'bg-gray-600',
        show: !!tags.website,
      },
    ];
  });
}
