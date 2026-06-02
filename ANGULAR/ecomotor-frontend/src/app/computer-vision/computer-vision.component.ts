import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

type VisionTab = 'modelo-base' | 'foto-usuario';

interface DetectionSummary {
  title: string;
  description: string;
  savedPath: string;
  detections: number;
  confidences: number[];
}

@Component({
  selector: 'app-computer-vision',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './computer-vision.component.html',
  styleUrl: './computer-vision.component.css'
})
export class ComputerVisionComponent {
  activeTab: VisionTab = 'modelo-base';
  isModalOpen = false;
  isAnalyzing = false;

  readonly placeholderImage =
    'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22960%22 height=%22640%22 viewBox=%220 0 960 640%22%3E%3Cdefs%3E%3ClinearGradient id=%22g%22 x1=%220%22 x2=%221%22 y1=%220%22 y2=%221%22%3E%3Cstop offset=%220%25%22 stop-color=%22%231a7a4a%22/%3E%3Cstop offset=%22100%25%22 stop-color=%22%230d1117%22/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width=%22960%22 height=%22640%22 rx=%2240%22 fill=%22url(%23g)%22/%3E%3Crect x=%22130%22 y=%22100%22 width=%22700%22 height=%22440%22 rx=%2232%22 fill=%22%23151b23%22 stroke=%22rgba(79,255,170,0.35)%22 stroke-width=%223%22/%3E%3Cpath d=%22M260 430c40-110 120-170 182-170 36 0 55 18 75 46 18 25 38 37 72 37 37 0 73-17 110-17 47 0 82 24 94 64 14 46-9 85-58 85H308c-51 0-80-20-48-45z%22 fill=%22rgba(79,255,170,0.12)%22 stroke=%22rgba(79,255,170,0.55)%22 stroke-width=%223%22/%3E%3Ccircle cx=%22426%22 cy=%22346%22 r=%2250%22 fill=%22rgba(0,0,0,0.24)%22 stroke=%22%23f5c518%22 stroke-width=%226%22/%3E%3Cpath d=%22M404 346h44M426 324v44%22 stroke=%22%23f5c518%22 stroke-width=%226%22 stroke-linecap=%22round%22/%3E%3Ctext x=%22480%22 y=%22580%22 text-anchor=%22middle%22 fill=%22%23c8d6e5%22 font-family=%22Arial, sans-serif%22 font-size=%2234%22%3EImagen de demostraci%C3%B3n para detecci%C3%B3n de humo%3C/text%3E%3C/svg%3E';

  referenceImagePreview = this.placeholderImage;
  userImagePreview = this.placeholderImage;

  analysisSummary: DetectionSummary = {
    title: 'Modelo CNN listo para ejecutar',
    description: 'Prepara una imagen y pulsa analizar para mostrar la detección de humo en un modal.',
    savedPath: 'Pendiente de generar cuando conectes test_model.py',
    detections: 0,
    confidences: []
  };

  switchTab(tab: VisionTab): void {
    this.activeTab = tab;
  }

  onReferenceImageSelected(event: Event): void {
    this.setPreviewFromInput(event, 'reference');
  }

  onUserImageSelected(event: Event): void {
    this.setPreviewFromInput(event, 'user');
  }

  analyzeReferenceImage(): void {
    this.analyze('modelo-base');
  }

  analyzeUserImage(): void {
    this.analyze('foto-usuario');
  }

  openModal(): void {
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  get activePreviewImage(): string {
    return this.activeTab === 'modelo-base' ? this.referenceImagePreview : this.userImagePreview;
  }

  get activePreviewLabel(): string {
    return this.activeTab === 'modelo-base'
      ? 'Imagen base para ejecución del modelo'
      : 'Tu foto lista para analizar';
  }

  get activeActionLabel(): string {
    return this.activeTab === 'modelo-base' ? 'Ejecutar modelo CNN' : 'Analizar foto subida';
  }

  get activeSupportText(): string {
    return this.activeTab === 'modelo-base'
      ? 'La primera pestaña quedará lista para la imagen principal que subirás después.'
      : 'El modelo devolverá la foto procesada con el humo resaltado y las detecciones enumeradas.';
  }

  private analyze(source: VisionTab): void {
    this.isAnalyzing = true;

    window.setTimeout(() => {
      const isUserFlow = source === 'foto-usuario';

      this.analysisSummary = {
        title: isUserFlow ? 'Foto del usuario analizada' : 'Imagen base analizada',
        description: 'Resultado mockeado del frontend para mostrar cómo se verá la integración con test_model.py.',
        savedPath: 'C:\\Users\\User\\Downloads\\eco-car-IA-prueba1\\cnn-vision-service\\runs\\detect\\predict-17',
        detections: 3,
        confidences: [0.7125051021575928, 0.4930281639099121, 0.2027812898159027]
      };

      this.isAnalyzing = false;
      this.openModal();
    }, 850);
  }

  private setPreviewFromInput(event: Event, target: 'reference' | 'user'): void {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : this.placeholderImage;

      if (target === 'reference') {
        this.referenceImagePreview = result;
      } else {
        this.userImagePreview = result;
      }
    };

    reader.readAsDataURL(file);
  }

}
