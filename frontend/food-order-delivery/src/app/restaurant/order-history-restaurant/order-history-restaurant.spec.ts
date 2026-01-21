import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderHistoryRestaurant } from './order-history-restaurant';

describe('OrderHistoryRestaurant', () => {
  let component: OrderHistoryRestaurant;
  let fixture: ComponentFixture<OrderHistoryRestaurant>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OrderHistoryRestaurant]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderHistoryRestaurant);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
