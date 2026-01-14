import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VistaInventarioComponent } from './vista-inventario.component';

describe('VistaInventarioComponent', () => {
  let component: VistaInventarioComponent;
  let fixture: ComponentFixture<VistaInventarioComponent>;

  beforeEach(async () => {
    // mock localStorage used by component
    (window as any).localStorage = {
      getItem: (_: string) => '[]',
      setItem: (_: string, __: any) => {},
      removeItem: (_: string) => {},
    };

    await TestBed.configureTestingModule({
      imports: [VistaInventarioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VistaInventarioComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
