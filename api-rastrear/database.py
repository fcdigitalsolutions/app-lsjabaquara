# databse.py
import mysql.connector
from mysql.connector import Error
import config_env  # Importa as configurações

def get_db_connection():
    try:
        conn = mysql.connector.connect(
            host=config_env.DB_HOST,
            user=config_env.DB_USER,
            password=config_env.DB_PASSWORD,
            database=config_env.DB_NAME
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

        cursor.execute(
            """
            create table if not exists master_login (
	            id int auto_increment primary key,
                user_login	       varchar(255) NULL, 
                user_name     	   varchar(255) NULL,
                user_pswd          varchar(255) NULL, 
                user_gestor        varchar(255) NULL,
                user_gestor_terr   varchar(255) NULL,
                user_gestor_rmwb   varchar(255) NULL,
                user_gestor_rfds   varchar(255) NULL,
                user_gestor_mecan  varchar(255) NULL,
                user_id_publica    varchar(255) NULL,
                user_receb_msg     varchar(255) NULL,
                user_dt_inclu      datetime  NULL
            )
        """)        

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS regioes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nome varchar(255) NOT NULL,
                descricao text
            )
          ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS cad_congregacoes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nome           varchar(255) NOT NULL,
                regiao 		   varchar(255) NOT NULL,
                endereco 	   varchar(255) NOT NULL,
                cca_nome 	   varchar(255) NULL,
                cca_contato    varchar(255) NULL,
                ss_nome 	   varchar(255) NULL,
                ss_contato 	   varchar(255) NULL,
                srv_terr_nome  varchar(255) NULL,
                srv_terr_contat varchar(255) NULL,
                obs			  text
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
	            data_inclu	    datetime NULL,
	            nome_publica    varchar(255) NULL,	
                num_contato     varchar(255) NULL,
                cod_congreg	    varchar(255) NULL, 
                cod_regiao	    varchar(255) NULL,  
	            enderec		    varchar(255) NULL,
                end_confirm     varchar(255) NULL,
	            origem	        varchar(255) NULL,
                indic_url_map   varchar(255) NULL,
                indic_tp_local  varchar(255) NULL,
                indic_desig     varchar(255) NULL,
                obs			    text
            )
        ''')        

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS cad_registro_nc (
	            id INT AUTO_INCREMENT PRIMARY KEY,
	            data_inclu	  datetime NULL,
	            nome_publica  varchar(255) NULL,	
                num_contato   varchar(255) NULL,
                cod_congreg	  varchar(255) NULL, 
                cod_regiao	  varchar(255) NULL, 
	            enderec		  varchar(255) NULL,
                num_visitas   int NULL,
                dt_ult_visit  datetime NULL,
	            obs			  text
            )
        ''')   
    
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS cad_publicador (
	            id INT AUTO_INCREMENT PRIMARY KEY,
                data_inclu	  datetime NULL,
                pub_nome      varchar(255) NULL,
                pub_contat    varchar(255) NULL,
                pub_login     varchar(255) NULL,
                pub_email     varchar(255) NULL,
                pub_endereco  varchar(255) NULL,
                pub_regiao    varchar(255) NULL,
                pub_uf        varchar(255) NULL,
                pub_dtbatism  datetime NULL,
                pub_dtnasc	  datetime NULL,
                desig_servic  varchar(255) NULL, 
                desig_campo   varchar(255) NULL,
                pub_status    varchar(255) NULL,
                pub_id_publica varchar(255) NULL,
	            resp_obs	  text
            )
        ''')            

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS cad_designacoes (
	            id INT AUTO_INCREMENT PRIMARY KEY,
	            data_inclu	  datetime NULL,
                dsg_data	  datetime NULL,
                pub_login     varchar(255) NULL,
	            pub_nome      varchar(255) NULL,	
                dsg_tipo      varchar(255) NULL,
                dsg_detalhes  varchar(255) NULL, 
                dsg_conselh   varchar(255) NULL, 
                dsg_mapa_cod  varchar(255) NULL, 
                dsg_mapa_url  varchar(255) NULL, 
                dsg_mapa_end  varchar(255) NULL,
                dsg_status    varchar(255) NULL,                 
	            dsg_obs		  text,
                pub_obs		  text
            )
        ''')        

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS cad_territorios (
	            id INT AUTO_INCREMENT PRIMARY KEY,
	            data_inclu	  datetime NULL,
                dt_ultvisit   datetime NULL,
                pub_ultvisi   varchar(255) NULL,
                dt_visit02    datetime NULL,
                pub_tvis02    varchar(255) NULL,
                dt_visit03    datetime NULL,
                pub_tvis03    varchar(255) NULL,
                dt_visit04    datetime NULL,
                pub_tvis04    varchar(255) NULL,
	            terr_nome     varchar(255) NULL,	
                terr_morador  varchar(255) NULL, 
                terr_enderec  varchar(255) NULL, 
                terr_regiao   varchar(255) NULL, 
                terr_link     varchar(255) NULL,  
                terr_coord    varchar(255) NULL,  
                terr_cor      varchar(255) NULL,      
                terr_status   varchar(255) NULL,
                num_pessoas   int NULL,
                melhor_dia_hora   varchar(255) NULL,
                terr_tp_local varchar(255) NULL,
                terr_classif  varchar(255) NULL,
                terr_desig    varchar(255) NULL,
                melhor_hora   varchar(255) NULL, 
                terr_respons   varchar(255) NULL,                          
                terr_obs      text             
            )
        ''')        
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS mov_relat_visitas (
	            id INT AUTO_INCREMENT PRIMARY KEY,
	            data_inclu	   datetime NULL,
                visit_data     datetime NULL,
                pub_login      varchar(255) NULL,        
				pub_nome       varchar(255) NULL,
	            visit_cod      varchar(255) NULL,	
                visit_url      varchar(255) NULL, 
                visit_ender    varchar(255) NULL,     
                visit_status   varchar(255) NULL,
                num_pessoas    int NULL,
                melhor_dia     varchar(255) NULL,
                melhor_hora    varchar(255) NULL,      
                terr_obs       text             
            )
        ''')    
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS cad_configcampo (
	            id INT AUTO_INCREMENT PRIMARY KEY,
	            data_inclu	   datetime NULL,
				cmp_tipo	   varchar(255) NULL,
                cmp_diadasem   varchar(255) NULL,
                cmp_seq	       varchar(255) NULL,
				cmp_local      varchar(255) NULL,
				cmp_enderec    varchar(255) NULL,
				cmp_url        varchar(255) NULL,
				cmp_tipoativ   varchar(255) NULL,
				cmp_horaini    varchar(255) NULL,
				cmp_horafim    varchar(255) NULL,
				cmp_detalhes   text         
            )
        ''')    

        conn.commit()
        cursor.close()
        conn.close()
    else:
        print("Falha ao inicializar o banco de dados.")
