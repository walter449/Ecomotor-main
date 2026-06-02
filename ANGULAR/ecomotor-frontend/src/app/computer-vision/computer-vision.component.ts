import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ComputerVisionService, DetectionResponse } from '../services/computer-vision.service';

type VisionTab = 'modelo-base' | 'foto-usuario';

interface DetectionSummary {
  title: string;
  description: string;
  savedPath: string;
  detections: number;
  confidences: number[];
  vehicleStatus: string;
}

@Component({
  selector: 'app-computer-vision',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './computer-vision.component.html',
  styleUrl: './computer-vision.component.css'
})
export class ComputerVisionComponent implements OnInit {
  activeTab: VisionTab = 'modelo-base';
  isModalOpen = false;
  isAnalyzing = false;
  errorMessage = '';

  readonly placeholderImage =
    'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22960%22 height=%22640%22 viewBox=%220 0 960 640%22%3E%3Cdefs%3E%3ClinearGradient id=%22g%22 x1=%220%22 x2=%221%22 y1=%220%22 y2=%221%22%3E%3Cstop offset=%220%25%22 stop-color=%22%231a7a4a%22/%3E%3Cstop offset=%22100%25%22 stop-color=%22%230d1117%22/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width=%22960%22 height=%22640%22 rx=%2240%22 fill=%22url(%23g)%22/%3E%3Crect x=%22130%22 y=%22100%22 width=%22700%22 height=%22440%22 rx=%2232%22 fill=%22%23151b23%22 stroke=%22rgba(79,255,170,0.35)%22 stroke-width=%223%22/%3E%3Cpath d=%22M260 430c40-110 120-170 182-170 36 0 55 18 75 46 18 25 38 37 72 37 37 0 73-17 110-17 47 0 82 24 94 64 14 46-9 85-58 85H308c-51 0-80-20-48-45z%22 fill=%22rgba(79,255,170,0.12)%22 stroke=%22rgba(79,255,170,0.55)%22 stroke-width=%223%22/%3E%3Ccircle cx=%22426%22 cy=%22346%22 r=%2250%22 fill=%22rgba(0,0,0,0.24)%22 stroke=%22%23f5c518%22 stroke-width=%226%22/%3E%3Cpath d=%22M404 346h44M426 324v44%22 stroke=%22%23f5c518%22 stroke-width=%226%22 stroke-linecap=%22round%22/%3E%3Ctext x=%22480%22 y=%22580%22 text-anchor=%22middle%22 fill=%22%23c8d6e5%22 font-family=%22Arial, sans-serif%22 font-size=%2234%22%3EImagen de demostraci%C3%B3n para detecci%C3%B3n de humo%3C/text%3E%3C/svg%3E';

  referenceImagePreview = '/test.jpg';
  userImagePreview = this.placeholderImage;
  analyzedImagePreview = this.placeholderImage;

  referenceFile: File | null = null;
  userFile: File | null = null;
  private referenceSamplePromise: Promise<void> | null = null;

  analysisSummary: DetectionSummary = {
    title: 'Modelo CNN conectado',
    description: 'Sube una imagen y pulsa analizar para enviar el archivo al servicio FastAPI.',
    savedPath: 'Esperando respuesta del backend',
    detections: 0,
    confidences: [],
    vehicleStatus: 'Sin análisis'
  };

  constructor(private computerVisionService: ComputerVisionService) {}

  ngOnInit(): void {
    void this.loadReferenceSample();
  }

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
    void this.analyze('modelo-base');
  }

  analyzeUserImage(): void {
    void this.analyze('foto-usuario');
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
      ? 'Usa la imagen de prueba test.jpg que está en MACHINE_LEARNING/cnn-vision-service o cualquier otra imagen de humo que quieras probar.'
      : 'El backend devolverá la foto procesada con las cajas de detección y la confianza del modelo.';
  }

  private async analyze(source: VisionTab): Promise<void> {
    let file = source === 'modelo-base' ? this.referenceFile : this.userFile;

    if (source === 'modelo-base' && !file) {
      await this.ensureReferenceSample();
      file = this.referenceFile;
    }

    if (!file) {
      this.errorMessage = 'Primero selecciona una imagen para enviarla al servicio de visión.';
      return;
    }

    this.errorMessage = '';
    this.isAnalyzing = true;

    this.computerVisionService.detectSmoke(file).subscribe({
      next: (response) => {
        this.applyAnalysisResponse(response, source);
        this.isAnalyzing = false;
        this.openModal();
      },
      error: () => {
        this.errorMessage = 'No se pudo conectar con el servicio cnn-vision-service. Verifica que FastAPI esté corriendo en http://localhost:8000.';
        this.isAnalyzing = false;
      }
    });
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
        this.referenceFile = file;
      } else {
        this.userImagePreview = result;
        this.userFile = file;
      }
    };

    reader.readAsDataURL(file);
  }

  private applyAnalysisResponse(response: DetectionResponse, source: VisionTab): void {
    const confidence = Number(response.confidence ?? 0);
    const confidenceList = confidence > 0 ? [confidence] : [];
    const title = response.smoke_detected ? 'Humo detectado por el modelo' : 'El modelo no detectó humo';

    this.analysisSummary = {
      title,
      description: response.vehicle_status,
      savedPath: response.evidence_image
        ? response.evidence_image
        : 'El modelo no generó una imagen de evidencia porque no encontró humo.',
      detections: response.smoke_detected ? 1 : 0,
      confidences: confidenceList,
      vehicleStatus: response.vehicle_status
    };

    this.analyzedImagePreview = response.evidence_image
      ? this.computerVisionService.buildEvidenceUrl(response.evidence_image)
      : (source === 'modelo-base' ? this.referenceImagePreview : this.userImagePreview);
  }

  private async loadReferenceSample(): Promise<void> {
    await this.ensureReferenceSample();
  }

  private async ensureReferenceSample(): Promise<void> {
    if (this.referenceFile) {
      return;
    }

    if (this.referenceSamplePromise) {
      await this.referenceSamplePromise;
      return;
    }

    this.referenceSamplePromise = (async () => {
    try {
      const response = await fetch('/test.jpg');

      if (!response.ok) {
        return;
      }

      const blob = await response.blob();
      this.referenceImagePreview = '/test.jpg';
      this.referenceFile = new File([blob], 'test.jpg', { type: blob.type || 'image/jpeg' });
    } catch {
      this.referenceImagePreview = this.placeholderImage;
    } finally {
      this.referenceSamplePromise = null;
    }
    })();

    await this.referenceSamplePromise;
  }

}
