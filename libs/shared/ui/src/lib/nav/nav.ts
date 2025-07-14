import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from "../button/button";

@Component({
  selector: 'lib-nav',
  imports: [CommonModule, Button, RouterLink, RouterLink],
  templateUrl: './nav.html',
  styleUrl: './nav.scss',
})
export class Nav {
  @Input() navItems: any[];
}
