import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth/services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ChangePasswordDialog } from '../change-password-dialog/change-password-dialog';

@Component({
  selector: 'app-my-account',
  standalone: false,
  templateUrl: './my-account.html',
  styleUrl: './my-account.css'
})
export class MyAccount implements OnInit {
  user: any;
  profileForm!: FormGroup;
  editMode = false;
  loading = false;
  userRole: string | null = null;
  profileImagePreview: string | null = null;
  selectedProfileFile: File | null = null;


  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }



  ngOnInit(): void {
    const storedUser = this.authService.getUser();
    if (storedUser?.userID) {
      this.loadUserDetails(storedUser.userID);
      this.userRole = this.authService.getUserRole();
    }

    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: [{ value: '', disabled: true }],
      phone: ['', Validators.required],
      registeredDate: [{ value: '', disabled: true }]
    });
  }

  loadUserDetails(id: number) {
    this.authService.getUserById(id).subscribe({
      next: (res) => {
        this.user = res;
        this.profileForm.patchValue(res);
        this.profileImagePreview = this.authService.getUserProfileImageUrl(this.user);
      },
      error: () =>
        this.snackBar.open('Failed to load user details', 'Close', { duration: 3000 })
    });
  }

  enableEdit() {
    this.editMode = true;
  }

  onProfileImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.snackBar.open('Please select an image', 'Close', { duration: 3000 });
      return;
    }

    this.selectedProfileFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.profileImagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  saveChanges() {
    if (this.profileForm.invalid || !this.user) return;

    this.loading = true;
    const storedUser = this.authService.getUser();

    const doUpdateUser = (profileImagePath?: string | null) => {
      const updatedUser = {
        userID: this.user.userID,
        firstName: this.profileForm.value.firstName,
        lastName: this.profileForm.value.lastName,
        password: this.user.password,
        email: this.user.email,
        phone: this.profileForm.value.phone,
        roleID: this.user.roleID ?? storedUser?.roleID,
        roleName: this.user.roleName ?? storedUser?.roleName,
        registeredDate: this.user.registeredDate ?? new Date(),
        status: this.user.status ?? 'Active',
        createdBy: this.user.createdBy ?? 'System',
        isActive: this.user.isActive ?? true,
        modifiedBy: `${this.user.firstName} ${this.user.lastName}`,

        profileImagePath: profileImagePath ?? this.user.profileImagePath ?? null
      };

      this.authService.updateUser(updatedUser).subscribe({
        next: () => {
          this.snackBar.open('Profile updated successfully!', 'Close', { duration: 3000 });
          this.editMode = false;
          this.loading = false;
          this.user = updatedUser;

          if (storedUser) {
            const updatedStoredUser = {
              ...storedUser,
              firstName: updatedUser.firstName,
              lastName: updatedUser.lastName,
              phone: updatedUser.phone,
              fullName: `${updatedUser.firstName} ${updatedUser.lastName}`,
              profileImagePath: updatedUser.profileImagePath
            };
            localStorage.setItem('user', JSON.stringify(updatedStoredUser));
            this.authService.userUpdated?.next(updatedStoredUser);
          }

          this.loadUserDetails(this.user.userID);
        },
        error: () => {
          this.snackBar.open('Failed to update profile', 'Close', { duration: 3000 });
          this.loading = false;
        }
      });
    };

    // ⬇️ Upload new image first if selected
    if (this.selectedProfileFile) {
      this.authService.uploadProfilePicture(this.user.userID, this.selectedProfileFile)
        .subscribe({
          next: (response: any) => {
            const rawPath = response?.data?.profileImagePath || null;
            this.user.profileImagePath = rawPath;
            this.profileImagePreview = this.authService.buildImageUrl(rawPath);
            doUpdateUser(rawPath);
          },
          error: (err) => {
            console.error('Image upload failed:', err);
            this.snackBar.open('Failed to upload image', 'Close', { duration: 3000 });
            this.loading = false;
          }
        });
    } else {
      doUpdateUser();
    }
  }

  cancelEdit() {
    this.editMode = false;
    this.selectedProfileFile = null;
    this.profileImagePreview = this.authService.getUserProfileImageUrl(this.user);
  }

  openChangePasswordDialog() {
    this.dialog.open(ChangePasswordDialog, {
      width: '450px',
      data: { userID: this.user.userID }
    });
  }
}
