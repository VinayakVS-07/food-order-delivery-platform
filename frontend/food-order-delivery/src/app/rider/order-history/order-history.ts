import { Component,OnInit } from '@angular/core';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-order-history',
  standalone: false,
  templateUrl: './order-history.html',
  styleUrl: './order-history.css'
})
export class OrderHistory implements OnInit {
  riderId: number = 0;
  orders: any[] = [];
  isLoading = true;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.riderId = JSON.parse(storedUser).userID;
      this.fetchOrderHistory();
    }
  }

  fetchOrderHistory() {
    this.authService.getRiderOrderHistory(this.riderId).subscribe({
      next: (res: any) => {
        this.orders = res.data || [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  getStatusLabel(status: string): string {
    return status === 'Delivered' ? 'COMPLETED' : status.toUpperCase();
  }

  getStatusColor(status: string): string {
    return status === 'Delivered' ? '#28a745' : '#dc3545'; // green for completed, red for cancelled
  }
}