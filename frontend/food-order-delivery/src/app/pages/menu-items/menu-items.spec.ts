import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuItems } from './menu-items';

describe('MenuItems', () => {
  let component: MenuItems;
  let fixture: ComponentFixture<MenuItems>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MenuItems]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuItems);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
