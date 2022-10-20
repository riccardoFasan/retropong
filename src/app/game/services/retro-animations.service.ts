import { Injectable } from '@angular/core';
import { Animation, AnimationController } from '@ionic/angular';
import { HalfField } from 'src/app/shared/enums';
import { Animations } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class RetroAnimationsService implements Animations {
  constructor(private animationController: AnimationController) {}

  animateBorder(ground: HTMLElement, halfField: HalfField): void {
    const className: string = `border-fade-${
      halfField === HalfField.Left ? 'left' : 'right'
    }`;
    ground.classList.add(className);
    ground.classList.remove(className);
  }

  fadePaddle(paddle: HTMLElement): void {
    console.log('retro fade');
  }

  resizePaddle(
    paddle: HTMLElement,
    delay: number,
    targetHeight: number,
    defaultHeight: number
  ): void {
    const resize: Animation = this.animationController
      .create()
      .addElement(paddle)
      .duration(200)
      .easing('ease')
      .to('height', `${targetHeight}px`)
      .fill('forwards');

    const reset: Animation = this.animationController
      .create()
      .addElement(paddle)
      .duration(200)
      .easing('ease')
      .delay(delay)
      .to('height', `${defaultHeight}px`)
      .fill('forwards');

    this.animationController
      .create()
      .addAnimation(resize)
      .addAnimation(reset)
      .play();
  }

  setPaddleHeight(paddle: HTMLElement, height: number): void {
    this.animationController
      .create()
      .addElement(paddle)
      .duration(200)
      .easing('ease')
      .to('height', `${height}px`)
      .fill('forwards')
      .play();
  }

  fadeShield(shield: HTMLElement): void {
    this.animationController
      .create()
      .addElement(shield)
      .easing('ease')
      .duration(300)
      .iterations(3)
      .keyframes([
        {
          offset: 0,
          backgroundColor: 'var(--ion-color-dark)',
        },
        {
          offset: 1,
          backgroundColor: 'var(--ion-color-success)',
        },
      ])
      .fill('none')
      .play();
  }

  turnUpShield(shield: HTMLElement): void {
    this.animationController
      .create()
      .addElement(shield)
      .duration(200)
      .easing('ease')
      .to('opacity', 0.75)
      .fill('forwards')
      .play();
  }

  turnDownShield(shield: HTMLElement): void {
    this.animationController
      .create()
      .addElement(shield)
      .duration(200)
      .easing('ease')
      .to('opacity', 0)
      .fill('forwards')
      .play();
  }
}