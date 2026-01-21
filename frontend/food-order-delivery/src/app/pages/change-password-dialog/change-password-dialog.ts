import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../auth/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-change-password-dialog',
  standalone: false,
  templateUrl: './change-password-dialog.html',
  styleUrl: './change-password-dialog.css'
})
export class ChangePasswordDialog {
passwordForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<ChangePasswordDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.passwordForm = this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(7), Validators.pattern('^(?=.*[!@#$%^&*()_+\\-=\\[\\]{};\':"\\\\|,.<>/?]).{7,}$')]],
      confirmPassword: ['', Validators.required]
    });
  }

  submit() {
    if (this.passwordForm.invalid) return;
    const { oldPassword, newPassword, confirmPassword } = this.passwordForm.value;
    if (newPassword !== confirmPassword) {
      this.snackBar.open('Passwords do not match.', 'Close', { duration: 3000 });
      return;
    }

    const payload = { userID: this.data.userID, oldPassword, newPassword };
    this.loading = true;
    this.authService.changePassword(payload).subscribe({
      next: () => {
        this.snackBar.open('Password changed successfully!', 'Close', { duration: 3000 });
        this.dialogRef.close();
      },
      error: (err) => {
        this.snackBar.open(err.error || 'Failed to change password.', 'Close', { duration: 3000 });
      },
      complete: () => (this.loading = false)
    });
  }
  
  get newPassword() {
    return this.passwordForm.get('newPassword');
  }
}