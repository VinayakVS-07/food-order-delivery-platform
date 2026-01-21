import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth/services/auth.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ApproveRestaurantsDialog } from '../approve-restaurants-dialog/approve-restaurants-dialog';

@Component({
  selector: 'app-restaurants',
  standalone: false,
  templateUrl: './restaurants.html',
  styleUrl: './restaurants.css'
})
export class Restaurants implements OnInit {
  restaurants: any[] = [];
  filteredRestaurants: any[] = [];
  searchTerm = '';

  constructor(private authService: AuthService, private router: Router,private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadRestaurants();
  }

  loadRestaurants(): void {
    this.authService.getAllRestaurants().subscribe({
      next: (res) => {
        this.restaurants = res;
        this.filteredRestaurants = res;
      },
      error: (err) => console.error(err)
    });
  }

  onSearch(): void {
    if (this.searchTerm.trim()) {
      this.authService.search(this.searchTerm).subscribe({
        next: (res) => (this.filteredRestaurants = res),
        error: (err) => console.error(err)
      });
    } else {
      this.filteredRestaurants = this.restaurants;
    }
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filteredRestaurants = this.restaurants;
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
approveRiders(): void {
  const dialogRef = this.dialog.open(ApproveRestaurantsDialog, {
    width: '1000px',   // ⬅️ widened for better table fit
    maxHeight: '85vh', // prevent overflow
    disableClose: true
  });

  dialogRef.afterClosed().subscribe((refresh: boolean) => {
    if (refresh) {
      this.loadRestaurants();
    }
  });
}

}

