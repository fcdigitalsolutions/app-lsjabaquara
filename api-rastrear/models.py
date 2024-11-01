# models.py

class Region:
    def __init__(self, nome, descricao=None):
        self.nome = nome
        self.descricao = descricao
        
class Indicacoes:
    def __init__(self, data_inclu, nome_publica,num_contato, cod_congreg, cod_regiao, enderec, end_confirm, origem,indic_url_map,indic_tp_local,indic_desig, obs=None ):
        self.data_inclu = data_inclu
        self.nome_publica = nome_publica
        self.num_contato = num_contato
        self.cod_congreg = cod_congreg
        self.cod_regiao = cod_regiao
        self.enderec = enderec
        self.end_confirm = end_confirm       
        self.origem = origem
        self.indic_url_map = indic_url_map
        self.indic_tp_local = indic_tp_local
        self.indic_desig = indic_desig
        self.obs = obs

class RegistroNC:
    def __init__(self, data_inclu, cod_regiao, enderec, num_visitas, dt_ult_visit, obs=None ):
        self.data_inclu = data_inclu
        self.cod_regiao = cod_regiao
        self.enderec = enderec
        self.num_visitas = num_visitas       
        self.dt_ult_visit = dt_ult_visit
        self.obs = obs

class Rastreamento:
    def __init__(self, cod_congreg, data_inclu, data_inicio, data_fim, num_enderec, num_endconcl, cod_status=None ):
        self.cod_congreg = cod_congreg
        self.data_inclu = data_inclu
        self.data_inicio = data_inicio
        self.data_fim = data_fim
        self.num_enderec = num_enderec
        self.num_endconcl = num_endconcl       
        self.cod_status = cod_status

class Congregation:
    def __init__(self, nome, regiao, endereco, cca_nome, cca_contato, ss_nome, ss_contato, srv_terr_nome, srv_terr_contat ):
        self.nome = nome
        self.regiao = regiao
        self.endereco = endereco
        self.cca_nome = cca_nome
        self.cca_contato = cca_contato
        self.ss_nome = ss_nome
        self.ss_contato = ss_contato
        self.srv_terr_nome = srv_terr_nome
        self.srv_terr_contat = srv_terr_contat

class AuthLogin:
    def __init__(self, user_login, user_name, user_pswd, user_gestor, user_id_publica, user_receb_msg ):
        self.user_login = user_login
        self.user_name = user_name
        self.user_pswd = user_pswd
        self.user_gestor = user_gestor
        self.user_id_publica = user_id_publica
        self.user_receb_msg = user_receb_msg
             
class Publicadores: 
    def __init__(self, data_inclu, pub_nome,pub_contat, pub_login, pub_email, pub_endereco, pub_regiao, pub_uf, pub_dtbatism, pub_dtnasc, desig_servic, desig_campo, pub_status,pub_id_publica, resp_obs ):
        self.data_inclu	  = data_inclu
        self.pub_nome     = pub_nome
        self.pub_contat    = pub_contat
        self.pub_login    = pub_login
        self.pub_email    = pub_email
        self.pub_endereco = pub_endereco
        self.pub_regiao   = pub_regiao
        self.pub_uf       = pub_uf
        self.pub_dtbatism = pub_dtbatism
        self.pub_dtnasc	  = pub_dtnasc
        self.desig_servic = desig_servic
        self.desig_campo  = desig_campo
        self.pub_status   = pub_status
        self.pub_id_publica   = pub_id_publica       
        self.resp_obs	  = resp_obs			   
    
class Designacoes: 
    def __init__(self, data_inclu, dsg_data, pub_nome, dsg_tipo, dsg_detalhes, dsg_conselh, dsg_mapa_cod, dsg_mapa_end, dsg_status, dsg_obs, pub_obs ):
        self.data_inclu	  = data_inclu
        self.dsg_data     = dsg_data
        self.pub_nome     = pub_nome
        self.dsg_tipo     = dsg_tipo
        self.dsg_detalhes = dsg_detalhes
        self.dsg_conselh  = dsg_conselh
        self.dsg_mapa_cod = dsg_mapa_cod
        self.dsg_mapa_end = dsg_mapa_end
        self.dsg_status	  = dsg_status
        self.dsg_obs      = dsg_obs
        self.pub_obs      = pub_obs
       	
class Territorios:
    def __init__(self,data_inclu,dt_ultvisit,pub_ultvisi,dt_visit02,pub_tvis02,dt_visit03,pub_tvis03,dt_visit04,pub_tvis04,
                 terr_nome,terr_morador,terr_enderec,terr_regiao,terr_link,terr_coord,terr_cor,terr_status,num_pessoas,
                 melhor_dia_hora,terr_tp_local,terr_classif,terr_desig,melhor_hora,terr_obs ):
        self.data_inclu	 = data_inclu	  
        self.dt_ultvisit  = dt_ultvisit   
        self.pub_ultvisi  = pub_ultvisi   
        self.dt_visit02   = dt_visit02    
        self.pub_tvis02   = pub_tvis02    
        self.dt_visit03   = dt_visit03    
        self.pub_tvis03   = pub_tvis03    
        self.dt_visit04   = dt_visit04    
        self.pub_tvis04   = pub_tvis04
        self.terr_nome    = terr_nome     	
        self.terr_morador = terr_morador   
        self.terr_enderec = terr_enderec   
        self.terr_regiao  = terr_regiao    
        self.terr_link    = terr_link    
        self.terr_coord   = terr_coord    
        self.terr_cor     = terr_cor    
        self.terr_status  = terr_status   
        self.num_pessoas  = num_pessoas 
        self.melhor_dia_hora  = melhor_dia_hora     
        self.terr_tp_local = terr_tp_local  
        self.terr_classif  = terr_classif  
        self.terr_desig    = terr_desig  
        self.melhor_hora   = melhor_hora   
        self.terr_obs      = terr_obs         
