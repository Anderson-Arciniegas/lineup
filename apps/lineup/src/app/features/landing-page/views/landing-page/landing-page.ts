import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Button } from '@lineup/ui';
import { TranslateModule } from '@ngx-translate/core';

/**
 * Landing informativa / presentación de producto con diseño fiel a Pencil Frame 0.
 */
@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterModule, Button, TranslateModule],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.scss',
})
export class LandingPage {
  readonly gmailComposeUrl =
    'https://mail.google.com/mail/?view=cm&fs=1&to=lineup@lineup.com.ve';
  
  activeChip = 'todos';

  setActiveChip(chip: string): void {
    this.activeChip = chip;
  }
}
