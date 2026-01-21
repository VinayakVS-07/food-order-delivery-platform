import { Component,OnInit, ElementRef, ViewChild, Renderer2  } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-order-detail',
  standalone: false,
  templateUrl: './order-detail.html',
  styleUrl: './order-detail.css'
})
export class OrderDetail implements OnInit {
  order: any;
  riderId!: number;
  isLoading = true;
  currentStatus = '';
   nextStep: any;

  @ViewChild('swipeIcon') swipeIcon!: ElementRef;
  @ViewChild('swipeTrack') swipeTrack!: ElementRef;

  @ViewChild('swipeContainer') swipeContainer!: ElementRef;

@ViewChild('swipeProgress') swipeProgress!: ElementRef;

private isSwiping = false;
private startX = 0;


  statusSteps = [
    { label: 'Accepted the order', status: 'Accepted' },
    { label: 'Reached the restaurant', status: 'Preparing' },
    { label: 'Collected from restaurant', status: 'PickedUp' },
    { label: 'Reached delivery location', status: 'Reached' },
    { label: 'Delivered order', status: 'Delivered' }
  ];

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private renderer: Renderer2,
    private router: Router
  ) {}

  ngOnInit(): void {
  const user = this.authService.getUser();
  this.riderId = user?.userID || user?.UserID || 0;

  const orderId = Number(this.route.snapshot.paramMap.get('orderId'));

  this.authService.getRiderOrderDetails(this.riderId, orderId).subscribe({
    next: (data) => {
      this.order = data;
      this.currentStatus = data.orderStatus;
      this.nextStep = this.getNextStep(data.orderStatus);
      this.isLoading = false;
    },
    error: (err) => {
      console.error(err);
      this.isLoading = false;
    }
  });
}

 getNextStep(currentStatus: string) {
    const index = this.statusSteps.findIndex((s) => s.status === currentStatus);
    return this.statusSteps[index + 1] || null;
  }

updateStatus(nextStatus: string) {
    this.authService.updateRiderOrderStatus(this.order.orderID, this.riderId, nextStatus).subscribe({
      next: (res: any) => {
        this.snackBar.open(res?.message || `Status updated to ${nextStatus}`, 'Close', { duration: 3000 });
        this.order.orderStatus = nextStatus;
        this.currentStatus = nextStatus;
        this.nextStep = this.getNextStep(nextStatus);
      },
      error: (err) => {
        console.error(err);
        this.snackBar.open('Failed to update status', 'Close', { duration: 3000 });
      }
    });
  }


onSwipeStart(event: MouseEvent | TouchEvent) {
  const e = event instanceof TouchEvent ? event.touches[0] : event;
  this.isSwiping = true;
  this.startX = e.clientX;

  const moveHandler = (moveEvent: MouseEvent | TouchEvent) => this.onSwipeMove(moveEvent);
  const endHandler = () => {
    this.isSwiping = false;
    document.removeEventListener('mousemove', moveHandler);
    document.removeEventListener('touchmove', moveHandler);
    document.removeEventListener('mouseup', endHandler);
    document.removeEventListener('touchend', endHandler);
    this.onSwipeEnd();
  };

  document.addEventListener('mousemove', moveHandler);
  document.addEventListener('touchmove', moveHandler);
  document.addEventListener('mouseup', endHandler);
  document.addEventListener('touchend', endHandler);
}

onSwipeMove(event: MouseEvent | TouchEvent) {
  if (!this.isSwiping) return;
  const e = event instanceof TouchEvent ? event.touches[0] : event;
  const containerWidth = this.swipeContainer.nativeElement.offsetWidth;
  const deltaX = Math.min(Math.max(e.clientX - this.startX, 0), containerWidth - 60);
  const progressPercent = (deltaX / containerWidth) * 100;

  this.swipeIcon.nativeElement.style.left = `${deltaX}px`;
  this.swipeProgress.nativeElement.style.width = `${progressPercent}%`;
}

onSwipeEnd() {
  const containerWidth = this.swipeContainer.nativeElement.offsetWidth;
  const iconLeft = parseFloat(this.swipeIcon.nativeElement.style.left || '0');

  if (iconLeft > containerWidth * 0.75) {
    // success — complete swipe
    this.swipeProgress.nativeElement.style.width = '100%';
    this.swipeContainer.nativeElement.classList.add('flash-success');

    // slight haptic / visual feedback
    navigator.vibrate(100);

    setTimeout(() => {
      this.updateStatus(this.nextStep.status);
      this.resetSwipe();
    }, 300);
  } else {
    // reset back
    this.resetSwipe();
  }
}

resetSwipe() {
  this.swipeIcon.nativeElement.style.left = '10px';
  this.swipeProgress.nativeElement.style.width = '0%';
  this.swipeContainer.nativeElement.classList.remove('flash-success');
}
get swipeIconEmoji(): string {
  switch (this.nextStep?.status) {
    case 'Preparing': return '🧑‍🍳';
    case 'PickedUp': return '📦';
    case 'Reached': return '📍';
    case 'Delivered': return '🏁';
    default: return '🚴‍♂️';
  }
}
navigateToLiveOrders() {
  this.router.navigate(['/live-orders']);
}

}
