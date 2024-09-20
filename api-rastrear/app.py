from flask import Flask, request, jsonify
from flask_cors import CORS
from models import Region, Congregation, Indicacoes, Rastreamento, AuthLogin, RegistroNC
from services import RegionService, CongregacaoService, IndicaService, RastrearService, AuthService,RegistroNCService
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

# Inicializa o banco de dados
init_db()

def format_date(date_obj):
    """Format datetime object to dd/MM/yyyy."""
    if isinstance(date_obj, datetime):
        return date_obj.strftime('%d/%m/%Y')
    return date_obj

def parse_date(date_str):
    """Parse date string dd/MM/yyyy to datetime object."""
    try:
        return datetime.strptime(date_str, '%d/%m/%Y').strftime('%Y-%m-%d')
    except ValueError:
        return None

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
    indica = Indicacoes(nome_publica=data.get('nome_publica'),
                        enderec=data.get('enderec'),
                        end_confirm=data.get('end_confirm'),
                        origem=data.get('origem'),
                        obs=data.get('obs'))
    updated_indica_id = indica_service.update_indica(indica_id, indica)
    return jsonify({"message": "Indicação atualizada com sucesso!", "indica_id": updated_indica_id}), 200

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
    registnc = RegistroNC(data_inclu=parse_date(data['data_inclu']),
                        nome_publica=data.get('nome_publica'),
                        num_contato=data.get('num_contato'),
                        cod_congreg=data.get('cod_congreg'),
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
    registnc = RegistroNC(num_visitas=data.get('num_visitas'),
                        dt_ult_visit=parse_date(data.get('dt_ult_visit')))
    updated_registnc_id = registnc_service.update_registnc(registnc_id, registnc)
    return jsonify({"message": "Registro NC atualizado com sucesso!", "registnc_id": updated_registnc_id}), 200

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


if __name__ == '__main__':
    app.run(debug=True)
