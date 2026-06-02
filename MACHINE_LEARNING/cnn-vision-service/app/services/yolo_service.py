from ultralytics import YOLO
import os
from datetime import datetime

# Cargar modelo una sola vez
model = YOLO("trained_models/smoke_detector_v2.pt")

# Carpeta para evidencias
os.makedirs("evidences", exist_ok=True)


def detect_smoke(image_path):

    results = model(
        image_path,
        conf=0.50
    )

    best_confidence = 0.0
    smoke_detected = False

    for result in results:

        if len(result.boxes) > 0:

            smoke_detected = True

            for box in result.boxes:

                confidence = float(box.conf[0])

                if confidence > best_confidence:
                    best_confidence = confidence

    evidence_path = None

    if smoke_detected:

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

        evidence_path = (
            f"evidences/smoke_{timestamp}.jpg"
        )

        results[0].save(
            filename=evidence_path
        )

    return {
        "smoke_detected": smoke_detected,
        "vehicle_status":
            "Vehículo con humo detectado"
            if smoke_detected
            else "Vehículo sin humo",
        "confidence": round(best_confidence, 4),
        "evidence_image": evidence_path
    }