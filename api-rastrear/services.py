# services.py
from database import get_db_connection
from models import Region,Congregation,Indicacoes,Rastreamento,RegistroNC,Publicadores,Designacoes,Territorios

def rows_to_dict(cursor, rows):
    """Converte uma lista de tuplas em uma lista de dicionários usando os nomes das colunas."""
    columns = [desc[0] for desc in cursor.description]
    return [dict(zip(columns, row)) for row in rows]


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
        cursor.execute('UPDATE cad_congregacoes SET nome = %s, regiao = %s, endereco = %s, cca_nome = %s, cca_contato = %s, ss_nome = %s, ss_contato = %s, srv_terr_nome = %s, srv_terr_contat = %s WHERE id = %s',
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
    
    def delete_congregation(self, congregation_id):
        conn = get_db_connection()
        cursor = conn.cursor()

        # Verifica se o registro existe antes de tentar deletar
        cursor.execute('SELECT * FROM cad_congregacoes WHERE id = %s', (congregation_id,))
        congregacoes = cursor.fetchone()

        if not congregacoes:
            conn.close()
            raise ValueError("Registro não encontrado")  # Lança erro se não encontrar

        # Se o registro existe, faz a exclusão
        cursor.execute('DELETE FROM cad_congregacoes WHERE id = %s', (congregation_id,))
        conn.commit()
        conn.close()
        return congregation_id

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


##
## Serviços para o Cadastro de Indicações
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
        cursor.execute('UPDATE cad_indicacoes SET nome_publica= %s, num_contato= %s, cod_congreg= %s, cod_regiao= %s, enderec= %s, end_confirm= %s, origem= %s, obs= %s WHERE id = %s',
            (indica.nome_publica,indica.num_contato,indica.cod_congreg,indica.cod_regiao,indica.enderec,indica.end_confirm,indica.origem,indica.obs,indica_id ))
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
    
    def delete_indica(self, indica_id):
        conn = get_db_connection()
        cursor = conn.cursor()

        # Verifica se a indicação existe antes de tentar deletar
        cursor.execute('SELECT * FROM cad_indicacoes WHERE id = %s', (indica_id,))
        indica = cursor.fetchone()

        if not indica:
            conn.close()
            raise ValueError("Registro não encontrado")  # Lança erro se não encontrar

        # Se a indicação existe, faz a exclusão
        cursor.execute('DELETE FROM cad_indicacoes WHERE id = %s', (indica_id,))
        conn.commit()
        conn.close()
        return indica_id

##
## Serviços para o Registro NC
class RegistroNCService:
    def add_registnc(self,registnc):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('INSERT INTO cad_registro_nc (data_inclu,cod_regiao,enderec,num_visitas,dt_ult_visit,obs) VALUES (%s,%s,%s,%s,%s,%s)',
            (registnc.data_inclu,registnc.cod_regiao,registnc.enderec,registnc.num_visitas,registnc.dt_ult_visit,registnc.obs ))
        conn.commit()
        registnc_id = cursor.lastrowid
        conn.close()
        return registnc_id
    
    def update_registnc(self, registnc_id, registnc):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('UPDATE cad_registro_nc SET cod_regiao=%s,enderec= %s,obs= %s, dt_ult_visit= %s, num_visitas= %s WHERE id= %s',
            (registnc.cod_regiao,registnc.enderec,registnc.obs,registnc.dt_ult_visit,registnc.num_visitas,registnc_id ))
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
    
    def delete_registnc(self, registnc_id):
        conn = get_db_connection()
        cursor = conn.cursor()

        # Verifica se o registro existe antes de tentar deletar
        cursor.execute('SELECT * FROM cad_registro_nc WHERE id = %s', (registnc_id,))
        registnc = cursor.fetchone()

        if not registnc:
            conn.close()
            raise ValueError("Registro não encontrado")  # Lança erro se não encontrar

        # Se o registro existe, faz a exclusão
        cursor.execute('DELETE FROM cad_registro_nc WHERE id = %s', (registnc_id,))
        conn.commit()
        conn.close()
        return registnc_id
    
##
## Serviços para os Rastreamentos
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

    def delete_rastrear(self, rastrear_id):
        conn = get_db_connection()
        cursor = conn.cursor()

        # Verifica se o registro existe antes de tentar deletar
        cursor.execute('SELECT * FROM master_rastrear WHERE id = %s', (rastrear_id,))
        rastrear = cursor.fetchone()

        if not rastrear:
            conn.close()
            raise ValueError("Registro não encontrada")  # Lança erro se não encontrar

        # Se o registro existe, faz a exclusão
        cursor.execute('DELETE FROM master_rastrear WHERE id = %s', (rastrear_id,))
        conn.commit()
        conn.close()
        return rastrear_id
    
##
## Serviços para o cadastro de Publicador
class PublicaService:
    def add_pubc(self,pubc):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('INSERT INTO cad_publicador (data_inclu,pub_nome,pub_contat,pub_login,pub_email,pub_endereco,pub_regiao,pub_uf,pub_dtbatism,pub_dtnasc,desig_servic,desig_campo,pub_status,resp_obs) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)',
            (pubc.data_inclu,pubc.pub_nome,pubc.pub_contat,pubc.pub_login,pubc.pub_email,pubc.pub_endereco,pubc.pub_regiao,pubc.pub_uf,pubc.pub_dtbatism,pubc.pub_dtnasc,pubc.desig_servic,pubc.desig_campo,pubc.pub_status,pubc.resp_obs ))
        conn.commit()
        pubc_id = cursor.lastrowid
        conn.close()
        return pubc_id
    
    def update_pubc(self, pubc_id, pubc):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('UPDATE cad_publicador SET pub_nome= %s,pub_contat= %s,pub_login= %s,pub_email= %s,pub_endereco= %s,pub_regiao= %s,pub_uf= %s,pub_dtbatism= %s,pub_dtnasc= %s,desig_servic= %s,desig_campo= %s,pub_status= %s,resp_obs= %s WHERE id = %s',
            (pubc.pub_nome,pubc.pub_contat,pubc.pub_login,pubc.pub_email,pubc.pub_endereco,pubc.pub_regiao,pubc.pub_uf,pubc.pub_dtbatism,pubc.pub_dtnasc,pubc.desig_servic,pubc.desig_campo,pubc.pub_status,pubc.resp_obs, pubc_id ))
        conn.commit()
        conn.close()
        return pubc_id

    def get_all_pubc(self):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM cad_publicador')
        pubc = cursor.fetchall()
        result = rows_to_dict(cursor, pubc)
        conn.close()
        return result

    def delete_publi(self, pubc_id):
        print(f"Excluindo publicador com ID: {pubc_id}")  # Adiciona um print para debug
  
        conn = get_db_connection()
        cursor = conn.cursor()

        # Verifica se o registro existe antes de tentar deletar
        cursor.execute('SELECT * FROM cad_publicador WHERE id = %s', (pubc_id,))
        pubc = cursor.fetchone()

        if not pubc:
            conn.close()
            raise ValueError("Registro não encontrado")  # Lança erro se não encontrar

        # Se o registro existe, faz a exclusão
        cursor.execute('DELETE FROM cad_publicador WHERE id = %s', (pubc_id,))
        conn.commit()
        conn.close()
        return pubc_id


class DesignService:
    def add_desig(self,desig):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('INSERT INTO cad_designacoes (data_inclu, dsg_data, pub_nome, dsg_tipo, dsg_detalhes, dsg_conselh, dsg_mapa_cod, dsg_mapa_end, dsg_status, dsg_obs, pub_obs) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)',
            (desig.data_inclu,desig.dsg_data,desig.pub_nome,desig.dsg_tipo,desig.dsg_detalhes,desig.dsg_conselh,desig.dsg_mapa_cod,desig.dsg_mapa_end,desig.dsg_status,desig.dsg_obs,desig.pub_obs ))
        conn.commit()
        desig_id = cursor.lastrowid
        conn.close()
        return desig_id
    
    def update_desig(self, desig_id, desig):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('UPDATE cad_designacoes SET dsg_data= %s,pub_nome= %s,dsg_tipo= %s,dsg_detalhes= %s,dsg_conselh= %s,dsg_mapa_cod= %s,dsg_mapa_end= %s,dsg_status= %s,dsg_obs= %s,pub_obs= %s WHERE id = %s',
            (desig.dsg_data,desig.pub_nome,desig.dsg_tipo,desig.dsg_detalhes,desig.dsg_conselh,desig.dsg_mapa_cod,desig.dsg_mapa_end,desig.dsg_status,desig.dsg_obs,desig.pub_obs, desig_id ))
        conn.commit()
        conn.close()
        return desig_id

    def get_all_desig(self):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM cad_designacoes')
        desig = cursor.fetchall()
        result = rows_to_dict(cursor, desig)
        conn.close()
        return result
    
    def delete_desig(self, desig_id):
        conn = get_db_connection()
        cursor = conn.cursor()

        # Verifica se o registro existe antes de tentar deletar
        cursor.execute('SELECT * FROM cad_designacoes WHERE id = %s', (desig_id,))
        desig = cursor.fetchone()

        if not desig:
            conn.close()
            raise ValueError("Registro não encontrado")  # Lança erro se não encontrar

        # Se o registro existe, faz a exclusão
        cursor.execute('DELETE FROM cad_designacoes WHERE id = %s', (desig_id,))
        conn.commit()
        conn.close()
        return desig_id

class TerritService:
    def add_territ(self,territ):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('INSERT INTO cad_territorios (data_inclu,dt_ultvisit,pub_ultvisi,dt_visit02,pub_tvis02,dt_visit03,pub_tvis03,dt_visit04,pub_tvis04,terr_nome,terr_morador,terr_enderec,terr_regiao,terr_link,terr_coord,terr_cor,terr_status,terr_obs) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)',
            (territ.data_inclu,territ.dt_ultvisit,territ.pub_ultvisi,territ.dt_visit02,territ.pub_tvis02,territ.dt_visit03,territ.pub_tvis03,territ.dt_visit04,territ.pub_tvis04,territ.terr_nome,territ.terr_morador,territ.terr_enderec,territ.terr_regiao,territ.terr_link,territ.terr_coord,territ.terr_cor,territ.terr_status,territ.terr_obs ))
        conn.commit()
        territ_id = cursor.lastrowid
        conn.close()
        return territ_id
    
    def update_territ(self, territ_id, territ):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('UPDATE cad_territorios SET dt_ultvisit= %s,pub_ultvisi= %s,dt_visit02= %s,pub_tvis02= %s,dt_visit03= %s,pub_tvis03= %s,dt_visit04= %s,pub_tvis04= %s,terr_nome= %s,terr_morador= %s,terr_enderec= %s,terr_regiao= %s,terr_link= %s,terr_coord= %s,terr_cor= %s,terr_status= %s,terr_obs= %s WHERE id = %s',
            (territ.dt_ultvisit,territ.pub_ultvisi,territ.dt_visit02,territ.pub_tvis02,territ.dt_visit03,territ.pub_tvis03,territ.dt_visit04,territ.pub_tvis04,territ.terr_nome,territ.terr_morador,territ.terr_enderec,territ.terr_regiao,territ.terr_link,territ.terr_coord,territ.terr_cor,territ.terr_status,territ.terr_obs ))
        conn.commit()
        conn.close()
        return territ_id

    def get_all_territ(self):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM cad_territorios')
        territ = cursor.fetchall()
        result = rows_to_dict(cursor, territ)
        conn.close()
        return result
    
    def delete_territ(self, territ_id):
        conn = get_db_connection()
        cursor = conn.cursor()

        # Verifica se o registro existe antes de tentar deletar
        cursor.execute('SELECT * FROM cad_territorios WHERE id = %s', (territ_id,))
        territ = cursor.fetchone()

        if not territ:
            conn.close()
            raise ValueError("Registro não encontrado")  # Lança erro se não encontrar

        # Se o registro existe, faz a exclusão
        cursor.execute('DELETE FROM cad_territorios WHERE id = %s', (territ_id,))
        conn.commit()
        conn.close()
        return territ_id