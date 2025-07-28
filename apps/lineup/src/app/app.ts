import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Ui } from '@lineup/ui';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';


@Component({
  imports: [RouterModule, ButtonModule, TranslateModule],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  protected title = 'lineup';
  
  protected translate = inject(TranslateService);

  ngOnInit() {
    this.translate.addLangs(['es', 'en',]);
    this.translate.setDefaultLang('es');
    this.translate.use('es');
  }
}
