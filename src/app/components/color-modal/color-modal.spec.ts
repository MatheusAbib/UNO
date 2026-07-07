import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColorModal } from './color-modal';

describe('ColorModal', () => {
  let component: ColorModal;
  let fixture: ComponentFixture<ColorModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColorModal],
    }).compileComponents();

    fixture = TestBed.createComponent(ColorModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
