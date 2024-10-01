# services.py
from database import get_db_connection
from models import Region, Congregation, Indicacoes, Rastreamento, RegistroNC

def rows_to_dict(cursor, rows):
    """Converte uma lista de tuplas em uma lista de dicionários usando os nomes das colunas."""
    columns = [desc[0] for desc in cursor.description]
    return [dict(zip(columns, row)) for row in rows]

class CongregacaoService:
    def add_congregation(self, congregacao):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('INSERT INTO cad_congregacoes (nome, regiao, endereco, cca_nome, cca_contato, ss_nome, ss_contato, srv_terr_nome, srv_terr_contat) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)',
                       (congregacao.nome, congregacao.regiao, congregacao.endereco, congregacao.cca_nome, congregacao.cca_contato, congregacao.ss_nome, congregacao.ss_contato, congregacao.srv_terr_nome, congregacao.srv_terr_contat))
        conn.commit()
        congregation_id = cursor.lastrowid
        conn.close()
        return congregation_id
    
    def update_congregation(self, congregation_id, congregacao):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('UPDATE cad_congregacoes SET nome = %s, regiao = %s, regiao = %s, cca_nome = %s, cca_contato = %s, ss_nome = %s, ss_contato = %s, srv_terr_nome = %s, srv_terr_contat = %s WHERE id = %s',
                       (congregacao.nome, congregacao.regiao, congregacao.endereco,congregacao.cca_nome, congregacao.cca_contato, congregacao.ss_nome, congregacao.ss_contato, congregacao.srv_terr_nome, congregacao.srv_terr_contat, congregation_id))
        conn.commit()
        conn.close()
        return congregation_id

    def get_all_congregations(self):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM cad_congregacoes')
        congregacoes = cursor.fetchall()
        result = rows_to_dict(cursor, congregacoes)
        conn.close()
        return result

class RegionService:
    def add_region(self, region):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('INSERT INTO regioes (nome, descricao) VALUES (%s, %s)',
                       (region.nome, region.descricao))
        conn.commit()
        region_id = cursor.lastrowid
        conn.close()
        return region_id
    
    def update_region(self, region_id, region):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('UPDATE regioes SET nome = %s, descricao = %s WHERE id = %s',
                       (region.nome, region.descricao, region_id))
        conn.commit()
        conn.close()
        return region_id

    def get_all_regions(self):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM regioes')
        regions = cursor.fetchall()
        result = rows_to_dict(cursor, regions)
        conn.close()
        return result

class IndicaService:
    def add_indica(self,indica):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('INSERT INTO cad_indicacoes (data_inclu,nome_publica,num_contato,cod_congreg,cod_regiao,enderec,end_confirm,origem,obs) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)',
            (indica.data_inclu,indica.nome_publica,indica.num_contato,indica.cod_congreg,indica.cod_regiao,indica.enderec,indica.end_confirm,indica.origem,indica.obs ))
        conn.commit()
        indica_id = cursor.lastrowid
        conn.close()
        return indica_id
    
    def update_indica(self, indica_id, indica):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('UPDATE cad_indicacoes SET nome_publica = %s, enderec = %s,  end_confirm = %s,  origem = %s, obs = %s WHERE id = %s',
            (indica.nome_publica,indica.enderec,indica.end_confirm,indica.origem,indica.obs,indica_id ))
        conn.commit()
        conn.close()
        return indica_id

    def get_all_indica(self):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM cad_indicacoes')
        indica = cursor.fetchall()
        result = rows_to_dict(cursor, indica)
        conn.close()
        return result

class RegistroNCService:
    def add_registnc(self,registnc):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('INSERT INTO cad_registro_nc (data_inclu,nome_publica,num_contato,cod_congreg,cod_regiao,enderec,num_visitas,dt_ult_visit,obs) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)',
            (registnc.data_inclu,registnc.nome_publica,registnc.num_contato,registnc.cod_congreg,registnc.cod_regiao,registnc.enderec,registnc.num_visitas,registnc.dt_ult_visit,registnc.obs ))
        conn.commit()
        registnc_id = cursor.lastrowid
        conn.close()
        return registnc_id
    
    def update_registnc(self, registnc_id, registnc):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('UPDATE cad_registro_nc SET dt_ult_visit = %s, enderec = %s,  num_visitas = %s WHERE id = %s',
            (registnc.dt_ult_visit,registnc.num_visitas,registnc_id ))
        conn.commit()
        conn.close()
        return registnc_id

    def get_all_registnc(self):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM cad_registro_nc')
        registnc = cursor.fetchall()
        result = rows_to_dict(cursor, registnc)
        conn.close()
        return result
    
class RastrearService:
    def add_rastrear(self,rastrear):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('INSERT INTO master_rastrear(cod_congreg,data_inclu,data_inicio,data_fim,num_enderec,num_endconcl,cod_status) VALUES (%s,%s,%s,%s,%s,%s,%s)',
            (rastrear.cod_congreg,rastrear.data_inclu,rastrear.data_inicio,rastrear.data_fim,rastrear.num_enderec,rastrear.num_endconcl,rastrear.cod_status ))
        conn.commit()
        rastrear_id = cursor.lastrowid
        conn.close()
        return rastrear_id
    
    def update_rastrear(self, rastrear_id, rastrear):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('UPDATE master_rastrear SET cod_congreg = %s, data_inicio = %s, data_fim = %s, cod_status = %s WHERE id = %s',
            ( rastrear.cod_congreg, rastrear.data_inicio,rastrear.data_fim,rastrear.cod_status,rastrear_id ))
        conn.commit()
        conn.close()
        return rastrear_id
    
    def get_all_rastrear(self):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM master_rastrear')
        rastrear = cursor.fetchall()
        result = rows_to_dict(cursor, rastrear)
        conn.close()
        return result

class AuthService:
    def get_auth_login(self, user_login, user_pswd):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM master_login WHERE user_login = %s AND user_pswd = %s', (user_login, user_pswd))
        authlogin = cursor.fetchone()  # Usar fetchone para obter um único registro
        conn.close()
        if authlogin:
            return dict(zip([desc[0] for desc in cursor.description], authlogin))
        return None
    
    def add_auth_login(self, authlogin):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('INSERT INTO master_login (user_login, user_name, user_pswd) VALUES (%s, %s, %s)',
                       (authlogin.user_login, authlogin.user_name, authlogin.user_pswd))
        conn.commit()
        authlogin_id = cursor.lastrowid
        conn.close()
        return authlogin_id
