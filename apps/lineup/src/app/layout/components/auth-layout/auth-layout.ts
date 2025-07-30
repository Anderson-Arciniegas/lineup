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

@Component({
    selector: 'app-auth-layout',
    imports: [CommonModule, RouterModule, Button],
    templateUrl: './auth-layout.html',
    styleUrl: './auth-layout.scss',
})
export class AuthLayout {
    private location = inject(Location);

    goBack(): void {
        this.location.back();
    }
}