import {
  AfterViewInit,
  Component,
  ElementRef,
  HostBinding,
  OnDestroy,
} from '@angular/core';
import { combineLatest, EMPTY, iif, Observable, timer } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { isIonicReady, randomFloatBetween } from 'src/utilities';
import { SubSink } from 'subsink';
import { Collision, GameStatus } from '../../enums';
import { Ball, LevelSettings } from '../../models';
import {
  ArtifactsService,
  BallDirectionService,
  CollisionService,
  GameControlsService,
  LevelService,
  GroundSizesService,
} from '../../services';
import { NORMAL_BALL } from '../../store';

@Component({
  selector: 'app-ball',
  templateUrl: './ball.component.html',
  styleUrls: ['./ball.component.scss'],
})
export class BallComponent implements AfterViewInit, OnDestroy {
  @HostBinding('style.left.px')
  x: number = 0;

  @HostBinding('style.top.px')
  y: number = 0;

  private ball: Ball = NORMAL_BALL;
  currentSpeed: number = this.ball.baseSpeed;

  private subSink: SubSink = new SubSink();

  private readonly millisecondsBeforeKickStart: number = 750;

  private onGatesCollision$: Observable<Collision> =
    this.collision.onGatesCollision$.pipe(tap(() => this.resetAfterGoal()));

  constructor(
    private ref: ElementRef,
    private collision: CollisionService,
    private controls: GameControlsService,
    private level: LevelService,
    private direction: BallDirectionService,
    private ground: GroundSizesService,
    private artifacts: ArtifactsService
  ) {}

  async ngAfterViewInit(): Promise<void> {
    await isIonicReady();
    this.collision.registerBall(this.ref.nativeElement);
    this.artifacts.registerBall(this.ref.nativeElement);
    this.onLevelChanged();
    this.onStatusChanged();
    this.onCollisionChanged();
  }

  ngOnDestroy(): void {
    this.subSink.unsubscribe();
  }

  private get height(): number {
    if (!this.ref.nativeElement) return 0;
    return this.ref.nativeElement.offsetHeight;
  }

  private get width(): number {
    if (!this.ref.nativeElement) return 0;
    return this.ref.nativeElement.offsetWidth;
  }

  private onLevelChanged(): void {
    this.subSink.sink = this.level.levelChanged$
      .pipe(map((level: LevelSettings) => level.ball))
      .subscribe((ball: Ball) => {
        this.ball = ball;
        this.currentSpeed = this.ball.baseSpeed;
      });
  }

  private onStatusChanged(): void {
    this.subSink.sink = this.controls.statusChanged$
      .pipe(
        tap((status: GameStatus) => {
          if (status === GameStatus.Stopped) {
            this.init();
          }
        }),
        switchMap((status: GameStatus) =>
          // ! do not use filter operator
          iif(
            () => status === GameStatus.Running,
            timer(this.millisecondsBeforeKickStart).pipe(
              switchMap(() => this.controls.timer$.pipe(tap(() => this.move())))
            ),
            EMPTY
          )
        )
      )
      .subscribe();
  }

  private onCollisionChanged(): void {
    this.subSink.sink = combineLatest([
      this.onGatesCollision$,
      this.direction.onRebound$,
    ]).subscribe();
  }

  private init(): void {
    this.centerBall();
    this.direction.init();
    this.currentSpeed = randomFloatBetween(
      this.ball.baseSpeed,
      this.ball.maximumSpeed
    );
  }

  private centerBall(): void {
    this.x = this.ground.width / 2 - this.width / 2;
    this.y = this.ground.height / 2 - this.height / 2;
  }

  private resetAfterGoal(): void {
    this.init();
  }

  private move(): void {
    this.increaseSpeed();
    this.x += this.direction.trajectory.x * this.currentSpeed;
    this.y += this.direction.trajectory.y * this.currentSpeed;
  }

  private increaseSpeed(): void {
    if (this.currentSpeed < this.ball.maximumSpeed) {
      this.currentSpeed += this.ball.acceleration;
    }
  }
}
