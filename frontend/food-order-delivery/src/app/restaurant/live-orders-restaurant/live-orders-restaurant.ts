import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-live-orders-restaurant',
  standalone: false,
  templateUrl: './live-orders-restaurant.html',
  styleUrl: './live-orders-restaurant.css'
})
export class LiveOrdersRestaurant implements OnInit {

  restaurantId!: number;
  liveOrders: any[] = [];
  isLoading = true;
  statusOptions = ['Accepted', 'Preparing', 'Ready'];


  constructor(private authService: AuthService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    const user = JSON.parse(storedUser);

    // Temporarily set loading
    this.isLoading = true;

    // If restaurantID exists, use it directly
    if (user.restaurantID) {
      this.restaurantId = user.restaurantID;
      this.loadLiveOrders();
    } else {
      // Fetch restaurantID by userID
      this.authService.getRestaurantByUser(user.userID).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.restaurantId = res.data.restaurantID;
            this.loadLiveOrders();
          } else {
            this.snackBar.open('No restaurant linked to this account.', 'Close', { duration: 2000 });
          }
        },
        error: () => {
          this.snackBar.open('Failed to fetch restaurant details', 'Close', { duration: 2000 });
          this.isLoading = false;
        }
      });
    }
  }
}

  

  loadLiveOrders(): void {
    this.authService.getLiveOrdersForRestaurant(this.restaurantId).subscribe({
      next: (res) => {
        if (res.success) {
          this.liveOrders = res.data;
        } else {
          this.snackBar.open('No live orders found', 'Close', { duration: 2000 });
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.snackBar.open('Error fetching live orders', 'Close', { duration: 2000 });
        this.isLoading = false;
      }
    });
  }
  getTotalAmount(order: any): number {
  if (!order.items || !Array.isArray(order.items)) return 0;
  return order.items.reduce((sum: number, i: any) => sum + i.totalPrice, 0);
}


  onStatusChange(order: any, newStatus: string): void {
  this.authService.updateOrderStatusbyRestaurant(order.orderID, newStatus, 'RestaurantOwner').subscribe({
    next: (res) => {
      if (res.success) {
        this.snackBar.open(`Order #${order.orderID} updated to ${newStatus}`, 'Close', { duration: 2000 });
      } else {
        this.snackBar.open(res.message, 'Close', { duration: 2000 });
      }
    },
    error: (err) => {
      console.error(err);
      this.snackBar.open('Failed to update order status', 'Close', { duration: 2000 });
    }
  });
}

getStatusColorClass(status: string): string {
  switch (status) {
    case 'Accepted':
      return 'status-accepted';
    case 'Preparing':
      return 'status-preparing';
    case 'Ready':
      return 'status-ready';
    default:
      return '';
  }
}



}