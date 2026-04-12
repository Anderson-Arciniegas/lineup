import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Button } from "@lineup/ui";
import { TranslateModule } from '@ngx-translate/core';

/** Landing de marketing / presentación del producto con CTA hacia registro o exploración. */
@Component({
  selector: 'app-landing-page',
  imports: [CommonModule, Button, TranslateModule],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.scss',
})
export class LandingPage {}
