import pandas as pd
from sqlalchemy import create_engine

# Leer CSV limpio
df = pd.read_csv( './MACHINE_LEARNING/dataset/co2_limpio.csv',
                    sep=';')

# Conexión MySQL
usuario = 'root'
password = ''
host = 'localhost'
puerto = '3306'
database = 'ecomotor'

engine = create_engine(
    f'mysql+pymysql://{usuario}:{password}@{host}:{puerto}/{database}'
)

# Guardar en MySQL
df.to_sql(
    'especificaciones_vehiculos',
    con=engine,
    if_exists='append',
    index=False
)

print("Datos importados correctamente")