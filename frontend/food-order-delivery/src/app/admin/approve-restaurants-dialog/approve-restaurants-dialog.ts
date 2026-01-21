import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth/services/auth.service';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-approve-restaurants-dialog',
  standalone: false,
  templateUrl: './approve-restaurants-dialog.html',
  styleUrl: './approve-restaurants-dialog.css'
})
export class ApproveRestaurantsDialog implements OnInit {
  pendingUsers: any[] = [];
  loading = true;
  approving: number | null = null;

  constructor(
    private dialogRef: MatDialogRef<ApproveRestaurantsDialog>,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.fetchPendingUsers();
  }

  fetchPendingUsers(): void {
    this.authService.getPendingRestaurants().subscribe({
      next: (res) => {
        if (res.success) {
          this.pendingUsers = res.data;
        } else {
          this.snackBar.open('Failed to fetch riders.', 'Close', { duration: 3000 });
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Error fetching riders.', 'Close', { duration: 3000 });
      }
    });
  }

  approveUser(user: any): void {
    this.approving = user.userID;

    this.authService.approveUser(user.userID, 'Admin').subscribe({
      next: (res) => {
        if (res.success) {
          this.snackBar.open(`${user.name} approved successfully!`, 'Close', {
            duration: 3000,
            panelClass: ['snackbar-success']
          });
          this.pendingUsers = this.pendingUsers.filter(r => r.userID !== user.userID);
        } else {
          this.snackBar.open('Approval failed.', 'Close', { duration: 3000 });
        }
        this.approving = null;
      },
      error: () => {
        this.snackBar.open('Error approving rider.', 'Close', { duration: 3000 });
        this.approving = null;
      }
    });
  }

  closeDialog(): void {
    this.dialogRef.close(true);
  }
}