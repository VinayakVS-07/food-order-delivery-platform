import { Component, OnInit, HostListener} from '@angular/core';
import { AuthService } from '../../auth/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-rider-dashboard',
  standalone: false,
  templateUrl: './rider-dashboard.html',
  styleUrl: './rider-dashboard.css'
})
export class RiderDashboard implements OnInit {
  dashboard: any = {};
  isOnline: boolean = false;
  riderId: number = 0;
   dropdownOpen = false;
  fullName = '';
  
  userId!: number;

  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
     const user = this.authService.getUser();
    if (user) {
      this.fullName = `${user.firstName} ${user.lastName}`;
      this.riderId = user.userID;
      this.authService.userUpdated.subscribe(updatedUser => {
       if (updatedUser && updatedUser.userID === this.riderId) {
          this.fullName = `${updatedUser.firstName} ${updatedUser.lastName}`;
        }
      });
      this.loadDashboard();
      this.checkRiderStatus();
    } else {
      this.snackBar.open('Rider ID not found. Please log in again.', 'Close', { duration: 3000 });
    }
  }

  loadDashboard() {
    this.authService.getRiderDashboard(this.riderId).subscribe({
      next: (res) => {
        if (res.success) {
          this.dashboard = res.data;
        } else {
          this.snackBar.open('Failed to load dashboard data', 'Close', { duration: 3000 });
        }
      },
      error: (err) => {
        this.snackBar.open('Error fetching dashboard data', 'Close', { duration: 3000 });
      }
    });
  }

   checkRiderStatus() {
    const user = this.authService.getUser();
    if (user && user.userID !== undefined) {
      this.isOnline = user.isOnline;
    }
  }

  
  toggleOnlineStatus() {
  this.isOnline = !this.isOnline;

  this.authService.updateRiderStatus(this.riderId, this.isOnline).subscribe({
    next: (res: any) => {
      if (res.success) {
        const msg = this.isOnline ? 'You are now Online' : 'You are now Offline';
        this.snackBar.open(msg, 'Close', { duration: 2000 });

        const user = this.authService.getUser();
        if (user) {
          user.isOnline = this.isOnline;
          localStorage.setItem('user', JSON.stringify(user));
        }
      } else {
        this.snackBar.open('Failed to update status', 'Close', { duration: 2000 });
      }
    },
    error: () => {
      this.snackBar.open('Error updating status', 'Close', { duration: 2000 });
    }
  });
}

  goToLiveOrders() {
  this.router.navigate(['/live-orders']);
}

}
