import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  imports: [RouterModule],
  selector: 'app-admin',
  templateUrl: './admin-app.html',
  styleUrl: './admin-app.scss',
})
export class AdminApp {
  protected title = 'admin';
}
