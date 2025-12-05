import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { DrawerModule } from 'primeng/drawer';
import { Button } from '../button/button';
import { InputIcon } from 'primeng/inputicon';
import { IconField } from 'primeng/iconfield';

@Component({
  selector: 'lib-nav',
  imports: [
    CommonModule,
    Button,
    RouterLink,
    DrawerModule,
    TranslateModule,
    InputIcon,
    IconField
  ],
  templateUrl: './nav.html',
  styleUrl: './nav.scss',
})
export class Nav {
  @Input() navItems: any[];
  logged = false;
  businessMode = false;
  visible = false;
}
