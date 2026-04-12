import {
  CommonModule,
  Location
} from '@angular/common';
import {
  Component,
  inject
} from '@angular/core';
import {
  RouterModule
} from '@angular/router';
import {
  Button
} from "@lineup/ui";

/** Contenedor de pantallas de autenticación con botón volver usando el historial del navegador. */
@Component({
    selector: 'app-auth-layout',
    imports: [CommonModule, RouterModule, Button],
    templateUrl: './auth-layout.html',
    styleUrl: './auth-layout.scss',
})
export class AuthLayout {
    private location = inject(Location);

    /** Navega un paso atrás en el historial (`Location.back`). */
    goBack(): void {
        this.location.back();
    }
}