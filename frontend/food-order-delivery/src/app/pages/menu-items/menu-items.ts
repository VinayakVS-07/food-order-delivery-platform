import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

interface MenuItem {
  menuItemID: number;
  restaurantID: number;
  name: string;
  description: string;
  category: string;
  price: number;
  imageUrl: string;
  isAvailable: boolean;
  isActive: boolean;
  quantity?: number;
}

@Component({
  selector: 'app-menu-items',
  standalone: false,
  templateUrl: './menu-items.html',
  styleUrl: './menu-items.css'
})
export class MenuItems implements OnInit {
  restaurantId!: number;
  menuItems: any[] = [];
  cart: any[] = [];
  showToast = false;
  toastMessage = '';
  userRole: string | null = null;
  restaurantName: string = '';
  newItemMode = false;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.restaurantId = Number(this.route.snapshot.paramMap.get('id'));
    
    
  this.route.queryParams.subscribe(params => {
    this.restaurantName = params['name'] || 'Restaurant';

  });

    this.loadMenuItems();
    this.userRole = this.authService.getUserRole();
  }

  loadMenuItems(): void {
  const role = this.authService.getUserRole();

  this.authService.getMenuItemsByRestaurant(this.restaurantId).subscribe({
    next: (res) => {
      if (role === 'Restaurant') {
        // show all active items (available + unavailable)
        this.menuItems = res.filter(x => x.isActive);
      } else {
        // show only available and active for others
        this.menuItems = res.filter(x => x.isActive && x.isAvailable);
      }
    },
    error: (err) => {
      console.error('Error fetching menu items:', err);
    }
  });
}


   addCart(item: any) {
    const existing = this.cart.find(c => c.menuItemID === item.menuItemID);
    if (existing) {
      existing.quantity++;
    } else {
      this.cart.push({ ...item, quantity: 1 });
    }
  }

  decreaseQty(item: any) {
    const existing = this.cart.find(c => c.menuItemID === item.menuItemID);
    if (existing) {
      existing.quantity--;
      if (existing.quantity <= 0) {
        this.cart = this.cart.filter(c => c.menuItemID !== item.menuItemID);
      }
    }
  }

   getItemQty(item: MenuItem): number {
    const found = this.cart.find(c => c.menuItemID === item.menuItemID);
    return found ? found.quantity || 0 : 0;
  }

  get totalItems(): number {
    return this.cart.reduce((acc, curr) => acc + (curr.quantity || 0), 0);
  }

  get totalAmount(): number {
    return this.cart.reduce((acc, curr) => acc + (curr.quantity! * curr.price), 0);
  }


  viewCart(): void {
    const user = this.authService.getUser();
    const customerID = user?.userID || 0;

    // navigate to Cart page
    this.router.navigate(['/cart', this.restaurantId]);
  }

   addToCart(): void {
  const user = this.authService.getUser();
  const customerID = user?.userID || 0;

  if (this.cart.length === 0) {
     this.snackBar.open('Please select at least one item before adding to cart.', 'OK', {
        duration: 2500,
        horizontalPosition: 'right',
        verticalPosition: 'bottom'
      });
  }

    // upload each cart item to backend
    this.cart.forEach(item => {
      const payload = {
        cartID: 0,
        customerID: customerID,
        restaurantID: this.restaurantId,
        menuItemID: item.menuItemID,
        quantity: item.quantity,
        itemName: item.name,
        unitPrice: item.price,
        totalPrice: item.quantity * item.price,
        restaurantName: item.restaurantName || 'string'
      };

      this.authService.addToCart(payload).subscribe({
        next: (res) => console.log('✅ Item added to cart:', res),
        error: (err) => console.error('❌ Failed to add to cart:', err)
      });
    });
     this.cart = [];
  this.menuItems.forEach(item => item.quantity = 0);
   this.snackBar.open('Items added to cart successfully! 🎉', 'OK', {
      duration: 2500,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }

   editingItem: any = null;

editMenuItem(menuItemId: number): void {
  this.authService.getMenuItemById(menuItemId).subscribe({
    next: (res) => {
      if (res.success && res.data) {
        this.editingItem = { ...res.data };
      }
    },
    error: (err) => {
      console.error('Error fetching menu item details:', err);
      this.snackBar.open('Failed to load menu item.', 'OK', { duration: 2500 });
    }
  });
}

saveMenuItemChanges(): void {
  if (!this.editingItem) return;

  const user = this.authService.getUser();
  this.editingItem.modifiedBy = user?.firstName || 'RestaurantOwner';

  this.authService.updateMenuItem(this.editingItem).subscribe({
    next: (res) => {
      if (res.success) {
        this.snackBar.open('Menu item updated successfully!', 'OK', {
          duration: 2500,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });
        this.editingItem = null;
        this.loadMenuItems();
      }
    },
    error: (err) => {
      console.error('Error updating menu item:', err);
      this.snackBar.open('Failed to update item.', 'OK', { duration: 2500 });
    }
  });
}

cancelEdit(): void {
  this.editingItem = null;
}
 
newMenuItem = {
  restaurantID: 0,
  name: '',
  description: '',
  category: '',
  price: 0,
  imageUrl: '',
  isAvailable: true,
  isActive: true,
  createdBy: ''
};

toggleAddForm(): void {
  this.newItemMode = !this.newItemMode;
}

saveNewMenuItem(): void {
  const user = this.authService.getUser();
  this.newMenuItem.restaurantID = this.restaurantId;
  this.newMenuItem.createdBy = user?.firstName || 'RestaurantOwner';

  this.authService.addMenuItem(this.newMenuItem).subscribe({
    next: (res) => {
      if (res.success) {
        this.snackBar.open('Menu item added successfully!', 'OK', { duration: 2500 });
        this.newItemMode = false;
        this.newMenuItem = {
          restaurantID: this.restaurantId,
          name: '',
          description: '',
          category: '',
          price: 0,
          imageUrl: '',
          isAvailable: true,
          isActive: true,
          createdBy: ''
        };
        this.loadMenuItems();
      }
    },
    error: (err) => {
      console.error('Error adding menu item:', err);
      this.snackBar.open('Failed to add menu item.', 'OK', { duration: 2500 });
    }
  });
}


} 