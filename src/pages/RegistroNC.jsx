import React, { useState, useEffect } from 'react';
import axios from 'axios';
import InputMask from 'react-input-mask';
import { Box, Button, TextField, Typography } from '@mui/material';

const RegistroNC = () => {
  const [rows, setRows] = useState([]);
  const [editRow, setEditRow] = useState(null);
  const [data_inclu, setDtInclu] = useState('');
  const [nome_publica, setNomePub] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cod_congreg, setCodCongreg] = useState('');
  const [cod_regiao, setCodRegiao] = useState('');
  const [enderec, setEnderec] = useState('');
  const [num_visitas, setNumVist] = useState('');
  const [dt_ult_visit, setDtUlmVisit] = useState('');
  const [obs, setObs] = useState('');

  useEffect(() => {
    axios.get('http://137.184.190.156:5000/indicaall')
      .then((response) => {
        setRows(response.data);
      })
      .catch((error) => {
        console.error("Erro ao buscar as registros NC: ", error);
      });
  }, []);

  const clearForm = () => {
    setDtInclu('');
    setNomePub('');
    setTelefone('');
    setCodCongreg('');
    setCodRegiao('');
    setNumVist('');
    setDtUlmVisit('');
    setObs('');
    setEditRow(null);
  };

  const handleInputChange = (e) => {
    if (e.target.value.length <= 200) {
      setObs(e.target.value);
    } else {
      e.target.value = e.target.value.slice(0, 200);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editRow) {
      try {
        const response = await axios.post('http://137.184.190.156:5000/indica', { data_inclu, nome_publica, telefone, cod_congreg, cod_regiao, enderec, num_visitas,dt_ult_visit , obs });
        setRows([...rows, response.data]);
      } catch (error) {
        console.error("Erro ao cadastrar o registro NC: ", error);
      }
    }
    clearForm();
  };

  return (
    <Box sx={{ padding: '20px', color: '#202038', backgroundColor: 'rgb(255,255,255)' }}>
      <Typography variant="h4" sx={{ color: '#202038', marginBottom: '20px' }}>
        Registro dos Não em Casa(NC)
      </Typography>
      <Typography variant="h5" sx={{ color: 'blue', marginBottom: '20px' }}>
        "Não encontrei pessoas em casa, o que eu faço?"
      </Typography>
      <Typography variant="h5" sx={{ color: '#202038', marginBottom: '20px' }}>
        Preencha o formulário abaixo com as informações:
      </Typography>

      {/* Formulário de cadastro/edição */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ flex: 1, minWidth: '200px' }}>
            <InputMask
              mask="99/99/9999"
              value={data_inclu}
              onChange={(e) => setDtInclu(e.target.value)}
            >
              {(inputProps) => (
                <TextField
                  {...inputProps}
                  label="Data"
                  variant="outlined"
                  size="small"
                  fullWidth
                />
              )}
            </InputMask>
          </Box>
          <Box sx={{ flex: 1, minWidth: '200px' }}>
            <TextField
              label="Nome Publicador"
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
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
            >
              {(inputProps) => (
                <TextField
                  {...inputProps}
                  label="Telefone de Contato"
                  variant="outlined"
                  size="small"
                  fullWidth
                />
              )}
            </InputMask>
          </Box>
          <Box sx={{ flex: 1, minWidth: '200px' }}>
            <TextField
              label="Congregação"
              variant="outlined"
              size="small"
              fullWidth
              value={cod_congreg}
              onChange={(e) => setCodCongreg(e.target.value)}
            />
          </Box>
          <Box sx={{ flex: 1, minWidth: '200px' }}>
            <TextField
              label="Região"
              variant="outlined"
              size="small"
              fullWidth
              value={cod_regiao}
              onChange={(e) => setCodRegiao(e.target.value)}
            />
          </Box>
          <Box sx={{ flex: 1, minWidth: '200px' }}>
            <TextField
              label="Endereço"
              variant="outlined"
              size="small"
              fullWidth
              value={enderec}
              onChange={(e) => setEnderec(e.target.value)}
            />
          </Box>
          <Box sx={{ flex: 1, minWidth: '200px' }}>
            <TextField
              label="Detalhes"
              variant="outlined"
              size="small"
              fullWidth
              value={obs}
              onChange={handleInputChange}
            />
          </Box>
        </Box>

        {/* Botões de ação */}
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

export default RegistroNC;
