import React, { useState } from 'react';
import api_service from '../services/api_service'; // Importando serviço da API
import { useNavigate } from 'react-router-dom'; // Importe o useNavigate
import InputMask from 'react-input-mask';
import { Box, Button, TextField, Typography, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import { FaArrowCircleLeft } from 'react-icons/fa';


const IndicaFormOff = () => {
  // Estados para armazenar os valores dos campos do formulário
  const [nome_publica, setNomePub] = useState('');
  const [num_contato, setTelefone] = useState('');
  const [cod_congreg, setCodCongreg] = useState('');
  const [cod_regiao, setCodRegiao] = useState('');
  const [enderec, setEnderec] = useState('');
  const [origem, setOrigem] = useState('');
  const [obs, setObs] = useState('');
  const [message, setMessage] = useState('');
  const Data_Atual = new Date();


  // Função para limpar o formulário
  const clearForm = () => {
    setNomePub('');
    setTelefone('');
    setCodCongreg('');
    setCodRegiao('');
    setEnderec('');
    setOrigem('');
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

  const formatDateTime = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Adiciona zero se necessário
    const day = String(date.getDate()).padStart(2, '0');
  
    return `${day}/${month}/${year}`;
  };

  // Função para limitar o comprimento do campo 'obs' a 200 caracteres
  const handleInputChange = (e) => {
    if (e.target.value.length <= 200) {
      setObs(e.target.value);
    } else {
      e.target.value = e.target.value.slice(0, 200);
    }
  };

  // Função para enviar os dados do formulário para a API
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Verifica se todos os campos obrigatórios estão preenchidos
    if (!nome_publica || !num_contato || !cod_congreg || !cod_regiao || !enderec || !origem) {
      setMessage('Por favor, preencha todos os campos obrigatórios.');
      return; // Impede o envio para a API
    }

    try {

      const defaultDtInclu = formatDateTime(Data_Atual);

      // Faz uma requisição POST para a API
      await api_service.post('/indica', {
        data_inclu: defaultDtInclu,
        nome_publica,
        num_contato,
        cod_congreg,
        cod_regiao,
        enderec,
        origem,
        obs
      });

      // Limpa o formulário após o envio bem-sucedido
      clearForm();
      setMessage('Informações enviadas com sucesso!');
    } catch (error) {
      console.error("Erro ao enviar as informações: ", error);
      setMessage('Erro ao enviar as informações');
    }
  };

  return (
    <Box sx={{ padding: '20px', color: '#202038', backgroundColor: 'rgb(255,255,255)' }}>
      <Typography variant="h4" sx={{ color: '#202038', marginBottom: '20px' }}>
        Indicação de Surdo
      </Typography>
      <Typography variant="h5" sx={{ color: 'blue', marginBottom: '20px' }}>
        "Encontrei o surdo, o que eu faço?"
      </Typography>
      <Typography variant="h5" sx={{ color: '#202038', marginBottom: '20px' }}>
        Preencha o formulário abaixo com as informações:
      </Typography>

      {/* Formulário de cadastro/edição */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ flex: 1, minWidth: '200px' }}>
            <TextField
              label="Seu Nome *"
              variant="outlined"
              size="small"
              fullWidth
              value={nome_publica}
              onChange={(e) => setNomePub(e.target.value)}
            />
          </Box>
          <Box sx={{ flex: 1, minWidth: '200px' }}>
            <InputMask
              mask="(99) 99999-9999"
              value={num_contato}
              onChange={(e) => setTelefone(e.target.value)}
            >
              {(inputProps) => (
                <TextField
                  {...inputProps}
                  label="Seu Telefone *"
                  variant="outlined"
                  size="small"
                  fullWidth
                />
              )}
            </InputMask>
          </Box>
          <Box sx={{ flex: 1, minWidth: '200px' }}>
            <TextField
              label="Sua Congregação *"
              variant="outlined"
              size="small"
              fullWidth
              value={cod_congreg}
              onChange={(e) => setCodCongreg(e.target.value)}
            />
          </Box>
          <Box sx={{ flex: 1, minWidth: '200px' }}>
            <TextField
              label="Bairro do Surdo *"
              variant="outlined"
              size="small"
              fullWidth
              value={cod_regiao}
              onChange={(e) => setCodRegiao(e.target.value)}
            />
          </Box>
          <Box sx={{ flex: 1, minWidth: '200px' }}>
            <TextField
              label="Endereço do Surdo *"
              variant="outlined"
              size="small"
              fullWidth
              value={enderec}
              onChange={(e) => setEnderec(e.target.value)}
            />
          </Box>
          {/* Campo Origem com lista de opções */}
          <Box xs={12} sm={6} md={4} sx={{ flex: 1, minWidth: '200px' }}>
            <FormControl fullWidth>
              <InputLabel id="origem-label">Origem</InputLabel>
              <Select
                labelId="origem-label"
                id="origem"
                value={origem}
                label="Origem *"
                onChange={(e) => setOrigem(e.target.value)}
              >
                <MenuItem value="Rastreamento Casa em Casa">Casa em Casa</MenuItem>
                <MenuItem value="Rastreamento Comércio">Comércio</MenuItem>
                <MenuItem value="Outros">Outros</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ flex: 1, minWidth: '200px' }}>
            <TextField
              label="Detalhes e Referências "
              variant="outlined"
              size="small"
              fullWidth
              value={obs}
              onChange={handleInputChange}
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
            Enviar Indicação
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

export default IndicaFormOff;
