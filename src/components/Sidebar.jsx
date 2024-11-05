import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FaMapMarkedAlt, FaMapPin, FaSignOutAlt, FaBars, FaHouseUser, FaChalkboardTeacher, FaUserTie } from 'react-icons/fa';
import { FaPeopleGroup, FaPersonCirclePlus, FaFileInvoice, FaUserGear } from 'react-icons/fa6';
import { AnimatePresence, motion } from 'framer-motion';

const routes = [
  { path: "/home/form-rastrea", name: "Rastreamento", icon: <FaFileInvoice /> },
  { path: "/home/form-indicac", name: "Indicações", icon: <FaPersonCirclePlus /> },
  { path: "/home/form-registnc", name: "Registros NC", icon: <FaHouseUser /> },
  { path: "/home/dash-congreg", name: "Congregações", icon: <FaPeopleGroup /> },
  { path: "/home/form-enderec", name: "Territórios", icon: <FaMapMarkedAlt /> },
  { path: "/home/form-pubc", name: "Publicadores", icon: <FaUserTie /> },
  { path: "/home/form-desig", name: "Designações", icon: <FaChalkboardTeacher /> },
  { path: "/home/form-region", name: "Regiões", icon: <FaMapPin /> },         // Caminhos atualizados
  { path: "/home/form-users", name: "Usuários", icon: <FaUserGear /> },         // Caminhos atualizados
  { path: "/", name: "Sair", icon: <FaSignOutAlt /> },
];

console.log(localStorage.getItem('token')); 

const Sidebar = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);
  const isAuthenticated = localStorage.getItem('token'); // Verifica se o token existe
  
  // Função de logout
  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove o token de autenticação
    window.location.href = '/'; // Redireciona para a página de login
  };

    // Exemplo de uso do isAuthenticated: oculta o menu se o usuário não estiver autenticado
    if (!isAuthenticated) {
      return null; // Ou você pode redirecionar para a página de login, por exemplo.
    }
  

  const showAnimation = {
    hidden: { width: 0, opacity: 0, transition: { duration: 0.5 } },
    show: { width: 'auto', opacity: 1, transition: { duration: 0.5 } },
  };

  return (
    <div className="main-container">
      <motion.div
        animate={{
          width: isOpen ? '160px' : '55px',
          transition: { duration: 0.8, type: 'spring', damping: 8 },
        }}
        className="sidebar"
      >
        <div className="top_section">
          <AnimatePresence>
            {isOpen && (
              <motion.h2
                variants={showAnimation}
                initial="hidden"
                animate="show"
                exit="hidden"
                className="logo"
              >
                LS Jabaquara
              </motion.h2>
            )}
          </AnimatePresence>
          <div className="bars">
            <FaBars onClick={toggle} />
          </div>
        </div>

        <section className="routes">
          {routes.map((route, index) => (
            <NavLink
              to={route.path}
              key={index}
              className={({ isActive }) => (isActive ? 'link active' : 'link')}
              onClick={route.name === 'Sair' ? handleLogout : null} // Chama logout se for o link "Sair"
            >
              <ul>
                <li>
                  <div className="icon">{route.icon}</div>
                </li>
              </ul>
              <AnimatePresence>
                <ul>
                  <li>
                    {isOpen && (
                      <motion.div
                        variants={showAnimation}
                        initial="hidden"
                        animate="show"
                        exit="hidden"
                        className="link_text"
                      >
                        {route.name}
                      </motion.div>
                    )}
                  </li>
                </ul>
              </AnimatePresence>
            </NavLink>
          ))}
        </section>
      </motion.div>

      <motion.div className="content">
        {children}
      </motion.div>
    </div>
  );
};

export default Sidebar;
