import { Component,OnInit, HostListener } from '@angular/core';
import { AuthService } from '../../auth/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';


@Component({
  selector: 'app-orders',
  standalone: false,
  templateUrl: './orders.html',
  styleUrl: './orders.css'
})
export class Orders implements OnInit {
  orders: any[] = [];
  statusOptions = ['Placed', 'Accepted', 'Preparing', 'Ready', 'PickedUp', 'Delivered', 'Cancelled'];
  selectedOrderId: number | null = null;
  riders: any[] = [];
 selectedRiderId: { [key: number]: any } = {};

  constructor(private authService: AuthService, private snackBar: MatSnackBar,private router: Router) {}

  ngOnInit(): void {
    this.loadOrders();
    this.loadRiders();
  }

  loadOrders(): void {
  this.authService.getAllOrders().subscribe({
    next: (res) => {
      this.orders = res;
      res.forEach((order: any) => {
       this.selectedRiderId[order.orderID] = '';
      });
    },
    error: (err) => console.error(err)
  });
}


 
loadRiders(): void {
  this.authService.getAllRiders().subscribe({
    next: (res) => (this.riders = res),
    error: (err) => console.error(err)
  });
}

assignRider(orderId: number): void {
    const riderIdRaw = this.selectedRiderId[orderId];
   const riderId = riderIdRaw !== '' && riderIdRaw != null ? Number(riderIdRaw) : null;

  if (!riderId) {
      this.snackBar.open('Please select a rider first', 'Close', { duration: 2000 });
      return;
    }

  this.authService.updateRider(orderId, riderId).subscribe({
    next: () => {
      this.snackBar.open('Rider assigned successfully', 'Close', { duration: 2000 });
      const order = this.orders.find(o => o.orderID === orderId);
      const rider = this.riders.find(r => r.riderID === riderId);
      if (order && rider) order.riderName = rider.riderName;

      this.selectedRiderId[orderId] = '';
    },
    error: (err) => {
      console.error(err);
      this.snackBar.open('Failed to assign rider', 'Close', { duration: 2000 });
    }
  });
}

  toggleDropdown(orderId: number): void {
    this.selectedOrderId = this.selectedOrderId === orderId ? null : orderId;
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.status-container')) {
      this.selectedOrderId = null;
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Placed': return '#2196f3';
      case 'Accepted': return '#1976d2';
      case 'Preparing': return '#ff9800';
      case 'Ready': return '#ffb300';
      case 'PickedUp': return '#9c27b0';
      case 'Delivered': return '#4caf50';
      case 'Cancelled': return '#f44336';
      default: return '#9e9e9e';
    }
  }

  updateStatus(orderId: number, newStatus: string): void {
    this.authService.updateOrderStatus(orderId, newStatus).subscribe({
      next: () => {
        this.snackBar.open('Order status updated successfully', 'Close', { duration: 2000 });
        this.loadOrders();
        this.selectedOrderId = null;
      },
      error: (err) => {
        console.error(err);
        this.snackBar.open('Failed to update status', 'Close', { duration: 2000 });
      }
    });
  }
}
