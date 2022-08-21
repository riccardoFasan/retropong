import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { GameStatus } from '../enums';

@Injectable({
  providedIn: 'root',
})
export class GameControlsService {
  private deltaStore$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  deltaChanged$: Observable<number> = this.deltaStore$.asObservable();

  private statusStore$: BehaviorSubject<GameStatus> =
    new BehaviorSubject<GameStatus>(GameStatus.Stopped);
  statusChanged$: Observable<GameStatus> = this.statusStore$.asObservable();

  private lastTime: DOMHighResTimeStamp | undefined;
  private frameId: number = 0;

  start(): void {
    this.status = GameStatus.Running;
    this.onFrameChanged();
  }

  stop(): void {
    this.status = GameStatus.Stopped;
    window.cancelAnimationFrame(this.frameId);
  }

  pause(): void {
    if (this.status === GameStatus.Stopped) return;
    this.status = GameStatus.Paused;
  }

  resume(): void {
    if (this.status === GameStatus.Stopped) return;
    this.status = GameStatus.Running;
  }

  private get status(): GameStatus {
    return this.statusStore$.getValue();
  }

  private set status(status: GameStatus) {
    this.statusStore$.next(status);
  }

  private onFrameChanged(): void {
    this.frameId = window.requestAnimationFrame((time: DOMHighResTimeStamp) => {
      this.update(time);
    });
  }

  private update(time: DOMHighResTimeStamp): void {
    if (this.lastTime !== undefined) {
      const delta: number = time - this.lastTime;
      this.deltaStore$.next(delta);
    }
    this.lastTime = time;
    this.onFrameChanged();
  }
}
