import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PrivateRoute = ({ component: Component }) => {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token'); // Verifica se o token existe

  useEffect(() => {
    // Se o usuário não estiver autenticado, redireciona para a página de login
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Renderiza o componente protegido se o usuário estiver autenticado
  return isAuthenticated ? <Component /> : null;
};

export default PrivateRoute;
