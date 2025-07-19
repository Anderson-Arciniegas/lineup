import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Ui } from "@lineup/ui";

@Component({
  selector: 'app-home-page',
  imports: [CommonModule, Ui],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage {}
