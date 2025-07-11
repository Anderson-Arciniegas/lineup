import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Button } from "../button/button";
import { Nav } from '../nav/nav';

@Component({
  selector: 'lib-ui',
  imports: [CommonModule, Button, Nav],
  templateUrl: './ui.html',
  styleUrl: './ui.css',
})
export class Ui {}
