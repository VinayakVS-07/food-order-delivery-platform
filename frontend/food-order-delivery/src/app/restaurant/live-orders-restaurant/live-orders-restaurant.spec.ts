import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveOrdersRestaurant } from './live-orders-restaurant';

describe('LiveOrdersRestaurant', () => {
  let component: LiveOrdersRestaurant;
  let fixture: ComponentFixture<LiveOrdersRestaurant>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LiveOrdersRestaurant]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LiveOrdersRestaurant);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
