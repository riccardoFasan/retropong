import { AfterViewInit, Directive, ElementRef, OnDestroy } from '@angular/core';
import { map } from 'rxjs/operators';
import { Inaccuracy } from '../enums';
import { PaddleController } from '../interfaces';
import { LevelSettings } from '../models';
import {
  CollisionService,
  GameControlsService,
  LevelService,
} from '../services';
import { BaseControllerDirective } from './base-controller.directive';

@Directive({
  selector: '[appComputerController]',
})
export class ComputerControllerDirective
  extends BaseControllerDirective
  implements AfterViewInit, OnDestroy, PaddleController
{
  private readonly speed: number = 0.02;
  private inaccuracy: Inaccuracy = Inaccuracy.Low;

  private previousBallPositionY: number = this.ballY;

  constructor(
    ref: ElementRef,
    collision: CollisionService,
    controls: GameControlsService,
    private level: LevelService
  ) {
    super(ref, collision, controls);
  }

  override async ngAfterViewInit(): Promise<void> {
    super.ngAfterViewInit();
    this.onLevelChanged();
    this.movePaddle();
  }

  private onLevelChanged(): void {
    this.subSink.sink = this.level.levelChanged$
      .pipe(map((level: LevelSettings) => level.computerInaccuracy))
      .subscribe((computerInaccuracy: Inaccuracy) => {
        this.inaccuracy = computerInaccuracy;
      });
  }

  private get ballY(): number {
    const ball: HTMLElement | null = document.querySelector('app-ball');
    if (ball === null) return 0;
    return parseInt(ball.style.top);
  }

  private get isBallMovingDown(): boolean {
    if (this.previousBallPositionY === undefined) return false;
    return this.previousBallPositionY < this.ballY;
  }

  private movePaddle(): void {
    this.subSink.sink = this.controls.deltaChanged$.subscribe(
      (delta: number) => {
        const correctionFactor: number = this.paddleHeight * this.inaccuracy;
        const correctedPaddleHeight: number = this.isBallMovingDown
          ? correctionFactor
          : this.paddleHeight - correctionFactor;
        const movement: number = this.ballY - this.y - correctedPaddleHeight;
        const positionY: number = this.y + this.speed * delta * movement;
        if (this.canMove(positionY)) {
          this.y = positionY;
        }
        this.previousBallPositionY = this.ballY;
      }
    );
  }
}
