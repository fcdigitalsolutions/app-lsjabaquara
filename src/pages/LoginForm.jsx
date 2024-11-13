import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api_service from '../services/api_service'; // Importando serviço da API
import '../styles/LoginForm.css'; // Importe seu arquivo CSS

const LoginForm = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!username || !password) {
            setMessage('Por favor, preencha os campos de usuário e senha.');
            return;
        }

        try {
            const response = await api_service.post('/auth/login', {
                user_login: username,
                user_pswd: password,
            });

            if (response.status === 200) {
                const userData = {
                    message: response.data.message,
                    iduser: response.data.iduser,
                    nome: response.data.nome,
                    idpublicador: response.data.idpublicador,
                    receb_msg: response.data.receb_msg,
                    gestor: response.data.gestor,
                    gestor_terr: response.data.gestor_terr,
                    gestor_rmwb: response.data.gestor_rmwb,
                    gestor_rfds: response.data.gestor_rfds,
                    gestor_mecan: response.data.gestor_mecan,
                    dtinclusao: response.data.dtinclusao
                };
                sessionStorage.setItem('userData', JSON.stringify(userData));

                // Verifica se o usuário é simples com base nos dados retornados
                const isUserSimples = ['gestor', 'gestor_terr', 'gestor_rmwb', 'gestor_rfds', 'gestor_mecan']
                    .every(key => userData[key] === '1');

                // Redireciona com base na condição de tipo de usuário
                if (isUserSimples) {
                    navigate('/huser');
                } else {
                    navigate('/ls'); // Direciona para a página de seleção para administradores
                }
            }
        } catch (error) {
            setMessage('Erro ao fazer login. Verifique suas credenciais.');
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <h2>LS Jabaquara</h2><br></br>
                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="username">Usuário</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Senha</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="form-input"
                        />
                    </div>
                    <button type="submit" className="login-button">Entrar</button>
                </form>
                {message && <p className="error-message">{message}</p>}
                <div className="external-links">
                    <button onClick={() => navigate('/regist-ncoff')} className="external-button">+ Não em Casa</button>
                    <button onClick={() => navigate('/indic-formoff')} className="external-button">+ Indicação de Surdo</button>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;
