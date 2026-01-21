import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproveRestaurantsDialog } from './approve-restaurants-dialog';

describe('ApproveRestaurantsDialog', () => {
  let component: ApproveRestaurantsDialog;
  let fixture: ComponentFixture<ApproveRestaurantsDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ApproveRestaurantsDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApproveRestaurantsDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
