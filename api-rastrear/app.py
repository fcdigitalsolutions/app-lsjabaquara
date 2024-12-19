from flask import Flask, request, jsonify
from flask_cors import CORS
from models import (
    Region,
    Congregation,
    Indicacoes,
    Rastreamento,
    AuthLogin,
    RegistroNC,
    Publicadores,
    Designacoes,
    Territorios,
    RelVisita,
    ConfigCampo,    
    RegPublicacoes, 
    CadNotificacoes,
    )
from services import (
    RegionService,
    CongregacaoService,
    IndicaService,
    RastrearService,
    AuthService,
    RegistroNCService,
    PublicaService,
    DesignService,
    TerritService,
    VisitaService,
    CfgCampoService,
    RgPublicacService,
    NotificaService, 
    )
from database import init_db
from datetime import datetime,timedelta
import config_env

app = Flask(__name__)
CORS(app)  # Permite CORS para todos os domínios e endpoints
region_service = RegionService()
congregation_service = CongregacaoService()
indica_service = IndicaService()
registnc_service = RegistroNCService()
rastrear_service = RastrearService()
auth_service = AuthService()
pubc_service = PublicaService()
desig_service = DesignService()
territ_service = TerritService()
rvisita_service = VisitaService()
cfgcampo_service = CfgCampoService()
rgpublic_service = RgPublicacService()

notif_service = NotificaService()


# Inicializa o banco de dados
init_db()

def format_date(date_obj):
    """Format datetime object to dd/MM/yyyy."""
    if isinstance(date_obj, datetime):
        return date_obj.strftime('%d/%m/%Y')
    return date_obj

from datetime import datetime

def parse_date(date_str):
    if date_str is None or date_str == '':
        return None  # Ou use uma data padrão, se necessário
    try:
        return datetime.strptime(date_str, '%d/%m/%Y').strftime('%Y-%m-%d')
    except ValueError:
        # Caso a data não esteja no formato esperado, retorna None ou lança um erro apropriado
        return None


def excel_serial_to_date(serial):
    """Converte número serial de data do Excel para string no formato 'YYYY-MM-DD'."""
    excel_start_date = datetime(1899, 12, 30)  # Excel considera 1º de janeiro de 1900 como dia 1
    converted_date = excel_start_date + timedelta(days=serial)
    return converted_date.strftime('%Y-%m-%d')


@app.route('/authxall', methods=['GET'])
def get_authxall():
    authlogin = auth_service.get_all_logins()
    return jsonify([{
        **dict(authlogin),
         'user_dt_inclu': format_date(authlogin.get('user_dt_inclu'))
    } for authlogin in authlogin])

@app.route('/auth/login', methods=['POST'])
def authenticate_user():
    data = request.json
    user_login = data.get('user_login')
    user_pswd = data.get('user_pswd')

    if not user_login or not user_pswd:
        return jsonify({"message": "Login e senha são obrigatórios!"}), 400

    user = auth_service.get_auth_login(user_login, user_pswd)
    
    if user:
    #    return jsonify({"message": "Autenticação bem-sucedida!"}), 200
    
        return jsonify({
            'message': "Autenticação bem-sucedida!", 
            'iduser': user.get('user_login'),
            'nome': user.get('user_name'),
		    'idpublicador': user.get('user_id_publica'),
		    'receb_msg': user.get('user_receb_msg'),
		    'gestor': user.get('user_gestor'),
		    'gestor_terr': user.get('user_gestor_terr'),
		    'gestor_rmwb': user.get('user_gestor_rmwb'),
		    'gestor_rfds': user.get('user_gestor_rfds'),
		    'gestor_mecan': user.get('user_gestor_mecan'),
		    'dtinclusao': format_date(user.get('user_dt_inclu'))
		    }), 200
    else:
        return jsonify({"message": "Credenciais inválidas!"}), 401

@app.route('/authxadd1', methods=['POST'])
def add_auth_login():
    data = request.json
    authlogin = AuthLogin(user_login=data['user_login'],
                        user_name=data.get('user_name'),
                        user_pswd=data.get('user_pswd'),
                        user_gestor=data.get('user_gestor'),
                        user_gestor_terr=data.get('user_gestor_terr'),
                        user_gestor_rmwb=data.get('user_gestor_rmwb'),
                        user_gestor_rfds=data.get('user_gestor_rfds'),
                        user_gestor_mecan=data.get('user_gestor_mecan'),
                        user_id_publica=data.get('user_id_publica'),
                        user_receb_msg=data.get('user_receb_msg'),
                        user_dt_inclu=parse_date(data.get('user_dt_inclu'))
                        )
    
    authlogin_id = auth_service.add_auth_login(authlogin)
    return jsonify({"id": authlogin_id, "message": "Usuário add com sucesso!"}), 201


@app.route('/authxadd1/<int:authlogin_id>', methods=['PUT'])
def update_authlogin(authlogin_id):
    data = request.json
    authlogin = AuthLogin(user_login=data['user_login'],
                        user_pswd=data.get('user_pswd'),
                        user_name=data.get('user_name'),
                        user_gestor=data.get('user_gestor'),
                        user_gestor_terr=data.get('user_gestor_terr'),
                        user_gestor_rmwb=data.get('user_gestor_rmwb'),
                        user_gestor_rfds=data.get('user_gestor_rfds'),
                        user_gestor_mecan=data.get('user_gestor_mecan'),
                        user_id_publica=data.get('user_id_publica'),
                        user_receb_msg=data.get('user_receb_msg'),
                        user_dt_inclu=parse_date(data.get('user_dt_inclu'))
                        )
    updated_authlogin_id = auth_service.update_authlogin(authlogin_id, authlogin)
    return jsonify({"message": "Usuário atualizado com sucesso!", "id": updated_authlogin_id}), 200


