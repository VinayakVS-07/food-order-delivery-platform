import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Riders } from './riders';

describe('Riders', () => {
  let component: Riders;
  let fixture: ComponentFixture<Riders>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Riders]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Riders);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
