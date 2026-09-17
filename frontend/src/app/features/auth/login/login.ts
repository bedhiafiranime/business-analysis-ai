import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { JwtStorageService } from '../../../core/services/jwt-storage.service';
import { AuthenticationRequest } from '../../../shared/models/auth.models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  request: AuthenticationRequest = { email: '', password: '' };
  errorMsg = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private jwtService: JwtStorageService,
    private router: Router
  ) {}

  login(): void {
    this.errorMsg = '';
    this.isLoading = true;
    this.authService.login(this.request).subscribe({
      next: (res) => {
        if (res.token) {
          this.jwtService.saveToken(res.token);
          this.router.navigate(['/dashboard']);
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMsg = 'Invalid email or password.';
        this.isLoading = false;
      }
    });
  }
}
