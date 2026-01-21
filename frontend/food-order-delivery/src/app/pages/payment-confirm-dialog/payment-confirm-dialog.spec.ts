import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentConfirmDialog } from './payment-confirm-dialog';

describe('PaymentConfirmDialog', () => {
  let component: PaymentConfirmDialog;
  let fixture: ComponentFixture<PaymentConfirmDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PaymentConfirmDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentConfirmDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
