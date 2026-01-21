import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
email = '';
  password = '';
  errorMessage = '';

  constructor(private auth: AuthService, private router: Router) {}

  onLogin() {
    const credentials = { email: this.email, password: this.password };

   this.auth.login(this.email, this.password).subscribe({
  next: (res: any) => {
    if (res.success) {
    
      if ((res.roleID && res.roleID === 1) || (res.roleName && res.roleName.toLowerCase() === 'customer')) {
        this.router.navigate(['/home']);
      } else if ((res.roleID && res.roleID === 4) || (res.roleName?.toLowerCase() === 'admin')) {
          this.router.navigate(['/admin-dashboard']);
      } else if ((res.roleID && res.roleID === 2) || (res.roleName?.toLowerCase() === 'rider')) {
          this.router.navigate(['/rider-dashboard']);
      } else if ((res.roleID && res.roleID === 3) || (res.roleName?.toLowerCase() === 'restaurant')) {
          this.router.navigate(['/restaurant-dashboard']);
      } else {
        this.errorMessage = 'Access restricted. Only customers can log in here.';
      }
    } else {
      this.errorMessage = res.message || 'Invalid credentials.';
    }
  },
  error: (err) => {
    console.error('Login failed:', err);
    if (err?.error && typeof err.error === 'object') {
      this.errorMessage = err.error.message || JSON.stringify(err.error);
    } else if (err?.status) {
      this.errorMessage = `HTTP ${err.status} - ${err.statusText || 'Server error'}`;
    } else {
      this.errorMessage = 'Server error. Please try again later.';
    }
   }
  });
 }
}