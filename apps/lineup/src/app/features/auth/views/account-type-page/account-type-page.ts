import { CommonModule, Location } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

/** Pantalla inicial de flujo de registro: el usuario elige crear cuenta de consumidor o de negocio. */
@Component({
  selector: 'app-account-type-page',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterLink],
  templateUrl: './account-type-page.html',
  styleUrl: './account-type-page.scss',
})
export class AccountTypePage {
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  goBack(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/']);
    }
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  navigateToTerms(): void {
    this.router.navigate(['/info/terminos-y-condiciones']);
  }

  navigateToPrivacy(): void {
    this.router.navigate(['/info/politica-de-privacidad']);
  }
}
