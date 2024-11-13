import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaMapMarkedAlt, FaMapPin, FaSignOutAlt, FaBars, FaHouseUser, FaChalkboardTeacher, FaUserTie,FaExchangeAlt,FaFileSignature } from 'react-icons/fa';
import { FaPeopleGroup, FaPersonCirclePlus, FaFileInvoice, FaUserGear } from 'react-icons/fa6';
import { AnimatePresence, motion } from 'framer-motion';

const routes = [
  { path: "/home/form-rastrea", name: "Rastreamento", icon: <FaFileInvoice /> },
  { path: "/home/form-indicac", name: "Indicações", icon: <FaPersonCirclePlus /> },
  { path: "/home/form-registnc", name: "Registros NC", icon: <FaHouseUser /> },
  { path: "/home/form-congreg", name: "Congregações", icon: <FaPeopleGroup /> },
  { path: "/home/form-enderec", name: "Territórios", icon: <FaMapMarkedAlt /> },
  { path: "/home/form-pubc", name: "Publicadores", icon: <FaUserTie /> },
  { path: "/home/form-desig", name: "Designações", icon: <FaChalkboardTeacher /> },
  { path: "/home/form-region", name: "Regiões", icon: <FaMapPin /> },         // Caminhos atualizados
  { path: "/home/form-visit", name: "Reg. Visitas", icon: <FaFileSignature /> },         // Caminhos atualizados
  { path: "/home/form-users", name: "Usuários", icon: <FaUserGear /> },         // Caminhos atualizados
  { path: "/ls", name: "Trocar Visão", icon: <FaExchangeAlt /> },         // Caminhos atualizado
  { path: "/", name: "Sair", icon: <FaSignOutAlt /> },
];


const Sidebar = ({ children }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);
  const userDados = JSON.parse(sessionStorage.getItem('userData')); // remove os dados do usuário armazenado e faz logoff
  const isAuthenticated = !!userDados && !!userDados.iduser; // Verifica se o sessionStorage existe

    // Função de logout para remover dados do usuário e redirecionar
    const handleLogout = () => {
      sessionStorage.removeItem('userData');
      sessionStorage.removeItem('selectedMode'); // Limpa o modo selecionado
      navigate('/'); // Redireciona para a página de login
    }; 

  // Uso do isAuthenticated: oculta o menu se o usuário não estiver autenticado
  if (!isAuthenticated) {
    return <p>Redirecionando para o login...</p>;
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
      <div className='content'>
        <p><br></br></p>
        <p align='center'><b>Seja bem-vindo(a), {userDados.nome}!</b></p>
      </div>
        {children} 
      </motion.div>
    </div>
  );
};

export default Sidebar;
