import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestaurantDashboard } from './restaurant-dashboard';

describe('RestaurantDashboard', () => {
  let component: RestaurantDashboard;
  let fixture: ComponentFixture<RestaurantDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RestaurantDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RestaurantDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
