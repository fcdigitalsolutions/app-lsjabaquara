import React, { useState } from 'react';
import axios from 'axios';
import { Box, Button, TextField, Typography } from '@mui/material';

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
    setEnderec('');
    setObs('');    
    setMessage('');
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
    if (!cod_regiao || !enderec || !obs) {
      setMessage('Por favor, preencha todos os campos obrigatórios.');
      return; // Impede o envio para a API
    }


    try {

      // Define valores padrão para num_visitas e dt_ult_visit
      const defaultNumVisitas = 1;
      const defaultDtUltVisit = Data_Atual.toLocaleDateString();
      const defaultDtInclu = Data_Atual.toLocaleDateString();
      const defaultTelefone = "";
      const defaultcod_congreg = "";
      const defaultnome_publica = "";
     

      // Faz uma requisição POST para a API
      await axios.post('https://ls-jabaquara.com.br/registnc', {
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

      // Limpa o formulário após o envio bem-sucedido
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
      <Typography variant="h5" sx={{ color: '#202038', marginBottom: '20px' }}>
        Preencha o formulário abaixo com as informações:
      </Typography>

      {/* Formulário de cadastro */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ flex: 1, minWidth: '200px' }}>
            <TextField
              label="Região/Bairro *"
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
          >
            Enviar Informações
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default RegistroNCOff;
