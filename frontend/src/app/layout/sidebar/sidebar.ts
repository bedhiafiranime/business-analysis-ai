import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { JwtStorageService } from '../../core/services/jwt-storage.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  constructor(
    private jwtService: JwtStorageService,
    private router: Router
  ) {}

  logout(): void {
    this.jwtService.clearToken();
    this.router.navigate(['/login']);
  }
}
