import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddressboxDialog } from './addressbox-dialog';

describe('AddressboxDialog', () => {
  let component: AddressboxDialog;
  let fixture: ComponentFixture<AddressboxDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddressboxDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddressboxDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
