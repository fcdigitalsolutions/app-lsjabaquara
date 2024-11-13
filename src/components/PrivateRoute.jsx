// src/components/PrivateRoute.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PrivateRoute = ({ adminComponent: AdminComponent, userComponent: UserComponent, adminOnly }) => {
  const navigate = useNavigate();
  const userDados = JSON.parse(sessionStorage.getItem('userData'));
  const isAuthenticated = !!userDados && !!userDados.iduser;

  const isUserSimples = ['gestor', 'gestor_terr', 'gestor_rmwb', 'gestor_rfds', 'gestor_mecan'].every(
    key => userDados?.[key] === '1'
  );

  useEffect(() => {
    const selectedMode = sessionStorage.getItem('selectedMode');


    if (!isAuthenticated) {
      navigate('/'); // Redirect to login if not authenticated
    } else if (adminOnly && !isUserSimples && !selectedMode) {
      navigate('/ls'); // Redirect to ls if admin and no mode selected
    } else if (selectedMode === '/huser' && UserComponent) {
      // Redirect to /huser for both admin and simple user if this mode is selected
      navigate('/huser');
    } else if (selectedMode === '/home' && AdminComponent) {
      // Redirect to /home for admin if this mode is selected
      navigate('/home');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isUserSimples, adminOnly]); // Removed `navigate` from dependencies

  console.log("AdminComponent:", AdminComponent);
  console.log("UserComponent:", UserComponent);    
  

  // Render the user or admin component based on permissions and selected mode
  return isUserSimples && UserComponent ? <UserComponent /> : <AdminComponent />;
};

export default PrivateRoute;
