import React, { useState, useEffect } from 'react';
import api_service from '../services/api_service'; // Importando serviço da API
import { useNavigate } from 'react-router-dom'; // Importe o useNavigate
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination, Button, TextField, Typography, MenuItem, Select, FormControl, Checkbox } from '@mui/material';
import { FaChartPie, FaUserPlus, FaShareSquare } from 'react-icons/fa';

const RegistroNC = () => {
  const [data, setData] = useState([]);
  const navigate = useNavigate(); // Use o useNavigate
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(5); // Limite de linhas por página
  const [editRowId, setEditRowId] = useState(null); // ID da linha sendo editada
  const [editedRowData, setEditedRowData] = useState({}); // Dados da linha sendo editada
  const [showNewIndicationForm, setShowNewIndicationForm] = useState(false); // Controla a exibição do formulário de nova indicação
  const [message, setMessage] = useState(''); // Mensagem de sucesso ou erro
  const [selected, setSelected] = useState([]);
  const [newIndication, setNewIndication] = useState({
    cod_regiao: '',
    enderec: '',
    obs: '',
  });


  const formatDateGrid = (date) => {
    const parsedDate = new Date(date);
    const year = String(parsedDate.getFullYear()); // Apenas os últimos 2 dígitos do ano
    const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
    const day = String(parsedDate.getDate()).padStart(2, '0');
    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    api_service.get('/registncall')
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        console.error("Erro ao buscar os dados: ", error);
      });
  }, []);

  const handleSelect = (id) => {
    setSelected((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((item) => item !== id) // Desmarca se já estiver selecionado
        : [...prevSelected, id] // Marca se não estiver
    );
  };
  const isSelected = (id) => selected.includes(id);

  // Função para controlar a seleção de todas as linhas
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = data.map((row) => row.id);
      setSelected(newSelected);
    } else {
      setSelected([]);
    }
  };

  // Verifica se todas as linhas estão selecionadas
  const isAllSelected = selected.length === data.length;


  // Função para redirecionar ao dashboard
  const handleRetornaDash = () => {
    navigate('/home/dash-registnc'); // Navegue para a rota definida
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
      // Fazer a requisição PUT enviando somente os campos necessários
      await api_service.put(`/registnc/${editedRowData.id}`, editedRowData); // Atualiza os dados no backend
      setData(data.map(row => (row.id === editedRowData.id ? { ...row, ...editedRowData } : row))); // Atualiza os dados no frontend
      setEditRowId(null); // Sai do modo de edição
      setMessage('Registro atualizado com sucesso!');
    } catch (error) {
      console.error("Erro ao salvar os dados: ", error);
      setMessage('Erro ao salvar os dados.');
    }
  };

  // Função para excluir o registro
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Você realmente deseja excluir este registro?");
    if (confirmDelete) {
      try {
        await api_service.delete(`/registnc/${id}`); // Envia a solicitação de exclusão para a API
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
    const { cod_regiao, enderec, obs } = newIndication;

    if (!cod_regiao || !enderec || !obs) {
      setMessage('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      const response = await api_service.post('/registnc', newIndication);
      setData([...data, response.data]); // Adiciona a nova indicação aos dados
      setNewIndication({ cod_regiao: '', enderec: '', obs: '' }); // Limpa o formulário
      setMessage('Registro incluído com sucesso!');
    } catch (error) {
      console.error("Erro ao enviar as informações: ", error);
      setMessage('Erro ao incluir o registro.');
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

  const getStatus = (num_visitas) => {
    if (num_visitas <= 1) {
      return 'Pendente';
    } else if (num_visitas >= 2) {
      return 'Concluído';
    }
    return 'Desconhecido'; // Fallback para casos inesperados
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pendente':
        return 'green';
      case 'Concluído':
        return '#202038';
      default:
        return 'transparent';
    }
  };

  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentData = data.slice(startIndex, endIndex);

  return (
    <Box sx={{ padding: '16px', backgroundColor: 'rgb(255,255,255)', color: '#202038' }}>
      <h2 style={{ fontSize: '1.6rem', marginBottom: '16px' }}>Registro NC</h2>

      {/* Botão Dashboard */}
      <Box sx={{ marginBottom: '16px', backgroundColor: 'white', padding: '16px', borderRadius: '8px' }}>
        <Box sx={{ backgroundColor: 'rgb(255, 255, 255)', borderRadius: '16px' }}>
          <button
            type="button"
            style={{
              ...buttonStyle,
              backgroundColor: '#202038',
              color: '#f1f1f1',
              transition: 'background-color 0.2s ease',
              align: 'right',
              borderRadius: '4px',
            }}
            onClick={handleRetornaDash}
          >
            <FaChartPie />  DashBoard Registro NC
          </button>

          {/* Tabela de registros */}
          <TableContainer component={Paper} sx={{ marginTop: '10px' }}>
            <Table>
              <TableHead>
                <TableRow>
                <TableCell align="center" sx={{ fontWeight: 'bold' }} padding="checkbox">
                    <Checkbox
                      indeterminate={selected.length > 0 && selected.length < data.length}
                      checked={isAllSelected}
                      onChange={handleSelectAllClick}
                      inputProps={{ 'aria-label': 'select all items' }}
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Região/Bairro</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Logradouro</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Números</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Primeira Visita</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Última Visita</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentData.map((row) => {
                  const isEditing = row.id === editRowId;
                  const status = getStatus(row.num_visitas);
                  return (
                    <TableRow key={row.id}>
                       <TableCell TableCell align="center">
                        <Checkbox
                          checked={isSelected(row.id)}
                          onChange={() => handleSelect(row.id)}
                        />
                      </TableCell>
                      <TableCell align="center">{isEditing ? <TextField name="cod_regiao" value={editedRowData.cod_regiao || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.cod_regiao}</TableCell>
                      <TableCell align="center">
                        {isEditing ? (
                          <FormControl fullWidth>
                            <Select
                              name="num_visitas"
                              value={editedRowData.num_visitas || '1'}
                              onChange={handleInputChange}
                            >
                              <MenuItem value="1">Pendente</MenuItem>
                              <MenuItem value="2">Concluído</MenuItem>
                            </Select>
                          </FormControl>
                        ) : (
                          <div
                            style={{
                              backgroundColor: getStatusColor(status),
                              color: 'white',
                              padding: '2px',
                              borderRadius: '4px',
                              textAlign: 'center',
                              fontSize: '0.65rem',
                            }}
                          >
                            {status}
                          </div>
                        )}
                      </TableCell>
                      <TableCell align="center">{isEditing ? <TextField name="enderec" value={editedRowData.enderec || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.enderec}</TableCell>
                      <TableCell align="center">{isEditing ? <TextField name="obs" value={editedRowData.obs || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.obs}</TableCell>
                      <TableCell align="center">{isEditing ? <TextField name="data_inclu" value={editedRowData.data_inclu || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : formatDateGrid(row.data_inclu)}</TableCell>
                      <TableCell align="center">{isEditing ? <TextField name="dt_ult_visit" value={editedRowData.dt_ult_visit || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : formatDateGrid(row.dt_ult_visit)}</TableCell>
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
          />

          {/* Botão para abrir o formulário */}
          <button
            type="button"
            style={{
              ...buttonStyle,
              backgroundColor: showNewIndicationForm ? '#67e7eb' : '#202038',
              color: showNewIndicationForm ? '#202038' : '#f1f1f1',
            }}
            onClick={handleNovoBotao}
          >
            <FaUserPlus /> Novo Registro NC
          </button>
        </Box>
      </Box>

      {/* Formulário de nova indicação */}
      <Box sx={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', display: showNewIndicationForm ? 'block' : 'none' }}>
        <form onSubmit={handleNewIndicationSubmit}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'space-between' }}>
            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <TextField label="Região/Bairro *" variant="outlined" size="small" fullWidth value={newIndication.cod_regiao} onChange={(e) => setNewIndication({ ...newIndication, cod_regiao: e.target.value })} />
            </Box>
            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <TextField label="Informe a Rua/Av/Trav/ *" variant="outlined" size="small" fullWidth value={newIndication.enderec} onChange={(e) => setNewIndication({ ...newIndication, enderec: e.target.value })} />
            </Box>
            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <TextField label="Numeros exemp: 1234 / 34553 / 34344 *" variant="outlined" size="small" fullWidth value={newIndication.obs} onChange={(e) => setNewIndication({ ...newIndication, obs: e.target.value })} />
            </Box>
          </Box>
          <Box sx={{ marginTop: '20px' }}>
            <button
              type="submmit"
              style={{
                ...buttonStyle,
                backgroundColor: '#202038',
                color: '#f1f1f1',
                transition: 'background-color 0.2s ease',
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
            >
              <FaShareSquare /> Enviar Registro NC
            </button>
          </Box>
        </form>
        {message && <Typography variant="body1" sx={{ color: message.includes('Erro') ? 'red' : 'green', marginTop: '10px' }}>{message}</Typography>}
      </Box>
    </Box>
  );
};

export default RegistroNC;
