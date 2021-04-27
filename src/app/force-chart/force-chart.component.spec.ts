import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForceChartComponent } from './force-chart.component';

describe('ForceChartComponent', () => {
  let component: ForceChartComponent;
  let fixture: ComponentFixture<ForceChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ForceChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ForceChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
