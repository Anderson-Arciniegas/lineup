import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ControlPanelNav } from '@lineup/ui';

@Component({
  selector: 'app-control-panel-layout',
  imports: [CommonModule, RouterModule, ControlPanelNav],
  templateUrl: './control-panel-layout.html',
  styleUrl: './control-panel-layout.scss',
})
export class ControlPanelLayout {}
