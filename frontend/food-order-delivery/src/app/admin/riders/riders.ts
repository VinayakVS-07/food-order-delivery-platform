import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { AuthService } from '../../auth/services/auth.service';
import { MatPaginator, PageEvent  } from '@angular/material/paginator';
import { MatSort, Sort} from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ApproveRidersDialog } from '../approve-riders-dialog/approve-riders-dialog';


export interface Rider {
  riderID: number;
  riderName: string;
  email: string;
  phone: string;
  isOnline: boolean;
  isActive: boolean;
  totalOrders: number;
  monthlyEarnings: number;
  floatingCash: number;
  registeredDate: string;
}

export interface RiderResponse {
  success: boolean;
  data: Rider[];
  totalCount: number;
}


@Component({
  selector: 'app-riders',
  standalone: false,
  templateUrl: './riders.html',
  styleUrl: './riders.css'
})
export class Riders implements OnInit, AfterViewInit {
   displayedColumns: string[] = [
    'riderName',
    'email',
    'phone',
    'isOnline',
    'totalOrders',
    'monthlyEarnings',
    'floatingCash',
    'isActive',
    'actions'
  ];
  dataSource = new MatTableDataSource<Rider>([]);
  
  searchTerm = '';
  totalCount = 0;
  filter = { page: 1, pageSize: 5, search: '', sortColumn: 'riderName', sortDirection: 'asc' };
  
  private searchSubject = new Subject<string>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private authService: AuthService, private snackBar: MatSnackBar,private dialog: MatDialog, private router: Router) {}

  ngOnInit(): void {
    this.loadRiders();

    this.searchSubject.pipe(
      debounceTime(100),
      distinctUntilChanged()
    ).subscribe(term => {
      this.filter.page = 1;
      this.filter.search = term;
      this.loadRiders();
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.sort.sortChange.subscribe((sortState: Sort) => {
      this.filter.sortColumn = sortState.active;
      this.filter.sortDirection = sortState.direction || 'asc';
      this.loadRiders();
    });
  }

 loadRiders(): void {
  this.authService.getRiders(this.filter).subscribe({
    next: (res: any) => {
      if (res.success && res.data && res.data.length > 0) {
        this.dataSource.data = res.data;
        this.totalCount = res.totalCount;
      } else {
        this.dataSource.data = [];
        this.totalCount = 0;
      }
    },
    error: (err) => {
      console.error('Error loading riders:', err);
      this.dataSource.data = [];
      this.totalCount = 0;
    }
  });
}


  // Auto-search as user types
  onSearchChange(value: string): void {
    this.searchSubject.next(value);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filter.search = '';
    this.loadRiders();
  }

  // Pagination
  onPageChange(event: PageEvent): void {
    this.filter.page = event.pageIndex + 1;
    this.filter.pageSize = event.pageSize;
    this.loadRiders();
  }

  toggleStatus(rider: Rider): void {
  const newStatus = !rider.isActive;

  this.authService.toggleRiderStatus(rider.riderID, newStatus).subscribe({
    next: (res: any) => {
      if (res.success) {
        rider.isActive = newStatus;
        this.snackBar.open(res.message, 'Close', { duration: 2500, panelClass: ['snackbar-success'] });
      } else {
        this.snackBar.open('Failed to update status.', 'Close', { duration: 2500, panelClass: ['snackbar-error'] });
      }
    },
    error: (err) => {
      console.error('Error updating status:', err);
      this.snackBar.open('Server error while updating status.', 'Close', { duration: 2500, panelClass: ['snackbar-error'] });
    }
  });
}


approveRiders(): void {
  const dialogRef = this.dialog.open(ApproveRidersDialog, {
    width: '1000px',   // ⬅️ widened for better table fit
    maxHeight: '85vh', // prevent overflow
    panelClass: 'approve-riders-dialog', // optional custom class
    disableClose: true
  });

  dialogRef.afterClosed().subscribe((refresh: boolean) => {
    if (refresh) {
      this.loadRiders();
    }
  });
}

}