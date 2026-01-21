import { Component,OnInit } from '@angular/core';
import { AuthService } from '../../auth/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-restaurant-profile',
  standalone: false,
  templateUrl: './restaurant-profile.html',
  styleUrl: './restaurant-profile.css'
})
export class RestaurantProfile  implements OnInit {
  restaurant: any = null;
  restaurantForm!: FormGroup;
  editing = false;
  loading = true;
  previewUrl: string | null = null;
  filteredRestaurants: any[] = [];
    restaurantId!: number;
  isOpen: boolean = false;
  toggling = false;
 

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
     private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
    const userId = user?.userID;

    this.initForm();
    if (userId) this.loadRestaurant(userId);
  }

  loadRestaurant(userId: number): void {
    this.authService.getRestaurantByOwner(userId).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success && res.data) {
          this.restaurant = res.data;
          this.isOpen = this.restaurant.isOpen;
          this.restaurantId = this.restaurant.restaurantID;
          this.initForm();
        } else {
          this.restaurant = null;
        }
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Error loading restaurant info.', 'Close', { duration: 3000 });
      }
    });
  }

  initForm(): void {
  this.restaurantForm = this.fb.group({
    restaurantID: [this.restaurant?.restaurantID || 0],
    userID: [this.restaurant?.userID || null],
    name: [this.restaurant?.name || '', Validators.required],
    description: [this.restaurant?.description || ''],
    address: [this.restaurant?.address || '', Validators.required],
    city: [this.restaurant?.city || '', Validators.required],
    state: [this.restaurant?.state || '', Validators.required],
    pincode: [this.restaurant?.pincode || '', Validators.required],
    openingTime: [this.restaurant?.openingTime || ''],
    closingTime: [this.restaurant?.closingTime || ''],
    imageUrl: [this.restaurant?.imageUrl || ''],
    isOpen: [this.restaurant?.isOpen ?? true],
    isActive: [this.restaurant?.isActive ?? true],
    rating: [this.restaurant?.rating ?? 0],
    createdAt: [this.restaurant?.createdAt || new Date()],
    modifiedAt: [new Date()]
  });
}

  onEdit() {
    this.editing = true;
     window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit() {
    this.editing = false;
    this.initForm();
    
  }

  onImagePreviewChange() {
     this.restaurantForm.patchValue({ imageUrl: this.restaurantForm.value.imageUrl });
   }

saveChanges() {
  if (this.restaurantForm.invalid) {
    this.snackBar.open('Please fill in all required fields.', 'Close', { duration: 3000 });
    return;
  }

  const restaurantData = this.restaurantForm.value;

   this.authService.updateRestaurant(restaurantData).subscribe({
    next: (res) => {
      if (res?.success) {
        this.snackBar.open('Restaurant updated successfully!', 'Close', { duration: 3000 });

        this.restaurant = { ...this.restaurant, ...restaurantData };
        this.editing = false;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        this.snackBar.open('Update failed. Try again.', 'Close', { duration: 3000 });
      }
    },
    error: () => {
      this.snackBar.open('Something went wrong. Try again later.', 'Close', { duration: 3000 });
    }
  });
}


  addRestaurant(): void {
  if (this.restaurantForm.invalid) {
    this.snackBar.open('Please fill in all required fields.', 'Close', { duration: 3000 });
    return;
  }

  const user = this.authService.getUser();
  const data = {
    ...this.restaurantForm.value,
    userID: user.userID,
    rating: 0,
    isOpen: true,
    isActive: true,
    createdAt: new Date(),
    modifiedAt: new Date()
  };

  this.authService.addRestaurant(data).subscribe({
    next: (res) => {
      if (res && res.success) {
        this.snackBar.open('Restaurant added successfully!', 'Close', { duration: 3000 });
        
        // Assign new ID and reload view
        this.restaurant = { ...data, restaurantID: res.restaurantId };
        this.editing = false;

        // Reload or navigate to show profile view
        setTimeout(() => {
          this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
            this.router.navigate(['/restaurant-profile']);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          });
        }, 400);
      } else {
        this.snackBar.open('Failed to add restaurant.', 'Close', { duration: 3000 });
      }
    },
    error: (err) => {
      console.error('Add restaurant error:', err);
      this.snackBar.open('Server error while adding restaurant.', 'Close', { duration: 3000 });
    }
  });
}


  viewMenu(restaurant: any): void {
    const id =
      restaurant.restaurantID ??
      restaurant.RestaurantID ??
      restaurant.id ??
      restaurant.Id ??
      restaurant.ID;

    if (!id && id !== 0) {
      console.warn('Invalid restaurant id:', restaurant);
      return;
    }

    this.router.navigate(['/menu', id]).then(() => window.scrollTo(0, 0));
  }
  

}
