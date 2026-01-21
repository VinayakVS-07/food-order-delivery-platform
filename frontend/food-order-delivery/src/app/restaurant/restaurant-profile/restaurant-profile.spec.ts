import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestaurantProfile } from './restaurant-profile';

describe('RestaurantProfile', () => {
  let component: RestaurantProfile;
  let fixture: ComponentFixture<RestaurantProfile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RestaurantProfile]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RestaurantProfile);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
