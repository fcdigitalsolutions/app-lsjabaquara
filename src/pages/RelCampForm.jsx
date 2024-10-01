import React, { useState } from 'react';
import api_service from '../services/api_service'; // Importando serviço da API
import { Box, Button, TextField, Typography, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import mesDoAnoImg from '../img/mes_do_ano.png'; // Importando a imagem
import horasImg from '../img/horas.png'; // Importando a imagem
import nomeImg from '../img/nome.png'; // Importando a imagem
import voceImg from '../img/voce.png'; // Importando a imagem
import ensinarImg from '../img/ensinar.png'; // Importando a imagem




const RelCampForm = () => {
  // Estados para armazenar os valores dos campos do formulário
  const [cod_regiao, setCodRegiao] = useState('');
  const [enderec, setEnderec] = useState('');
  const [obs, setObs] = useState('');
  const [message, setMessage] = useState('');
  const Data_Atual = new Date();
  const [mesano, setMesAno] = useState('');
  const [publica, setPublica] = useState('');
  const [designa, setDesigna] = useState('');
  const [horas, setHoras] = useState('');
  const [estudos, setEstudos] = useState('');
  const [observa, setObserva] = useState('');


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
       <br></br>
      <Typography variant="h4" sx={{ color: '#202038', marginBottom: '20px' }}>
        Relatório Mensal de Pregação
      </Typography>
      <Typography variant="h5" sx={{ color: '#202038', marginBottom: '20px' }}>
        Preencha o formulário abaixo com as informações:
      </Typography>


      {/* Formulário de cadastro */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '25px' }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Box item xs={12} sm={6} md={4} sx={{ flex: 1, minWidth: '200px' }}>
            <img
              src={mesDoAnoImg}
              alt="mesano"
              style={{ width: '100%', maxWidth: '165px', marginBottom: '20px', display: 'block', margin: '0 auto' }}
            />
            <FormControl fullWidth>
              <InputLabel id="mesdoano-label">Mês do Ano:</InputLabel>
              <Select
                labelId="mesdoano-label"
                id="mesdoano"
                value={mesano}
                label="Mês do Ano *"
                onChange={(e) => setMesAno(e.target.value)}
              >
                <MenuItem value="Janeiro">Janeiro</MenuItem>
                <MenuItem value="Fevereiro">Fevereiro</MenuItem>
                <MenuItem value="Março">Março</MenuItem>
                <MenuItem value="Abril">Abril</MenuItem>
                <MenuItem value="Maio">Maio</MenuItem>
                <MenuItem value="Junho">Junho</MenuItem>
                <MenuItem value="Julho">Julho</MenuItem>
                <MenuItem value="Agosto">Agosto</MenuItem>
                <MenuItem value="Setembro">Setembro</MenuItem>
                <MenuItem value="Outubro">Outubro</MenuItem>
                <MenuItem value="Novembro">Novembro</MenuItem>
                <MenuItem value="Dezembro">Dezembro</MenuItem>
              </Select>
            </FormControl>
          </Box>


          <Box item xs={12} sm={6} md={4} sx={{ flex: 1, minWidth: '200px' }}>
            <img
              src={nomeImg}
              alt="Nome"
              style={{ width: '100%', maxWidth: '200px', marginBottom: '20px', display: 'block', margin: '0 auto' }}
            />
            <FormControl fullWidth>
              <InputLabel id="publica-label">Nome Publicador</InputLabel>
              <Select
                labelId="publica-label"
                id="publica"
                value={publica}
                label="Mês do Ano *"
                onChange={(e) => setPublica(e.target.value)}
              >
                <MenuItem value="Felipe Wanzava">Felipe Wanzava</MenuItem>
                <MenuItem value="Felipe Bená">Felipe Bená</MenuItem>
                <MenuItem value="Cintia Wanzava">Cintia Wanzava</MenuItem>
                <MenuItem value="Thiago Ramos">Thiago Ramos</MenuItem>

              </Select>
            </FormControl>
          </Box>
          <Box item xs={12} sm={6} md={4} sx={{ flex: 1, minWidth: '200px' }}>
            <img
              src={voceImg}
              alt="Voce"
              style={{ width: '100%', maxWidth: '100px', marginBottom: '20px', display: 'block', margin: '0 auto' }}
            />
            <FormControl fullWidth>
              <InputLabel id="designa-label">Você? </InputLabel>
              <Select
                labelId="designa-label"
                id="designa"
                value={designa}
                label="Você? *"
                onChange={(e) => setDesigna(e.target.value)}
              >
                <MenuItem value="Publicador">Publicador</MenuItem>
                <MenuItem value="Pioneiro Auxiliar">Pioneiro Auxiliar</MenuItem>
                <MenuItem value="Pioneiro Regular">Pioneiro Regular</MenuItem>
                <MenuItem value="Pioneiro Especial">Pioneiro Especial</MenuItem>

              </Select>
            </FormControl>
          </Box>
          <Box sx={{ flex: 1, minWidth: '200px' }}>
            <img
              src={horasImg}
              alt="Horas"
              style={{ width: '100%', maxWidth: '100px', marginBottom: '20px', display: 'block', margin: '0 auto' }}
            />
            <TextField
              label="Horas? *"
              variant="outlined"
              size="small"
              fullWidth
              value={horas}
              onChange={(e) => setHoras(e.target.value)}
            />
          </Box>
          <Box sx={{ flex: 1, minWidth: '200px' }}>
            <br></br>
            <img
              src={ensinarImg}
              alt="Ensinar"
              style={{ width: '100%', maxWidth: '115px', marginBottom: '20px', display: 'block', margin: '0 auto' }}
            />
            <TextField
              label="Quantos Estudos? *"
              variant="outlined"
              size="small"
              fullWidth
              value={estudos}
              onChange={(e) => setEstudos(e.target.value)}
            />
          </Box>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap:2 }}> 
          <Box sx={{ flex: 1, minWidth: '200px' }}>
          <br></br>
            <TextField
              label="Observações: "
              variant="outlined"
              size="small"
              fullWidth
              value={observa}
              onChange={(e) => setObserva(e.target.value)}
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
        <br></br>
          <Button
            type="submit"
            variant="contained"
            sx={{ backgroundColor: '#202038', marginRight: '10px' }}
          >
            Enviar Relatório
          </Button>
        </Box>
      </form>

    </Box>
  );
};

export default RelCampForm;