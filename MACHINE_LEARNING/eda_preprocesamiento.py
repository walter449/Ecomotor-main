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
    'MACHINE_LEARNING/dataset/mi2015-2024-consumo-combustible.csv',
    sep=';'
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

    'CO2 emissions (g/km)': 'co2_base'

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

# =========================================================
# TOP 20 MODELOS
# =========================================================

counts = df.modelo.value_counts().head(20)

plt.figure(figsize=(10,6))

ax = counts.plot(kind="bar")

ax.set_title('Top 20 Modelos', fontsize=18)
ax.set_xlabel('Modelo', fontsize=14)
ax.set_ylabel('Número de carros', fontsize=14)

plt.xticks(rotation=45)

ax.bar_label(ax.containers[0], fontsize=10)

plt.tight_layout()
plt.show()

# =========================================================
# 8. Variable de respuesta frente VS características categóricas
# =========================================================


for columna in variables_categoricas:

        plt.figure(figsize=(15, 5))

        # Agrupar y sacar promedio de CO2
        datos_agrupados = (

            df.groupby(columna)['co2_base']
            .mean()
            .round(1)
            .reset_index()

        )

        # Ordenar de mayor a menor
        datos_ordenados = datos_agrupados.sort_values(
            by='co2_base',
            ascending=False
        )

        # Crear gráfico
        ax = sns.barplot(
            x=columna,
            y='co2_base',
            data=datos_ordenados,
            order=datos_ordenados[columna]
        )

        # Mostrar valores encima de barras
        ax.bar_label(
            ax.containers[0],
            rotation=90
        )

        # Títulos
        plt.xlabel(columna, fontsize=18)

        plt.ylabel(
            'Promedio de Emisiones CO2',
            fontsize=15
        )

        plt.title(
            f'Promedio de CO2 por {columna}',
            fontsize=20
        )

        # Rotar nombres
        plt.xticks(
            rotation=45,
            ha='right',
            fontsize=12
        )

        plt.show()

# =========================================================
# 9. DISTRIBUCIÓN DE VARIABLES NUMÉRICAS
# =========================================================

variables_numericas = [

    'anio_modelo',

    'cilindraje_motor',

    'cilindros',

    'consumo_ciudad',

    'consumo_carretera',

    'consumo_combinado',

    'consumo_mpg',

    'co2_base'

]

# Tamaño general de la figura
plt.figure(figsize=(15,10))

cantidad_variables = len(variables_numericas)

for i, columna in enumerate(variables_numericas, 1):

    # Crear subplot
    plt.subplot((cantidad_variables // 2) + 1, 2, i)

    # Histograma
    ax = sns.histplot(
        data=df,
        x=columna,
        kde=True
    )

    # Título
    ax.set_title(
        f'Distribución de {columna}',
        fontsize=12
    )

    # Cambiar nombres ejes
    ax.set_xlabel(columna)
    ax.set_ylabel('Cantidad')

    # Rotar etiquetas
    plt.xticks(
        rotation=45,
        fontsize=10
    )

# Ajustar espacios
plt.tight_layout()

# Mostrar
plt.show()

# =========================================================
# 10. TARGET VARIABLE VS NUMERICAL FEATURES
# =========================================================



# =========================================================
# 11. PROMEDIO DE CO2 POR AÑO
# =========================================================

plt.figure(figsize=(10,5))

df.groupby('anio_modelo')['co2_base'].mean().plot()

plt.title('Promedio de CO2 por Año')

plt.ylabel('CO2 promedio')

plt.show()


# =========================================================
# 14. LABEL ENCODING
# =========================================================
# =========================================================
# LABEL ENCODING
# =========================================================
# Convertir variables categóricas a números
# para que puedan ser usadas en Machine Learning
#
# Ejemplo:
# Toyota -> 0
# Kia -> 1
# Ford -> 2
# =========================================================


# Crear copia para no modificar el dataset original
df_codificado = df.copy()

# Variables categóricas
columnas_categoricas = [

    'marca',

    'modelo',

    'clase_vehiculo',

    'transmision',

    'tipo_combustible'

]

# Diccionario para guardar encoders
codificadores = {}

# Aplicar Label Encoding
for columna in columnas_categoricas:

    # Crear encoder
    le = LabelEncoder()

    # Transformar texto a números
    df_codificado[columna] = le.fit_transform(
        df_codificado[columna]
    )

    # Guardar encoder
    codificadores[columna] = le

 
#=========================================================
# MOSTRAR TABLAS DE LABEL ENCODING
# =========================================================

print("\n==============================")
print("TABLAS DE LABEL ENCODING")
print("==============================")

for columna, encoder in codificadores.items():

    print(f"\nColumna: {columna}")
    print("-------------------------")

    # Crear tabla de equivalencias
    tabla = pd.DataFrame({

        'Valor Original': encoder.classes_,

        'Valor Codificado': range(len(encoder.classes_))

    })

    print(tabla)

# =========================================================
# 16. DATASET FINAL LIMPIO
# =========================================================

print("\n==============================")
print("DATASET FINAL")
print("==============================")

print(df.head())

print(df.shape)

# =========================================================
# 17. GUARDAR DATASET LIMPIO
# =========================================================
# IMPORTANTE:
# Esto NO modifica el CSV original.
# Crea un nuevo archivo limpio listo para ML.
# =========================================================

df.to_csv(

    'MACHINE_LEARNING/dataset/co2_limpio.csv',

    index=False

)

print("\n==============================")
print("CSV LIMPIO GUARDADO")
print("==============================")

print("Archivo creado:")
print("MACHINE_LEARNING/dataset/co2_limpio.csv")
