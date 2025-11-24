import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonApp, IonRouterOutlet } from "@ionic/angular/standalone";
import { NxWelcome } from './nx-welcome';

@Component({
  imports: [IonRouterOutlet, IonApp, NxWelcome, RouterModule],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'mobile';
}
