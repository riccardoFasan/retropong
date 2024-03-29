import { AfterViewInit, Component, ElementRef, OnDestroy } from '@angular/core';
import { isIonicReady, sleep } from 'src/utilities';
import { Action } from '../../enums';
import { Artifact, Coordinates } from '../../models';
import { ElementsService } from '../../services';

@Component({
  selector: 'app-artifact',
  templateUrl: './artifact.component.html',
  styleUrls: ['./artifact.component.scss'],
})
export class ArtifactComponent implements AfterViewInit, OnDestroy, Artifact {
  id!: number;
  action!: Action;
  coordinates!: Coordinates;

  private readonly sleepingTime: number = 25;

  constructor(private ref: ElementRef, private elements: ElementsService) {}

  async ngAfterViewInit(): Promise<void> {
    await isIonicReady();
    this.setHostPosition();
    await sleep(this.sleepingTime);
    this.elements.registerArtifact(this.artifact, this.ref);
  }

  ngOnDestroy(): void {
    this.elements.unregisterArtifact(this.id);
  }

  get className(): string {
    return this.action.toLowerCase();
  }

  private get artifact(): Artifact {
    return { id: this.id, action: this.action, coordinates: this.coordinates };
  }

  private setHostPosition(): void {
    const element: HTMLElement = this.ref.nativeElement;
    element.style.top = `${this.coordinates.y}px`;
    element.style.left = `${this.coordinates.x}px`;
  }
}
