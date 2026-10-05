import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CarouselTouchService } from './carousel-touch.service';

interface TouchPoint {
  identifier: number;
  clientX: number;
  clientY: number;
}

function dispatchTouch(
  target: HTMLElement,
  type: string,
  changedTouches: TouchPoint[],
  touches: TouchPoint[],
): void {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperties(event, {
    changedTouches: { value: changedTouches },
    touches: { value: touches },
  });
  target.dispatchEvent(event);
}

describe('CarouselTouchService', () => {
  let service: CarouselTouchService;
  let viewport: HTMLDivElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: 'browser' }],
    });
    service = TestBed.inject(CarouselTouchService);
    viewport = document.createElement('div');
    viewport.className = 'p-carousel-viewport';
    document.body.appendChild(viewport);
    service.attach();
  });

  afterEach(() => {
    service.detach();
    viewport.remove();
  });

  it('no deja que PrimeNG cancele un gesto vertical', () => {
    const carouselTouchMove = jest.fn();
    viewport.addEventListener('touchmove', carouselTouchMove);
    const start = { identifier: 1, clientX: 10, clientY: 10 };
    const move = { identifier: 1, clientX: 12, clientY: 40 };

    dispatchTouch(viewport, 'touchstart', [start], [start]);
    dispatchTouch(viewport, 'touchmove', [move], [move]);

    expect(carouselTouchMove).not.toHaveBeenCalled();
  });

  it('mantiene el swipe horizontal del carrusel', () => {
    const carouselTouchMove = jest.fn();
    viewport.addEventListener('touchmove', carouselTouchMove);
    const start = { identifier: 2, clientX: 10, clientY: 10 };
    const move = { identifier: 2, clientX: 40, clientY: 12 };

    dispatchTouch(viewport, 'touchstart', [start], [start]);
    dispatchTouch(viewport, 'touchmove', [move], [move]);

    expect(carouselTouchMove).toHaveBeenCalled();
  });
});
