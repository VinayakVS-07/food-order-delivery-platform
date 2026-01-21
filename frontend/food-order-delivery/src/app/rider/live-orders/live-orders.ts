import { Component,OnInit } from '@angular/core';
import { AuthService } from '../../auth/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-live-orders',
  standalone: false,
  templateUrl: './live-orders.html',
  styleUrl: './live-orders.css'
})
export class LiveOrders implements OnInit {
  liveOrders: any[] = [];
  riderId!: number; 
  isLoading = true;
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.riderId = user?.userID;

    if (this.riderId) {
      this.loadLiveOrders();
    } else {
      this.errorMessage = 'Rider not found. Please log in again.';
      this.isLoading = false;
    }
  }

  loadLiveOrders() {
    this.authService.getRiderLiveOrders(this.riderId).subscribe({
      next: (res) => {
        this.liveOrders = res;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to load live orders.';
        this.isLoading = false;
      }
    });
  }

  openOrderDetails(orderId: number) {
    this.router.navigate(['/order-details', orderId]);
  }
}
