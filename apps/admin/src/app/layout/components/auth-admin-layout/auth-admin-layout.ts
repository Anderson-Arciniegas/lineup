import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

/** Contenedor de pantallas de autenticación del admin (sin barra superior: solo hay login sin sesión). */
@Component({
  selector: 'app-auth-admin-layout',
  imports: [CommonModule, RouterModule],
  templateUrl: './auth-admin-layout.html',
  styleUrl: './auth-admin-layout.scss',
})
export class AuthAdminLayout {}
