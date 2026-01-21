import { Component,OnInit, OnDestroy,HostListener, ViewChild, ElementRef  } from '@angular/core';
import { AuthService } from '../../auth/services/auth.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-customer-home',
  standalone: false,
  templateUrl: './customer-home.html',
  styleUrl: './customer-home.css'
})
export class CustomerHome implements OnInit {

   @ViewChild('restaurantSection') restaurantSection!: ElementRef;

  searchTerm = '';
  categories: any[] = [];
  restaurants: any[] = [];
  selectedCategory: string | null = null;
  popularItems: any[] = [];
  filteredRestaurants: any[] = [];
  menuItems: any[] = [];
  selectedRestaurant: any = null;
  dropdownOpen = false;
  fullName = '';
  cartCount: number = 0;
  userId!: number;

  heroImages: string[] = [
    'assets/banner1.png',
    'assets/banner2.png',
    'assets/banner3.png'
  ];
  currentImageIndex = 0;
  slideInterval: any;

  autoScrollInterval: any;
  autoScrollPaused = false;
  currentIndex = 0;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    const user  = this.authService.getUser();
     if (user) {
      this.fullName = `${user.firstName} ${user.lastName}`;
       this.userId = user.userID;
    } else {
      this.fullName = 'Guest';
    }
    this.loadCategories();
    this.loadRestaurants();
    this.startSlideshow();
    this.loadMenuItems();

  }

  loadCategories() {
    this.authService.getCategoriesWithImages().subscribe({
      next: (res) => {
        if (res && res.success && res.data) {
          this.categories = res.data;
        } else {
          this.categories = [];
          
        }
      },
      error: (err) => {
        console.error('Error fetching categories:', err);
        this.categories = [];
      }
    });
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

  onCategoryChange() {
    if (this.selectedCategory) {
      this.authService.getRestaurantsByCategory(this.selectedCategory).subscribe(res=> {
        
        this.restaurants = res;
        
      });
      
    }
  }

  loadRestaurants(): void {
    this.authService.getAllRestaurants().subscribe({
      next: res => {
        this.restaurants = res;
        this.filteredRestaurants = res;
      },
      error: err => console.error(err)
    });
  }

  toggleCategory(category: string): void {
    if (this.selectedCategory === category) {
      // Click again → reset to all
      this.selectedCategory = null;
      this.filteredRestaurants = this.restaurants;
      
    } else {
      // Filter by new category
      this.selectedCategory = category;
      this.scrollToRestaurants();
      this.authService.getRestaurantsByCategory(category).subscribe({
        
        next: res => this.filteredRestaurants = res,
        
        error: err => console.error(err)
      });
    }
  }

  onSearch(): void {
    if (this.searchTerm.trim()) {
      this.authService.search(this.searchTerm).subscribe({
        next: res => {
        this.filteredRestaurants = res;
         this.scrollToRestaurants();
        },
        error: err => console.error(err)
      });
    } else {
      this.filteredRestaurants = this.restaurants;
    }
  }

  clearSearch(): void {
  this.searchTerm = '';
  this.filteredRestaurants = this.restaurants;
}

   scrollToRestaurants(): void {
    setTimeout(() => {
      if (this.restaurantSection) {
        this.restaurantSection.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 300);
  }

    viewMenu(restaurant: any): void {
    if (!restaurant) return;
    const id =
      restaurant.restaurantID ??
      restaurant.RestaurantID ??
      restaurant.id ??
      restaurant.Id ??
      restaurant.ID;

      const name =
    restaurant.name ??
    restaurant.Name ??
    restaurant.restaurantName ??
    'Restaurant';

    if (!id && id !== 0) {
    
      return;
    }

    
     this.router.navigate(
    ['/menu', id],
    {
      queryParams: { name: name },
      queryParamsHandling: 'merge'
    }
  ).then(() => {
    window.scrollTo(0, 0);
  });
}
  // ✅ Hero Slideshow Controls
  startSlideshow(): void {
    this.slideInterval = setInterval(() => {
      this.nextSlide();
    }, 6000); 
  }

  nextSlide(): void {
    this.currentImageIndex = (this.currentImageIndex + 1) % this.heroImages.length;
  }

  goToSlide(index: number): void {
    this.currentImageIndex = index;
  }

  ngOnDestroy(): void {
    if (this.slideInterval) clearInterval(this.slideInterval);
  }

  loadMenuItems(): void {
  this.authService.getAllMenuItems().subscribe({
    next: (res: any) => {
      if (res && res.success) {
        this.menuItems = res.data;
        setTimeout(() => {
          // 🕹 Restore saved position if available
          const savedIndex = sessionStorage.getItem('menuCarouselIndex');
          this.currentIndex = savedIndex ? parseInt(savedIndex, 10) : 0;
          this.startMenuAutoScroll();
        }, 500);
      }
    },
    error: err => console.error('Error loading menu items', err)
  });
}


startMenuAutoScroll(): void {
  const visibleCount = 8;
  const itemWidth = 250;
  const scaleStep = 0.15;
  const carousel = document.querySelector('.menu-carousel') as HTMLElement;
  if (!carousel) return;

  const cards = Array.from(carousel.querySelectorAll('.menu-card')) as HTMLElement[];
  const total = cards.length;
  const centerIndex = Math.floor(visibleCount / 2);

  const updatePositions = () => {
    cards.forEach((card, i) => {
      const offset = ((i - this.currentIndex + total) % total);
      let position = offset - centerIndex;

      if (position < -centerIndex) position += total;
      if (position > centerIndex) position -= total;

      const x = position * itemWidth;
      const scale = 1 - Math.abs(position) * scaleStep;
      const opacity = 1 - Math.abs(position) * 0.2;

      card.style.transform = `translateX(${x}px) scale(${scale})`;
      card.style.opacity = `${opacity}`;
      card.style.zIndex = `${100 - Math.abs(position)}`;
      card.classList.toggle('center', position === 0);
    });
  };

  // initial draw
  updatePositions();
  if (this.autoScrollInterval) clearInterval(this.autoScrollInterval);

  // auto-scroll loop
  this.autoScrollInterval = setInterval(() => {
    if (!this.autoScrollPaused) {
      this.currentIndex = (this.currentIndex + 1) % total;
      updatePositions();
    }
  }, 2000);

  // store function for manual calls
  (this as any).updatePositions = updatePositions;

   // 🖱️ Hover Pause/Resume setup
  carousel.addEventListener('mouseenter', () => this.pauseAutoScroll(true));
  carousel.addEventListener('mouseleave', () => this.pauseAutoScroll(false));
}

pauseAutoScroll(pause: boolean | null = true): void {
  if (pause) {
    this.autoScrollPaused = true;
    clearTimeout((this as any).resumeTimeout);
  } else {
    // resume only if not manually paused by click
    (this as any).resumeTimeout = setTimeout(() => {
      this.autoScrollPaused = false;
    }, 500);
  }
}

// ✅ Arrow controls with sync + pause
moveMenu(direction: 'left' | 'right'): void {
  this.pauseAutoScroll(true); // temporarily pause on arrow click
  clearTimeout((this as any).resumeTimeout);
  (this as any).resumeTimeout = setTimeout(() => (this.autoScrollPaused = false), 3000);

  const carousel = document.querySelector('.menu-carousel') as HTMLElement;
  if (!carousel) return;

  const cards = Array.from(carousel.querySelectorAll('.menu-card')) as HTMLElement[];
  const total = cards.length;

  // update index (stay in sync)
  this.currentIndex =
    direction === 'left'
      ? (this.currentIndex - 1 + total) % total
      : (this.currentIndex + 1) % total;

  // re-render positions
  if ((this as any).updatePositions) (this as any).updatePositions();
}

// ✅ Card click → navigate like restaurant “View Menu”
openMenuItem(item: any): void {
  if (!item || !item.restaurantID) return;

   sessionStorage.setItem('menuCarouselIndex', this.currentIndex.toString());
  this.router.navigate(['/menu', item.restaurantID], {
    queryParams: { name: item.restaurantName },
    queryParamsHandling: 'merge'
  }).then(() => window.scrollTo(0, 0));
}


  
}