# Rota DELETE para excluir um Usuário existente
@app.route('/authxadd1/<int:authlogin_id>', methods=['DELETE'])
def delete_authlogin(authlogin_id):
    try:
        auth_service.delete_authlogin(authlogin_id)  # Chama o serviço para deletar a Usuário
        return jsonify({"message": "Usuário excluído com sucesso!"}), 200
    except ValueError:
        return jsonify({"message": "Usuário não encontrado!"}), 404
    except Exception as e:
        return jsonify({"message": "Erro ao excluir o Usuário", "error": str(e)}), 500

## 
@app.route('/regionsall', methods=['GET'])
def get_regionsall():
    regions = region_service.get_all_regions()
    return jsonify([{
        **dict(region),
        'data_inclu': format_date(region.get('data_inclu')),
        'data_inicio': format_date(region.get('data_inicio')),
        'data_fim': format_date(region.get('data_fim'))
    } for region in regions])

@app.route('/regions', methods=['POST'])
def add_region():
    data = request.json
    region = Region(nome=data['nome'], descricao=data.get('descricao'))
    region_id = region_service.add_region(region)
    return jsonify({"message": "Região add com sucesso!", "id": region_id}), 201

@app.route('/regions/<int:region_id>', methods=['PUT'])
def update_region(region_id):
    data = request.json
    region = Region(nome=data.get('nome'), descricao=data.get('descricao'))
    updated_region_id = region_service.update_region(region_id, region)
    return jsonify({"message": "Região atualizada com sucesso!", "id": updated_region_id}), 200

## Rotas da API para o cadastro de indicações 
@app.route('/indicaall', methods=['GET'])
def get_indicaall():
    indica = indica_service.get_all_indica()
    return jsonify([{
        **dict(indica),
        'data_inclu': format_date(indica.get('data_inclu'))
    } for indica in indica])

@app.route('/indica', methods=['POST'])
def add_indica():
    data = request.json
    indica = Indicacoes(data_inclu=parse_date(data.get('data_inclu')),
                        nome_publica=data.get('nome_publica'),
                        num_contato=data.get('num_contato'),
                        cod_congreg=data.get('cod_congreg'),
                        cod_regiao=data.get('cod_regiao'),
                        enderec=data.get('enderec'),
                        end_confirm=data.get('end_confirm'),
                        origem=data.get('origem'),
                        indic_url_map=data.get('indic_url_map'),
                        indic_tp_local=data.get('indic_tp_local'),
                        indic_desig=data.get('indic_desig'),
                        obs=data.get('obs'))
    indica_id = indica_service.add_indica(indica)
    return jsonify({"id": indica_id, "message": "Indicação add com sucesso!"}), 201

@app.route('/indica/<int:indica_id>', methods=['PUT'])
def update_indica(indica_id):
    data = request.json
    indica = Indicacoes(data_inclu=parse_date(data.get('data_inclu')),
                        nome_publica=data.get('nome_publica'),
                        num_contato=data.get('num_contato'),
                        cod_congreg=data.get('cod_congreg'),
                        cod_regiao=data.get('cod_regiao'),
                        enderec=data.get('enderec'),
                        end_confirm=data.get('end_confirm'),
                        origem=data.get('origem'),
                        indic_url_map=data.get('indic_url_map'),
                        indic_tp_local=data.get('indic_tp_local'),
                        indic_desig=data.get('indic_desig'),
                        obs=data.get('obs'))
    updated_indica_id = indica_service.update_indica(indica_id, indica)
    return jsonify({"message": "Indicação atualizada com sucesso!", "id": updated_indica_id}), 200

# Rota DELETE para excluir uma indicação existente
@app.route('/indica/<int:indica_id>', methods=['DELETE'])
def delete_indica(indica_id):
    try:
        indica_service.delete_indica(indica_id)  # Chama o serviço para deletar a indicação
        return jsonify({"message": "Indicação excluída com sucesso!"}), 200
    except ValueError:
        return jsonify({"message": "Indicação não encontrada!"}), 404
    except Exception as e:
        return jsonify({"message": "Erro ao excluir a indicação", "error": str(e)}), 500

## 
## Rotas da API para o Registros NC  
@app.route('/registncall', methods=['GET'])
def get_registncall():
    registnc = registnc_service.get_all_registnc()
    return jsonify([{
        **dict(registnc),
        'data_inclu': format_date(registnc.get('data_inclu')),
        'dt_ult_visit': format_date(registnc.get('dt_ult_visit'))
    } for registnc in registnc])

@app.route('/registnc', methods=['POST'])
def add_registnc():
    data = request.json
    registnc = RegistroNC(data_inclu=parse_date(data.get('data_inclu')),
                        cod_regiao=data.get('cod_regiao'),
                        enderec=data.get('enderec'),
                        num_visitas=data.get('num_visitas'),
                        dt_ult_visit=parse_date(data.get('dt_ult_visit')),
                        obs=data.get('obs'))
    registnc_id = registnc_service.add_registnc(registnc)
    return jsonify({"id": registnc_id, "message": "Registro NC add com sucesso!"}), 201

