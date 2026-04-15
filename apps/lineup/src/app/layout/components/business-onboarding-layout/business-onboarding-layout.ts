import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Nav } from '@lineup/ui';

@Component({
  selector: 'app-business-onboarding-layout',
  imports: [CommonModule, RouterOutlet, Nav],
  templateUrl: './business-onboarding-layout.html',
  styleUrl: './business-onboarding-layout.scss',
})
export class BusinessOnboardingLayout {}

