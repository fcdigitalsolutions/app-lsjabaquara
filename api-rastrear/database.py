# databse.py
import mysql.connector
from mysql.connector import Error

def get_db_connection():
    try:
        conn = mysql.connector.connect(
            host='localhost',       # Substitua pelo endereço do seu servidor MySQL
            user='lsmaster',     # Substitua pelo seu usuário MySQL
            password='LSJabaquara@#2025',   # Substitua pela sua senha MySQL
            database='lsjabaquara'    # Substitua pelo nome do seu banco de dados
        )
        if conn.is_connected():
            print("Conexão ao MySQL foi bem-sucedida")
            return conn
    except Error as e:
        print(f"Erro ao conectar ao MySQL: {e}")
        return None

def init_db():
    conn = get_db_connection()
    if conn is not None:
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS regioes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nome VARCHAR(255) NOT NULL,
                descricao TEXT
            )
          ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS cad_congregacoes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nome           VARCHAR(255) NOT NULL,
                regiao 		   VARCHAR(255) NOT NULL,
                endereco 	   VARCHAR(255) NOT NULL,
                cca_nome 	   VARCHAR(255) NULL,
                cca_contato    VARCHAR(255) NULL,
                ss_nome 	   VARCHAR(255) NULL,
                ss_contato 	   VARCHAR(255) NULL,
                srv_terr_nome  VARCHAR(255) NULL,
                srv_terr_contat VARCHAR(255) NULL,
                obs			  TEXT
            )
        ''')

        cursor.execute('''
         CREATE TABLE IF NOT EXISTS master_rastrear (
	            id int auto_increment primary key,
                cod_congreg	   varchar(255) NULL, 
                data_inclu	   datetime NULL,
	            data_inicio	   datetime NULL,
                data_fim	   datetime NULL,
	            num_enderec    int NULL,	
                num_endconcl   int NULL,	
                cod_status     varchar(255) NULL
            )
        ''')        

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS cad_indicacoes (
	            id INT AUTO_INCREMENT PRIMARY KEY,
	            data_inclu	   datetime NULL,
	            nome_publica  VARCHAR(255) NULL,	
                num_contato   VARCHAR(255) NULL,
                cod_congreg	  VARCHAR(255) NULL, 
                cod_regiao	  VARCHAR(255) NULL,  
	            enderec		  VARCHAR(255) NULL,
                end_confirm   VARCHAR(255) NULL,
	            origem	      VARCHAR(255) NULL,
	            obs			  TEXT
            )
        ''')        

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS cad_registro_nc (
	            id INT AUTO_INCREMENT PRIMARY KEY,
	            data_inclu	  datetime NULL,
	            nome_publica  VARCHAR(255) NULL,	
                num_contato   VARCHAR(255) NULL,
                cod_congreg	  VARCHAR(255) NULL, 
                cod_regiao	  VARCHAR(255) NULL, 
	            enderec		  VARCHAR(255) NULL,
                num_visitas   int NULL,
                dt_ult_visit  datetime NULL,
	            obs			  TEXT
            )
        ''')   
    
        cursor.execute('''
         create table if not exists master_login (
	            id int auto_increment primary key,
                user_login	       varchar(255) NULL, 
                user_name     	   varchar(255) NULL,
                user_pswd          varchar(255) NULL
            )
        ''')        
        conn.commit()
        cursor.close()
        conn.close()
    else:
        print("Falha ao inicializar o banco de dados.")
