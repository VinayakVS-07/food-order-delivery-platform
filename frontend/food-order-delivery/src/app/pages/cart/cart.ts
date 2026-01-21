import { Component,OnInit } from '@angular/core';
import { AuthService } from '../../auth/services/auth.service';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

interface CartItem {
imageUrl: string;
  cartID: number;
  customerID: number;
  restaurantID: number;
  menuItemID: number;
  quantity: number;
  itemName: string;
  unitPrice: number;
  totalPrice: number;
  restaurantName: string;
}


@Component({
  selector: 'app-cart',
  standalone: false,
  templateUrl: './cart.html',
  styleUrl: './cart.css'
})
export class Cart implements OnInit {
  customerID = 0;
  restaurantID = 0;
  items: CartItem[] = [];
  loading = false;
  updating = false;
  errorMessage = '';
  

  constructor(private authService: AuthService, public router: Router) {}

  ngOnInit(): void {

     if (!sessionStorage.getItem('cartReloaded')) {
      sessionStorage.setItem('cartReloaded', 'true');
      window.location.reload();
      return;
    } else {
      sessionStorage.removeItem('cartReloaded');
    }

    const user = this.authService.getUser();
    this.customerID = user?.userID || 0;
    if (!this.customerID) {
      this.errorMessage = 'Unable to identify customer. Please login again.';
      return;
    }
    this.fetchCart();
  }

  fetchCart(): void {
    this.loading = true;
    this.errorMessage = '';
    this.authService.getCartItems(this.customerID)
      .pipe(finalize(()=> this.loading = false))
      .subscribe({
        next: (res: any) => {
          if (res?.success) {
            this.items = res.data || [];
            if (this.items.length) this.restaurantID = this.items[0].restaurantID;
          } else {
            this.items = [];
            this.errorMessage = 'Failed to load cart.';
          }
        },
        error: err => {
          console.error('Fetch cart error', err);
          this.errorMessage = 'Something went wrong while loading your cart.';
        }
      });
  }
 
  // total items in cart
  get totalItems(): number {
    return this.items.reduce((s, it) => s + (it.quantity || 0), 0);
  }

   get subtotal(): number {
    return this.items.reduce(
      (s, it) => s + (it.totalPrice || it.quantity * it.unitPrice),
      0
    );
  }

  get deliveryCharge(): number {
    return this.items.length ? 40 : 0;
  }

  get taxes(): number {
    return this.subtotal * 0.05; // 5% tax
  }

  get totalAmount(): number {
    return this.subtotal + this.deliveryCharge + this.taxes;
  }

  // increase qty locally then send update for that item
  increase(item: CartItem): void {
    item.quantity++;
    item.totalPrice = item.quantity * item.unitPrice;
    this.updateItemOnServer(item);
  }

 
  decrease(item: CartItem): void {
    if (item.quantity > 1) {
      item.quantity--;
      item.totalPrice = item.quantity * item.unitPrice;
      this.updateItemOnServer(item);
    } else {
      const yes = confirm(`Remove "${item.itemName}" from cart?`);
      if (yes) this.removeItem(item.cartID);
    }
  }

  // send update to backend (single item)
  updateItemOnServer(item: CartItem): void {
    this.updating = true;
    const payload = {
      cartID: item.cartID,
      customerID: item.customerID,
      restaurantID: item.restaurantID,
      menuItemID: item.menuItemID,
      quantity: item.quantity,
      itemName: item.itemName,
      unitPrice: item.unitPrice,
      totalPrice: item.quantity * item.unitPrice,
      restaurantName: item.restaurantName
    };

    this.authService.updateCartItem(payload).pipe(finalize(()=> this.updating = false))
      .subscribe({
        next: (res: any) => {
          if (res?.success === false) {
            console.warn('Update responded with failure', res);
            this.fetchCart();
          }
        },
        error: err => {
          console.error('Failed to update cart item', err);
          this.errorMessage = 'Failed to update item quantity. Please try again.';
          this.fetchCart();
        }
      });
  }

  removeItem(cartID: number): void {
    if (!confirm('Are you sure you want to remove this item?')) return;

    this.updating = true;
    this.authService.removeCartItem(cartID).pipe(finalize(()=> this.updating = false))
      .subscribe({
        next: (res: any) => {
          if (res?.success) {
            this.items = this.items.filter(i => i.cartID !== cartID);
          } else {
            this.errorMessage = res?.message || 'Failed to remove item.';
            this.fetchCart();
          }
        },
        error: err => {
          console.error('Remove item error', err);
          this.errorMessage = 'Error removing item.';
          this.fetchCart();
        }
      });
  }

  clearCart(): void {
    if (!confirm('Clear all items from your cart?')) return;

    this.updating = true;
    this.authService.clearCart(this.customerID).pipe(finalize(()=> this.updating = false))
      .subscribe({
        next: (res: any) => {
          if (res?.success) {
            this.items = [];
          } else {
            this.errorMessage = res?.message || 'Failed to clear cart.';
          }
        },
        error: err => {
          console.error('Clear cart error', err);
          this.errorMessage = 'Failed to clear cart.';
        }
      });
  }

    scrollToRestaurants() {
    
  const target = document.getElementById('featured-restaurants');
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
  
    this.router.navigate(['/home']).then(() => {
      setTimeout(() => {
        const section = document.getElementById('featured-restaurants');
        if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    });
  }
}

  // go to checkout route with restaurant id (or pass cart via state)
  checkout(): void {
    if (!this.items.length) {
      alert('Your cart is empty.');
      return;
    }

    this.router.navigate(['/checkout'], { state: { customerID: this.customerID, restaurantID: this.restaurantID } });
  }


  formatPrice(amount: number): string {
    return `₹${amount.toFixed(0)}`;
  }
}