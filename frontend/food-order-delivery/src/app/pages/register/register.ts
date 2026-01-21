import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { interval, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class Register implements OnInit, OnDestroy {
  registerForm!: FormGroup;
  message = '';

  // OTP state
  otpCode = '';
  otpSent = false;
  emailVerified = false;
  sendingOtp = false;
  verifyingOtp = false;
  resendEnabled = false;
  countdown = 0; // seconds remaining
  private countdownSub?: Subscription;

  verifiedEmail: string | null = null;


  roles = [
    { id: 1, name: 'Customer' },
    { id: 3, name: 'Restaurant' },
    { id: 2, name: 'Rider' }
  ];


  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      password: ['', [Validators.required, Validators.minLength(7), Validators.pattern('^(?=.*[!@#$%^&*()_+\\-=\\[\\]{};\'":|,.<>/?]).{7,}$')]],
      confirmPassword: ['', Validators.required],
      roleID: [this.roles[0].id, Validators.required],
      otpCode: ['']
    }, { validators: this.passwordMatchValidator });

    this.registerForm.get('email')?.valueChanges.subscribe(value => {
      if (this.emailVerified && value !== this.verifiedEmail) {
        // Email changed after verification → reset OTP state
        this.emailVerified = false;
        this.verifiedEmail = null;
        this.otpSent = false;
        this.registerForm.patchValue({ otpCode: '' });

        this.snackBar.open(
          'Email changed. Please verify the new email.',
          'Close',
          { duration: 3000, panelClass: ['snackbar-error'] }
        );
      }
    });
  }


  ngOnDestroy(): void {
    this.countdownSub?.unsubscribe();
  }

  passwordMatchValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  };

  // ---------- OTP actions ----------
  sendOtp(): void {
    this.message = '';
    this.emailVerified = false;

    const emailControl = this.registerForm.get('email');
    if (!emailControl || emailControl.invalid) {
      this.snackBar.open('Enter a valid email before sending OTP.', 'Close', { duration: 3000, panelClass: ['snackbar-error'] });
      return;
    }

    const email = emailControl.value?.toString().trim();
    if (!email) {
      this.snackBar.open('Enter a valid email before sending OTP.', 'Close', { duration: 3000, panelClass: ['snackbar-error'] });
      return;
    }

    this.sendingOtp = true;

    this.authService.sendOtp(email).subscribe({
      next: (res: any) => {
        this.sendingOtp = false;
        if (res?.success) {
          this.otpSent = true;
          this.resendEnabled = false;
          // clear any previous OTP in the input (reactive control)
          this.registerForm.patchValue({ otpCode: '' });
          this.startCountdown(60); // 60 seconds cooldown
          this.snackBar.open('OTP sent to your email.', 'Close', { duration: 3000, panelClass: ['snackbar-success'] });
        } else {
          this.snackBar.open(res?.message || 'Failed to send OTP.', 'Close', { duration: 3500, panelClass: ['snackbar-error'] });
        }
      },
      error: (err) => {
        this.sendingOtp = false;
        console.error('Send OTP error', err);
        this.snackBar.open('Error sending OTP. Try again later.', 'Close', { duration: 3500, panelClass: ['snackbar-error'] });
      }
    });
  }

  startCountdown(seconds: number): void {
    this.countdownSub?.unsubscribe();
    this.countdown = seconds;
    this.resendEnabled = false;

    this.countdownSub = interval(1000).pipe(take(seconds)).subscribe({
      next: _ => {
        this.countdown--;
        if (this.countdown <= 0) {
          this.resendEnabled = true;
          this.countdownSub?.unsubscribe();
        }
      },
      complete: () => {
        this.resendEnabled = true;
      }
    });
  }

  resendOtp(): void {
    if (!this.resendEnabled) {
      return;
    }
    this.sendOtp();
  }


  verifyOtp(): void {
    const email = this.registerForm.get('email')?.value?.toString().trim();
    if (!email) {
      this.snackBar.open('Enter a valid email before verifying OTP.', 'Close', { duration: 3000, panelClass: ['snackbar-error'] });
      return;
    }

    const otp = this.registerForm.get('otpCode')?.value?.toString().trim();
    if (!otp) {
      this.snackBar.open('Please enter the OTP received by email.', 'Close', { duration: 3000, panelClass: ['snackbar-error'] });
      return;
    }

    this.verifyingOtp = true;


    this.authService.verifyOtp(email, otp).subscribe({
      next: (res: any) => {
        this.verifyingOtp = false;
        if (res?.success) {
          this.emailVerified = true;
          this.verifiedEmail = email;

          // stop countdown and disable resend
          this.countdownSub?.unsubscribe();
          this.resendEnabled = false;
          this.countdown = 0;

          // lock OTP UI
          this.otpSent = true;

          this.snackBar.open('Email verified successfully.', 'Close', { duration: 3000, panelClass: ['snackbar-success'] });
        } else {
          this.snackBar.open(res?.message || 'Invalid or expired OTP.', 'Close', { duration: 3500, panelClass: ['snackbar-error'] });
        }
      },
      error: (err) => {
        this.verifyingOtp = false;
        console.error('Verify OTP error', err);
        this.snackBar.open('Error verifying OTP. Try again later.', 'Close', { duration: 3500, panelClass: ['snackbar-error'] });
      }
    });
  }

  // ---------- Registration submit ----------

  onSubmit(): void {
    this.message = '';

    if (this.registerForm.invalid) {
      this.message = 'Please fix the errors before submitting.';
      return;
    }

    // block registration unless emailVerified is true
    if (!this.emailVerified) {
      this.snackBar.open('Please verify your email before registering.', 'Close', { duration: 3500, panelClass: ['snackbar-error'] });
      return;
    }

    const selectedRoleId = Number(this.registerForm.value.roleID);
    const selectedRole = this.roles.find(r => r.id === selectedRoleId);

    // Set status logic based on role
    let status = 'Active';
    let isActive = true;

    if (selectedRoleId === 2 || selectedRoleId === 3) {
      // Rider or Restaurant
      status = 'Pending';
      isActive = false;
    }

    const userData = {
      userID: 0,
      firstName: this.registerForm.value.firstName,
      lastName: this.registerForm.value.lastName,
      email: this.registerForm.value.email,
      phone: this.registerForm.value.phone,
      password: this.registerForm.value.password,
      roleID: selectedRoleId,
      roleName: selectedRole?.name || '',
      registeredDate: new Date().toISOString(),
      status: status,
      createdBy: this.registerForm.value.firstName,
      isActive: isActive
    };

    this.authService.register(userData).subscribe(
      (res: any) => {
        if (res.success) {
          // Show message based on role
          let message = '';

          if (selectedRoleId === 1) {
            message = 'Registration successful! Please login.';
          } else if (selectedRoleId === 2 || selectedRoleId === 3) {
            message = 'Registration successful! Please wait for admin approval.';
          }

          this.snackBar.open(message, 'Close', {
            duration: 4000,
            panelClass: ['snackbar-success']
          });

          this.router.navigate(['/login']);
        } else {
          this.snackBar.open(res.message || 'Registration failed.', 'Close', {
            duration: 4000,
            panelClass: ['snackbar-error']
          });
        }
      },
      (err) => {
        this.snackBar.open('Error during registration. Try again later.', 'Close', {
          duration: 4000,
          panelClass: ['snackbar-error']
        });
      }
    );
  }
}