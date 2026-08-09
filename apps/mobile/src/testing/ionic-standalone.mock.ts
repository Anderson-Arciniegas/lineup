import { Component } from '@angular/core';

/* Selectors Ionic en mocks de test (no son componentes de la app). */
/* eslint-disable @angular-eslint/component-selector */
@Component({
  selector: 'ion-app',
  template: '<ng-content></ng-content>',
  standalone: true,
})
export class IonApp {}

@Component({
  selector: 'ion-router-outlet',
  template: '<ng-content></ng-content>',
  standalone: true,
})
export class IonRouterOutlet {}
/* eslint-enable @angular-eslint/component-selector */
