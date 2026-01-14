import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VistaMantenimientoComponent } from './vista-mantenimiento.component';

describe('VistaMantenimientoComponent', () => {
  let component: VistaMantenimientoComponent;
  let fixture: ComponentFixture<VistaMantenimientoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VistaMantenimientoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VistaMantenimientoComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
