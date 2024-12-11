# services.py
from database import get_db_connection
from models import Region,Congregation,Indicacoes,Rastreamento,RegistroNC,Publicadores,Designacoes,Territorios,RelVisita,ConfigCampo

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
        cursor.execute(
            """ INSERT INTO master_login (
                            user_login,user_name,user_id_publica,
                            user_receb_msg,user_gestor,user_gestor_terr,user_gestor_rmwb,
                            user_gestor_rfds,user_gestor_mecan,user_dt_inclu,user_pswd) 
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """ , (authlogin.user_login,authlogin.user_name,
                   authlogin.user_id_publica,authlogin.user_receb_msg,
                   authlogin.user_gestor,authlogin.user_gestor_terr,
                   authlogin.user_gestor_rmwb,authlogin.user_gestor_rfds,
                   authlogin.user_gestor_mecan,authlogin.user_dt_inclu,
                   authlogin.user_pswd))
        conn.commit()
        authlogin_id = cursor.lastrowid
        conn.close()
        return authlogin_id
    
    def get_all_logins(self):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            """ 
             select 
                id,user_login,user_name,user_id_publica,user_receb_msg,
                user_gestor,user_gestor_terr,user_gestor_rmwb,user_gestor_rfds,
                user_gestor_mecan, user_dt_inclu
             from master_login where 1=1
            """ )
        authlogin = cursor.fetchall()
        result = rows_to_dict(cursor, authlogin)
        conn.close()
        return result

    def update_authlogin(self, authlogin_id, authlogin):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('UPDATE master_login SET user_pswd= %s, user_name= %s,user_receb_msg= %s, user_gestor= %s, user_gestor_terr= %s, user_gestor_rmwb= %s, user_gestor_rfds= %s, user_gestor_mecan= %s WHERE id= %s',
                    (authlogin.user_pswd,authlogin.user_name,authlogin.user_receb_msg,authlogin.user_gestor,authlogin.user_gestor_terr,authlogin.user_gestor_rmwb,authlogin.user_gestor_rfds,authlogin.user_gestor_mecan, authlogin_id ))
        conn.commit()
        conn.close()
        return authlogin_id

    def delete_authlogin(self, authlogin_id):
        conn = get_db_connection()
        cursor = conn.cursor()

        # Verifica se o login existe antes de tentar deletar
        cursor.execute('SELECT * FROM master_login WHERE id = %s', (authlogin_id,))
        authlogin = cursor.fetchone()

        if not authlogin:
            conn.close()
            raise ValueError("Registro não encontrado")  # Lança erro se não encontrar

        # Se a indicação existe, faz a exclusão
        cursor.execute('DELETE FROM master_login WHERE id = %s', (authlogin_id,))
        conn.commit()
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
        cursor.execute('INSERT INTO cad_indicacoes (data_inclu,nome_publica,num_contato,cod_congreg,cod_regiao,enderec,end_confirm,origem,indic_url_map,indic_tp_local,indic_desig,obs) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)',
            (indica.data_inclu,indica.nome_publica,indica.num_contato,indica.cod_congreg,indica.cod_regiao,indica.enderec,indica.end_confirm,indica.origem,indica.indic_url_map,indica.indic_tp_local,indica.indic_desig,indica.obs ))
        conn.commit()
        indica_id = cursor.lastrowid
        conn.close()
        return indica_id
    
    def update_indica(self, indica_id, indica):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('UPDATE cad_indicacoes SET nome_publica= %s, num_contato= %s, cod_congreg= %s, cod_regiao= %s, enderec= %s, end_confirm= %s, origem= %s, indic_url_map= %s,indic_tp_local= %s,indic_desig= %s,obs= %s WHERE id = %s',
            (indica.nome_publica,indica.num_contato,indica.cod_congreg,indica.cod_regiao,indica.enderec,indica.end_confirm,indica.origem,indica.indic_url_map,indica.indic_tp_local,indica.indic_desig,indica.obs,indica_id ))
        conn.commit()
        conn.close()
        return indica_id
    
    def get_all_indica(self):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute( 
            """    
                select 
	                indc.id, indc.data_inclu, indc.nome_publica, indc.num_contato,indc.cod_congreg
	                ,indc.cod_regiao, indc.enderec, indc.end_confirm, indc.origem, indc.obs
                    ,indc.indic_url_map, indc.indic_tp_local,indc.indic_desig
                    ,ter.terr_enderec
                    ,CASE 
                        when isnull(terr_enderec) then '0'
                        else '1'
                    END as 'map_exist'
                from cad_indicacoes as indc
                left join cad_territorios ter
	                on indc.enderec = ter.terr_enderec
                order by indc.data_inclu asc
            """  
        )
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
        cursor.execute('SELECT * FROM cad_publicador where 1 = 1 ')
        pubc = cursor.fetchall()
        result = rows_to_dict(cursor, pubc)
        conn.close()
        return result

    def get_all_pubc_sint(self):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT pub_nome,pub_login as 'pub_chave',pub_status,data_inclu  FROM cad_publicador where 1 = 1 ")
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
        cursor.execute('INSERT INTO cad_designacoes (data_inclu, dsg_data,pub_login, pub_nome, dsg_tipo, dsg_detalhes, dsg_conselh, dsg_mapa_cod,dsg_mapa_url, dsg_mapa_end, dsg_status, dsg_obs, pub_obs) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)',
            (desig.data_inclu,desig.dsg_data,desig.pub_login,desig.pub_nome,desig.dsg_tipo,desig.dsg_detalhes,desig.dsg_conselh,desig.dsg_mapa_cod,desig.dsg_mapa_url,desig.dsg_mapa_end,desig.dsg_status,desig.dsg_obs,desig.pub_obs ))
        conn.commit()
        desig_id = cursor.lastrowid
        conn.close()
        return desig_id
   
    def add_batch_desig(self, desigs):
        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            sql = """
            INSERT INTO cad_designacoes (
                data_inclu, dsg_data, pub_login, pub_nome, dsg_tipo, dsg_detalhes, dsg_conselh,  
                dsg_mapa_cod, dsg_mapa_url, dsg_mapa_end, dsg_status, dsg_obs, pub_obs
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            batch_values = [
                (
                    desig.data_inclu, desig.dsg_data, desig.pub_login, desig.pub_nome, 
                    desig.dsg_tipo, desig.dsg_detalhes, desig.dsg_conselh, desig.dsg_mapa_cod, 
                    desig.dsg_mapa_url, desig.dsg_mapa_end, desig.dsg_status, desig.dsg_obs,
                    desig.pub_obs,
                )
                for desig in desigs
            ]
            cursor.executemany(sql, batch_values)
            conn.commit()
            return cursor.rowcount
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            cursor.close()
            conn.close()

    def update_desig(self, desig_id, desig):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('UPDATE cad_designacoes SET dsg_data= %s,pub_login= %s,pub_nome= %s,dsg_tipo= %s,dsg_detalhes= %s,dsg_conselh= %s,dsg_mapa_cod= %s,dsg_mapa_url= %s,dsg_mapa_end= %s,dsg_status= %s,dsg_obs= %s,pub_obs= %s WHERE id = %s',
            (desig.dsg_data,desig.pub_login,desig.pub_nome,desig.dsg_tipo,desig.dsg_detalhes,desig.dsg_conselh,desig.dsg_mapa_cod,desig.dsg_mapa_url,desig.dsg_mapa_end,desig.dsg_status,desig.dsg_obs,desig.pub_obs, desig_id ))
        conn.commit()
        conn.close()
        return desig_id

    def get_all_desig(self):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM cad_designacoes")
        desig = cursor.fetchall()
        result = rows_to_dict(cursor, desig)
        conn.close()
        return result
    
    def get_desig_user(self, desig_user):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT 
                desg.id AS desig_id,     
                terr.id AS territor_id,   
                desg.data_inclu, desg.dsg_data, desg.pub_login, desg.pub_nome, 
                desg.dsg_tipo, desg.dsg_detalhes, desg.dsg_conselh, desg.dsg_mapa_cod,
                desg.dsg_mapa_url, desg.dsg_mapa_end, desg.dsg_status, desg.dsg_obs, 
                desg.pub_obs, terr.terr_respons, terr.dt_ultvisit,  
                terr.terr_morador, terr.pub_ultvisi, terr.terr_enderec, 
                terr.terr_regiao, terr.terr_link, terr.terr_coord, terr.terr_cor, 
                terr.terr_status, terr.num_pessoas, terr.melhor_hora, terr.melhor_dia_hora, 
                terr.terr_tp_local, terr.terr_classif, terr.terr_desig, terr.terr_obs 
            FROM cad_designacoes desg
            LEFT JOIN cad_territorios terr ON desg.dsg_mapa_cod = terr.terr_nome
            WHERE 
                1 = 1 
                and desg.dsg_status IN ('1', '2', '3') 
                and desg.dsg_tipo IN  ('0', '1')                       
                and terr.terr_status IN  ('0')
                and trim(desg.pub_login) = %s
            ORDER BY desg.dsg_mapa_cod ASC
            """, (desig_user,))
        
        desig = cursor.fetchall()
        result = rows_to_dict(cursor, desig)
        conn.close()
        return result
    
    def get_desig_transf(self):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
              SELECT 
                desg.id AS desig_id,     
                terr.id AS territor_id, 
                desg.data_inclu, desg.dsg_data, desg.pub_login, desg.pub_nome, 
                desg.dsg_tipo, desg.dsg_detalhes, desg.dsg_conselh, desg.dsg_mapa_cod,
                desg.dsg_mapa_url, desg.dsg_mapa_end, desg.dsg_status, desg.dsg_obs, 
                desg.pub_obs, terr.terr_respons, terr.dt_ultvisit,  
                terr.terr_morador, terr.pub_ultvisi, terr.terr_enderec, 
                terr.terr_regiao, terr.terr_link, terr.terr_coord, terr.terr_cor, 
                terr.terr_status, terr.num_pessoas, terr.melhor_hora, terr.melhor_dia_hora, 
                terr.terr_tp_local, terr.terr_classif, terr.terr_desig, terr.terr_obs 
            FROM cad_designacoes desg
            LEFT JOIN cad_territorios terr ON desg.dsg_mapa_cod = terr.terr_nome
            WHERE 
                1 = 1 
                and desg.dsg_status IN ('0') 
                and desg.dsg_tipo IN  ('0', '1')
                and terr.terr_status IN  ('0')
                and (isnull(desg.pub_login) or desg.pub_login = '')
            ORDER BY desg.dsg_mapa_cod ASC
            """)
        
        desig = cursor.fetchall()
        result = rows_to_dict(cursor, desig)
        conn.close()
        return result

    def get_desig_ensino(self, desig_user):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
              SELECT 
                desg.id AS desig_id,         -- ID da designação
                terr.id AS territor_id,      -- ID do território
                desg.data_inclu, desg.dsg_data, desg.pub_login, desg.pub_nome, 
                desg.dsg_tipo, desg.dsg_detalhes, desg.dsg_conselh, desg.dsg_mapa_cod,
                desg.dsg_mapa_url, desg.dsg_mapa_end, desg.dsg_status, desg.dsg_obs, 
                desg.pub_obs, terr.terr_respons, terr.dt_ultvisit,  
                terr.terr_morador, terr.pub_ultvisi, terr.terr_enderec, 
                terr.terr_regiao, terr.terr_link, terr.terr_coord, terr.terr_cor, 
                terr.terr_status, terr.num_pessoas, terr.melhor_hora, terr.melhor_dia_hora, 
                terr.terr_tp_local, terr.terr_classif, terr.terr_desig, terr.terr_obs 
            FROM cad_designacoes desg
            LEFT JOIN cad_territorios terr ON desg.dsg_mapa_cod = terr.terr_nome
            WHERE 
                1 = 1 
                and desg.dsg_status IN ('2') 
                and desg.dsg_tipo IN  ('0', '1')
                and terr.terr_status IN  ('1', '2')
                and trim(terr.terr_respons) = %s
                and trim(desg.pub_login) = %s
            ORDER BY desg.dsg_mapa_cod ASC
            """, (desig_user,desig_user,))
        
        desig = cursor.fetchall()
        result = rows_to_dict(cursor, desig)
        conn.close()
        return result

    def get_desig_sugest(self):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
        
         (  SELECT 
                desg.id AS desig_id,     
				desg.dsg_data,
				desg.dsg_detalhes,
				desg.dsg_mapa_cod,
                terr.id AS territor_id, 
                terr.terr_nome, 
                terr.data_inclu, 
                terr.terr_respons, terr.dt_ultvisit,  
                terr.terr_morador, terr.pub_ultvisi, terr.terr_enderec, 
                terr.terr_regiao, terr.terr_link, terr.terr_coord, terr.terr_cor, 
                terr.terr_status, terr.num_pessoas, terr.melhor_hora, terr.melhor_dia_hora, 
                terr.terr_tp_local, terr.terr_classif, terr.terr_desig, terr.terr_obs 
            FROM cad_territorios terr
            LEFT JOIN cad_designacoes desg ON desg.dsg_mapa_cod = terr.terr_nome
            WHERE 
                1 = 1 
                and terr.terr_status IN  ('0')
                and terr.terr_cor IN  ('0')
                and not (terr.terr_desig in ('2') )
                and (isnull(desg.id) or desg.dsg_status in ('4'))
            ORDER BY terr.dt_ultvisit,terr.terr_nome desc limit 4  )
		    UNION 
           ( SELECT 
                desg.id AS desig_id,     
				desg.dsg_data,
				desg.dsg_detalhes,
				desg.dsg_mapa_cod,
                terr.id AS territor_id, 
                terr.terr_nome, 
                terr.data_inclu, 
                terr.terr_respons, terr.dt_ultvisit,  
                terr.terr_morador, terr.pub_ultvisi, terr.terr_enderec, 
                terr.terr_regiao, terr.terr_link, terr.terr_coord, terr.terr_cor, 
                terr.terr_status, terr.num_pessoas, terr.melhor_hora, terr.melhor_dia_hora, 
                terr.terr_tp_local, terr.terr_classif, terr.terr_desig, terr.terr_obs 
            FROM cad_territorios terr
            LEFT JOIN cad_designacoes desg ON desg.dsg_mapa_cod = terr.terr_nome
            WHERE 
                1 = 1 
                and terr.terr_status IN  ('0')
                and terr.terr_cor IN  ('1')
                and not (terr.terr_desig in ('2') )
                and (isnull(desg.id) or desg.dsg_status in ('4'))
            ORDER BY terr.dt_ultvisit,terr.terr_nome desc limit 4)
            UNION 
            ( SELECT 
                desg.id AS desig_id,     
				desg.dsg_data,
				desg.dsg_detalhes,
				desg.dsg_mapa_cod,
                terr.id AS territor_id, 
                terr.terr_nome, 
                terr.data_inclu, 
                terr.terr_respons, terr.dt_ultvisit,  
                terr.terr_morador, terr.pub_ultvisi, terr.terr_enderec, 
                terr.terr_regiao, terr.terr_link, terr.terr_coord, terr.terr_cor, 
                terr.terr_status, terr.num_pessoas, terr.melhor_hora, terr.melhor_dia_hora, 
                terr.terr_tp_local, terr.terr_classif, terr.terr_desig, terr.terr_obs 
            FROM cad_territorios terr
            LEFT JOIN cad_designacoes desg ON desg.dsg_mapa_cod = terr.terr_nome
            WHERE 
                1 = 1 
                and terr.terr_status IN  ('0')
                and terr.terr_cor IN  ('2')
                and not (terr.terr_desig in ('2') )
                and (isnull(desg.id) or desg.dsg_status in ('4'))
            ORDER BY terr.dt_ultvisit,terr.terr_nome desc limit 2)
            """)
        
        desig = cursor.fetchall()
        result = rows_to_dict(cursor, desig)
        conn.close()
        return result
    
    def get_desig_user_outras(self, desig_user):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
   SELECT 
                desg.id AS desig_id,     
                camp.id AS camp_id,   
                desg.data_inclu, desg.dsg_data, desg.pub_login, desg.pub_nome, 
                desg.dsg_tipo, desg.dsg_detalhes, desg.dsg_conselh, desg.dsg_mapa_cod,
                desg.dsg_mapa_url, desg.dsg_mapa_end, desg.dsg_status, desg.dsg_obs, 
                desg.pub_obs, camp.data_inclu, camp.cmp_tipo,  
                camp.cmp_diadasem, camp.cmp_seq, camp.cmp_local, 
                camp.cmp_enderec, camp.cmp_url, camp.cmp_tipoativ, camp.cmp_horaini,
                camp.cmp_horafim, camp.cmp_detalhes, 
                (select 
					desg2.pub_nome from cad_designacoes desg2 
                    where 1 =1 
						and desg2.dsg_mapa_cod = camp.cmp_diadasem 
						and desg2.dsg_tipo = desg.dsg_tipo
                        and desg2.dsg_data = desg.dsg_data
                       and not(desg2.pub_login in (desg.pub_login))
                    group by desg2.pub_nome limit 1) as 'cmp_publicador02'
            FROM cad_designacoes desg
            LEFT JOIN cad_configcampo camp ON desg.dsg_mapa_cod = camp.cmp_diadasem and desg.dsg_tipo = camp.cmp_tipo
            WHERE 
                1 = 1 
                and desg.dsg_status IN ('1', '2', '3') 
                and desg.dsg_tipo IN  ('2', '3','4')                 
                and trim(desg.pub_login) = %s
             ORDER BY desg.dsg_data ASC
            """, (desig_user,))
        
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
        cursor.execute(
            """                 
            INSERT INTO cad_territorios (
                data_inclu,dt_ultvisit,pub_ultvisi,
                dt_visit02,pub_tvis02,dt_visit03,
                pub_tvis03,dt_visit04,pub_tvis04,
                terr_nome,terr_morador,terr_enderec,
                terr_regiao,terr_link,terr_coord,
                terr_cor,terr_status,
                num_pessoas,melhor_dia_hora,
                terr_tp_local,terr_classif,terr_desig,melhor_hora,
                terr_respons,terr_obs) 
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                """,
            (territ.data_inclu,
             territ.dt_ultvisit,
             territ.pub_ultvisi,
             territ.dt_visit02,
             territ.pub_tvis02,
             territ.dt_visit03,
             territ.pub_tvis03,
             territ.dt_visit04,
             territ.pub_tvis04,
             territ.terr_nome,
             territ.terr_morador,
             territ.terr_enderec,
             territ.terr_regiao,
             territ.terr_link,
             territ.terr_coord,
             territ.terr_cor,
             territ.terr_status,
             territ.num_pessoas,
             territ.melhor_dia_hora,
             territ.terr_tp_local,
             territ.terr_classif,
             territ.terr_desig,
             territ.melhor_hora,
             territ.terr_respons,
             territ.terr_obs ))
        conn.commit()
        territ_id = cursor.lastrowid
        conn.close()
        return territ_id
    
    def update_territ(self, territ_id, territ):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            UPDATE cad_territorios SET 
            dt_ultvisit= %s,pub_ultvisi= %s,dt_visit02= %s,pub_tvis02= %s,
            dt_visit03= %s,pub_tvis03= %s,dt_visit04= %s,pub_tvis04= %s,
            terr_nome= %s,terr_morador= %s,terr_enderec= %s,terr_regiao= %s,
            terr_link= %s,terr_coord= %s,terr_cor= %s, terr_status= %s,
            num_pessoas= %s, melhor_dia_hora= %s,
            terr_tp_local= %s,terr_classif= %s,terr_desig= %s,melhor_hora= %s,
            terr_respons= %s,terr_obs= %s WHERE id = %s
            """,    
          (  territ.dt_ultvisit,
             territ.pub_ultvisi,
             territ.dt_visit02,
             territ.pub_tvis02,
             territ.dt_visit03,
             territ.pub_tvis03,
             territ.dt_visit04,
             territ.pub_tvis04,
             territ.terr_nome,
             territ.terr_morador,
             territ.terr_enderec,
             territ.terr_regiao,
             territ.terr_link,
             territ.terr_coord,
             territ.terr_cor,
             territ.terr_status,
             territ.num_pessoas,
             territ.melhor_dia_hora,
             territ.terr_tp_local,
             territ.terr_classif,
             territ.terr_desig,
             territ.melhor_hora,
             territ.terr_respons,
             territ.terr_obs,
             territ_id
            ))
        
        conn.commit()
        conn.close()
        return territ_id
    
    def update_territ_especif(self, territ_id, fields_to_update):
        conn = get_db_connection()
        cursor = conn.cursor()

        # Monta a cláusula SET dinamicamente com os campos enviados
        set_clause = ', '.join([f"{key} = %s" for key in fields_to_update.keys()])
        query = f"UPDATE cad_territorios SET {set_clause} WHERE id = %s"

        # Valores para a query, adicionando o `territ_id` no final
        values = list(fields_to_update.values())
        values.append(territ_id)

        # Executa a query de atualização
        cursor.execute(query, values)
        conn.commit()
        conn.close()    
        return territ_id

    def get_all_territ(self):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM cad_territorios where 1 = 1 ORDER BY terr_nome ASC')
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

class VisitaService:
    def add_visit(self,rvisitas):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('INSERT INTO mov_relat_visitas (data_inclu, visit_data,pub_login, pub_nome, visit_cod, visit_url, visit_ender, visit_status,num_pessoas, melhor_dia, melhor_hora, terr_obs) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)',
            (rvisitas.data_inclu,rvisitas.visit_data,rvisitas.pub_login,rvisitas.pub_nome,rvisitas.visit_cod,rvisitas.visit_url,rvisitas.visit_ender,rvisitas.visit_status,rvisitas.num_pessoas,rvisitas.melhor_dia,rvisitas.melhor_hora,rvisitas.terr_obs ))
        conn.commit()
        rvisitas_id = cursor.lastrowid
        conn.close()
        return rvisitas_id

    def get_all_visit(self):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(           
            """
        	select
	            id             , 
	            data_inclu	   ,
                visit_data     ,
                pub_login      ,        
				pub_nome       ,
	            visit_cod      ,	
                visit_url      , 
                visit_ender    ,     
                visit_status   ,
                num_pessoas    ,
                melhor_dia     ,
                melhor_hora    ,      
                terr_obs       
            from mov_relat_visitas where 1 = 1 
            """
            )
        rvisitas = cursor.fetchall()
        result = rows_to_dict(cursor, rvisitas)
        conn.close()
        return result

    def delete_visit(self, rvisitas_id):
        conn = get_db_connection()
        cursor = conn.cursor()

        # Verifica se o registro existe antes de tentar deletar
        cursor.execute('SELECT * FROM mov_relat_visitas WHERE id = %s', (rvisitas_id,))
        rvisitas = cursor.fetchone()

        if not rvisitas:
            conn.close()
            raise ValueError("Registro não encontrado")  # Lança erro se não encontrar

        # Se o registro existe, faz a exclusão
        cursor.execute('DELETE FROM mov_relat_visitas WHERE id = %s', (rvisitas_id,))
        conn.commit()
        conn.close()
        return rvisitas_id

    def update_visit(self, rvisitas_id, rvisitas):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('UPDATE mov_relat_visitas SET visit_data= %s,pub_login= %s,pub_nome= %s,visit_cod= %s,visit_url= %s,visit_ender= %s,visit_status= %s,num_pessoas= %s,melhor_dia= %s,melhor_hora= %s,terr_obs= %s WHERE id = %s',
            (rvisitas.visit_data,rvisitas.pub_login,rvisitas.pub_nome,rvisitas.visit_cod,rvisitas.visit_url,rvisitas.visit_ender,rvisitas.visit_status,rvisitas.num_pessoas,rvisitas.melhor_dia,rvisitas.melhor_hora,rvisitas.terr_obs,rvisitas_id ))
        conn.commit()
        conn.close()
        return rvisitas_id		

    def add_batch_visits(self, rvisitas_list):
        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            sql = """
            INSERT INTO mov_relat_visitas (
                data_inclu, visit_data, pub_login, pub_nome, visit_cod, visit_url, 
                visit_ender, visit_status, num_pessoas, melhor_dia, melhor_hora, terr_obs
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            batch_values = [
                (
                    visit['data_inclu'], visit['visit_data'], visit['pub_login'], visit['pub_nome'], 
                    visit['visit_cod'], visit['visit_url'], visit['visit_ender'], visit['visit_status'], 
                    visit['num_pessoas'], visit['melhor_dia'], visit['melhor_hora'], visit['terr_obs']
                )
                for visit in rvisitas_list
            ]
            cursor.executemany(sql, batch_values)
            conn.commit()
            return cursor.rowcount
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            cursor.close()
            conn.close()
##
## Serviços para a config de campo
class CfgCampoService:
    def add_cfgcampo(self,cfgcampo):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('INSERT INTO cad_configcampo(data_inclu,cmp_tipo,cmp_diadasem,cmp_seq,cmp_local,cmp_enderec,cmp_url,cmp_tipoativ,cmp_horaini,cmp_horafim,cmp_detalhes) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)',
            (cfgcampo.data_inclu,cfgcampo.cmp_tipo,cfgcampo.cmp_diadasem,cfgcampo.cmp_seq,cfgcampo.cmp_local,cfgcampo.cmp_enderec,cfgcampo.cmp_url,cfgcampo.cmp_tipoativ,cfgcampo.cmp_horaini,cfgcampo.cmp_horafim,cfgcampo.cmp_detalhes ))
        conn.commit()
        cfgcampo_id = cursor.lastrowid
        conn.close()
        return cfgcampo_id
    
    def update_cfgcampo(self, cfgcampo_id, cfgcampo):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('UPDATE cad_configcampo SET cmp_tipo = %s, cmp_diadasem = %s, cmp_seq = %s, cmp_local = %s,cmp_enderec = %s,cmp_url = %s,cmp_tipoativ = %s,cmp_horaini = %s,cmp_horafim = %s,cmp_detalhes = %s WHERE id = %s',
            ( cfgcampo.cmp_tipo,cfgcampo.cmp_diadasem,cfgcampo.cmp_seq,cfgcampo.cmp_local,cfgcampo.cmp_enderec,cfgcampo.cmp_url,cfgcampo.cmp_tipoativ,cfgcampo.cmp_horaini,cfgcampo.cmp_horafim,cfgcampo.cmp_detalhes,cfgcampo_id ))
        conn.commit()
        conn.close()
        return cfgcampo_id
    
    def get_all_cfgcampo(self):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM cad_configcampo where 1 = 1 and cmp_tipo in ('2') order by cmp_seq ASC")
        cfgcampo = cursor.fetchall()
        result = rows_to_dict(cursor, cfgcampo)
        conn.close()
        return result
    
    def get_all_cfgcarrin(self):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM cad_configcampo where 1 = 1 and cmp_tipo in ('3') order by cmp_seq ASC")
        cfgcampo = cursor.fetchall()
        result = rows_to_dict(cursor, cfgcampo)
        conn.close()
        return result

    def delete_cfgcampo(self, cfgcampo_id):
        conn = get_db_connection()
        cursor = conn.cursor()

        # Verifica se o registro existe antes de tentar deletar
        cursor.execute('SELECT * FROM cad_configcampo WHERE id = %s', (cfgcampo_id,))
        rastrear = cursor.fetchone()

        if not rastrear:
            conn.close()
            raise ValueError("Registro não encontrada")  # Lança erro se não encontrar

        # Se o registro existe, faz a exclusão
        cursor.execute('DELETE FROM cad_configcampo WHERE id = %s', (cfgcampo_id,))
        conn.commit()
        conn.close()
        return cfgcampo_id
    
##