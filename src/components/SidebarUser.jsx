import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';


const routes = [
  { path: "/huser/form-userview", name: "Pregação" },
  { path: "/huser/formuserensino", name: "Ensino" },
  { path: "/huser/formuserdesig", name: "Designar" },
  { path: "/huser/relatoriocampo", name: "Relat. Mensal" },
  { path: "/", name: "Sair" },
];

const SidebarUser = ({ children }) => {
  const navigate = useNavigate();
  const userDados = JSON.parse(sessionStorage.getItem('userData'));

  // Função de logout para remover dados do usuário e redirecionar
  const handleLogout = () => {
    sessionStorage.removeItem('userData');
    sessionStorage.removeItem('selectedMode'); // Limpa o modo selecionado
    navigate('/'); // Redireciona para a página de login
  };


  return (
    <div className="main-containerusers">
      <div className='sidebaruser' style={{fontSize: '0.7rem', color:'#D9D919'}}>
        <p>Seja bem-vindo(a), {userDados?.nome || 'Usuário'}!</p>
      </div>
      <motion.div
        animate={{
          width: '100%', // Define a largura total para o topo
          transition: { duration: 0.8, type: 'spring', damping: 8 },
        }}
        className="sidebaruser"
      >

        <section className="routesusers" style={{fontSize: '0.8rem'}}>
          {routes.map((route, index) => (
            <NavLink
              to={route.path}
              key={index}
              className={({ isActive }) => (isActive ? 'linkusers' : 'linkusers')}
              onClick={route.name === "Sair" ? (e) => { e.preventDefault(); handleLogout(); } : null}
            >
              <span>{route.name}</span>
            </NavLink>
          ))}
        </section>
      </motion.div>
      <motion.div className="content" style={{fontSize: '0.7rem',backgroundColor: '#2c2c4e',color: '#67e7eb'}}>
        {children}
      </motion.div>
    </div>
  );
};

export default SidebarUser;
