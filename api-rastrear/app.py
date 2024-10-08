from flask import Flask, request, jsonify
from flask_cors import CORS
from models import Region,Congregation,Indicacoes,Rastreamento,AuthLogin,RegistroNC,Publicadores,Designacoes,Territorios
from services import RegionService,CongregacaoService,IndicaService,RastrearService,AuthService,RegistroNCService,PublicaService,DesignService,TerritService
from database import init_db
from datetime import datetime

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

@app.route('/auth/login', methods=['POST'])
def authenticate_user():
    data = request.json
    user_login = data.get('user_login')
    user_pswd = data.get('user_pswd')

    if not user_login or not user_pswd:
        return jsonify({"message": "Login e senha são obrigatórios!"}), 400

    user = auth_service.get_auth_login(user_login, user_pswd)
    
    if user:
        return jsonify({"message": "Autenticação bem-sucedida!"}), 200
    else:
        return jsonify({"message": "Credenciais inválidas!"}), 401

@app.route('/authxadd1', methods=['POST'])
def add_auth_login():
    data = request.json
    authlogin = AuthLogin(user_login=data['user_login'],
                            user_name=data.get('user_name'),
                            user_pswd=data.get('user_pswd'))
    authlogin_id = auth_service.add_auth_login(authlogin)
    return jsonify({"id": authlogin_id, "message": "Usuário add com sucesso!"}), 201

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
    return jsonify({"message": "Região add com sucesso!", "region_id": region_id}), 201

@app.route('/regions/<int:region_id>', methods=['PUT'])
def update_region(region_id):
    data = request.json
    region = Region(nome=data.get('nome'), descricao=data.get('descricao'))
    updated_region_id = region_service.update_region(region_id, region)
    return jsonify({"message": "Região atualizada com sucesso!", "region_id": updated_region_id}), 200

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
                        obs=data.get('obs'))
    updated_indica_id = indica_service.update_indica(indica_id, indica)
    return jsonify({"message": "Indicação atualizada com sucesso!", "indica_id": updated_indica_id}), 200

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
    return jsonify({"message": "Registro NC atualizado com sucesso!", "registnc_id": updated_registnc_id}), 200

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
    return jsonify({"message": "Rastreamento atualizado com sucesso!", "rastrear_id": updated_rastrear_id}), 200

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
    return jsonify({"message": "Congregação add com sucesso!", "congregation_id": update_congregation_id}), 200

@app.route('/congregs', methods=['POST'])
def add_congregation():
    data = request.json
    congregation = Congregation(nome=data['nome'], regiao=data.get('regiao'), endereco=data.get('endereco'),
                                cca_nome=data.get('cca_nome'), cca_contato=data.get('cca_contato'),
                                ss_nome=data.get('ss_nome'), ss_contato=data.get('ss_contato'),
                                srv_terr_nome=data.get('srv_terr_nome'), srv_terr_contat=data.get('srv_terr_contat'))
    congregation_id = congregation_service.add_congregation(congregation)
    return jsonify({"message": "Congregação add com sucesso!", "congregation_id": congregation_id}), 201

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
                        resp_obs=data.get('resp_obs')
                        )
    updated_pubc_id = pubc_service.update_pubc(pubc_id, pubc)
    return jsonify({"message": "Publicador atualizado com sucesso!", "pubc_id": updated_pubc_id}), 200

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
        'data_inclu': format_date(desig.get('data_inclu'))
    } for desig in desig])

@app.route('/desig', methods=['POST'])
def add_desig():
    data = request.json
    desig = Designacoes(data_inclu=parse_date(data.get('data_inclu')),
                        dsg_data=parse_date(data.get('dsg_data')),
                        pub_nome=data.get('pub_nome'),
                        dsg_tipo=data.get('dsg_tipo'),
                        dsg_detalhes=data.get('dsg_detalhes'),
                        dsg_conselh=data.get('dsg_conselh'),
                        dsg_mapa_cod=data.get('dsg_mapa_cod'),
                        dsg_mapa_end=data.get('dsg_mapa_end'),
                        dsg_status=data.get('dsg_status'),
                        dsg_obs=data.get('dsg_obs')
                        )                
    desig_id = desig_service.add_desig(desig)
    return jsonify({"id": desig_id, "message": "Designação add com sucesso!"}), 201

@app.route('/desig/<int:desig_id>', methods=['PUT'])
def update_desig(desig_id):
    data = request.json
    desig = Designacoes(data_inclu=parse_date(data.get('data_inclu')),
                        dsg_data=parse_date(data.get('dsg_data')),
                        pub_nome=data.get('pub_nome'),
                        dsg_tipo=data.get('dsg_tipo'),
                        dsg_detalhes=data.get('dsg_detalhes'),
                        dsg_conselh=data.get('dsg_conselh'),
                        dsg_mapa_cod=data.get('dsg_mapa_cod'),
                        dsg_mapa_end=data.get('dsg_mapa_end'),
                        dsg_status=data.get('dsg_status'),
                        dsg_obs=data.get('dsg_obs')
                        )
    updated_desig_id = desig_service.update_desig(desig_id, desig)
    return jsonify({"message": "Designação atualizada com sucesso!", "desig_id": updated_desig_id}), 200
	   
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
                        terr_obs=data.get('terr_obs')
                        )
    updated_territ_id = territ_service.update_territ(territ_id, territ)
    return jsonify({"message": "Território atualizado com sucesso!", "desig_id": updated_territ_id}), 200
	   
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


if __name__ == '__main__':
  ## habilite essa linha modo desenvolvedor
  #  app.run(debug=True)
    app.run(host="0.0.0.0", port=5000, debug=True)
