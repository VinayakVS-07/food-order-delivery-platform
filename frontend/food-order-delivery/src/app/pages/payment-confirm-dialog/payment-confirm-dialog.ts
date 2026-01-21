import { Component,Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-payment-confirm-dialog',
  standalone: false,
  templateUrl: './payment-confirm-dialog.html',
  styleUrl: './payment-confirm-dialog.css'
})
export class PaymentConfirmDialog {
 constructor(
    public dialogRef: MatDialogRef<PaymentConfirmDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
}
