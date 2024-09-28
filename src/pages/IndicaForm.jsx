import React, { useState, useEffect } from 'react';
import api_service from '../services/api_service'; // Importando serviço da API
import { useNavigate } from 'react-router-dom'; // Importe o useNavigate
import InputMask from 'react-input-mask';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination, Button, TextField, Typography, MenuItem, Select, InputLabel, FormControl } from '@mui/material';

const IndicaForm = () => {
  const [data, setData] = useState([]);
  const navigate = useNavigate(); // Use o useNavigate
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(6); // Limite de linhas por página
  const [editRowId, setEditRowId] = useState(null); // ID da linha sendo editada
  const [editedRowData, setEditedRowData] = useState({}); // Dados da linha sendo editada
  const [showNewIndicationForm, setShowNewIndicationForm] = useState(false); // Controla a exibição do formulário de nova indicação
  const [message, setMessage] = useState(''); // Mensagem de sucesso ou erro
  const [newIndication, setNewIndication] = useState({
    nome_publica: '',
    telefone: '',
    cod_congreg: '',
    cod_regiao: '',
    enderec: '',
    origem: '',
    obs: ''
  });

  useEffect(() => {
    api_service.get('/indicaall')
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        console.error("Erro ao buscar os dados: ", error);
      });
  }, []);

  // Função para redirecionar ao dashboard
  const handleRetornaDash = () => {
    navigate('/home/dash-indicac'); // Navegue para a rota definida
  };

  // Função para iniciar a edição de uma linha
  const handleEdit = (row) => {
    setEditRowId(row.id); // Define a linha como editável
    setEditedRowData({ ...row }); // Copia os dados atuais da linha para o estado editável
  };

  // Função para lidar com alterações nos campos de entrada
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedRowData({ ...editedRowData, [name]: value }); // Atualiza os dados editados
  };

  // Função para salvar as alterações
  const handleSave = async () => {
    try {
      await api_service.put(`/indica/${editedRowData.id}`, editedRowData); // Atualiza os dados no backend
      setData(data.map(row => (row.id === editedRowData.id ? editedRowData : row))); // Atualiza os dados no frontend
      setEditRowId(null); // Sai do modo de edição
    } catch (error) {
      console.error("Erro ao salvar os dados: ", error);
    }
  };

  // Função para excluir o registro
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Você realmente deseja excluir este registro?");
    if (confirmDelete) {
      try {
        await api_service.delete(`/indica/${id}`); // Envia a solicitação de exclusão para a API
        setData(data.filter(row => row.id !== id)); // Remove o registro excluído do estado local
      } catch (error) {
        console.error("Erro ao excluir os dados: ", error);
      }
    }
  };

  // Função para mostrar/esconder o formulário de nova indicação
  const handleNovoBotao = () => {
    setShowNewIndicationForm(!showNewIndicationForm); // Alterna entre mostrar ou esconder o formulário
  };

  // Função para enviar a nova indicação
  const handleNewIndicationSubmit = async (e) => {
    e.preventDefault();
    const { nome_publica, telefone, cod_congreg, cod_regiao, enderec, origem, obs } = newIndication;

    if (!nome_publica || !telefone || !cod_congreg || !cod_regiao || !enderec || !origem) {
      setMessage('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      const response = await api_service.post('/indica', newIndication);
      setData([...data, response.data]); // Adiciona a nova indicação aos dados
      setNewIndication({ nome_publica: '', telefone: '', cod_congreg: '', cod_regiao: '', enderec: '', origem: '', obs: '' }); // Limpa o formulário
      setMessage('Indicação incluída com sucesso!');
    } catch (error) {
      console.error("Erro ao enviar as informações: ", error);
      setMessage('Erro ao incluir a indicação.');
    }
  };

  const buttonStyle = {
    padding: '4px 12px',
    fontSize: '0.80rem',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '4px',
    transition: 'background-color 0.2s ease'
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Cálculo do índice inicial e final das linhas a serem exibidas
  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentData = data.slice(startIndex, endIndex);

  // Estilo para inputs menores
  const inputStyle = {
    flex: 1,
    minWidth: '120px', // Largura reduzida em até 60% conforme solicitado
    maxWidth: '250px'
  };

  // Estilo responsivo para inputs
  const formBoxStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 2,
    justifyContent: 'space-between', // Alinha inputs horizontalmente
    '@media (max-width: 600px)': {
      flexDirection: 'column', // Em telas menores, alinha verticalmente
    }
  };

  return (
    <Box sx={{ padding: '16px', backgroundColor: 'rgb(255,255,255)', color: '#202038' }}>
      <h2 style={{ fontSize: '1.6rem', marginBottom: '16px' }}>Indicações</h2>

      {/* Box separado para a tabela */}
      <Box sx={{ marginBottom: '16px', backgroundColor: 'white', padding: '16px', borderRadius: '8px' }}>
        <Box sx={{ backgroundColor: 'rgb(255, 255, 255)', borderRadius: '16px' }}>
          {/* Botão Dashboard indicações */}
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
            onClick={handleRetornaDash}
          >
            DashBoard indicações
          </button>

          <TableContainer component={Paper} sx={{ marginTop: '10px' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align="center">Data</TableCell>
                  <TableCell align="center">Confirmado?</TableCell>
                  <TableCell align="center">Publicador</TableCell>
                  <TableCell align="center">Contato</TableCell>
                  <TableCell align="center">Congregação</TableCell>
                  <TableCell align="center">Endereço</TableCell>
                  <TableCell align="center">Origem</TableCell>
                  <TableCell align="center">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentData.map((row) => {
                  const isEditing = row.id === editRowId;
                  return (
                    <TableRow key={row.id}>
                      <TableCell align="center">{isEditing ? <TextField name="data_inclu" value={editedRowData.data_inclu || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.data_inclu}</TableCell>
                      <TableCell align="center">{isEditing ? <TextField name="end_confirm" value={editedRowData.end_confirm || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.end_confirm === '2' ? 'Concluído' : 'Pendente'}</TableCell>
                      <TableCell align="center">{isEditing ? <TextField name="nome_publica" value={editedRowData.nome_publica || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.nome_publica}</TableCell>
                      <TableCell align="center">{isEditing ? <TextField name="num_contato" value={editedRowData.num_contato || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.num_contato}</TableCell>
                      <TableCell align="center">{isEditing ? <TextField name="cod_congreg" value={editedRowData.cod_congreg || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.cod_congreg}</TableCell>
                      <TableCell align="center">{isEditing ? <TextField name="enderec" value={editedRowData.enderec || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.enderec}</TableCell>
                      <TableCell align="center">{isEditing ? <TextField name="origem" value={editedRowData.origem || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.origem}</TableCell>
                      <TableCell align="center">
                        {isEditing ? (
                          <Button variant="contained" color="primary" size="small" onClick={handleSave} sx={{ fontSize: '0.65rem', padding: '2px 5px' }}>Salvar</Button>
                        ) : (
                          <Box sx={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                            <Button variant="contained" color="primary" size="small" onClick={() => handleEdit(row)} sx={{ fontSize: '0.65rem', padding: '2px 5px' }}>Editar</Button>
                            <Button variant="contained" color="error" size="small" onClick={() => handleDelete(row.id)} sx={{ fontSize: '0.65rem', padding: '2px 5px' }}>Excluir</Button>
                          </Box>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[]}
            component="div"
            count={data.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            sx={{
              '& .MuiTablePagination-toolbar': { fontSize: '0.65rem' },
              '& .MuiTablePagination-selectRoot': { fontSize: '0.65rem' },
              '& .MuiTablePagination-displayedRows': { fontSize: '0.65rem' },
            }}
          />
        </Box>
      </Box>

       {/* Botão para abrir o formulário */}
       <Box sx={{ padding: '16px', marginTop: '16px' }}>
        <button
          type="button"
          style={{
            ...buttonStyle,
            backgroundColor: showNewIndicationForm ? '#67e7eb' : '#202038',
            color: showNewIndicationForm ? '#202038' : '#f1f1f1',
          }}
          onMouseEnter={(e) => {
            if (!showNewIndicationForm) {
              e.currentTarget.style.backgroundColor = '#67e7eb'; // Cor ao passar o mouse
              e.currentTarget.style.color = '#202038'; // Cor do texto ao passar o mouse
            }
          }}
          onMouseLeave={(e) => {
            if (!showNewIndicationForm) {
              e.currentTarget.style.backgroundColor = '#202038'; // Cor original
              e.currentTarget.style.color = '#f1f1f1'; // Cor do texto original
            }
          }}
          onClick={handleNovoBotao}
        >
          + Incluir nova Indicação
        </button>
      </Box>

      {/* Formulário de nova indicação */}
      <Box sx={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', display: showNewIndicationForm ? 'block' : 'none' }}>
        <form onSubmit={handleNewIndicationSubmit}>
          <Box sx={formBoxStyle}>
            <TextField label="Nome Publicador *" variant="outlined" size="small" fullWidth value={newIndication.nome_publica} onChange={(e) => setNewIndication({ ...newIndication, nome_publica: e.target.value })} sx={inputStyle} />
            <InputMask mask="(99) 99999-9999" value={newIndication.telefone} onChange={(e) => setNewIndication({ ...newIndication, telefone: e.target.value })}>
              {(inputProps) => <TextField {...inputProps} label="Telefone de Contato *" variant="outlined" size="small" fullWidth sx={inputStyle} />}
            </InputMask>
            <TextField label="Congregação *" variant="outlined" size="small" fullWidth value={newIndication.cod_congreg} onChange={(e) => setNewIndication({ ...newIndication, cod_congreg: e.target.value })} sx={inputStyle} />
            <TextField label="Região/Bairro *" variant="outlined" size="small" fullWidth value={newIndication.cod_regiao} onChange={(e) => setNewIndication({ ...newIndication, cod_regiao: e.target.value })} sx={inputStyle} />
            <TextField label="Endereço *" variant="outlined" size="small" fullWidth value={newIndication.enderec} onChange={(e) => setNewIndication({ ...newIndication, enderec: e.target.value })} sx={inputStyle} />
            <FormControl fullWidth sx={inputStyle}>
              <InputLabel id="origem-label">Origem</InputLabel>
              <Select labelId="origem-label" id="origem" value={newIndication.origem} label="Informe a Origem" onChange={(e) => setNewIndication({ ...newIndication, origem: e.target.value })}>
                <MenuItem value="Rastreamento Casa em Casa">Casa em Casa</MenuItem>
                <MenuItem value="Rastreamento Comércio">Comércio</MenuItem>
                <MenuItem value="Outros">Outros</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Detalhes" variant="outlined" size="small" fullWidth value={newIndication.obs} onChange={(e) => setNewIndication({ ...newIndication, obs: e.target.value })} sx={inputStyle} />
          </Box>
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
            > Enviar Indicação</button>
          </Box>
        </form>
        {message && <Typography variant="body1" sx={{ color: message.includes('Erro') ? 'red' : 'green', marginTop: '10px' }}>{message}</Typography>}
      </Box>

    </Box>
  );
};

export default IndicaForm;
