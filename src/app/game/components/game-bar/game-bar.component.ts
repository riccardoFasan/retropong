import { Component, OnDestroy } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { Player } from 'src/app/shared/enums';
import { PlayersService } from 'src/app/shared/services';
import { isIonicReady } from 'src/utilities';
import { SubSink } from 'subsink';
import { GameStatus } from '../../enums';
import { Score } from '../../models';
import { GameControlsService, ScoreService } from '../../services';

@Component({
  selector: 'app-game-bar',
  templateUrl: './game-bar.component.html',
  styleUrls: ['./game-bar.component.scss'],
})
export class GameBarComponent implements OnDestroy {
  gameStatus$: Observable<GameStatus> = this.controls.statusChanged$;
  points$: Observable<Score> = this.score.scoreChanged$;

  private subSink: SubSink = new SubSink();

  constructor(
    private score: ScoreService,
    private controls: GameControlsService,
    private alertController: AlertController,
    private players: PlayersService
  ) {}

  ngOnDestroy(): void {
    this.stop();
  }

  async start(): Promise<void> {
    await isIonicReady();
    this.controls.start();
    this.onGameOver();
  }

  pause(): void {
    this.controls.pause();
    this.openPauseAlert();
  }

  private stop(): void {
    this.controls.stop();
    this.score.resetScore();
    this.subSink.unsubscribe();
  }

  private resume(): void {
    this.controls.resume();
  }

  private onGameOver(): void {
    this.subSink.sink = this.score.winnerChanged$.subscribe(
      (winner: Player) => {
        this.stop();
        const message: string =
          winner === this.players.user ? 'You won' : 'Game lost';
        this.openGameOverAlert(message);
      }
    );
  }

  private async openGameOverAlert(message: string): Promise<void> {
    const alert: HTMLIonAlertElement = await this.alertController.create({
      header: 'Game Over',
      subHeader: message,
      buttons: ['OK'],
    });
    await alert.present();
  }

  private async openPauseAlert(): Promise<void> {
    const alert: HTMLIonAlertElement = await this.alertController.create({
      header: 'Pause',
      message:
        'The game is paused. Choose whether to resume the game from where it left off or close the game.',
      buttons: [
        {
          text: 'Stop',
          role: 'destructive',
          handler: () => {
            this.stop();
          },
        },
        {
          text: 'Resume',
          role: 'confirm',
          handler: () => {
            this.resume();
          },
        },
      ],
    });
    await alert.present();
  }
}
