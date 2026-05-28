# =========================================================
# ECOMOTOR - EDA + PREPROCESSING COMPLETO
# =========================================================
# Este archivo:
# 1. Lee el dataset
# 2. Explora los datos (EDA)
# 3. Limpia datos
# 4. Hace visualizaciones
# 5. Analiza correlaciones
# 6. Hace encoding
# 7. Detecta outliers
# 8. Guarda un nuevo CSV limpio
# Proyecto: Ecomotor
# =========================================================


# =========================================================
# 1. IMPORTAR LIBRERÍAS
# =========================================================

import pandas as pd
import numpy as np

import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.preprocessing import LabelEncoder


# Configuración visual
plt.style.use('ggplot')



# =========================================================
# 2. IMPORTAR Y LEER EL DATASET
# =========================================================

# Lee el CSV original
co2 = pd.read_csv(
    'MACHINE_LEARNING/dataset/mi2015-2024-consumo-combustible.csv'
)

# Crear copia para trabajar seguro
df = co2.copy()

print("\n==============================")
print("DATASET CARGADO")
print("==============================")

print(df.head())
print(df.sample(5))


# =========================================================
# 3. UNDERSTANDING THE DATA
# =========================================================
# Aquí entendemos:
# - columnas
# - tipos de datos
# - cantidad de filas
# - estadísticas
# - nulos
# - duplicados
#
# 0. Model year:
# Año del modelo del vehículo.
#
# IMPORTANCIA:
# Los vehículos más nuevos suelen:
# - consumir menos combustible
# - emitir menos CO2
# - tener tecnologías más eficientes
#
# RELACIÓN ESPERADA:
# A mayor año:
# ↓ menor emisión de CO2
# =========================================================

print("\n==============================")
print("INFORMACIÓN GENERAL")
print("==============================")

print(df.info())

print("\n==============================")
print("ESTADÍSTICAS")
print("==============================")

print(df.describe())

print("\n==============================")
print("VALORES NULOS")
print("==============================")

print(df.isnull().sum())

print("\n==============================")
print("DUPLICADOS")
print("==============================")

print(df.duplicated().sum())

filas_duplicadas = df[df.duplicated(keep=False)]
print(filas_duplicadas)

# =========================================================
# 4. RENOMBRAR COLUMNAS
# =========================================================
# Cambiamos nombres largos/feos
# por nombres fáciles para SQL y Node.js

df = df.rename(columns={

    'Model year': 'anio_modelo',

    'Make': 'marca',

    'Model': 'modelo',

    'Vehicle class': 'clase_vehiculo',

    'Engine size (L)': 'cilindraje_motor',

    'Cylinders': 'cilindros',

    'Transmission': 'transmision',

    'Fuel type': 'tipo_combustible',

    'City (L/100 km)': 'consumo_ciudad',

    'Highway (L/100 km)': 'consumo_carretera',

    'Combined (L/100 km)': 'consumo_combinado',

    'Combined (mpg)': 'consumo_mpg',

    'CO2 emissions(g/km)': 'co2_base'

})

print("\n==============================")
print("COLUMNAS RENOMBRADAS")
print("==============================")

print(df.columns)



# =========================================================
# 5. LIMPIEZA DE DATOS
# =========================================================

# Eliminar duplicados
df = df.drop_duplicates()

# Eliminar nulos
df = df.dropna()

print("\n==============================")
print("DATOS LIMPIOS")
print("==============================")

print(df.shape)



# =========================================================
# 6. NORMALIZAR TEXTO
# =========================================================
# Evita problemas:
# kia != Kia != KIA

df['marca'] = df['marca'].str.strip().str.title()

df['modelo'] = df['modelo'].str.strip()

df['transmision'] = df['transmision'].str.strip()

df['tipo_combustible'] = df['tipo_combustible'].str.strip()

# =========================================================
# 7. DISTRIBUCIÓN DE VARIABLES CATEGÓRICAS
# =========================================================

variables_categoricas = [

    'marca',

    'clase_vehiculo',

    'transmision',

    'tipo_combustible'

]

for columna in variables_categoricas:

        # Tamaño del gráfico
        plt.figure(figsize=(15, 5))

        # Crear gráfico de barras
        ax = sns.countplot(
            x=columna,
            data=df,
            order=df[columna].value_counts().index

        )

        # Mostrar cantidades encima de las barras
        ax.bar_label(
            ax.containers[0],
            rotation=45
        )

        # Etiquetas
        plt.xlabel(columna, fontsize=15)
        plt.ylabel('Cantidad', fontsize=15)

        # Título
        plt.title(
            f'Gráfico de barras de {columna}',
            fontsize=20
        )

        # Rotar texto inferior
        plt.xticks(
            rotation=45,
            ha='right',
            fontsize=12
        )

        # Mostrar gráfico
        plt.show()

