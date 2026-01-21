import { Component,  OnInit, HostListener,ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-customer-header',
  standalone: false,
  templateUrl: './customer-header.html',
  styleUrl: './customer-header.css'
})
export class CustomerHeader implements OnInit {

 @ViewChild('restaurantSection') restaurantSection!: ElementRef;

  dropdownOpen = false;
  fullName = '';
  cartCount = 0;
  userId!: number;
  activeLink: string = '';
  userRole: string | null = null;
  liveOrderCount = 0;
  restaurantId!: number;
  profileImageUrl: string | null = null;

  isAIChatOpen = false;


  constructor(private authService: AuthService, private router: Router) {}

ngOnInit(): void {
    this.userRole = this.authService.getUserRole();
    const user = this.authService.getUser();

    if (user) {
      this.fullName = `${user.firstName} ${user.lastName}`;
      this.userId = user.userID;

      // ✅ Always fetch fresh user details from backend for avatar
      this.loadHeaderUserFromApi();

      this.loadCartCount();

      this.authService.userUpdated.subscribe(updatedUser => {
        if (!updatedUser) return;
        if (updatedUser.userID !== this.userId) return; // ignore old-session users

        this.fullName = `${updatedUser.firstName} ${updatedUser.lastName}`;
        this.profileImageUrl = this.authService.getUserProfileImageUrl(updatedUser);

        if (this.userRole === 'Rider') {
          this.loadLiveOrderCount();
        }

        if (this.userRole === 'Restaurant') {
          this.initRestaurantLiveOrderCount();
        }
      });

      if (this.userRole === 'Rider') {
        this.loadLiveOrderCount();
      }

      if (this.userRole === 'Restaurant') {
        this.initRestaurantLiveOrderCount();
      }
    } else {
      this.fullName = 'Guest';
      this.profileImageUrl = null;
    }
  }

  // 🔹 New: fetch user directly from API so we don't rely on localStorage for image
  private loadHeaderUserFromApi(): void {
    if (!this.userId) return;

    this.authService.getUserById(this.userId).subscribe({
      next: (userFromApi: any) => {
        // use central helper from AuthService
        this.profileImageUrl = this.authService.getUserProfileImageUrl(userFromApi);
      },
      error: (err) => {
        console.error('Failed to load user for header avatar:', err);
      }
    });
  }

  scrollToTop(): void {
  setTimeout(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 100);
}

  
   scrollToRestaurants() {
    this.activeLink = 'restaurants';
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


  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const clickedInside =
      target.closest('.user-menu') || target.closest('.menu-icon');
    if (!clickedInside) {
      this.dropdownOpen = false;
    }
  }

  goToCart(): void {
    const user = this.authService.getUser();
    if (user && user.userID) {
      this.router.navigate(['/cart', user.userID]);
    } else {
      this.router.navigate(['/login']);
    }
  }

  myOrders() {
  this.router.navigate(['/myorder']).then(() => {
    window.scrollTo(0, 0);
  });
}
  myAccount() {
     this.router.navigate(['/myaccount']).then(() => {
    window.scrollTo(0, 0);
  });
  }

  loadCartCount() {
    this.authService.getCartItemCount(this.userId).subscribe(
      count => (this.cartCount = count),
      err => console.error('Failed to fetch cart count', err)
    );
  }

  loadLiveOrderCount() {
  this.authService.getRiderLiveOrderCount(this.userId).subscribe({
    next: (res) => {
      if (res && res.success) {
        this.liveOrderCount = res.liveOrderCount;
      }
    },
    error: (err) => console.error('Error fetching live order count:', err)
  });
}

loadLiveOrderCountforRestaurant() {
  this.authService.getRestaurantLiveOrderCount(this.restaurantId).subscribe({
    next: (res) => {
      if (res && res.success && res.data) {
        this.liveOrderCount = res.data.activeOrdersCount;
      } else {
        this.liveOrderCount = 0;
      }
    },
    error: (err) => {
      console.error('Error fetching restaurant live order count:', err);
      this.liveOrderCount = 0;
    }
  });
}

initRestaurantLiveOrderCount(): void {
  const storedUser = localStorage.getItem('user');

  if (storedUser) {
    const user = JSON.parse(storedUser);

    if (user.restaurantID) {
      this.restaurantId = user.restaurantID;
      this.loadLiveOrderCountforRestaurant();
    } 
    else {
      this.authService.getRestaurantByUser(user.userID).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.restaurantId = res.data.restaurantID;
            this.loadLiveOrderCountforRestaurant();
          } else {
            console.warn('No restaurant linked to this account.');
          }
        },
        error: (err) => {
          console.error('Failed to fetch restaurant details:', err);
        }
      });
    }
  } else {
    console.warn('User not found in local storage.');
  }
}


goToRestaurantLiveOrders(): void {
  this.router.navigate(['/restaurant-live-order']).then(() => {
    window.scrollTo(0, 0);
  });
}


  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleAIChat() {
  this.isAIChatOpen = !this.isAIChatOpen;
}
}
