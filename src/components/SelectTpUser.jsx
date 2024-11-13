// src/components/SelectTpUser.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box,Button,Typography } from '@mui/material';
import '../styles/LoginForm.css'; // Importa o estilo da página de login

const SelectTpUser = () => {
  const navigate = useNavigate();

  const handleSelectMode = (mode) => {
    sessionStorage.setItem('selectedMode', mode);
    navigate(mode);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <Typography variant="h4" sx={{ textAlign: 'center', color: '#67e7eb', marginBottom: '20px' }}>
          Escolha o modo de acesso
        </Typography>
         {/* Box separado para os cards */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          justifyContent: 'space-between',
          marginBottom: '5px', // Espaçamento entre os cards e a tabela
          '@media (max-width: 600px)': {
            flexDirection: 'column',
            alignItems: 'left',
          },
        }}
      >
        <Button
          variant="contained"
          fullWidth
          onClick={() => handleSelectMode('/home')}
          className="login-button" // Usa a mesma classe do botão de login
        >
          Modo Administrador
        </Button>
        </Box>
        <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          justifyContent: 'space-between',
          marginBottom: '5px', // Espaçamento entre os cards e a tabela
          '@media (max-width: 600px)': {
            flexDirection: 'column',
            alignItems: 'left',
          },
        }}
      >
        <Button
          variant="contained"
          fullWidth
          onClick={() => handleSelectMode('/huser')}
          className="external-button" // Usa o estilo do botão externo
        >
          Modo Publicador
        </Button>
        </Box>
      </div>
    </div>
  );
};

export default SelectTpUser;
