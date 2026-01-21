import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { finalize } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AddressboxDialog } from '../addressbox-dialog/addressbox-dialog';
import { PaymentConfirmDialog } from '../payment-confirm-dialog/payment-confirm-dialog';


@Component({
  selector: 'app-checkout',
  standalone: false,
  templateUrl: './checkout.html',
  styleUrl: './checkout.css'
})
export class Checkout implements OnInit {
  customerID = 0;
  restaurantID = 0;
  items: any[] = [];
  loading = false;
  processing = false;
  instructions = '';
  selectedPayment = '';
  selectedAddress: any = null;

  paymentMethods = [
    { label: 'UPI (Google Pay / PhonePe)', value: 'UPI' },
    { label: 'Credit / Debit Card', value: 'Card' },
    { label: 'Cash on Delivery', value: 'COD' }
  ];

  constructor(
    private authService: AuthService,
    public router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
    this.customerID = user?.userID || 0;

    if (!this.customerID) {
      alert('User not found. Please login again.');
      this.router.navigate(['/login']);
      return;
    }
    this.fetchCart();
  }

  fetchCart(): void {
    this.loading = true;
    this.authService
      .getCartItems(this.customerID)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res: any) => {
          if (res?.success && res?.data?.length) {
            this.items = res.data;
            this.restaurantID = this.items[0].restaurantID;
          } else {
            this.items = [];
          }
        },
        error: err => console.error('Cart fetch error:', err)
      });
  }

  openAddressDialog(): void {
    const dialogRef = this.dialog.open(AddressboxDialog, {
      width: '600px',
  
      data: { customerID: this.customerID }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.selectedAddress = result;
      }
    });
  }

  get subtotal(): number {
    return this.items.reduce(
      (sum, i) => sum + (i.totalPrice || i.quantity * i.unitPrice),
      0
    );
  }

  get deliveryCharge(): number {
    return this.items.length ? 40 : 0;
  }

  get taxes(): number {
    return this.subtotal * 0.05;
  }

  get totalAmount(): number {
    return this.subtotal + this.deliveryCharge + this.taxes;
  }

  confirmOrder(): void {
    if (!this.selectedAddress) {
      this.snackBar.open('Please select a delivery address.', 'Close', { duration: 3000 });
      return;
    }
    if (!this.selectedPayment) {
       this.snackBar.open('Please select a payment method.', 'Close', { duration: 3000 });
      return;
    }

    this.processing = true;

    const payload = {
      order: {
        customerID: this.customerID,
        restaurantID: this.restaurantID,
        addressID: this.selectedAddress.addressID,
        totalAmount: this.totalAmount,
        deliveryInstructions: this.instructions,
        estimatedDeliveryTime: new Date(Date.now() + 45 * 60000)
      },
      orderItems: this.items.map(i => ({
        orderID: 0,
        menuItemID: i.menuItemID,
        quantity: i.quantity,
        unitPrice: i.unitPrice
      })),
      payment: {
        orderID: 0,
        customerID: this.customerID,
        paymentMethod: this.selectedPayment,
        transactionID:
          this.selectedPayment === 'COD' ? 'Pending' : 'TXN' + Date.now(),
        provider:
          this.selectedPayment === 'UPI'
            ? 'Google Pay'
            : this.selectedPayment === 'Card'
            ? 'Visa'
            : 'Cash',
        amount: this.totalAmount
      }
    };

    this.authService
      .placeOrder(payload)
      .pipe(finalize(() => (this.processing = false)))
      .subscribe({
        next: (res: any) => {
          if (res?.success) {
           this.snackBar.open('✅ Order placed successfully!', 'Close', { duration: 3000 });
            this.clearCart();
            this.router.navigate(['/myorder']);
          } else {
             this.snackBar.open('❌ Failed to place order. Try again.', 'Close', { duration: 3000 });
          }
        },
        error: err => {
          console.error('Order error:', err);
         this.snackBar.open('Order failed. Try again.', 'Close', { duration: 3000 });
        }
      });
  }

  payNow(): void {
  const dialogRef = this.dialog.open(PaymentConfirmDialog, {
    width: '400px',
    data: { message: 'Do you want to confirm your payment of ' + this.formatPrice(this.totalAmount) + '?' }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      this.confirmOrder();
    }
  });
}

  clearCart(): void {
    this.authService.clearCart(this.customerID).subscribe({
      next: (res: any) => {
        if (res?.success) this.items = [];
      },
      error: err => console.error('Clear cart error', err)
    });
  }

  cancel(): void {
    this.router.navigate(['/cart']);
  }

  formatPrice(amount: number): string {
    return `₹${amount.toFixed(0)}`;
  }
}