import React, { useState } from 'react';
import api_service from '../services/api_service'; // Importando serviço da API
import { useNavigate } from 'react-router-dom'; // Importe o useNavigate
import { Box, Button, TextField, Typography } from '@mui/material';
import { FaArrowCircleLeft } from 'react-icons/fa';

const RegistroNCOff = () => {
  // Estados para armazenar os valores dos campos do formulário
  const [cod_regiao, setCodRegiao] = useState('');
  const [enderec, setEnderec] = useState('');
  const [obs, setObs] = useState('');
  const [message, setMessage] = useState('');
  const Data_Atual = new Date();

  // Função para limpar o formulário
  const clearForm = () => {
    setCodRegiao('');
   // setEnderec('');
    setObs('');
    setMessage('');
  };

  const navigate = useNavigate(); // Use o useNavigate

  // Função para redirecionar ao login
  const handleRetornaLogin = () => {
    navigate('/'); // Navegue para a rota definida
  };

  const buttonStyle = {
    padding: '8px 14px',
    fontSize: '0.80rem',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '4px',
    transition: 'background-color 0.2s ease'
  };

  // Função para enviar os dados do formulário para a API
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formatDateTime = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Adiciona zero se necessário
      const day = String(date.getDate()).padStart(2, '0');

      return `${day}/${month}/${year}`;
    };

    // Verifica se todos os campos obrigatórios estão preenchidos
    if (!enderec || !obs) {
      setMessage('Por favor, preencha todos os campos obrigatórios.');
      return; // Impede o envio para a API
    }


    try {
      const defaultNumVisitas = 1;
      //  const defaultDtUltVisit = Data_Atual.toISOString(); // Gera 'YYYY-MM-DD'
      //  const defaultDtInclu = Data_Atual.toISOString(); // Gera 'YYYY-MM-DD'

      const defaultDtUltVisit = formatDateTime(Data_Atual); // Formato 'YYYY-MM-DD HH:mm:ss'
      const defaultDtInclu = formatDateTime(Data_Atual);

      const defaultTelefone = "";
      const defaultcod_congreg = "";
      const defaultnome_publica = "";

      // Faz uma requisição POST para a API
      await api_service.post('/registnc', {
        data_inclu: defaultDtInclu,
        nome_publica: defaultnome_publica,
        telefone: defaultTelefone,
        cod_congreg: defaultcod_congreg,
        cod_regiao,
        enderec,
        num_visitas: defaultNumVisitas,
        dt_ult_visit: defaultDtUltVisit,
        obs
      });

      clearForm();
      setMessage('Informações enviadas com sucesso!');
    } catch (error) {
      console.error("Erro ao cadastrar o registro NC: ", error);
      setMessage('Erro ao cadastrar o registro NC. Tente novamente.');
    }

  };

  return (
    <Box sx={{ padding: '20px', color: '#202038', backgroundColor: 'rgb(255,255,255)' }}>
      <Typography variant="h4" sx={{ color: '#202038', marginBottom: '20px' }}>
        Registro dos Não em Casa (NC)
      </Typography>
      <Typography variant="h5" sx={{ color: 'blue', marginBottom: '20px' }}>
        "Não encontrei pessoas em casa, o que eu faço?"
      </Typography>

      {/* Formulário de cadastro */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ flex: 1, minWidth: '200px' }}>
            <TextField
              label="Região/Bairro (se necessário)"
              variant="outlined"
              size="small"
              fullWidth
              value={cod_regiao}
              onChange={(e) => setCodRegiao(e.target.value)}
            />
          </Box>
          <Box sx={{ flex: 1, minWidth: '200px' }}>
            <TextField
              label="Informe a Rua/Av/Trav/ *"
              variant="outlined"
              size="small"
              fullWidth
              value={enderec}
              onChange={(e) => setEnderec(e.target.value)}
            />
          </Box>
          <Box sx={{ flex: 1, minWidth: '200px' }}>
            <TextField
              label="Numeros exemp: 1234 / 34553 / 34344"
              variant="outlined"
              size="small"
              fullWidth
              value={obs}
              onChange={(e) => setObs(e.target.value)}
            />
          </Box>
        </Box>

        {/* Exibe mensagem no corpo do formulário */}
        {message && (
          <Typography
            variant="body1"
            sx={{ color: message.includes('Erro') || message.includes('Por favor') ? 'red' : 'green', marginTop: '20px' }}
          >
            {message}
          </Typography>
        )}

        {/* Botão de ação */}
        <Box sx={{ marginTop: '20px' }}>
          <Button
            type="submit"
            variant="contained"
            sx={{ backgroundColor: '#202038', marginRight: '10px' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#67e7eb'; // Cor ao passar o mouse
              e.currentTarget.style.color = '#202038'; // Cor do texto ao passar o mouse
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#202038'; // Cor original
              e.currentTarget.style.color = '#f1f1f1'; // Cor do texto original
            }}
          >
            Enviar Informações
          </Button>
        </Box>
      </form>

      <Box sx={{ marginTop: '20px' }}>
        <button
          type="button"
          style={{
            ...buttonStyle,
            backgroundColor: '#202038',
            color: '#f1f1f1',
            transition: 'background-color 0.2s ease', // Transição suave
            align: 'right',
            borderRadius: '4px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#67e7eb'; // Cor ao passar o mouse
            e.currentTarget.style.color = '#202038'; // Cor do texto ao passar o mouse
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#202038'; // Cor original
            e.currentTarget.style.color = '#f1f1f1'; // Cor do texto original
          }}
          onClick={handleRetornaLogin}
        >
          <FaArrowCircleLeft /> Retornar
        </button>
      </Box>
    </Box>
  );
};

export default RegistroNCOff;