@app.route('/registnc/<int:registnc_id>', methods=['PUT'])
def update_registnc(registnc_id):
    data = request.json
    registnc = RegistroNC(data_inclu=parse_date(data.get('data_inclu')),
                        cod_regiao=data.get('cod_regiao'),
                        enderec=data.get('enderec'),
                        obs=data.get('obs'),                      
                        dt_ult_visit=parse_date(data.get('dt_ult_visit')),
                        num_visitas=data.get('num_visitas'))
    updated_registnc_id = registnc_service.update_registnc(registnc_id, registnc)
    return jsonify({"message": "Registro NC atualizado com sucesso!", "id": updated_registnc_id}), 200

# Rota DELETE para excluir um Registro NC
@app.route('/registnc/<int:registnc_id>', methods=['DELETE'])
def delete_registnc(registnc_id):
    try:
        registnc_service.delete_registnc(registnc_id)  # Chama o serviço para deletar Registro NC
        return jsonify({"message": "Registro NC excluída com sucesso!"}), 200
    except ValueError:
        return jsonify({"message": "Registro NC não encontrada!"}), 404
    except Exception as e:
        return jsonify({"message": "Erro ao excluir o Registro NC", "error": str(e)}), 500

## 
## Rotas da API para cadastro de Rastreamentos  
@app.route('/rastrearall', methods=['GET'])
def get_rastrear():
    rastrear = rastrear_service.get_all_rastrear()
    return jsonify([{
        **dict(rastrear),
        'data_inclu': format_date(rastrear.get('data_inclu')),
        'data_inicio': format_date(rastrear.get('data_inicio')),
        'data_fim': format_date(rastrear.get('data_fim'))
    } for rastrear in rastrear])

@app.route('/rastrear', methods=['POST'])
def add_rastrear():
    data = request.json
    rastrear = Rastreamento(cod_congreg=data['cod_congreg'],
                            data_inclu=parse_date(data.get('data_inclu')),
                            data_inicio=parse_date(data.get('data_inicio')),
                            data_fim=parse_date(data.get('data_fim')),
                            num_enderec=data.get('num_enderec'),
                            num_endconcl=data.get('num_endconcl'),
                            cod_status=data.get('cod_status'))
    rastrear_id = rastrear_service.add_rastrear(rastrear)
    return jsonify({"id": rastrear_id, "message": "Rastreamento add com sucesso!"}), 201

@app.route('/rastrear/<int:rastrear_id>', methods=['PUT'])
def update_rastrear(rastrear_id):
    data = request.json
    rastrear = Rastreamento(cod_congreg=data.get('cod_congreg'),
                            data_inicio=parse_date(data.get('data_inicio')),
                            data_fim=parse_date(data.get('data_fim')),
                            cod_status=data.get('cod_status'))
    updated_rastrear_id = rastrear_service.update_rastrear(rastrear_id, rastrear)
    return jsonify({"message": "Rastreamento atualizado com sucesso!", "id": updated_rastrear_id}), 200

# Rota DELETE para excluir Rastreamentos
@app.route('/rastrear/<int:rastrear_id>', methods=['DELETE'])
def delete_rastrear(rastrear_id):
    try:
        rastrear_service.delete_rastrear(rastrear_id)  # Chama o serviço para deletar Rastreamentos
        return jsonify({"message": "Rastreamentos excluído com sucesso!"}), 200
    except ValueError:
        return jsonify({"message": "Rastreamentos não encontrado!"}), 404
    except Exception as e:
        return jsonify({"message": "Erro ao excluir o Rastreamentos", "error": str(e)}), 500


@app.route('/congregs/<int:congregation_id>', methods=['PUT'])
def update_congregation(congregation_id):
    data = request.json
    congregation = Congregation(nome=data['nome'], regiao=data.get('regiao'), endereco=data.get('endereco'),
                                cca_nome=data.get('cca_nome'), cca_contato=data.get('cca_contato'),
                                ss_nome=data.get('ss_nome'), ss_contato=data.get('ss_contato'),
                                srv_terr_nome=data.get('srv_terr_nome'), srv_terr_contat=data.get('srv_terr_contat'))
    update_congregation_id = congregation_service.update_congregation(congregation_id, congregation)
    return jsonify({"message": "Congregação add com sucesso!", "id": update_congregation_id}), 200

@app.route('/congregs', methods=['POST'])
def add_congregation():
    data = request.json
    congregation = Congregation(nome=data['nome'], regiao=data.get('regiao'), endereco=data.get('endereco'),
                                cca_nome=data.get('cca_nome'), cca_contato=data.get('cca_contato'),
                                ss_nome=data.get('ss_nome'), ss_contato=data.get('ss_contato'),
                                srv_terr_nome=data.get('srv_terr_nome'), srv_terr_contat=data.get('srv_terr_contat'))
    congregation_id = congregation_service.add_congregation(congregation)
    return jsonify({"message": "Congregação add com sucesso!", "id": congregation_id}), 201

@app.route('/congregsall', methods=['GET'])
def get_congregations():
    congregations = congregation_service.get_all_congregations()
    return jsonify([dict(congregation) for congregation in congregations])


# Rota DELETE para excluir Congregação
@app.route('/congregs/<int:congregation_id>', methods=['DELETE'])
def delete_congregation(congregation_id):
    try:
        congregation_service.delete_congregation(congregation_id)  # Chama o serviço para deletar Congregação
        return jsonify({"message": "Rastreamentos excluído com sucesso!"}), 200
    except ValueError:
        return jsonify({"message": "Rastreamentos não encontrado!"}), 404
    except Exception as e:
        return jsonify({"message": "Erro ao excluir o Rastreamentos", "error": str(e)}), 500


