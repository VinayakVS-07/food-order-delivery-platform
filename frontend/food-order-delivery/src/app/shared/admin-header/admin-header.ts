import { Component,  OnInit, HostListener,ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-admin-header',
  standalone: false,
  templateUrl: './admin-header.html',
  styleUrl: './admin-header.css'
})
export class AdminHeader implements OnInit {

 @ViewChild('restaurantSection') restaurantSection!: ElementRef;

  dropdownOpen = false;
  fullName = '';
  
  userId!: number;
  activeLink: string = '';
  activeOrderCount: number = 0;

   profileImageUrl: string | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (user) {
      this.fullName = `${user.firstName} ${user.lastName}`;
      this.userId = user.userID;

        this.loadHeaderUserFromApi();

     this.authService.userUpdated.subscribe(updatedUser => {
     if (!updatedUser) return;
        if (updatedUser.userID !== this.userId) return; // ignore other users

        this.fullName = `${updatedUser.firstName} ${updatedUser.lastName}`;
        this.profileImageUrl = this.authService.getUserProfileImageUrl(updatedUser);
  });
}
    
    else {
      this.fullName = 'Guest';
       this.profileImageUrl = null;
    }
    this.fetchActiveOrderCount();
    // Optional auto-refresh every 20s
    setInterval(() => this.fetchActiveOrderCount(), 20000);
  }

   private loadHeaderUserFromApi(): void {
    if (!this.userId) return;

    this.authService.getUserById(this.userId).subscribe({
      next: (userFromApi: any) => {
        this.profileImageUrl = this.authService.getUserProfileImageUrl(userFromApi);
      },
      error: (err) => {
        console.error('Failed to load admin user for header avatar:', err);
      }
    });
  }

   fetchActiveOrderCount(): void {
    this.authService.getAdminActiveOrderCount().subscribe({
      next: (res) => {
        if (res?.success && res.data?.activeOrdersCount >= 0) {
          this.activeOrderCount = res.data.activeOrdersCount;
        }
      },
      error: (err) => console.error('Error fetching active order count:', err)
    });
  }

  scrollToTop(): void {
  setTimeout(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 100);
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

  goToOrders(): void {
  this.router.navigate(['/all-orders']).then(() => {
    window.scrollTo(0, 0);
  });
}


  myAccount() {
     this.router.navigate(['/myaccount']).then(() => {
    window.scrollTo(0, 0);
  });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

