# services.py
from database import get_db_connection
from models import (
    Region,
    Congregation,
    Indicacoes,
    Rastreamento,
    RegistroNC,
    Publicadores,
    Designacoes,
    Territorios,
    RelVisita,
    ConfigCampo,
    RegPublicacoes, 
    CadNotificacoes,
    CaduAnotacoes,
    MovHorasCampo,
    )

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
    
    def update_indica(self, indica_id, fields_to_update):
        conn = get_db_connection()
        cursor = conn.cursor()

        # Monta a cláusula SET dinamicamente com os campos enviados
        set_clause = ', '.join([f"{key} = %s" for key in fields_to_update.keys()])
        query = f"UPDATE cad_indicacoes SET {set_clause} WHERE id = %s"

        # Valores para a query, adicionando o `indica_id` no final
        values = list(fields_to_update.values())
        values.append(indica_id)

        # Executa a query de atualização
        cursor.execute(query, values)
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
        cursor.execute('SELECT * FROM cad_publicador where 1 = 1 order by pub_nome asc')
        pubc = cursor.fetchall()
        result = rows_to_dict(cursor, pubc)
        conn.close()
        return result

    def get_all_pubc_sint(self):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT pub_nome,pub_login as 'pub_chave',pub_status,data_inclu  FROM cad_publicador where 1 = 1 order by pub_nome asc")
        pubc = cursor.fetchall()
        result = rows_to_dict(cursor, pubc)
        conn.close()
        return result
    
    def get_pubc_user(self, pubc_user):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            select 
                id as pubc_id,
                data_inclu, 
                pub_login as 'pub_chave',
                pub_nome, pub_contat, pub_email, pub_endereco, 
                pub_regiao, desig_servic, desig_campo, pub_status 
            from cad_publicador pubc
            where 1 = 1 
            	and trim(pubc.pub_login) = %s
            order by 
            	id  ASC
            """, (pubc_user,))
        
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
        cursor.execute('INSERT INTO cad_designacoes (data_inclu, dsg_data,pub_login, pub_nome, dsg_tipo, dsg_detalhes, dsg_conselh, dsg_mapa_cod,dsg_mapa_url, dsg_mapa_end, dsg_status,dsg_horaini, dsg_obs, pub_obs) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)',
            (desig.data_inclu,desig.dsg_data,desig.pub_login,desig.pub_nome,desig.dsg_tipo,desig.dsg_detalhes,desig.dsg_conselh,desig.dsg_mapa_cod,desig.dsg_mapa_url,desig.dsg_mapa_end,desig.dsg_status,desig.dsg_horaini,desig.dsg_obs,desig.pub_obs ))
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
                dsg_mapa_cod, dsg_mapa_url, dsg_mapa_end, dsg_status,dsg_horaini, dsg_obs, pub_obs
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            batch_values = [
                (
                    desig.data_inclu, desig.dsg_data, desig.pub_login, desig.pub_nome, 
                    desig.dsg_tipo, desig.dsg_detalhes, desig.dsg_conselh, desig.dsg_mapa_cod, 
                    desig.dsg_mapa_url, desig.dsg_mapa_end, desig.dsg_status,desig.dsg_horaini, desig.dsg_obs,
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
        cursor.execute('UPDATE cad_designacoes SET dsg_data= %s,pub_login= %s,pub_nome= %s,dsg_tipo= %s,dsg_detalhes= %s,dsg_conselh= %s,dsg_mapa_cod= %s,dsg_mapa_url= %s,dsg_mapa_end= %s,dsg_status= %s,dsg_horaini= %s, dsg_obs= %s,pub_obs= %s WHERE id = %s',
            (desig.dsg_data,desig.pub_login,desig.pub_nome,desig.dsg_tipo,desig.dsg_detalhes,desig.dsg_conselh,desig.dsg_mapa_cod,desig.dsg_mapa_url,desig.dsg_mapa_end,desig.dsg_status,desig.dsg_horaini,desig.dsg_obs,desig.pub_obs, desig_id ))
        conn.commit()
        conn.close()
        return desig_id

    def get_all_desig(self):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
                SELECT 
                    desg.id, 
                    desg.id AS desig_id,     
                    0 AS territor_id,    
                    0 AS indica_id,                          
                    desg.data_inclu,
                    desg.dsg_data,
                    desg.pub_login, 
                    desg.pub_nome, 
                    desg.dsg_tipo, 
                    desg.dsg_detalhes, 
                    desg.dsg_conselh, 
                    desg.dsg_mapa_cod,
                    desg.dsg_mapa_url, 
                    desg.dsg_mapa_end, 
                    desg.dsg_status,
                    desg.dsg_horaini,
                    desg.dsg_obs, 
                    desg.pub_obs
                FROM cad_designacoes desg
                WHERE 
                    1 = 1 
                ORDER BY desg.dsg_data DESC
            """)
        desig = cursor.fetchall()
        result = rows_to_dict(cursor, desig)
        conn.close()
        return result
    
    def get_desig_user(self, desig_user):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            (
                SELECT 
                    desg.id AS desig_id,     
                    terr.id AS territor_id,    
                    0 AS indica_id,                          
                    desg.data_inclu, desg.dsg_data, desg.pub_login, desg.pub_nome, 
                    desg.dsg_tipo, desg.dsg_detalhes, desg.dsg_conselh, desg.dsg_mapa_cod,
                    desg.dsg_mapa_url, desg.dsg_mapa_end,desg.dsg_horaini, desg.dsg_status, desg.dsg_obs, 
                    desg.pub_obs, terr.terr_respons, terr.dt_ultvisit,  
                    terr.terr_morador, terr.pub_ultvisi, terr.terr_enderec, 
                    terr.terr_regiao, terr.terr_link, terr.terr_coord, terr.terr_cor, 
                    terr.terr_status, terr.num_pessoas, terr.melhor_hora, terr.melhor_dia_hora, 
                    terr.terr_tp_local, terr.terr_classif, terr.terr_desig, terr.terr_obs,
                    'MAP' as desg_tipogrupo  
                FROM cad_designacoes desg
                LEFT JOIN cad_territorios terr ON desg.dsg_mapa_cod = terr.terr_nome
                WHERE 
                    1 = 1 
                    and desg.dsg_status IN ('1', '2', '3') 
                    and desg.dsg_tipo IN  ('0', '1')                       
                    and terr.terr_status IN  ('0')
                    and trim(desg.pub_login) = %s
                ORDER BY desg.dsg_mapa_cod ASC 
            )
            UNION		
            (    
                SELECT 
                    desg.id AS desig_id,    
                    0 AS territor_id,
                    indc.id AS indica_id, 
                    desg.data_inclu, 
                    desg.dsg_data, 
                    desg.pub_login, 
                    desg.pub_nome, 
                    desg.dsg_tipo, 
                    desg.dsg_detalhes, 
                    desg.dsg_conselh, 
                    desg.dsg_mapa_cod,
                    desg.dsg_mapa_url, 
                    desg.dsg_mapa_end, 
                    desg.dsg_status, 
                    desg.dsg_horaini,
                    desg.dsg_obs, 
                    desg.pub_obs, 
                    desg.pub_login as terr_respons, 
                    desg.dsg_data as dt_ultvisit,  
                    ''  AS terr_morador, 
                    indc.nome_publica AS pub_ultvisi, 
                    indc.enderec AS terr_enderec, 
                    indc.cod_regiao AS terr_regiao, 
                    indc.indic_url_map AS terr_link, 
                    ''  AS terr_coord, 
                    '2' AS terr_cor, 
                    '0' AS terr_status, 
                    '1' AS num_pessoas, 
                    'Livre' AS melhor_hora, 
                    'Livre' AS melhor_dia_hora, 
                    indc.indic_tp_local AS terr_tp_local, 
                    '0' AS terr_classif, 
                    indc.indic_desig AS terr_desig, 
                    CONCAT('Indicação: ',indc.nome_publica, ' / Cel: ', indc.num_contato, ' / OBS: ', indc.obs) AS terr_obs,
                    'IND' as desg_tipogrupo 
                FROM cad_designacoes desg
                INNER JOIN cad_indicacoes indc on desg.dsg_mapa_cod = (CONCAT('IND', CAST(indc.id AS CHAR(255))))
                WHERE 
                    1 = 1 
                    and desg.dsg_status IN ('1', '2', '3')  
                    and desg.dsg_tipo IN  ('0', '1')
			    	and trim(desg.pub_login) = %s
                ORDER BY desg.dsg_mapa_cod ASC 
		    ) 
            """, (desig_user,desig_user,))
        
        desig = cursor.fetchall()
        result = rows_to_dict(cursor, desig)
        conn.close()
        return result
    
    def get_desig_transf(self):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            (   SELECT 
                    desg.id AS desig_id,     
                    terr.id AS territor_id,    
                    0 AS indica_id, 
                    desg.data_inclu, desg.dsg_data, desg.pub_login, desg.pub_nome, 
                    desg.dsg_tipo, desg.dsg_detalhes, desg.dsg_conselh, desg.dsg_mapa_cod,
                    desg.dsg_mapa_url, desg.dsg_mapa_end, desg.dsg_status,desg.dsg_horaini, desg.dsg_obs, 
                    desg.pub_obs, terr.terr_respons, terr.dt_ultvisit,  
                    terr.terr_morador, terr.pub_ultvisi, terr.terr_enderec, 
                    terr.terr_regiao, terr.terr_link, terr.terr_coord, terr.terr_cor, 
                    terr.terr_status, terr.num_pessoas, terr.melhor_hora, terr.melhor_dia_hora, 
                    terr.terr_tp_local, terr.terr_classif, terr.terr_desig, terr.terr_obs,
                    'MAP' as desg_tipogrupo 
                FROM cad_designacoes desg
                LEFT JOIN cad_territorios terr ON desg.dsg_mapa_cod = terr.terr_nome
                WHERE 
                    1 = 1 
                    and desg.dsg_status IN ('0') 
                    and desg.dsg_tipo IN  ('0', '1')
                    and terr.terr_status IN  ('0')
                    and (isnull(desg.pub_login) or desg.pub_login = '')
                ORDER BY desg.dsg_mapa_cod ASC 
            ) 
            UNION 
            (   SELECT 
                    desg.id AS desig_id,     
                    0 AS territor_id, 
                    indc.id AS indica_id, 
                    desg.data_inclu, 
                    desg.dsg_data, 
                    desg.pub_login, 
                    desg.pub_nome, 
                    desg.dsg_tipo, 
                    desg.dsg_detalhes, 
                    desg.dsg_conselh, 
                    desg.dsg_mapa_cod,
                    desg.dsg_mapa_url, 
                    desg.dsg_mapa_end, 
                    desg.dsg_status, 
                    desg.dsg_horaini,
                    desg.dsg_obs, 
                    desg.pub_obs, 
                    desg.pub_login as terr_respons, 
                    indc.data_inclu as dt_ultvisit,  
                    '' AS terr_morador, 
                    indc.nome_publica AS pub_ultvisi, 
                    indc.enderec AS terr_enderec, 
                    indc.cod_regiao AS terr_regiao, 
                    indc.indic_url_map AS terr_link, 
                    '' AS terr_coord, 
                    '2' AS terr_cor, 
                    '0' AS terr_status, 
                    '1' AS num_pessoas, 
                    'Livre' AS melhor_hora, 
                    'Livre' AS melhor_dia_hora, 
                    indc.indic_tp_local AS terr_tp_local, 
                    '0' AS terr_classif, 
                    indc.indic_desig AS terr_desig, 
                    CONCAT('Indicação: ',indc.nome_publica, ' / Cel: ', indc.num_contato, ' / OBS: ', indc.obs) AS terr_obs,
                    'IND' desg_tipogrupo
                FROM cad_designacoes desg
                INNER JOIN cad_indicacoes indc on desg.dsg_mapa_cod = (CONCAT('IND', CAST(indc.id AS CHAR(255))))
                WHERE 
                    1 = 1 
                    and desg.dsg_status IN ('0') 
                    and desg.dsg_tipo IN  ('0', '1')
                    and (isnull(desg.pub_login) or desg.pub_login = '')
                ORDER BY desg.dsg_mapa_cod ASC 
            ) 
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
                desg.dsg_mapa_url, desg.dsg_mapa_end, desg.dsg_status,desg.dsg_horaini, desg.dsg_obs, 
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


    def get_desig_sugest2(self, desig_tpmapa, desg_tipogrupo_filter=None):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
          SELECT * 
        FROM (
            (SELECT 
                terr.id as id_padrao,
                desg.id AS desig_id,     
                terr.id AS territor_id,    
                0 AS indica_id, 
                desg.dsg_data,
                desg.dsg_detalhes,
                desg.dsg_mapa_cod,
                desg.dsg_horaini,
                terr.terr_nome, 
                terr.data_inclu, 
                terr.terr_respons, terr.dt_ultvisit,  
                terr.terr_morador, terr.pub_ultvisi, terr.terr_enderec, 
                terr.terr_regiao, terr.terr_link, terr.terr_coord, terr.terr_cor, 
                terr.terr_status, terr.num_pessoas, terr.melhor_hora, terr.melhor_dia_hora, 
                terr.terr_tp_local, terr.terr_classif, terr.terr_desig, terr.terr_obs,
                'MAP' AS desg_tipogrupo
            FROM cad_territorios terr
            LEFT JOIN cad_designacoes desg ON desg.dsg_mapa_cod = terr.terr_nome
            WHERE 
                1 =1
                AND terr.terr_status IN ('0')
                AND terr.terr_cor IN ('0')
                AND TRIM(terr.terr_tp_local) = %s
                AND (ISNULL(desg.id) OR desg.dsg_status IN ('4'))
                AND NOT (terr.terr_desig IN ('2'))
            ORDER BY terr.dt_ultvisit, terr.terr_nome DESC
            LIMIT 6
        ) UNION (
            SELECT
                terr.id as id_padrao,
                desg.id AS desig_id,     
                terr.id AS territor_id,    
                0 AS indica_id,     
                desg.dsg_data,
                desg.dsg_detalhes,
                desg.dsg_mapa_cod,
                desg.dsg_horaini,       
                terr.terr_nome, 
                terr.data_inclu, 
                terr.terr_respons, terr.dt_ultvisit,  
                terr.terr_morador, terr.pub_ultvisi, terr.terr_enderec, 
                terr.terr_regiao, terr.terr_link, terr.terr_coord, terr.terr_cor, 
                terr.terr_status, terr.num_pessoas, terr.melhor_hora, terr.melhor_dia_hora, 
                terr.terr_tp_local, terr.terr_classif, terr.terr_desig, terr.terr_obs, 
                'MAP' AS desg_tipogrupo
            FROM cad_territorios terr
            LEFT JOIN cad_designacoes desg ON desg.dsg_mapa_cod = terr.terr_nome
            WHERE 
                1 =1
                AND terr.terr_status IN ('0')
                AND terr.terr_cor IN ('1')
                AND TRIM(terr.terr_tp_local) = %s
                AND (ISNULL(desg.id) OR desg.dsg_status IN ('4'))
                AND NOT (terr.terr_desig IN ('2'))
            ORDER BY terr.dt_ultvisit, terr.terr_nome DESC
            LIMIT 6
        ) UNION (
            SELECT
                indc.id as id_padrao, 
                desg.id AS desig_id,     
                0 AS territor_id,    
                indc.id AS indica_id,   
                indc.data_inclu AS dsg_data,
                indc.obs AS dsg_detalhes,
                CONCAT('IND', CAST(indc.id AS CHAR(255))) AS dsg_mapa_cod,
                '' AS dsg_mapa_cod,
                CONCAT('IND', CAST(indc.id AS CHAR(255))) AS terr_nome, 
                indc.data_inclu AS data_inclu, 
                indc.nome_publica AS terr_respons, 
                indc.data_inclu AS dt_ultvisit,  
                '' AS terr_morador, 
                indc.nome_publica AS pub_ultvisi, 
                indc.enderec AS terr_enderec, 
                indc.cod_regiao AS terr_regiao, 
                indc.indic_url_map AS terr_link, 
                '' AS terr_coord, 
                '2' AS terr_cor, 
                '0' AS terr_status, 
                '1' AS num_pessoas, 
                'Livre' AS melhor_hora, 
                'Livre' AS melhor_dia_hora, 
                indc.indic_tp_local AS terr_tp_local, 
                '0' AS terr_classif, 
                indc.indic_desig AS terr_desig, 
                CONCAT('Indicação: ',indc.nome_publica, ' / Cel: ', indc.num_contato, ' / OBS: ', indc.obs) AS terr_obs,
                'IND' AS desg_tipogrupo
            FROM cad_indicacoes indc
            LEFT JOIN cad_designacoes desg on desg.dsg_mapa_cod = (CONCAT('IND', CAST(indc.id AS CHAR(255))))
            WHERE 
                1=1
                AND TRIM(indc.end_confirm) = '1'
                AND (ISNULL(desg.id) OR desg.dsg_status IN ('4'))
                AND NOT (indc.indic_desig IN ('2'))
            ORDER BY indc.data_inclu DESC
            LIMIT 15
        ) UNION (
            SELECT
                terr.id as id_padrao,
                desg.id AS desig_id,     
                terr.id AS territor_id,    
                0 AS indica_id,   
                desg.dsg_data,
                desg.dsg_detalhes,
                desg.dsg_mapa_cod,
                desg.dsg_horaini,
                terr.terr_nome, 
                terr.data_inclu, 
                terr.terr_respons, terr.dt_ultvisit,  
                terr.terr_morador, terr.pub_ultvisi, terr.terr_enderec, 
                terr.terr_regiao, terr.terr_link, terr.terr_coord, terr.terr_cor, 
                terr.terr_status, terr.num_pessoas, terr.melhor_hora, terr.melhor_dia_hora, 
                terr.terr_tp_local, terr.terr_classif, terr.terr_desig, terr.terr_obs, 
                'MAP' AS desg_tipogrupo
            FROM cad_territorios terr
            LEFT JOIN cad_designacoes desg ON desg.dsg_mapa_cod = terr.terr_nome
            WHERE
                1=1
                AND terr.terr_status IN ('0')
                AND terr.terr_cor IN ('2')
                AND TRIM(terr.terr_tp_local) = %s
                AND (ISNULL(desg.id) OR desg.dsg_status IN ('4'))
                AND NOT (terr.terr_desig IN ('2'))
            ORDER BY terr.dt_ultvisit, terr.terr_nome DESC
            LIMIT 3 )
        ) AS Query_Unidas
        WHERE desg_tipogrupo = %s
    """, ( desig_tpmapa, desig_tpmapa, desig_tpmapa, desg_tipogrupo_filter))
    
        
        desig = cursor.fetchall()
        result = rows_to_dict(cursor, desig)
        conn.close()
        return result
    
    def get_desig_sugest(self):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            (   SELECT 
                    desg.id AS desig_id,                        
                    terr.id AS territor_id,  
				    desg.dsg_data,
				    desg.dsg_detalhes,
				    desg.dsg_mapa_cod,
                    desg.dsg_horaini,
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
                    and (isnull(desg.id) or desg.dsg_status in ('4'))
                    and not (terr.terr_desig in ('2') )
                ORDER BY terr.dt_ultvisit,terr.terr_nome desc limit 6  )
		        UNION 
            (   SELECT 
                    desg.id AS desig_id,                       
                    terr.id AS territor_id,  
				    desg.dsg_data,
				    desg.dsg_detalhes,
				    desg.dsg_mapa_cod, 
                    desg.dsg_horaini,
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
                    and (isnull(desg.id) or desg.dsg_status in ('4'))
                    and not (terr.terr_desig in ('2') )
                ORDER BY terr.dt_ultvisit,terr.terr_nome desc limit 6)
                UNION 
            (   SELECT 
                    desg.id AS desig_id,                      
                    terr.id AS territor_id,   
				    desg.dsg_data,
				    desg.dsg_detalhes,
				    desg.dsg_mapa_cod, 
                    desg.dsg_horaini,
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
                    and (isnull(desg.id) or desg.dsg_status in ('4'))
                    and not (terr.terr_desig in ('2') )
                ORDER BY terr.dt_ultvisit,terr.terr_nome desc limit 3)
            """)
        
        desig = cursor.fetchall()
        result = rows_to_dict(cursor, desig)
        conn.close()
        return result
    
    def get_desig_user_outras(self, desig_user):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
         SELECT * FROM ( ( SELECT 
                desg.id AS desig_id,     
                camp.id AS camp_id,   
                desg.data_inclu,
                desg.dsg_data,
                desg.pub_login,
                desg.pub_nome, 
                desg.dsg_tipo,
                desg.dsg_detalhes,
                desg.dsg_conselh, 
                desg.dsg_mapa_cod,
                desg.dsg_horaini,
                desg.dsg_mapa_url,
                desg.dsg_mapa_end,
                desg.dsg_status,
                desg.dsg_obs, 
                desg.pub_obs,
                camp.cmp_tipo,  
                camp.cmp_diadasem,
                camp.cmp_seq,
                camp.cmp_local, 
                camp.cmp_enderec,
                camp.cmp_url,
                camp.cmp_tipoativ,
                camp.cmp_horaini,
                camp.cmp_horafim,
                camp.cmp_detalhes,
                /* Primeiro Publicador Auxiliar (OFFSET 0) */
                (
                    SELECT pub_nome 
                    FROM (
                        SELECT DISTINCT pub_nome
                        FROM cad_designacoes desg_aux
                        WHERE desg.dsg_mapa_cod = camp.cmp_diadasem and desg.dsg_horaini = camp.cmp_horaini 
                        AND desg_aux.dsg_tipo = desg.dsg_tipo
                        AND desg_aux.dsg_data = desg.dsg_data
                        AND desg_aux.pub_login <> desg.pub_login
                        ORDER BY pub_nome
                        LIMIT 1 OFFSET 0
                    ) t
                ) AS cmp_publicador02,
            
                /* Segundo Publicador Auxiliar (OFFSET 1) */
                (
                    SELECT pub_nome 
                    FROM (
                        SELECT DISTINCT pub_nome
                        FROM cad_designacoes desg_aux
                        WHERE desg.dsg_mapa_cod = camp.cmp_diadasem and desg.dsg_horaini = camp.cmp_horaini 
                        AND desg_aux.dsg_tipo = desg.dsg_tipo
                        AND desg_aux.dsg_data = desg.dsg_data
                        AND desg_aux.pub_login <> desg.pub_login
                        ORDER BY pub_nome
                        LIMIT 1 OFFSET 1
                    ) t
                ) AS cmp_publicador03,
            
                /* Terceiro Publicador Auxiliar (OFFSET 2) */
                (
                    SELECT pub_nome 
                    FROM (
                        SELECT DISTINCT pub_nome
                        FROM cad_designacoes desg_aux
                        WHERE desg.dsg_mapa_cod = camp.cmp_diadasem and desg.dsg_horaini = camp.cmp_horaini 
                        AND desg_aux.dsg_tipo = desg.dsg_tipo
                        AND desg_aux.dsg_data = desg.dsg_data
                        AND desg_aux.pub_login <> desg.pub_login
                        ORDER BY pub_nome
                        LIMIT 1 OFFSET 2
                    ) t
                ) AS cmp_publicador04
            
            FROM cad_designacoes desg
            LEFT JOIN cad_configcampo camp
                ON desg.dsg_mapa_cod = camp.cmp_diadasem and desg.dsg_horaini = camp.cmp_horaini 
                AND desg.dsg_tipo = camp.cmp_tipo
            WHERE 
                desg.dsg_status IN ('1', '2', '3') 
                AND desg.dsg_tipo IN ('2', '3') 
                and trim(desg.pub_login) = %s
                ) 
			UNION 
	        ( SELECT 
                desg.id AS desig_id,     
                camp.id AS camp_id,   
                desg.data_inclu,
                desg.dsg_data,
                desg.pub_login,
                desg.pub_nome, 
                desg.dsg_tipo,
                desg.dsg_detalhes,
                desg.dsg_conselh, 
                desg.dsg_mapa_cod,
                desg.dsg_horaini,
                desg.dsg_mapa_url,
                desg.dsg_mapa_end,
                desg.dsg_status,
                desg.dsg_obs, 
                desg.pub_obs,
                camp.cmp_tipo,  
                camp.cmp_diadasem,
                camp.cmp_seq,
                camp.cmp_local, 
                camp.cmp_enderec,
                camp.cmp_url,
                camp.cmp_tipoativ,
                camp.cmp_horaini,
                camp.cmp_horafim,
                camp.cmp_detalhes,
                /* Primeiro Publicador Auxiliar (OFFSET 0) */
                '' AS cmp_publicador02,
            
                /* Segundo Publicador Auxiliar (OFFSET 1) */
                '' AS cmp_publicador03,
            
                /* Terceiro Publicador Auxiliar (OFFSET 2) */
                '' AS cmp_publicador04
            
            FROM cad_designacoes desg
            LEFT JOIN cad_configcampo camp
                ON desg.dsg_mapa_cod = camp.cmp_diadasem  
                AND camp.cmp_tipo = '4'
            WHERE 
                desg.dsg_status IN ('1', '2', '3') 
                AND desg.dsg_tipo IN ('4','5','6','7','8','9') 
                    and trim(desg.pub_login) = %s
		    ) ) as Designacoes_Outras 
                ORDER BY dsg_data ASC 
	            """, (desig_user,desig_user,))
        
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
    
    def get_all_cfgreuniao(self):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM cad_configcampo where 1 = 1 and cmp_tipo in ('4') order by cmp_seq ASC")
        cfgreuniao = cursor.fetchall()
        result = rows_to_dict(cursor, cfgreuniao)
        conn.close()
        return result

    def delete_cfgcampo(self, cfgcampo_id):
        conn = get_db_connection()
        cursor = conn.cursor()

        # Verifica se o registro existe antes de tentar deletar
        cursor.execute('SELECT * FROM cad_configcampo WHERE id = %s', (cfgcampo_id,))
        cfgcampo = cursor.fetchone()

        if not cfgcampo:
            conn.close()
            raise ValueError("Registro não encontrada")  # Lança erro se não encontrar

        # Se o registro existe, faz a exclusão
        cursor.execute('DELETE FROM cad_configcampo WHERE id = %s', (cfgcampo_id,))
        conn.commit()
        conn.close()
        return cfgcampo_id
    
