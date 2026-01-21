import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-my-orders',
  standalone: false,
  templateUrl: './my-orders.html',
  styleUrl: './my-orders.css'
})
export class MyOrders implements OnInit {
  orders: any[] = [];
  loading = true;
  errorMessage = '';

  constructor(private authService: AuthService , public router: Router) {}

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user && user.userID) {
      this.fetchOrders(user.userID);
    } else {
      this.errorMessage = 'User not logged in.';
      this.loading = false;
    }
  }

  fetchOrders(customerId: number) {
    this.authService.getCustomerOrders(customerId).subscribe({
      next: (res) => {
        this.orders = res;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching orders:', err);
        this.errorMessage = 'Failed to load orders.';
        this.loading = false;
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'placed': return '#007bff';
      case 'accepted': return '#28a745';
      case 'preparing': return '#ff9800';
      case 'ready': return '#17a2b8';
      case 'pickedup': return '#6f42c1';
      case 'delivered': return '#00c853';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  }
}