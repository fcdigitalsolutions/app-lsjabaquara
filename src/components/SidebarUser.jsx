import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaMoon, 
  FaSun, 
  FaComments,
  FaCommentDots,
  FaMapMarked,
  FaClock,
  FaClipboardList,
  FaSignLanguage,
  FaChartArea,
  FaSignInAlt,
 } from 'react-icons/fa';
import { useTheme } from './ThemeContext'; // Importa o hook do contexto
import api_service from '../services/api_service'; // Importando serviço da API

import {
  Button,
  Box,
  Card,
  CardContent,
  Typography,
} from '@mui/material';

const routes = [
  { path: "/huser/formuseroutras", name: "Atividades", icon: FaClipboardList },
  { path: "/huser/form-userview", name: "Mapas", icon: FaMapMarked },
  { path: "/huser/formuserensino", name: "Ensino", icon: FaSignLanguage },
  { path: "/huser/formuseranota", name: "Notas", icon: FaCommentDots },
  { path: "/huser/formuserdesig", name: "Designar", icon: FaChartArea },
  { path: "/huser/formuserhoras", name: "Horas", icon: FaClock },
  { path: "/", name: "Sair", icon: FaSignInAlt },
];

const SidebarUser = ({ children }) => {

  const navigate = useNavigate();
  const userDados = JSON.parse(sessionStorage.getItem('userData'));
  const { darkMode, toggleTheme } = useTheme(); // Consome o contexto do tema
  const [dataMsg, setDataMsg] = useState([]);

  // Função de logout para remover dados do usuário e redirecionar
  const handleLogout = () => {
    sessionStorage.removeItem('userData');
    sessionStorage.removeItem('selectedMode'); // Limpa o modo selecionado
    navigate('/'); // Redireciona para a página de login
  };

  // Função para buscar os dados da API
  useEffect(() => {
    const fetchMensagens = async () => {
      try {
        const response = await api_service.get('/notifall'); // rota da API
        setDataMsg(response.data); // a API retorna um array de dados
      } catch (error) {
        console.error('Erro ao carregar os dados:', error);
      }
    };

    fetchMensagens(); // Chama a função para carregar os dados
  }, []);

  // Função para iniciar a edição de uma linha
  const handleAbreLink = () => {
    const link_quadro = "https://sites.google.com/view/quadrodeanuncioslsjabaquara"
    window.open(link_quadro, '_blank'); // Abre o link em uma nova aba
  };


  return (
    <Box className="main-containerusers"
      sx={{
        backgroundColor: darkMode ? '#202038' : '#f0f0f0',
        color: darkMode ? '#67e7eb' : '#333',
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        padding: '0.5px',
      }}>
      <Box sx={{
        fontSize: '11px',
        backgroundColor: darkMode ? '#202038' : '#f0f0f0',
        color: darkMode ? '#D9D919' : '#23238E',
        justifyItems: 'center'
      }}>
        <Typography sx={{ fontSize: '10px', marginTop: '10px' }}>Seja bem-vindo(a), {userDados?.nome || 'Usuário'}!</Typography>
      </Box>
      <Box sx={{ flex: 1, minWidth: '350px', maxWidth: '350px', height: '110px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            onClick={toggleTheme}
            sx={{
              marginTop: '4px',
              fontSize: '9px',
              marginBottom: '8px',
              marginLeft: '5px', // Ajuste conforme necessário
              color: darkMode ? '#67e7eb' : '#23238E',
            }}
            startIcon={darkMode ? <FaSun /> : <FaMoon />}
          >
            {darkMode ? 'Modo Claro' : 'Modo Escuro'}
          </Button>

          <Button
            onClick={() => handleAbreLink()}
            sx={{
              marginTop: '4px', // Ajuste conforme necessário
              marginLeft: '35px', // Ajuste conforme necessário
              fontSize: '9px',
              marginBottom: '8px',
              color: darkMode ? '#67e7eb' : '#23238E',
            }}
            startIcon={darkMode ? <FaComments /> : <FaComments />}
          >
            Quadro de Anúncios
          </Button>
        </Box>

        <Box className="card-container-msg-user">
          {dataMsg.map((item, index) => (
            <Box key={index} className="card-box-msg-user">
              <Card
                className="card-msg-user"
                sx={{
                  backgroundColor: darkMode ? '#2c2c4e' : '#ffffff',
                  color: darkMode ? '#67e7eb' : '#333',
                  justifyItems: 'center',
                }}
              >
                <CardContent>
                  <Typography
                    variant="body1"
                    className="status-text-user"
                    sx={{
                      marginLeft: '-8px',
                      marginTop: '-8px',
                      marginBottom: '-15px',
                      justifyItems: 'center',
                      fontSize: '13px',
                      //    color: darkMode ? '#67e7eb' : '#00009C',
                      color: darkMode ? '#D9D919' : ' #00009C',
                    }}
                  >
                    {item.noti_mensag}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </Box>
      <motion.div
        animate={{
          width: '100%', // Define a largura total para o topo
          transition: { duration: 0.8, type: 'spring', damping: 8 },
        }}
        style={{
          justifyItems: 'center',
          fontSize: '13px',
          color: darkMode ? '#D9D919' : '#202038',
          marginTop: '20px',
        }}
      >
        <section style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '1px' }}>

          {routes.map((route, index) => (
            <NavLink
              to={route.path}
              key={index}
              className={({ isActive }) =>
                isActive
                  ? 'linkusers active'
                  : darkMode
                    ? 'linkusers-dark'
                    : 'linkusers'
              }
              onClick={route.name === "Sair" ? (e) => { e.preventDefault(); handleLogout(); } : null}
            >
                {route.icon && (
                  <Box sx={{ 
                      marginTop: '-2px',
                      marginBottom: '6px',
                      fontSize: '26px',
                      display: 'flex', 
                      alignItems: 'center', 
                      flexDirection: 'column',
                      }}>
                    {React.createElement(route.icon)}
                  </Box>
                )}
                <span>{route.name}</span>
    
            </NavLink>
          ))}
        </section>
      </motion.div>
      <motion.div className="content-user" style={{ fontSize: '9px', backgroundColor: darkMode ? '#202038' : '#f0f0f0' }}>
        {children}
      </motion.div>
    </Box>
  );
};

export default SidebarUser;
