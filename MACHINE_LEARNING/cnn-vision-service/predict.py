from ultralytics import YOLO
import cv2
import os

# Cargar modelo
model = YOLO("trained_models/smoke_detector_v1.pt")

# Realizar predicción
results = model(
    source="test.jpg",
    conf=0.10,
    save=False
)

for result in results:

    # Guardar imagen con las detecciones dibujadas
    output_path = "prediction.jpg"
    result.save(filename=output_path)

    boxes = result.boxes

    print("\n" + "=" * 50)
    print("RESULTADOS DE LA DETECCIÓN")
    print("=" * 50)

    if len(boxes) == 0:
        print("❌ No se detectaron objetos.")
    else:
        print(f"✅ Objetos detectados: {len(boxes)}\n")

        for i, box in enumerate(boxes, start=1):
            clase = int(box.cls[0])
            confianza = float(box.conf[0])

            x1, y1, x2, y2 = map(int, box.xyxy[0])

            print(f"Detección #{i}")
            print(f"Clase      : {model.names[clase]}")
            print(f"Confianza  : {confianza:.2%}")
            print(f"BoundingBox: ({x1}, {y1}) -> ({x2}, {y2})")
            print("-" * 40)

    print(f"\nImagen guardada en: {os.path.abspath(output_path)}")

    # Mostrar imagen resultante
    image = cv2.imread(output_path)

    if image is not None:
        cv2.imshow("Resultado YOLO", image)
        print("\nPresiona cualquier tecla para cerrar la ventana...")
        cv2.waitKey(0)
        cv2.destroyAllWindows()
    else:
        print("No fue posible abrir la imagen generada.")

