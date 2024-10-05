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
         create table if not exists master_login (
	            id int auto_increment primary key,
                user_login	       varchar(255) NULL, 
                user_name     	   varchar(255) NULL,
                user_pswd          varchar(255) NULL
            )
        ''')        

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
            CREATE TABLE IF NOT EXISTS cad_publicador (
	            id INT AUTO_INCREMENT PRIMARY KEY,
                data_inclu	  datetime NULL,
                pub_nome      VARCHAR(255) NULL,
                pub_contat    VARCHAR(255) NULL,
                pub_login     VARCHAR(255) NULL,
                pub_email     VARCHAR(255) NULL,
                pub_endereco  VARCHAR(255) NULL,
                pub_regiao    VARCHAR(255) NULL,
                pub_uf        VARCHAR(255) NULL,
                pub_dtbatism  datetime NULL,
                pub_dtnasc	  datetime NULL,
                desig_servic  VARCHAR(255) NULL, 
                desig_campo   VARCHAR(255) NULL,
                pub_status    VARCHAR(255) NULL,
	            resp_obs	  TEXT
            )
        ''')            

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS cad_designacoes (
	            id INT AUTO_INCREMENT PRIMARY KEY,
	            data_inclu	  datetime NULL,
                dsg_data	  datetime NULL,
	            pub_nome      VARCHAR(255) NULL,	
                dsg_tipo      VARCHAR(255) NULL,
                dsg_detalhes  VARCHAR(255) NULL, 
                dsg_conselh   VARCHAR(255) NULL, 
                dsg_mapa_cod  VARCHAR(255) NULL, 
                dsg_mapa_end  VARCHAR(255) NULL,
                dsg_status    VARCHAR(255) NULL,                 
	            dsg_obs		  TEXT,
                pub_obs		  TEXT
            )
        ''')        

        conn.commit()
        cursor.close()
        conn.close()
    else:
        print("Falha ao inicializar o banco de dados.")
