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
# ASIGNAR NOMBRES A LOS CLUSTERS
# =========================================================

nombres_cluster = {

    0: 'Eficientes',

    1: 'Contaminacion Moderada',

    2: 'Altamente Contaminantes',

    3: 'Vehiculos de Alto Consumo'

}

df['nombre_cluster'] = df['cluster'].map(
    nombres_cluster
)

# =========================================================
# 8. VER CANTIDAD DE VEHÍCULOS POR CLUSTER
# =========================================================

print("\n==========================")
print("VEHÍCULOS POR CLUSTER")
print("==========================")

print(
    df['nombre_cluster']
    .value_counts()
)


# =========================================================
# 9. PROMEDIO DE CO2 POR CLUSTER
# =========================================================

print("\n==========================")
print("CO2 PROMEDIO POR CLUSTER")
print("==========================")

print(
    df.groupby('nombre_cluster')['co2_base']
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

    df.groupby('nombre_cluster')[
        [
            'cilindraje_motor',
            'cilindros',
            'consumo_combinado',
            'co2_base'
        ]

    ].mean().round(2)

)

print(
    df.groupby('nombre_cluster')['clase_vehiculo']
      .agg(lambda x: x.value_counts().index[0])
)

print(
    df.groupby('nombre_cluster')['tipo_combustible']
      .agg(lambda x: x.value_counts().index[0])
)

# =========================================================
# 11. CREAR DATASET LEGIBLE
# =========================================================
# Convierte nuevamente los códigos numéricos
# a sus valores originales para poder analizar
# los clusters fácilmente.
# =========================================================

try:

    from joblib import load

    codificadores = load(
        'MACHINE_LEARNING/modelos/codificadores.pkl'
    )

    df_legible = df.copy()

    df_legible['marca'] = (
        codificadores['marca']
        .inverse_transform(df_legible['marca'])
    )

    df_legible['clase_vehiculo'] = (
        codificadores['clase_vehiculo']
        .inverse_transform(df_legible['clase_vehiculo'])
    )

    df_legible['tipo_combustible'] = (
        codificadores['tipo_combustible']
        .inverse_transform(df_legible['tipo_combustible'])
    )

    df_legible['transmision'] = (
        codificadores['transmision']
        .inverse_transform(df_legible['transmision'])
    )

    print("\n==========================")
    print("DATASET LEGIBLE CREADO")
    print("==========================")

except Exception as e:

    print(
        "\nNo se pudieron cargar los codificadores:"
    )

    print(e)

    df_legible = df.copy()


# =========================================================
# 12. GUARDAR DATASET CLUSTERIZADO
# =========================================================

#df.to_csv(
#    'MACHINE_LEARNING/dataset/vehiculos_clusterizados.csv',
#    index=False
#)

print("\nCSV clusterizado guardado")


# =========================================================
# GUARDAR VERSIÓN LEGIBLE
# =========================================================

df_legible.to_csv(
    'MACHINE_LEARNING/dataset/vehiculos_clusterizados_legible.csv',
    index=False
)

print(
    "CSV clusterizado legible guardado"
)


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
    'MACHINE_LEARNING/modelos/scaler_kmeans.pkl')

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

# =========================================================
# PERFIL COMPLETO DE LOS CLUSTERS
# =========================================================

print("\n==========================")
print("PERFIL DETALLADO")
print("==========================")

for nombre in df_legible['nombre_cluster'].unique():

    print(f"\n######## {nombre} ########")

    datos = df_legible[
        df_legible['nombre_cluster'] == nombre
    ]

    print("\nMarcas más comunes:")
    print(
        datos['marca']
        .value_counts()
        .head(5)
    )

    print("\nClases más comunes:")
    print(
        datos['clase_vehiculo']
        .value_counts()
        .head(5)
    )

    print("\nCombustibles más comunes:")
    print(
        datos['tipo_combustible']
        .value_counts()
        .head(5)
    )

    print("\nPromedio CO2:")
    print(
        round(
            datos['co2_base'].mean(),
            2
        )
    )