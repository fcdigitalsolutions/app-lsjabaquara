import React, { useState, useEffect } from 'react';
import api_service from '../services/api_service';
import { Box, Button, TextField, Typography, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import mesDoAnoImg from '../img/mes_do_ano.png';
import horasImg from '../img/horas.png';
import nomeImg from '../img/nome.png';
import voceImg from '../img/voce.png';
import ensinarImg from '../img/ensinar.png';

const RelCampForm = () => {
  const [message, setMessage] = useState('');
  const Data_Atual = new Date();
  const [mesano, setMesAno] = useState('');
  const [publica, setPublica] = useState('');
  const [designa, setDesigna] = useState('');
  const [horas, setHoras] = useState('');
  const [estudos, setEstudos] = useState('');
  const [observa, setObserva] = useState('');
  const [publicadores, setPublicadores] = useState([]);

  useEffect(() => {
    const fetchPublicadores = async () => {
      try {
        const response = await api_service.get('/pubcall');
        console.log('Publicadores carregados:', response.data);
        setPublicadores(response.data);
      } catch (error) {
        console.error('Erro ao carregar os publicadores:', error);
      }
    };
    fetchPublicadores();
  }, []);

  const formatDateTime = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${day}/${month}/${year}`;
  };

  const clearForm = () => {
    setMesAno('');
    setPublica('');
    setDesigna('');
    setHoras('');
    setEstudos('');
    setObserva('');
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mesano || !publica || !designa || !horas) {
      setMessage('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      const defaultDtInclu = formatDateTime(Data_Atual);
      console.log('Enviando dados do formulário:', { mesano, publica, designa, horas, estudos, observa });
      await api_service.post('/relatcampo', {
        data_inclu: defaultDtInclu,
        mesano,
        publica,
        designa,
        horas,
        estudos: estudos || '',
        observa: observa || '',
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
        Relatório Mensal de Pregação
      </Typography>
      <Typography variant="h5" sx={{ color: '#202038', marginBottom: '20px' }}>
        Preencha o formulário abaixo com as informações:
      </Typography>

      <form onSubmit={handleSubmit} style={{ marginBottom: '25px' }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Box xs={12} sm={6} md={4} sx={{ flex: 1, minWidth: '200px' }}>
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
                value={mesano || ''}
                label="Mês do Ano *"
                onChange={(e) => setMesAno(e.target.value)}
              >
                {['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'].map(mes => (
                  <MenuItem key={mes} value={mes}>{mes}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box xs={12} sm={6} md={4} sx={{ flex: 1, minWidth: '200px' }}>
            <img
              src={nomeImg}
              alt="Nome"
              style={{ width: '100%', maxWidth: '200px', marginBottom: '20px', display: 'block', margin: '0 auto' }}
            />
            <FormControl fullWidth>
              <InputLabel id="publica-label">Seu Nome?</InputLabel>
              <Select
                labelId="publica-label"
                id="publica"
                value={publica || ''}
                label="Seu Nome? *"
                onChange={(e) => setPublica(e.target.value)}
              >
                {publicadores.map((publicador) => (
                  <MenuItem key={publicador.id} value={publicador.nome}>
                    {publicador.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box xs={12} sm={6} md={4} sx={{ flex: 1, minWidth: '200px' }}>
            <img
              src={voceImg}
              alt="Voce"
              style={{ width: '100%', maxWidth: '100px', marginBottom: '20px', display: 'block', margin: '0 auto' }}
            />
            <FormControl fullWidth>
              <InputLabel id="designa-label">Você?</InputLabel>
              <Select
                labelId="designa-label"
                id="designa"
                value={designa || ''}
                label="Você? *"
                onChange={(e) => setDesigna(e.target.value)}
              >
                {['Publicador', 'Pioneiro Auxiliar', 'Pioneiro Regular', 'Pioneiro Especial'].map(cargo => (
                  <MenuItem key={cargo} value={cargo}>{cargo}</MenuItem>
                ))}
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
              value={horas || ''}
              onChange={(e) => setHoras(e.target.value)}
            />
          </Box>

          <Box sx={{ flex: 1, minWidth: '200px' }}>
            <img
              src={ensinarImg}
              alt="Ensinar"
              style={{ width: '100%', maxWidth: '115px', marginBottom: '20px', display: 'block', margin: '0 auto' }}
            />
            <TextField
              label="Quantos Estudos?"
              variant="outlined"
              size="small"
              fullWidth
              value={estudos || ''}
              onChange={(e) => setEstudos(e.target.value)}
            />
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ flex: 1, minWidth: '200px' }}>
            <TextField
              label="Observações:"
              variant="outlined"
              size="small"
              fullWidth
              value={observa || ''}
              onChange={(e) => setObserva(e.target.value)}
            />
          </Box>
        </Box>

        {message && (
          <Typography
            variant="body1"
            sx={{ color: message.includes('Erro') || message.includes('Por favor') ? 'red' : 'green', marginTop: '20px' }}
          >
            {message}
          </Typography>
        )}

        <Box sx={{ marginTop: '20px' }}>
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