## Rotas da API para o cadastro de puiblicadores 
@app.route('/pubcall', methods=['GET'])
def get_pubcall():
    pubc = pubc_service.get_all_pubc()
    return jsonify([{
        **dict(pubc),
        'pub_dtbatism': format_date(pubc.get('pub_dtbatism')),
        'pub_dtnasc': format_date(pubc.get('pub_dtnasc')),
        'data_inclu': format_date(pubc.get('data_inclu'))
    } for pubc in pubc])

## Rotas da API para o cadastro de puiblicadores 
@app.route('/pubcallsint', methods=['GET'])
def get_pubcallsint():
    pubc = pubc_service.get_all_pubc_sint()
    return jsonify([{
        **dict(pubc),    
        'data_inclu': format_date(pubc.get('data_inclu'))
    } for pubc in pubc])

@app.route('/pubc', methods=['POST'])
def add_pubc():
    data = request.json
    pubc = Publicadores(data_inclu=parse_date(data.get('data_inclu')),
                        pub_nome=data.get('pub_nome'),
                        pub_contat=data.get('pub_contat'),
                        pub_login=data.get('pub_login'),
                        pub_email=data.get('pub_email'),
                        pub_endereco=data.get('pub_endereco'),
                        pub_regiao=data.get('pub_regiao'),
                        pub_uf=data.get('pub_uf'),
                        pub_dtbatism=parse_date(data.get('pub_dtbatism')),
                        pub_dtnasc=parse_date(data.get('pub_dtnasc')),
                        desig_servic=data.get('desig_servic'),
                        desig_campo=data.get('desig_campo'),
                        pub_status=data.get('pub_status'),
                        pub_id_publica=data.get('pub_id_publica'),
                        resp_obs=data.get('resp_obs')
                        )
    pubc_id = pubc_service.add_pubc(pubc)
    return jsonify({"id": pubc_id, "message": "Publicador add com sucesso!"}), 201

@app.route('/pubc/<int:pubc_id>', methods=['PUT'])
def update_pubc(pubc_id):
    data = request.json
    pubc = Publicadores(data_inclu=parse_date(data.get('data_inclu')),
                        pub_nome=data.get('pub_nome'),
                        pub_contat=data.get('pub_contat'),
                        pub_login=data.get('pub_login'),
                        pub_email=data.get('pub_email'),
                        pub_endereco=data.get('pub_endereco'),
                        pub_regiao=data.get('pub_regiao'),
                        pub_uf=data.get('pub_uf'),
                        pub_dtbatism=parse_date(data.get('pub_dtbatism')),
                        pub_dtnasc=parse_date(data.get('pub_dtnasc')),
                        desig_servic=data.get('desig_servic'),
                        desig_campo=data.get('desig_campo'),
                        pub_status=data.get('pub_status'),
                        pub_id_publica=data.get('pub_id_publica'),
                        resp_obs=data.get('resp_obs')
                        )
    updated_pubc_id = pubc_service.update_pubc(pubc_id, pubc)
    return jsonify({"message": "Publicador atualizado com sucesso!", "id": updated_pubc_id}), 200

# Rota DELETE para excluir Publicador
@app.route('/pubc/<int:pubc_id>', methods=['DELETE'])
def delete_publi(pubc_id):
    try:
        pubc_service.delete_publi(pubc_id)  # Chama o serviço para deletar Publicador
        return jsonify({"message": "Publicador excluído com sucesso!"}), 200
    except ValueError:
        return jsonify({"message": "Publicador não encontrado!"}), 404
    except Exception as e:
        return jsonify({"message": "Erro ao excluir o Publicador", "error": str(e)}), 500

## Rotas da API para o cadastro de Designações 
@app.route('/desigaall', methods=['GET'])
def get_desigall():
    desig = desig_service.get_all_desig()
    return jsonify([{
        **dict(desig),        
        'dsg_data': format_date(desig.get('dsg_data')),
        'data_inclu': format_date(desig.get('data_inclu'))
    } for desig in desig])

## Rotas da API para o cadastro de Designações 
@app.route('/desig/<string:desig_user>', methods=['GET'])
def get_desiguser(desig_user):
    desig = desig_service.get_desig_user(desig_user)
    return jsonify([{
        **dict(desig_item),
        'dsg_data': format_date(desig_item.get('dsg_data')),
        'dt_ultvisit': format_date(desig_item.get('dt_ultvisit')),
        'data_inclu': format_date(desig_item.get('data_inclu'))
    } for desig_item in desig])

## Rotas da API para o cadastro de Designações 
@app.route('/desigpend', methods=['GET'])
def get_desigpendente():
    desig = desig_service.get_desig_transf()
    return jsonify([{
        **dict(desig),
        'dsg_data': format_date(desig.get('dsg_data')),        
        'dt_ultvisit': format_date(desig.get('dt_ultvisit')),
        'data_inclu': format_date(desig.get('data_inclu'))
    } for desig in desig])

## Rotas da API para o cadastro de Designações 
@app.route('/desigensin/<string:desig_user>', methods=['GET'])
def get_desigensino(desig_user):
    desig = desig_service.get_desig_ensino(desig_user)
    return jsonify([{
        **dict(desig_item),
        'dsg_data': format_date(desig_item.get('dsg_data')),        
        'dt_ultvisit': format_date(desig_item.get('dt_ultvisit')),
        'data_inclu': format_date(desig_item.get('data_inclu'))
    } for desig_item in desig])


