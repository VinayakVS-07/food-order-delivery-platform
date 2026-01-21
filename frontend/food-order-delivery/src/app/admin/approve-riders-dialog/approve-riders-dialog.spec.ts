import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproveRidersDialog } from './approve-riders-dialog';

describe('ApproveRidersDialog', () => {
  let component: ApproveRidersDialog;
  let fixture: ComponentFixture<ApproveRidersDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ApproveRidersDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApproveRidersDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
