import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VistaAdministradorComponent } from './vista-administrador.component';

describe('VistaAdministradorComponent', () => {
  let component: VistaAdministradorComponent;
  let fixture: ComponentFixture<VistaAdministradorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VistaAdministradorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VistaAdministradorComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