##
## Serviços para registro de publicações 
class RgPublicacService:
    def add_rgpublic(self,rgpublic):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('INSERT INTO mov_rgpublicacoes(data_inclu,rgp_data,rgp_pub,rgp_diadasem,rgp_local,rgp_url,rgp_tipoativ,rgp_publicac,rgp_qtd,rgp_detalhes) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)',
            (rgpublic.data_inclu,rgpublic.rgp_data,rgpublic.rgp_pub,rgpublic.rgp_diadasem,rgpublic.rgp_local,rgpublic.rgp_url,rgpublic.rgp_tipoativ,rgpublic.rgp_publicac,rgpublic.rgp_qtd,rgpublic.rgp_detalhes ))
        conn.commit()
        rgpublic_id = cursor.lastrowid
        conn.close()
        return rgpublic_id
		
    def update_rgpublic(self, rgpublic_id, rgpublic):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('UPDATE mov_rgpublicacoes SET rgp_data = %s, rgp_pub = %s, rgp_diadasem = %s, rgp_local = %s,rgp_url = %s,rgp_tipoativ = %s,rgp_publicac = %s,rgp_qtd = %s,rgp_detalhes = %s WHERE id = %s',
			(rgpublic.rgp_data,rgpublic.rgp_pub,rgpublic.rgp_diadasem,rgpublic.rgp_local,rgpublic.rgp_url,rgpublic.rgp_tipoativ,rgpublic.rgp_publicac,rgpublic.rgp_qtd,rgpublic.rgp_detalhes ))
        conn.commit()
        conn.close()
        return rgpublic_id
    
    def get_all_rgpublic(self):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM mov_rgpublicacoes where 1 = 1 ORDER BY rgp_data DESC")
        rgpublic = cursor.fetchall()
        result = rows_to_dict(cursor, rgpublic)
        conn.close()
        return result
    
    def delete_rgpublic(self, rgpublic_id):
        conn = get_db_connection()
        cursor = conn.cursor()

        # Verifica se o registro existe antes de tentar deletar
        cursor.execute('SELECT * FROM mov_rgpublicacoes WHERE id = %s', (rgpublic_id,))
        rgpublic = cursor.fetchone()

        if not rgpublic:
            conn.close()
            raise ValueError("Registro não encontrado")  # Lança erro se não encontrar

        # Se o registro existe, faz a exclusão
        cursor.execute('DELETE FROM mov_rgpublicacoes WHERE id = %s', (rgpublic_id,))
        conn.commit()
        conn.close()
        return rgpublic_id
    
