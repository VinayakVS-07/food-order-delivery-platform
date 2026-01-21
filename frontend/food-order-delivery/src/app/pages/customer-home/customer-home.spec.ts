import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerHome } from './customer-home';

describe('CustomerHome', () => {
  let component: CustomerHome;
  let fixture: ComponentFixture<CustomerHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CustomerHome]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerHome);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
