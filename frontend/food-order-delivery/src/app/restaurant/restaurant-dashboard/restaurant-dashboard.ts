import { Component,OnInit } from '@angular/core';
import { AuthService } from '../../auth/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-restaurant-dashboard',
  standalone: false,
  templateUrl: './restaurant-dashboard.html',
  styleUrl: './restaurant-dashboard.css'
})
export class RestaurantDashboard implements OnInit {

  dashboardData: any;
  restaurantId!: number;
  restaurant: any = null;
  isOpen: boolean = false;
  toggling = false;
  isLoading = true;

  constructor(private authService: AuthService,private snackBar: MatSnackBar,) {}

 ngOnInit(): void {
  const user = this.authService.getUser();
  
  if (user && user.userID) {
    this.authService.getRestaurantByUser(user.userID).subscribe({
      next: (res) => {
        if (res.success && res.data) {
        
          this.restaurantId = res.data.restaurantID;
    
          this.loadDashboardData();
        } else {
          console.warn('No restaurant found for this user.');
          this.isLoading = false;
        }
      },
      error: (err) => {
        console.error('Error fetching restaurant:', err);
        this.isLoading = false;
      }
    });
  } else {
    console.warn('No logged-in user found.');
    this.isLoading = false;
  }
}



  loadDashboardData(): void {
    this.authService.getRestaurantDashboard(this.restaurantId).subscribe({
      next: (res) => {
        if (res.success) {
          this.dashboardData = res.data;
           this.restaurant = res.data;
          this.isOpen = this.restaurant.isOpen;
    
          
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

 toggleRestaurantStatus(isChecked: boolean): void {
    if (!this.restaurantId) return;
    this.toggling = true;
    this.isOpen = isChecked;

    const payload = { isOpen: isChecked };

    this.authService.toggleRestaurantOpen(this.restaurantId, payload).subscribe({
      next: (res: any) => {
        this.toggling = false;
        this.snackBar.open(res.message, 'OK', { duration: 2000 });
      },
      error: () => {
        this.toggling = false;
        this.snackBar.open('Error updating restaurant status.', 'Close', { duration: 2000 });
      }
    });
  }
  
}
