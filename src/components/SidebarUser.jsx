import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {FaMoon, FaSun } from 'react-icons/fa';
import { useTheme } from './ThemeContext'; // Importa o hook do contexto

import {
  Button,
  Box,
  Typography,
} from '@mui/material';

const routes = [
  { path: "/huser/formuseroutras", name: "Atividades" },
  { path: "/huser/form-userview", name: "Mapas" },
  { path: "/huser/formuserensino", name: "Ensino" },
  { path: "/huser/formuseranota", name: "Notas" },
  { path: "/huser/formuserdesig", name: "Designar" },
  { path: "/huser/relatoriocampo", name: "Horas" },
  //  { path: "/huser/relatoriocampo", name: "Relat. Mensal" },
  { path: "/", name: "Sair" },
];

const SidebarUser = ({ children }) => {

  const navigate = useNavigate();
  const userDados = JSON.parse(sessionStorage.getItem('userData'));

  const { darkMode, toggleTheme } = useTheme(); // Consome o contexto do tema
  

  // Função de logout para remover dados do usuário e redirecionar
  const handleLogout = () => {
    sessionStorage.removeItem('userData');
    sessionStorage.removeItem('selectedMode'); // Limpa o modo selecionado
    navigate('/'); // Redireciona para a página de login
  };


  return (
    <Box className="main-containerusers" sx={{ backgroundColor: darkMode ? '#202038' : '#f0f0f0', color: darkMode ? '#67e7eb' : '#333' }}>
      <Box style={{ 
        fontSize: '11px', 
        backgroundColor: darkMode ? '#202038' : '#f0f0f0', 
        color: darkMode ? '#D9D919' : '#23238E', 
        justifyItems:'center'
        }}>
          <Typography sx={{ fontSize: '10px', marginTop: '10px' }}>Seja bem-vindo(a), {userDados?.nome || 'Usuário'}!</Typography>
      </Box>
      <Box>
        <Button onClick={toggleTheme} 
          sx={{ 
            margin: '2px', 
            fontSize: '9px', 
            color: darkMode ? '#67e7eb' : '#23238E', 
            }} 
          startIcon={darkMode ? <FaSun /> : <FaMoon 
          />}>
          {darkMode ? 'Modo Claro' : 'Modo Escuro'}
        </Button>
      </Box>
      <motion.div
        animate={{
          width: '100%', // Define a largura total para o topo
          transition: { duration: 0.8, type: 'spring', damping: 8 },
        }}
        style={{
          justifyItems:'center',
          fontSize: '13px', 
          color: darkMode ? '#D9D919' : '#202038',
        }}
      >
        <section 
          style={{ display: 'Flex', 
        
          }}>
          {routes.map((route, index) => (
           <NavLink
           to={route.path}
           key={index}
           className={({ isActive }) => isActive ? 'linkusers active' : 'linkusers'}
           onClick={route.name === "Sair" ? (e) => { e.preventDefault(); handleLogout(); } : null}
         >
           <span>{route.name}</span>
         </NavLink>
         
          ))}
        </section>
      </motion.div>
      <motion.div className="content" style={{ fontSize: '9px', backgroundColor: darkMode ? '#202038' : '#f0f0f0' }}>
        {children}
      </motion.div>
    </Box>
  );
};

export default SidebarUser;
