import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-account-type-page',
 imports: [CommonModule, TranslateModule, RouterLink],
  templateUrl: './account-type-page.html',
  styleUrl: './account-type-page.scss',
})
export class AccountTypePage {}