##
## Serviços para registro de Notificações 
class NotificaService:
    def add_notif(self,notif):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('INSERT INTO cad_notificacoes(data_inclu,noti_dtini,noti_dtexp,noti_tipo,noti_servic,noti_campo,noti_mensag,noti_detalhes) VALUES (%s,%s,%s,%s,%s,%s,%s,%s)',
            (notif.data_inclu,notif.noti_dtini,notif.noti_dtexp,notif.noti_tipo,notif.noti_servic,notif.noti_campo,notif.noti_mensag,notif.noti_detalhes))
        conn.commit()
        notif_id = cursor.lastrowid
        conn.close()
        return notif_id
		
    def update_notif(self, notif_id, notif):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('UPDATE cad_notificacoes SET noti_dtini = %s, noti_dtexp = %s, noti_tipo = %s,noti_servic = %s,noti_campo = %s,noti_mensag = %s,noti_detalhes = %s WHERE id = %s',
	        (notif.noti_dtini,notif.noti_dtexp,notif.noti_tipo,notif.noti_servic,notif.noti_campo,notif.noti_mensag,notif.noti_detalhes))
        conn.commit()
        conn.close()
        return notif_id
    
    def get_all_notif(self):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM cad_notificacoes where 1 = 1 order by noti_dtini DESC")
        notif = cursor.fetchall()
        result = rows_to_dict(cursor, notif)
        conn.close()
        return result
    
    def delete_notif(self, notif_id):
        conn = get_db_connection()
        cursor = conn.cursor()

        # Verifica se o registro existe antes de tentar deletar
        cursor.execute('SELECT * FROM cad_notificacoes WHERE id = %s', (notif_id,))
        notif = cursor.fetchone()

        if not notif:
            conn.close()
            raise ValueError("Registro não encontrado")  # Lança erro se não encontrar

        # Se o registro existe, faz a exclusão
        cursor.execute('DELETE FROM cad_notificacoes WHERE id = %s', (notif_id,))
        conn.commit()
        conn.close()
        return notif_id

