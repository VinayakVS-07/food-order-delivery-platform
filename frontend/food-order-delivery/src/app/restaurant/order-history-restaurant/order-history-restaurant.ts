import { Component , OnInit} from '@angular/core';
import { AuthService } from '../../auth/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-order-history-restaurant',
  standalone: false,
  templateUrl: './order-history-restaurant.html',
  styleUrl: './order-history-restaurant.css'
})
export class OrderHistoryRestaurant implements OnInit {
  groupedOrders: any[] = [];
  restaurantId!: number;
  loading = true;

  constructor(private authService: AuthService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    const storedUser = localStorage.getItem('user');

    if (storedUser) {
      const user = JSON.parse(storedUser);
      this.loading = true;

      // Case 1: restaurantID already available in user object
      if (user.restaurantID) {
        this.restaurantId = user.restaurantID;
        this.fetchOrderHistory();
      } 
      // Case 2: fetch restaurantID using userID
      else {
        this.authService.getRestaurantByUser(user.userID).subscribe({
          next: (res) => {
            if (res.success && res.data) {
              this.restaurantId = res.data.restaurantID;
              this.fetchOrderHistory();
            } else {
              this.loading = false;
              this.snackBar.open('No restaurant linked to this account.', 'Close', { duration: 2000 });
            }
          },
          error: () => {
            this.loading = false;
            this.snackBar.open('Failed to fetch restaurant details', 'Close', { duration: 2000 });
          }
        });
      }
    } else {
      this.loading = false;
      this.snackBar.open('User not found in local storage', 'Close', { duration: 2000 });
    }
  }

  fetchOrderHistory(): void {
    this.loading = true;
    this.authService.getRestaurantOrderHistory(this.restaurantId).subscribe({
      next: (res) => {
        if (res && Array.isArray(res)) {
          this.groupOrdersById(res);
        } else if (res?.data && Array.isArray(res.data)) {
          this.groupOrdersById(res.data);
        } else {
          this.snackBar.open('No past orders found', 'Close', { duration: 2000 });
        }
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.snackBar.open('Error fetching order history', 'Close', { duration: 2000 });
        this.loading = false;
      }
    });
  }

  groupOrdersById(data: any[]): void {
  const grouped: { [key: number]: any } = {};

  data.forEach((order) => {
    if (!grouped[order.orderID]) {
      grouped[order.orderID] = {
        orderID: order.orderID,
        orderStatus: order.orderStatus,
        orderTime: order.orderTime,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        customerAddress: order.customerAddress,
        riderName: order.riderName,
        riderPhone: order.riderPhone,
        totalAmount: order.totalAmount,
        items: []
      };
    }

    grouped[order.orderID].items.push({
      itemName: order.itemName,
      itemImage: order.itemImage,
      quantity: order.quantity,
      unitPrice: order.unitPrice,
      totalPrice: order.totalPrice
    });
  });

  // Convert to array and sort descending by OrderID
  this.groupedOrders = Object.values(grouped).sort(
    (a: any, b: any) => b.orderID - a.orderID
  );
}

}