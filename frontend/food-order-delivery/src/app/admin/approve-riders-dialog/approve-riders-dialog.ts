import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth/services/auth.service';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-approve-riders-dialog',
  standalone: false,
  templateUrl: './approve-riders-dialog.html',
  styleUrl: './approve-riders-dialog.css'
})
export class ApproveRidersDialog  implements OnInit {
  pendingRiders: any[] = [];
  loading = true;
  approving: number | null = null;

  constructor(
    private dialogRef: MatDialogRef<ApproveRidersDialog>,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.fetchPendingRiders();
  }

  fetchPendingRiders(): void {
    this.authService.getPendingRiders().subscribe({
      next: (res) => {
        if (res.success) {
          this.pendingRiders = res.data;
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

  approveRider(rider: any): void {
    this.approving = rider.userID;

    this.authService.approveRider(rider.riderID, 'Admin').subscribe({
      next: (res) => {
        if (res.success) {
          this.snackBar.open(`${rider.riderName} approved successfully!`, 'Close', {
            duration: 3000,
            panelClass: ['snackbar-success']
          });
          this.pendingRiders = this.pendingRiders.filter(r => r.riderID !== rider.riderID);
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