##
## Serviços para registro de Notificações 
class UanotacService:
    def add_uanotac(self,uanotac):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('INSERT INTO cad_user_anotacoes(data_inclu,uanot_pub,uanot_titul,uanot_legend,uanot_cor,uanot_mensag) VALUES (%s,%s,%s,%s,%s,%s)',
            (uanotac.data_inclu,uanotac.uanot_pub,uanotac.uanot_titul,uanotac.uanot_legend,uanotac.uanot_cor,uanotac.uanot_mensag))
        conn.commit()
        uanotac_id = cursor.lastrowid
        conn.close()
        return uanotac_id
    

    def update_uanotac(self, uanotac_id, uanotac):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('UPDATE cad_user_anotacoes SET uanot_pub = %s, uanot_titul = %s, uanot_legend = %s,uanot_cor = %s,uanot_mensag = %s WHERE id = %s',
	        (uanotac.uanot_pub,uanotac.uanot_titul,uanotac.uanot_legend,uanotac.uanot_cor,uanotac.uanot_mensag, uanotac_id ))
        conn.commit()
        conn.close()
        return uanotac_id
    
    def get_all_uanotac(self):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM cad_user_anotacoes where 1 = 1 order by uanot_pub, data_inclu DESC")
        uanotac = cursor.fetchall()
        result = rows_to_dict(cursor, uanotac)
        conn.close()
        return result
    
    def get_anotac_user(self, uanotac_user):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT 
	            id as uanot_id,
	            data_inclu,	
	            uanot_pub,	
	            uanot_titul, 
	            uanot_legend,
	            uanot_cor,  		
	            uanot_mensag
            FROM cad_user_anotacoes as tanot
            WHERE 1 = 1 
	            and trim(tanot.uanot_pub) = %s
            ORDER BY tanot.data_inclu DESC
            """, (uanotac_user,))
        
        uanotac = cursor.fetchall()
        result = rows_to_dict(cursor, uanotac)
        conn.close()
        return result

    
    def delete_uanotac(self, uanotac_id):
        conn = get_db_connection()
        cursor = conn.cursor()

        # Verifica se o registro existe antes de tentar deletar
        cursor.execute('SELECT * FROM cad_user_anotacoes WHERE id = %s', (uanotac_id,))
        uanotac = cursor.fetchone()

        if not uanotac:
            conn.close()
            raise ValueError("Registro não encontrado")  # Lança erro se não encontrar

        # Se o registro existe, faz a exclusão
        cursor.execute('DELETE FROM cad_user_anotacoes WHERE id = %s', (uanotac_id,))
        conn.commit()
        conn.close()
        return uanotac_id

    
##
## Serviços para registro de Horas 
class HorasCampService:
    def add_hrsprg(self,hrsprg):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('INSERT INTO mov_horas_pregacao(data_inclu,mhrsp_data,mhrsp_pub,mhrsp_anosrv,mhrsp_anocal,mhrsp_mes,mhrsp_ativ,mhrsp_hrs,mhrsp_min,mhrsp_ensino,mhrsp_mensag ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)',
            (hrsprg.data_inclu,hrsprg.mhrsp_data,hrsprg.mhrsp_pub,hrsprg.mhrsp_anosrv,hrsprg.mhrsp_anocal,hrsprg.mhrsp_mes,hrsprg.mhrsp_ativ,hrsprg.mhrsp_hrs,hrsprg.mhrsp_min,hrsprg.mhrsp_ensino,hrsprg.mhrsp_mensag ))
        conn.commit()
        hrsprg_id = cursor.lastrowid
        conn.close()
        return hrsprg_id
    
    def update_hrsprg(self, hrsprg_id, hrsprg):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('UPDATE mov_horas_pregacao SET mhrsp_data = %s, mhrsp_pub = %s, mhrsp_anosrv = %s, mhrsp_anocal = %s, mhrsp_mes = %s, mhrsp_ativ = %s, mhrsp_hrs = %s, mhrsp_min = %s, mhrsp_ensino = %s, mhrsp_mensag = %s WHERE id = %s',
	        (hrsprg.mhrsp_data,hrsprg.mhrsp_pub,hrsprg.mhrsp_anosrv,hrsprg.mhrsp_anocal,hrsprg.mhrsp_mes,hrsprg.mhrsp_ativ,hrsprg.mhrsp_hrs,hrsprg.mhrsp_min,hrsprg.mhrsp_ensino,hrsprg.mhrsp_mensag, hrsprg_id, ))
        conn.commit()
        conn.close()
        return hrsprg_id
    
    def get_all_hrsprg(self):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT 
	            id as mhrsp_id,
	            data_inclu,	
				mhrsp_data,	
	            mhrsp_pub,	
	            mhrsp_anosrv, 
	            mhrsp_anocal,
	            mhrsp_mes,  	
				mhrsp_ativ,  	
				mhrsp_hrs,  	
				mhrsp_min,
				mhrsp_ensino,	  
	            mhrsp_mensag
            FROM mov_horas_pregacao as thrspreg
            WHERE 1 = 1 
            ORDER BY mhrsp_pub, mhrsp_data DESC
            """ )
        hrsprg = cursor.fetchall()
        result = rows_to_dict(cursor, hrsprg)
        conn.close()
        return result
    
    def get_hrsprg_user(self, hrsprg_user):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT 
	            id as mhrsp_id,
	            data_inclu,	
				mhrsp_data,	
	            mhrsp_pub,	
	            mhrsp_anosrv, 
	            mhrsp_anocal,
	            mhrsp_mes,  	
				mhrsp_ativ,  	
				mhrsp_hrs,  	
				mhrsp_min,
				mhrsp_ensino,	  
	            mhrsp_mensag
            FROM mov_horas_pregacao as thrspreg
            WHERE 1 = 1 
	            and trim(thrspreg.mhrsp_pub) = %s
            ORDER BY mhrsp_data DESC
            """, (hrsprg_user,))
        hrsprg = cursor.fetchall()
        result = rows_to_dict(cursor, hrsprg)
        conn.close()
        return result
    
    def delete_hrsprg(self, hrsprg_id):
        conn = get_db_connection()
        cursor = conn.cursor()

        # Verifica se o registro existe antes de tentar deletar
        cursor.execute('SELECT * FROM mov_horas_pregacao WHERE id = %s', (hrsprg_id,))
        hrsprg = cursor.fetchone()

        if not hrsprg:
            conn.close()
            raise ValueError("Registro não encontrado")  # Lança erro se não encontrar

        # Se o registro existe, faz a exclusão
        cursor.execute('DELETE FROM mov_horas_pregacao WHERE id = %s', (hrsprg_id,))
        conn.commit()
        conn.close()
        return hrsprg_id


##### ##### ##### ##### ######
###### FIM DOS SERVICES ###### 