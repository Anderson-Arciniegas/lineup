import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Button } from "@lineup/ui";

@Component({
  selector: 'app-landing-page',
  imports: [CommonModule, Button],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.scss',
})
export class LandingPage {}
