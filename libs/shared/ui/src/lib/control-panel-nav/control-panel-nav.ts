import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from "primeng/button";
import { DrawerModule } from 'primeng/drawer';
import { Button } from '../button/button';

@Component({
  selector: 'lib-control-panel-nav',
  imports: [CommonModule, Button, RouterLink, RouterLink, DrawerModule, ButtonModule],
  templateUrl: './control-panel-nav.html',
  styleUrl: './control-panel-nav.scss',
})
export class ControlPanelNav {
  visible = false;
}