## Rotas da API para o cadastro de Designações 
@app.route('/desigsuges', methods=['GET'])
def get_desigsugest():
    desig = desig_service.get_desig_sugest()
    return jsonify([{
        **dict(desig),
        'dsg_data': format_date(desig.get('dsg_data')),        
        'dt_ultvisit': format_date(desig.get('dt_ultvisit')),
        'data_inclu': format_date(desig.get('data_inclu'))
    } for desig in desig])

## Rotas da API para o cadastro de Designações 
@app.route('/desigoutras/<string:desig_user>', methods=['GET'])
def get_desigoutras(desig_user):
    desig = desig_service.get_desig_user_outras(desig_user)
    return jsonify([{
        **dict(desig_item),
        'dsg_data': format_date(desig_item.get('dsg_data')),
        'dt_ultvisit': format_date(desig_item.get('dt_ultvisit')),
        'data_inclu': format_date(desig_item.get('data_inclu'))
    } for desig_item in desig])

@app.route('/desig', methods=['POST'])
def add_desig():
    data = request.json
    desig = Designacoes(data_inclu=parse_date(data.get('data_inclu')),
                        dsg_data=parse_date(data.get('dsg_data')),
                        pub_login=data.get('pub_login'),
                        pub_nome=data.get('pub_nome'),
                        pub_obs=data.get('pub_obs'),
                        dsg_tipo=data.get('dsg_tipo'),
                        dsg_detalhes=data.get('dsg_detalhes'),
                        dsg_conselh=data.get('dsg_conselh'),
                        dsg_mapa_cod=data.get('dsg_mapa_cod'),
                        dsg_mapa_url=data.get('dsg_mapa_url'),
                        dsg_mapa_end=data.get('dsg_mapa_end'),
                        dsg_status=data.get('dsg_status'),
                        dsg_obs=data.get('dsg_obs')
                        )                
    desig_id = desig_service.add_desig(desig)
    return jsonify({"id": desig_id, "message": "Designação add com sucesso!"}), 201


@app.route('/desiglot', methods=['POST'])
def add_batch_desig():
    data = request.json
    ## print("Dados recebidos:", data)

    # Verificar se os dados são uma lista
    if not isinstance(data, list):
        print("Erro: Dados não são uma lista.")
        return jsonify({"message": "Dados invalidos. Esperado uma lista de objetos."}), 400

    # Criar objetos Designacoes para cada item
    desigs = []
    for item in data:
        try:
            desigs.append(Designacoes(
                data_inclu=parse_date(item.get('data_inclu')),
                dsg_data=parse_date(item.get('dsg_data')),
                pub_login=item.get('pub_login'),
                pub_nome=item.get('pub_nome'),
                pub_obs=item.get('pub_obs'),
                dsg_tipo=item.get('dsg_tipo'),
                dsg_detalhes=item.get('dsg_detalhes'),
                dsg_conselh=item.get('dsg_conselh'),
                dsg_mapa_cod=item.get('dsg_mapa_cod'),
                dsg_mapa_url=item.get('dsg_mapa_url'),
                dsg_mapa_end=item.get('dsg_mapa_end'),
                dsg_status=item.get('dsg_status'),
                dsg_obs=item.get('dsg_obs')
            ))
        except Exception as e:
            print(f"Erro ao processar item: {item} - Erro: {e}")
            return jsonify({"message": "Erro ao processar um dos itens."}), 500
    try:
        # Chamar o serviço para adicionar o lote
        count = desig_service.add_batch_desig(desigs)
        print(f"{count} designações adicionadas com sucesso!")
        return jsonify({"message": f"{count} designações adicionadas com sucesso!"}), 201
    except Exception as e:
        print(f"Erro ao adicionar designações em lote: {e}")
        return jsonify({"message": "Erro ao processar o lote."}), 500

@app.route('/desig/<int:desig_id>', methods=['PUT'])
def update_desig(desig_id):
    data = request.json
    desig = Designacoes(data_inclu=parse_date(data.get('data_inclu')),
                        dsg_data=parse_date(data.get('dsg_data')),
                        pub_login=data.get('pub_login'),
                        pub_nome=data.get('pub_nome'),
                        pub_obs=data.get('pub_obs'),
                        dsg_tipo=data.get('dsg_tipo'),
                        dsg_detalhes=data.get('dsg_detalhes'),
                        dsg_conselh=data.get('dsg_conselh'),
                        dsg_mapa_cod=data.get('dsg_mapa_cod'),
                        dsg_mapa_url=data.get('dsg_mapa_url'),
                        dsg_mapa_end=data.get('dsg_mapa_end'),
                        dsg_status=data.get('dsg_status'),
                        dsg_obs=data.get('dsg_obs')
                        )
    updated_desig_id = desig_service.update_desig(desig_id, desig)
    return jsonify({"message": "Designação atualizada com sucesso!", "id": updated_desig_id}), 200
	   
# Rota DELETE para excluir Designação
@app.route('/desig/<int:desig_id>', methods=['DELETE'])
def delete_desig(desig_id):
    try:
        desig_service.delete_desig(desig_id)  # Chama o serviço para deletar Publicador
        return jsonify({"message": "Designação excluída com sucesso!"}), 200
    except ValueError:
        return jsonify({"message": "Designação não encontrada!"}), 404
    except Exception as e:
        return jsonify({"message": "Erro ao excluir a Designação", "error": str(e)}), 500


