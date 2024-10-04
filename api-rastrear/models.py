# models.py

class Region:
    def __init__(self, nome, descricao=None):
        self.nome = nome
        self.descricao = descricao
        
class Indicacoes:
    def __init__(self, data_inclu, nome_publica,num_contato, cod_congreg, cod_regiao, enderec, end_confirm, origem, obs=None ):
        self.data_inclu = data_inclu
        self.nome_publica = nome_publica
        self.num_contato = num_contato
        self.cod_congreg = cod_congreg
        self.cod_regiao = cod_regiao
        self.enderec = enderec
        self.end_confirm = end_confirm       
        self.origem = origem
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
    def __init__(self, user_login, user_name, user_pswd ):
        self.user_login = user_login
        self.user_name = user_name
        self.user_pswd = user_pswd
     
