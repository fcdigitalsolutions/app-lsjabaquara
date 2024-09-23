// src/pages/LoginForm.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/LoginForm.css'; // Importe seu arquivo CSS

const LoginForm = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://ls-jabaquara.com.br/auth/login', {
                user_login: username,
                user_pswd: password,
            });
            
            if (response.status === 200) {
                localStorage.setItem('token', response.data.token);
                navigate('/home');
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
                            required
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
                            required
                            className="form-input"
                        />
                    </div>
                    <button type="submit" className="login-button">Entrar</button>
                </form>
                {message && <p className="error-message">{message}</p>}
                <div className="external-links">
                    <button onClick={() => navigate('/registro-nc-off')} className="external-button">+ Ninguém em Casa</button>
                    <button onClick={() => navigate('/indica-form-off')} className="external-button">+ Indicação de Surdos</button>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;