## Rotas da API para o cadastro de Territórios 
@app.route('/territall', methods=['GET'])
def get_territall():
    territ = territ_service.get_all_territ()
    return jsonify([{
        **dict(territ),
        'dt_ultvisit': format_date(territ.get('dt_ultvisit')),
        'data_inclu': format_date(territ.get('data_inclu'))
    } for territ in territ])

@app.route('/territ', methods=['POST'])
def add_territ():
    data = request.json
    territ = Territorios(data_inclu=parse_date(data.get('data_inclu')),
                        dt_ultvisit=parse_date(data.get('dt_ultvisit')),
                        pub_ultvisi=data.get('pub_ultvisi'),
                        dt_visit02=parse_date(data.get('dt_visit02')),
                        pub_tvis02=data.get('pub_tvis02'),
                        dt_visit03=parse_date(data.get('dt_visit03')),
                        pub_tvis03=data.get('pub_tvis03'),
                        dt_visit04=parse_date(data.get('dt_visit04')),
                        pub_tvis04=data.get('pub_tvis04'),
                        terr_nome=data.get('terr_nome'),
                        terr_morador=data.get('terr_morador'),
                        terr_enderec=data.get('terr_enderec'),
                        terr_regiao=data.get('terr_regiao'),
                        terr_link=data.get('terr_link'),
                        terr_coord=data.get('terr_coord'),
                        terr_cor=data.get('terr_cor'),
                        terr_status=data.get('terr_status'),
                        num_pessoas=data.get('num_pessoas'),
                        melhor_dia_hora=data.get('melhor_dia_hora'),                        
                        terr_tp_local=data.get('terr_tp_local'),
                        terr_classif=data.get('terr_classif'),
                        terr_desig=data.get('terr_desig'),
                        melhor_hora=data.get('melhor_hora'),                                 
                        terr_respons=data.get('terr_respons'),                 
                        terr_obs=data.get('terr_obs')
                        )     
    territ_id = territ_service.add_territ(territ)
    return jsonify({"id": territ_id, "message": "Território add com sucesso!"}), 201

@app.route('/territ/<int:territ_id>', methods=['PUT'])
def update_territ(territ_id):
    data = request.json
   
    territ = Territorios(data_inclu=parse_date(data.get('data_inclu')),
                        dt_ultvisit=parse_date(data.get('dt_ultvisit')),
                        pub_ultvisi=data.get('pub_ultvisi'),
                        dt_visit02=parse_date(data.get('dt_visit02')),
                        pub_tvis02=data.get('pub_tvis02'),
                        dt_visit03=parse_date(data.get('dt_visit03')),
                        pub_tvis03=data.get('pub_tvis03'),
                        dt_visit04=parse_date(data.get('dt_visit04')),
                        pub_tvis04=data.get('pub_tvis04'),
                        terr_nome=data.get('terr_nome'),
                        terr_morador=data.get('terr_morador'),
                        terr_enderec=data.get('terr_enderec'),
                        terr_regiao=data.get('terr_regiao'),
                        terr_link=data.get('terr_link'),
                        terr_coord=data.get('terr_coord'),
                        terr_cor=data.get('terr_cor'),
                        terr_status=data.get('terr_status'),
                        num_pessoas=data.get('num_pessoas'),
                        melhor_dia_hora=data.get('melhor_dia_hora'),
                        terr_tp_local=data.get('terr_tp_local'),
                        terr_classif=data.get('terr_classif'),
                        terr_desig=data.get('terr_desig'),
                        melhor_hora=data.get('melhor_hora'),   
                        terr_respons=data.get('terr_respons'),             
                        terr_obs=data.get('terr_obs')
                        )
    updated_territ_id = territ_service.update_territ(territ_id, territ)
    return jsonify({"message": "Território atualizado com sucesso!", "id": updated_territ_id}), 200
	   
# Rota DELETE para excluir Território
@app.route('/territ/<int:territ_id>', methods=['DELETE'])
def delete_territ(territ_id):
    try:
        territ_service.delete_territ(territ_id)  # Chama o serviço para deletar Publicador
        return jsonify({"message": "Território excluída com sucesso!"}), 200
    except ValueError:
        return jsonify({"message": "Território não encontrada!"}), 404
    except Exception as e:
        return jsonify({"message": "Erro ao excluir a Território", "error": str(e)}), 500
    

