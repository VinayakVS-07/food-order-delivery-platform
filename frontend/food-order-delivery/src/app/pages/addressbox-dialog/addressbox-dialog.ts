import { Component, Inject, OnInit  } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-addressbox-dialog',
  standalone: false,
  templateUrl: './addressbox-dialog.html',
  styleUrls: ['./addressbox-dialog.css']
})
export class AddressboxDialog implements OnInit {
  addresses: any[] = [];
  selectedAddressId: number | null = null;

  newAddress = {
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false,
    createdBy: 'Customer'
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private authService: AuthService,
    private dialogRef: MatDialogRef<AddressboxDialog>
  ) {}

  ngOnInit(): void {
    this.loadAddresses();
  }

  // Load all saved addresses
  loadAddresses(): void {
    this.authService.getCustomerAddresses(this.data.customerID).subscribe({
      next: (res: any) => {
  this.addresses = res?.data || []; // ✅ pick the actual array
  const defaultAddr = this.addresses.find(a => a.isDefault);
  if (defaultAddr) this.selectedAddressId = defaultAddr.addressID;
},

      error: err => console.error('Address fetch error:', err)
    });
  }

  // Save new address
  saveAddress(): void {
    if (!this.newAddress.addressLine1 || !this.newAddress.city || !this.newAddress.state) {
      alert('Please fill all required fields.');
      return;
    }

    const payload = { ...this.newAddress, customerID: this.data.customerID };

    this.authService.addCustomerAddress(payload).subscribe({
      next: () => {
        alert('✅ Address added!');
        // reset form
        this.newAddress = {
          addressLine1: '',
          addressLine2: '',
          city: '',
          state: '',
          pincode: '',
          isDefault: false,
          createdBy: 'Customer'
        };
        // reload addresses including the new one
        this.loadAddresses();
      },
      error: err => console.error('Add address error:', err)
    });
  }

  confirmSelection(): void {
    const selected = this.addresses.find(a => a.addressID === this.selectedAddressId);
    if (!selected) {
      alert('Please select an address.');
      return;
    }
    this.dialogRef.close(selected);
  }

  close(): void {
    this.dialogRef.close();
  }
}