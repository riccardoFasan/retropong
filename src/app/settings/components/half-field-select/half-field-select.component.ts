import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable } from 'rxjs';
import { HalfField, Player } from 'src/app/shared/enums';
import { PlayersService } from 'src/app/shared/services';
import { Option } from '../../models';

@Component({
  selector: 'app-half-field-select',
  templateUrl: './half-field-select.component.html',
  styleUrls: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HalfFieldSelectComponent {
  halfFields: Option[] = [
    { label: 'LEFT', value: HalfField.Left },
    { label: 'RIGHT', value: HalfField.Right },
  ];

  userField$: Observable<HalfField> = this.players.userField$;

  constructor(private players: PlayersService) {}

  setPlayer(halfField: HalfField): void {
    const player: Player = this.players.getPlayerByField(halfField);
    this.players.user = player;
  }
}
