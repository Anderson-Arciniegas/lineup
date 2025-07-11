import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from "../button/button";

@Component({
  selector: 'lib-nav',
  imports: [CommonModule, Button, RouterLink],
  templateUrl: './nav.html',
  styleUrl: './nav.scss',
})
export class Nav {}
