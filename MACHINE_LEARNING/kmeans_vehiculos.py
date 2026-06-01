# =========================================================
# ECOMOTOR
# CLUSTERING DE VEHÍCULOS CON K-MEANS
# =========================================================

import pandas as pd

import matplotlib.pyplot as plt

from sklearn.cluster import KMeans

from sklearn.preprocessing import StandardScaler

import joblib


# =========================================================
# 1. CARGAR DATASET
# =========================================================

df = pd.read_csv(
    'MACHINE_LEARNING/dataset/co2_codificado.csv',
    sep=';'
)

print("\n==========================")
print("DATASET CARGADO")
print("==========================")

print(df.head())


# =========================================================
# 2. VARIABLES PARA CLUSTERING
# =========================================================
# No usamos modelo porque genera miles de categorías
# y mete ruido al clustering.
# =========================================================

X = df[[
    'marca',
    'clase_vehiculo',
    'cilindraje_motor',
    'cilindros',
    'transmision',
    'tipo_combustible',
    'consumo_combinado',
    'co2_base'
]]

print("\nVariables utilizadas:")
print(X.columns)


# =========================================================
# 3. ESCALAR DATOS
# =========================================================

scaler = StandardScaler()

X_scaled = scaler.fit_transform(X)

print("\nDatos escalados correctamente")


# =========================================================
# 4. MÉTODO DEL CODO
# =========================================================

inercias = []

print("\nCalculando método del codo...")

for k in range(1, 11):

    modelo = KMeans(
        n_clusters=k,
        random_state=42,
        n_init=10
    )

    modelo.fit(X_scaled)

    inercias.append(modelo.inertia_)


# =========================================================
# 5. GRAFICAR EL CODO
# =========================================================

plt.figure(figsize=(8,5))

plt.plot(
    range(1,11),
    inercias,
    marker='o'
)

plt.title(
    'Método del Codo'
)

plt.xlabel(
    'Número de Clusters'
)

plt.ylabel(
    'Inercia'
)

plt.grid(True)

plt.show()


# =========================================================
# 6. ELEGIR NÚMERO DE CLUSTERS
# =========================================================
# Cambiar según el gráfico.
# Inicialmente usamos 4.
# =========================================================

N_CLUSTERS = 4


# =========================================================
# 7. ENTRENAR K-MEANS
# =========================================================

kmeans = KMeans(
    n_clusters=N_CLUSTERS,
    random_state=42,
    n_init=10
)

df['cluster'] = kmeans.fit_predict(
    X_scaled
)

print("\nModelo entrenado correctamente")


# =========================================================
# 8. VER CANTIDAD DE VEHÍCULOS POR CLUSTER
# =========================================================

print("\n==========================")
print("VEHÍCULOS POR CLUSTER")
print("==========================")

print(
    df['cluster']
    .value_counts()
    .sort_index()
)


# =========================================================
# 9. PROMEDIO DE CO2 POR CLUSTER
# =========================================================

print("\n==========================")
print("CO2 PROMEDIO POR CLUSTER")
print("==========================")

print(
    df.groupby('cluster')['co2_base']
    .mean()
    .round(2)
)


# =========================================================
# 10. PERFIL DE CADA CLUSTER
# =========================================================

print("\n==========================")
print("PERFILES DE CLUSTER")
print("==========================")

print(

    df.groupby('cluster')[
        [
            'cilindraje_motor',
            'cilindros',
            'consumo_combinado',
            'co2_base'
        ]

    ].mean().round(2)

)


# =========================================================
# 11. GUARDAR DATASET CON CLUSTERS
# =========================================================

df.to_csv(
    'MACHINE_LEARNING/dataset/vehiculos_clusterizados.csv',
    index=False
)

print("\nCSV clusterizado guardado")


# =========================================================
# 12. GUARDAR MODELO
# =========================================================

joblib.dump(
    kmeans,
    'MACHINE_LEARNING/modelos/kmeans_vehiculos.pkl'
)

print("Modelo guardado")


# =========================================================
# 13. GUARDAR SCALER
# =========================================================

joblib.dump(
    scaler,
    'MACHINE_LEARNING/modelos/scaler_kmeans.pkl'
)

print("Scaler guardado")


# =========================================================
# 14. CENTROIDES
# =========================================================

print("\n==========================")
print("CENTROIDES")
print("==========================")

print(
    pd.DataFrame(
        kmeans.cluster_centers_
    )
)

print("\nProceso finalizado")