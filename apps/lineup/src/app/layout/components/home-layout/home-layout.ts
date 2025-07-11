import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Nav } from '@lineup/ui';

@Component({
  selector: 'app-home-layout',
  imports: [CommonModule, RouterModule, Nav],
  templateUrl: './home-layout.html',
  styleUrl: './home-layout.scss',
})
export class HomeLayout {}
