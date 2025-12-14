import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { BusinessService, UserGraphqlService } from '@lineup/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { AuthService } from './core/services/auth.service';

@Component({
  imports: [RouterModule, ButtonModule, TranslateModule],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit, AfterViewInit, OnDestroy {
  protected title = 'lineup';

  protected translate = inject(TranslateService);
  private platformId: object = inject(PLATFORM_ID);
  private _user = inject(UserGraphqlService);
  private _auth = inject(AuthService);
  private _business = inject(BusinessService);
  private _subscription: Subscription = new Subscription();

  ngOnInit() {
    this.translate.addLangs(['es', 'en']);
    this.translate.setDefaultLang('es');
    this.translate.use('es');
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this._subscription.add(
      this._user
        .getMe()
        .pipe(take(1))
        .subscribe({
          next: (user) => {
            console.log(user);
            if (user) {
              this._auth.setUser(user);
              // this.refreshUserToken();
            } else {
              this._auth.removeUser(false);
            }
          },
          error: (error) => {
            console.log(error);
            console.error(error);
            this._auth.removeUser(false);
          },
        }),
    );

    this._subscription.add(
      this._business
        .myBusiness()
        .pipe(take(1))
        .subscribe({
          next: (business) => {
            console.log(business);
            if (business) {
              this._auth.setBusiness(business);
              // this.refreshBusinessToken();
            } else {
              this._auth.removeUser(false);
            }
          },
          error: (error) => {
            console.log(error);
            console.error(error);
            this._auth.removeUser(false);
          },
        }),
    );

    // this._subscription.add(
    //   this._user
    //     .getUser(2)
    //     .pipe(take(1))
    //     .subscribe({
    //       next: (user) => {
    //         console.log(user);
    //       },
    //       error: (error) => {
    //         console.error(error);
    //       },
    //     }),
    // );
  }

  refreshUserToken(): void {
    this._subscription.add(
      this._user.refreshToken().subscribe({
        next: (user) => {
          console.log(user);
        },
      }),
    );
  }

  refreshBusinessToken(): void {
    this._subscription.add(
      this._business.refreshToken().subscribe({
        next: (business) => {
          console.log(business);
        },
      }),
    );
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }
}
