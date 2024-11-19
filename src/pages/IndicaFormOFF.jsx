import React, { useState, useEffect } from 'react';
import api_service from '../services/api_service'; // Importando serviço da API
import { useNavigate } from 'react-router-dom'; // Importe o useNavigate
import InputMask from 'react-input-mask';
import { Box, Button, TextField, Typography, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import { FaArrowCircleLeft } from 'react-icons/fa';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';

import encontrarImg from '../img/encontrar.png'; // Importando a imagem
import casaImg from '../img/casa.png'; // Importando a imagem


const IndicaFormOff = () => {
  // Estados para armazenar os valores dos campos do formulário
  const [nome_publica, setNomePub] = useState('');
  const [num_contato, setTelefone] = useState('');
  const [cod_congreg, setCodCongreg] = useState('');
  const [cod_regiao, setCodRegiao] = useState('');
  const [enderec, setEnderec] = useState('');
  const [obs, setObs] = useState('');
  const [message, setMessage] = useState('');
  const [end_confirm, setEndConfirm] = useState('1');
  const [congregacoes, setCongregacoes] = useState([]); // Estado para armazenar as opções de Congregaçoes

  const Data_Atual = new Date();

  // Função para limpar o formulário
  const clearForm = () => {
    //  setNomePub('');
    //  setTelefone('');
    //  setCodCongreg('');
    setEndConfirm('1');
    setEnderec('');
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

  // Função para buscar as congregações da API
  useEffect(() => {
    const fetchCongregacoes = async () => {
      try {
        const response = await api_service.get('/congregsall'); // rota da sua API
        setCongregacoes(response.data); // a API retorna um array de Congregações
      } catch (error) {
        console.error('Erro ao carregar as Congregações:', error);
      }
    };

    fetchCongregacoes(); // Chama a função para carregar as Congregações
  }, []);

  // Função para enviar os dados do formulário para a API
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Verifica se todos os campos obrigatórios estão preenchidos
    if (!nome_publica || !num_contato || !cod_congreg || !enderec) {
      setMessage('Por favor, preencha todos os campos obrigatórios.');
      return; // Impede o envio para a API
    }

    try {
      const defaultDtInclu = formatDateTime(Data_Atual);
      const defaultOrigem = '';
      const defaultEndconfirm = '1';
      // Faz uma requisição POST para a API
      await api_service.post('/indica', {
        data_inclu: defaultDtInclu,
        nome_publica,
        num_contato,
        cod_congreg,
        cod_regiao,
        enderec,
        origem: defaultOrigem,
        end_confirm: defaultEndconfirm,
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
      
      <table>
        <tr>
          <td><img
            src={casaImg}
            alt="Casa"
            style={{ width: '100%', maxWidth: '75px', marginBottom: '20px', display: 'block', margin: 'auto' }}
          /></td><td></td><td></td>
          <td>
            <img
              src={encontrarImg}
              alt="Encontrar"
              style={{ width: '100%', maxWidth: '60px', marginBottom: '20px', display: 'block', margin: 'auto' }}
            />
          </td>
        </tr>
      </table>

      <Typography variant="h5" sx={{ color: 'blue', marginBottom: '20px' }}>
        "Encontrei o surdo ou sei a casa, o que eu faço?"
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
            <FormControl fullWidth>
              <InputLabel id="congrega-label">Sua Congregação? </InputLabel>
              <Select
                labelId="congrega-label"
                id="congregacoes"
                value={cod_congreg}
                label="Seu Nome? *"
                onChange={(e) => setCodCongreg(e.target.value)}
              >
                {congregacoes.map((congregacao) => (
                  <MenuItem key={congregacao.id} value={congregacao.nome}>
                    {congregacao.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ flex: 1, minWidth: '200px' }}>
            <TextField
              label="Bairro do Surdo(se necessário) "
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
        <Box sx={{ flex: 1, minWidth: '100px' }}>
          {/* Exibe uma chave de escolha se o endereço é confirmado ou não */}
          <FormControlLabel
            control={
              <Switch
                color="primary"
                checked={end_confirm === '2'}
                onChange={(e) => setEndConfirm(e.target.checked ? '2' : '1')}
              />
            }
            label="Endereço Confirmado?"
          />
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
