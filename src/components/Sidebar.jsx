import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FaMapMarkedAlt, FaMapPin, FaSignOutAlt, FaBars, FaHouseUser } from 'react-icons/fa';
import { FaPeopleGroup, FaPersonCirclePlus, FaFileInvoice } from 'react-icons/fa6';
import { AnimatePresence, motion } from 'framer-motion';

const routes = [
  { path: "/home/form-region", name: "Regiões", icon: <FaMapPin /> },         // Caminhos atualizados
  { path: "/home/form-congreg", name: "Congregações", icon: <FaPeopleGroup /> },
  { path: "/home/dash-indicac", name: "Indicações", icon: <FaPersonCirclePlus /> },
  { path: "/home/dash-registnc", name: "Registros NC", icon: <FaHouseUser /> },
  { path: "/home/dash-rastrea", name: "Rastreamento", icon: <FaFileInvoice /> },
  { path: "/home/form-enderec", name: "Endereços", icon: <FaMapMarkedAlt /> },
  { path: "/home/login", name: "Sair", icon: <FaSignOutAlt /> },
];

const Sidebar = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);
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
