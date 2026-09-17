import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { JwtStorageService } from '../../../core/services/jwt-storage.service';
import { RegisterRequest } from '../../../shared/models/auth.models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  request: RegisterRequest = { fullName: '', email: '', password: '', role: 'USER' };
  errorMsg = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private jwtService: JwtStorageService,
    private router: Router
  ) {}

  register(): void {
    this.errorMsg = '';
    this.isLoading = true;
    this.authService.register(this.request).subscribe({
      next: (res) => {
        if (res.token) {
          this.jwtService.saveToken(res.token);
          this.router.navigate(['/dashboard']);
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMsg = 'Registration failed. Please try again.';
        this.isLoading = false;
      }
    });
  }
}
