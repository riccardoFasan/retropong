import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Observable, timer } from 'rxjs';
import { filter, first, map, throttleTime } from 'rxjs/operators';
import { isIonicReady, sleep } from 'src/utilities';
import { SubSink } from 'subsink';
import { Action, Collision, HalfField, Player } from '../../enums';
import { HitArtifact, LevelSettings } from '../../models';
import {
  AnimationsService,
  ArtifactsService,
  CollisionService,
  ElementsService,
  LevelService,
  PlayersService,
} from '../../services';
import { NORMAL_LEVEL } from '../../store';

@Component({
  selector: 'app-shield',
  templateUrl: './shield.component.html',
  styleUrls: ['./shield.component.scss'],
})
export class ShieldComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() halfField!: HalfField;

  @ViewChild('shield') private ref!: ElementRef;

  x: number = 0;

  private onCollision$: Observable<Collision> =
    this.collision.onShieldsCollision$.pipe(
      filter((collision: Collision) => {
        if (this.halfField === HalfField.Right) {
          return collision === Collision.RightShield;
        }
        return collision === Collision.LeftShield;
      })
    );

  private readonly sleepingTime: number = 50;
  private subSink: SubSink = new SubSink();
  private duration: number = NORMAL_LEVEL.shieldsDuration;

  constructor(
    private collision: CollisionService,
    private artifacts: ArtifactsService,
    private players: PlayersService,
    private level: LevelService,
    private animations: AnimationsService,
    private elements: ElementsService
  ) {}

  async ngAfterViewInit(): Promise<void> {
    await isIonicReady();
    await sleep(this.sleepingTime);
    this.setLeftPosition();
    this.onActivation();
    this.onCollision();
    this.onLevelChanged();
    this.onGoal();
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    await isIonicReady();
    if (changes['halfField']) {
      this.setLeftPosition();
    }
  }

  ngOnDestroy(): void {
    this.unRegisterShield();
    this.subSink.unsubscribe();
  }

  @HostListener('window:resize')
  private setLeftPosition(): void {
    const halfEdgesDistance: number = this.elements.edgesDistance / 2;
    if (this.halfField === HalfField.Left) {
      this.x = halfEdgesDistance;
      return;
    }
    this.x = this.elements.groundWidth - this.width - halfEdgesDistance;
  }

  private get width(): number {
    if (!this.ref.nativeElement) return 0;
    return this.ref.nativeElement.offsetWidth;
  }

  private get player(): Player {
    return this.players.getPlayerByField(this.halfField);
  }

  private onActivation(): void {
    this.subSink.sink = this.artifacts.onActivation$
      .pipe(
        filter((hitArtifact: HitArtifact) => this.canActivate(hitArtifact)),
        throttleTime(this.duration),
        map((hitArtifact: HitArtifact) => hitArtifact.artifact)
      )
      .subscribe(() => this.turnUp());
  }

  private onCollision(): void {
    this.subSink.sink = this.onCollision$.subscribe(() => this.fade());
  }

  private onLevelChanged(): void {
    this.subSink.sink = this.level.levelChanged$.subscribe(
      (settings: LevelSettings) => {
        this.duration = settings.shieldsDuration;
      }
    );
  }

  private onGoal(): void {
    this.subSink.sink = this.collision.onGatesCollision$.subscribe(() =>
      this.turnDown()
    );
  }

  private canActivate(hitArtifact: HitArtifact): boolean {
    return (
      hitArtifact.artifact.action === Action.Shields &&
      hitArtifact.player === this.player
    );
  }

  private turnUp(): void {
    this.registerShield();
    this.animations.turnUpShield(this.ref.nativeElement);
    this.onShieldDestroy();
  }

  private onShieldDestroy(): void {
    this.subSink.sink = timer(this.duration)
      .pipe(first())
      .subscribe(() => this.turnDown());
  }

  private turnDown(): void {
    this.unRegisterShield();
    this.animations.turnDownShield(this.ref.nativeElement);
  }

  private fade(): void {
    this.animations.fadeShield(this.ref.nativeElement);
  }

  private registerShield(): void {
    this.elements.registerShield(this.ref.nativeElement, this.halfField);
  }

  private unRegisterShield(): void {
    this.elements.unRegisterShield(this.halfField);
  }
}