@app.route('/terrupdesp/<int:territ_id>', methods=['PUT'])
def update_specific_territ_fields(territ_id):
    data = request.json

    # Lista de campos permitidos
    allowed_fields = [
        'dt_ultvisit', 'pub_ultvisi', 'terr_cor', 'terr_status', 
        'num_pessoas', 'melhor_dia_hora', 'melhor_hora','terr_respons',  
        'terr_tp_local', 'terr_classif', 'terr_desig', 'terr_obs'
    ]

    # Dicionário para armazenar os campos a serem atualizados
    fields_to_update = {}

    # Tratamento especial para campos de data
    if 'dt_ultvisit' in data:
        fields_to_update['dt_ultvisit'] = parse_date(data.get('dt_ultvisit'))

    # Verifica e adiciona os demais campos ao dicionário de atualização
    for field in allowed_fields:
        if field in data and field != 'dt_ultvisit':  # Evita duplicar 'dt_ultvisit'
            fields_to_update[field] = data[field]

    if not fields_to_update:
        return jsonify({"error": "Nenhum campo válido para atualizar"}), 400

    try:
        # Chama o service para realizar a atualização
        territ_service = TerritService()
        updated_territ_id = territ_service.update_territ_especif(territ_id, fields_to_update)
        return jsonify({"message": "Campos do território atualizados com sucesso!", "id": updated_territ_id}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


## ## ## ## ##  ##  ##  ##  ## 
## Rotas da API para relatorio de visitas   
@app.route('/rvisitall', methods=['GET'])
def get_rvisitall():
    rvisitas = rvisita_service.get_all_visit()
    return jsonify([{
        **dict(rvisitas),        
        'visit_data': format_date(rvisitas.get('visit_data')),
        'data_inclu': format_date(rvisitas.get('data_inclu'))
    } for rvisitas in rvisitas])

@app.route('/rvisitas', methods=['POST'])
def add_rvisitas():
    data = request.json
    rvisitas = RelVisita(data_inclu=parse_date(data.get('data_inclu')),
                        visit_data=parse_date(data.get('visit_data')),
                        pub_login=data.get('pub_login'),
                        pub_nome=data.get('pub_nome'),
                        visit_cod=data.get('visit_cod'),
                        visit_url=data.get('visit_url'),
                        visit_ender=data.get('visit_ender'),
                        visit_status=data.get('visit_status'),
                        num_pessoas=data.get('num_pessoas'),
                        melhor_dia=data.get('melhor_dia'),                        
                        melhor_hora=data.get('melhor_hora'),
                        terr_obs=data.get('terr_obs')                      
                        )     
    rvisitas_id = rvisita_service.add_visit(rvisitas)
    return jsonify({"id": rvisitas_id, "message": "Registro add com sucesso!"}), 201


@app.route('/rvisitas/<int:rvisitas_id>', methods=['PUT'])
def update_rvisitas(rvisitas_id):
    data = request.json
    rvisitas = RelVisita(data_inclu=parse_date(data.get('data_inclu')),
                        visit_data=parse_date(data.get('visit_data')),
                        pub_login=data.get('pub_login'),
                        pub_nome=data.get('pub_nome'),
                        visit_cod=data.get('visit_cod'),
                        visit_url=data.get('visit_url'),
                        visit_ender=data.get('visit_ender'),
                        visit_status=data.get('visit_status'),
                        num_pessoas=data.get('num_pessoas'),
                        melhor_dia=data.get('melhor_dia'),                        
                        melhor_hora=data.get('melhor_hora'),
                        terr_obs=data.get('terr_obs')                      
                        )     
    updated_rvisitas_id = rvisita_service.update_visit(rvisitas_id, rvisitas)
    return jsonify({"message": "Registro atualizado com sucesso!", "id": updated_rvisitas_id}), 200
	   

# Rota DELETE para relatorio de visitas
@app.route('/rvisitas/<int:rvisitas_id>', methods=['DELETE'])
def delete_rvisitas(rvisitas_id):
    try:
        rvisita_service.delete_visit(rvisitas_id)  # Chama o serviço para deletar o registro
        return jsonify({"message": "Registro excluído com sucesso!"}), 200
    except ValueError:
        return jsonify({"message": "Registro não encontrado!"}), 404
    except Exception as e:
        return jsonify({"message": "Erro ao excluir o Registro", "error": str(e)}), 500
    

@app.route('/rvisitas/batch', methods=['POST'])
def add_batch_rvisitas():
    data = request.json
    if not isinstance(data, list):
        return jsonify({"error": "Payload deve ser uma lista de registros"}), 400

    try:
        # Converter datas no formato serial do Excel para string
        for visit in data:
            if isinstance(visit.get('data_inclu'), int):
                visit['data_inclu'] = excel_serial_to_date(visit['data_inclu'])
            else:
                visit['data_inclu'] = parse_date(str(visit.get('data_inclu', "")))

            if isinstance(visit.get('visit_data'), int):
                visit['visit_data'] = excel_serial_to_date(visit['visit_data'])
            else:
                visit['visit_data'] = parse_date(str(visit.get('visit_data', "")))

        # Enviar os dados para o serviço
        rows_inserted = rvisita_service.add_batch_visits(data)
        return jsonify({"message": f"{rows_inserted} registros inseridos com sucesso!"}), 201
    except Exception as e:
        return jsonify({"error": f"Erro ao inserir registros: {str(e)}"}), 500

##                                              #########
##                                              #########
## Rotas da API para o cadastro de Configurações de Campo
@app.route('/cfgcampoall', methods=['GET'])
def get_cfgcampo():
    cfgcampo = cfgcampo_service.get_all_cfgcampo()
    return jsonify([{
        **dict(cfgcampo),        
        'data_inclu': format_date(cfgcampo.get('data_inclu'))
    } for cfgcampo in cfgcampo])

@app.route('/cfgcarrinall', methods=['GET'])
def get_cfgcarrinh():
    cfgcampo = cfgcampo_service.get_all_cfgcarrin()
    return jsonify([{
        **dict(cfgcampo),        
        'data_inclu': format_date(cfgcampo.get('data_inclu'))
    } for cfgcampo in cfgcampo])
    

@app.route('/cfgreuniall', methods=['GET'])
def get_cfgreuniao():
    cfgcampo = cfgcampo_service.get_all_cfgreuniao()
    return jsonify([{
        **dict(cfgcampo),        
        'data_inclu': format_date(cfgcampo.get('data_inclu'))
    } for cfgcampo in cfgcampo])

@app.route('/cfgcampo', methods=['POST'])
def add_cfgcampo():
    data = request.json
    cfgcampo = ConfigCampo(data_inclu=parse_date(data.get('data_inclu')),
                        cmp_tipo=data.get('cmp_tipo'),
                        cmp_diadasem=data.get('cmp_diadasem'),
                        cmp_seq=data.get('cmp_seq'),
                        cmp_local=data.get('cmp_local'),
                        cmp_enderec=data.get('cmp_enderec'),
                        cmp_url=data.get('cmp_url'),
                        cmp_tipoativ=data.get('cmp_tipoativ'),
                        cmp_horaini=data.get('cmp_horaini'),                        
                        cmp_horafim=data.get('cmp_horafim'),
                        cmp_detalhes=data.get('cmp_detalhes')                      
                        )     
    cfgcampo_id = cfgcampo_service.add_cfgcampo(cfgcampo)
    return jsonify({"id": cfgcampo_id, "message": "Registro add com sucesso!"}), 201


# Rota DELETE para de Configurações de Campo
@app.route('/cfgcampo/<int:cfgcampo_id>', methods=['DELETE'])
def delete_cfgcampo(cfgcampo_id):
    try:
        cfgcampo_service.delete_cfgcampo(cfgcampo_id)  # Chama o serviço para deletar o registro
        return jsonify({"message": "Registro excluído com sucesso!"}), 200
    except ValueError:
        return jsonify({"message": "Registro não encontrado!"}), 404
    except Exception as e:
        return jsonify({"message": "Erro ao excluir o Registro", "error": str(e)}), 500
    

##                                              #########
## Rotas da API para o cadastro de Registro de Publicações

@app.route('/rgpublicall', methods=['GET'])
def get_rgpublic():
    rgpublic = rgpublic_service.get_all_rgpublic()
    return jsonify([{
        **dict(rgpublic),        
		'rgp_data'  : format_date(rgpublic.get('rgp_data')),
        'data_inclu': format_date(rgpublic.get('data_inclu'))
    } for rgpublic in rgpublic])

@app.route('/rgpublic', methods=['POST'])
def add_rgpublic():
    data = request.json
    rgpublic = RegPublicacoes(data_inclu=parse_date(data.get('data_inclu')),
                        rgp_data=parse_date(data.get('rgp_data')),
                        rgp_pub=data.get('rgp_pub'),
                        rgp_diadasem=data.get('rgp_diadasem'),
                        rgp_local=data.get('rgp_local'),
                        rgp_url=data.get('rgp_url'),
                        rgp_tipoativ=data.get('rgp_tipoativ'),
                        rgp_publicac=data.get('rgp_publicac'),                        
                        rgp_qtd=data.get('rgp_qtd'),
                        rgp_detalhes=data.get('rgp_detalhes')                      
                        )     
    rgpublic_id = rgpublic_service.add_rgpublic(rgpublic)
    return jsonify({"id": rgpublic_id, "message": "Registro add com sucesso!"}), 201

# Rota DELETE para de Configurações de Campo
@app.route('/rgpublic/<int:rgpublic_id>', methods=['DELETE'])
def delete_rgpublic(rgpublic_id):
    try:
        rgpublic_service.delete_rgpublic(rgpublic_id)  # Chama o serviço para deletar o registro
        return jsonify({"message": "Registro excluído com sucesso!"}), 200
    except ValueError:
        return jsonify({"message": "Registro não encontrado!"}), 404
    except Exception as e:
        return jsonify({"message": "Erro ao excluir o Registro", "error": str(e)}), 500
    
##                                              #########
## Rotas da API para o cadastro de Registro de Notificações

@app.route('/notifall', methods=['GET'])
def get_notif():
    notif = notif_service.get_all_notif()
    return jsonify([{
        **dict(notif),        
		'data_inclu': format_date(notif.get('data_inclu')),
		'noti_dtini'  : format_date(notif.get('noti_dtini')),
		'noti_dtexp'  : format_date(notif.get('noti_dtexp'))        
    } for notif in notif])

@app.route('/notif', methods=['POST'])
def add_notif():
    data = request.json
    notif = CadNotificacoes(data_inclu=parse_date(data.get('data_inclu')),
                        noti_dtini=parse_date(data.get('noti_dtini')),
						noti_dtexp=parse_date(data.get('noti_dtexp')),
                        noti_tipo=data.get('noti_tipo'),
                        noti_servic=data.get('noti_servic'),
                        noti_campo=data.get('noti_campo'),
                        noti_mensag=data.get('noti_mensag'),
                        noti_detalhes=data.get('noti_detalhes')                   
                        )     
    notif_id = notif_service.add_notif(notif)
    return jsonify({"id": notif_id, "message": "Registro add com sucesso!"}), 201

# Rota DELETE para de Configurações de Campo
@app.route('/notif/<int:notif_id>', methods=['DELETE'])
def delete_notif(notif_id):
    try:
        notif_service.delete_notif(notif_id)  # Chama o serviço para deletar o registro
        return jsonify({"message": "Registro excluído com sucesso!"}), 200
    except ValueError:
        return jsonify({"message": "Registro não encontrado!"}), 404
    except Exception as e:
        return jsonify({"message": "Erro ao excluir o Registro", "error": str(e)}), 500
    

### FIM DAS ROTAS 

if __name__ == '__main__':
  ## habilite essa linha modo desenvolvedor
  #  app.run(debug=True)
    app.run(host=config_env.FLASK_HOST, port=config_env.FLASK_PORT)

