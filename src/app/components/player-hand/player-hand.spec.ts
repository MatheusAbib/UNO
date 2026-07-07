import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerHand } from './player-hand';

describe('PlayerHand', () => {
  let component: PlayerHand;
  let fixture: ComponentFixture<PlayerHand>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlayerHand],
    }).compileComponents();

    fixture = TestBed.createComponent(PlayerHand);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
