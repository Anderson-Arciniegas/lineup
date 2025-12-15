import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppState, selectUser } from '@lineup/core';
import { Store } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { DrawerModule } from 'primeng/drawer';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { Subscription } from 'rxjs';
import { Button } from '../button/button';

@Component({
  selector: 'lib-nav',
  standalone: true,
  imports: [
    CommonModule,
    Button,
    RouterLink,
    DrawerModule,
    TranslateModule,
    InputIcon,
    IconField,
  ],
  templateUrl: './nav.html',
  styleUrls: ['./nav.scss'],
})
export class Nav implements OnInit {
  @Input() navItems: any[];
  logged = false;
  businessMode = false;
  visible = false;

  private _store = inject(Store<AppState>);
  private _subscription: Subscription = new Subscription();

  ngOnInit(): void {
    this._subscription.add(
      this._store.select(selectUser).subscribe((user) => {
        this.logged = user ? true : false;
      }),
    );
  }
}
