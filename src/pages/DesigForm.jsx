import React, { useState, useEffect } from 'react';
import api_service from '../services/api_service'; // Importando serviço da API
import { useNavigate } from 'react-router-dom'; // Importe o useNavigate
import { Box, Table, InputLabel, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination, Button, TextField, Typography, MenuItem, Select, FormControl, Checkbox } from '@mui/material';
import { FaChartPie, FaUserPlus, FaShareSquare } from 'react-icons/fa';

const DesigForm = () => {
  const [data, setData] = useState([]);
  const navigate = useNavigate(); // Use o useNavigate
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(5); // Limite de linhas por página
  const [editRowId, setEditRowId] = useState(null); // ID da linha sendo editada
  const [editedRowData, setEditedRowData] = useState({}); // Dados da linha sendo editada
  const [showNewDesignCForm, setShowNewDesignCForm] = useState(false); // Controla a exibição do formulário de nova indicação
  const [message, setMessage] = useState(''); // Mensagem de sucesso ou erro
  const [selected, setSelected] = useState([]);

  const [newDesignC, setNewDesignC] = useState({
    nome_publica: '',
    num_contato: '',
    cod_congreg: '',
    cod_regiao: '',
    enderec: '',
    origem: '',
    obs: ''
  });

  useEffect(() => {
    api_service.get('/desigaall')
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
    navigate('/home/dash-enderec'); // Navegue para a rota definida
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
      await api_service.put(`/desig/${editedRowData.id}`, editedRowData); // Atualiza os dados no backend
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
        await api_service.delete(`/desig/${id}`); // Envia a solicitação de exclusão para a API
        setData(data.filter(row => row.id !== id)); // Remove o registro excluído do estado local
      } catch (error) {
        console.error("Erro ao excluir os dados: ", error);
      }
    }
  };

  // Função para mostrar/esconder o formulário de novo mapa
  const handleNovoBotao = () => {
    setShowNewDesignCForm(!showNewDesignCForm); // Alterna entre mostrar ou esconder o formulário
  };


  // Função para enviar ao novo mapa
  const handleNewDesignCSubmit = async (e) => {
    e.preventDefault();

    const { pub_login, pub_nome, dsg_tipo, dsg_status } = newDesignC;

    if (!pub_login || !pub_nome || !dsg_tipo || !dsg_status) {
      setMessage('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      const response = await api_service.post('/desig', newDesignC);
      setData([...data, response.data]); // Adiciona novo mapa aos dados
      setNewDesignC({ data_inclu: '',dsg_data: '',pub_login: '',pub_nome: '',dsg_tipo: '',dsg_detalhes: '',dsg_conselh: '',dsg_mapa_cod: '',dsg_mapa_end: '',dsg_mapa_url: '' ,dsg_status: '',dsg_obs: '',pub_obs: ''  }); // Limpa o formulário
      setMessage('Informações enviadas com sucesso!');
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

  const getStatusTipo = (dsg_status) => {
    switch (dsg_status) {
      case '0': return 'Mapa';
      case '1': return 'Indicação';
      case '2': return 'Dirigente Campo';
      case '3': return 'Carrinho';
      case '4': return 'Mecanicas';
      case '5': return 'Reunião RMWB';
      case '6': return 'Reunião FDS';
      case '7': return 'Discurso Publico';
      default: return 'Outros';
    }
  };

  const getStatusColorTipo = (status) => {
    switch (status) {
      case 'Mapa': return '#2F4F2F';
      case 'Indicação': return'#CC0000';
      case 'Dirigente Campo': return '#42426F';
      case 'Carrinho': return '#93DB70';
      case 'Mecanicas': return '#000000';
      case 'Reunião RMWB': return '#000000';
      case 'Reunião FDS': return '#000000';
      case 'Discurso Publico': return '#000000';
      default: return 'transparent';
    }
  };

  const getStatusDesig = (dsg_status) => {
    switch (dsg_status) {
      case '0': return 'Não Designada';
      case '1': return 'Pendente';
      case '2': return 'Realizada';
      case '3': return 'Vencida';
      case '4': return 'Encerrada';
      default: return 'Outros';
    }
  };

  const getStatusColorDesig = (status) => {
    switch (status) {
      case 'Não Designada': return '#D8BFD8';
      case 'Pendente': return'#CC0000';
      case 'Realizada': return '#42426F';
      case 'Vencida': return '#5C4033';
      case 'Encerrada': return '#000000';
      default: return 'transparent';
    }
  };

  return (
    <Box sx={{ padding: '16px', backgroundColor: 'rgb(255,255,255)', color: '#202038' }}>
      <h2 style={{ fontSize: '1.6rem', marginBottom: '16px' }}>Designações de Territórios</h2>

      {/* Box separado para a tabela */}
      <Box sx={{ marginBottom: '16px', backgroundColor: 'white', padding: '16px', borderRadius: '8px' }}>
        <Box sx={{ backgroundColor: 'rgb(255, 255, 255)', borderRadius: '16px' }}>
          {/* Botão Dashboard Mapas */}
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
            <FaChartPie />  DashBoard Mapas
          </button>

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
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Data</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Publicador</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Nome Publicador</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Obs Publicador</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Tipo</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Detalhes</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Conselho</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Cod. Mapa</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>End. Mapa</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Url. Mapa</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Desig. OBS</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentData.map((row) => {
                  const isEditing = row.id === editRowId;
                  const statusTipo = getStatusTipo(row.dsg_tipo);
                  const statusDesig = getStatusDesig(row.dsg_status);
                  return (
                    <TableRow key={row.id}>
                      <TableCell TableCell align="center">
                        <Checkbox
                          checked={isSelected(row.id)}
                          onChange={() => handleSelect(row.id)}
                        />
                      </TableCell>
                      <TableCell align="center">{isEditing ? <TextField name="dsg_data" value={editedRowData.dsg_data || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.dsg_data}</TableCell>
                      <TableCell align="center">{isEditing ? <TextField name="pub_login" value={editedRowData.pub_login || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.pub_login}</TableCell>
                      <TableCell align="center">{isEditing ? <TextField name="pub_nome" value={editedRowData.pub_nome || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.pub_nome}</TableCell>
                      <TableCell align="center">{isEditing ? <TextField name="pub_obs" value={editedRowData.pub_obs || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.pub_obs}</TableCell>
                      {/* Campo editável de status */}
                      <TableCell align="center">
                        {isEditing ? (
                          <FormControl fullWidth>
                            <Select
                              name="dsg_tipo"
                              value={editedRowData.dsg_tipo || ' '}
                              onChange={handleInputChange}
                            >
                              <MenuItem value="0">Mapa</MenuItem>
                              <MenuItem value="1">Indicação</MenuItem>
                              <MenuItem value="2">Dirigente Campo</MenuItem>
                              <MenuItem value="3">Carrinho</MenuItem>
                              <MenuItem value="4">Mecanicas</MenuItem>
                              <MenuItem value="5">Reunião RMWB</MenuItem>
                              <MenuItem value="6">Reunião FDS</MenuItem>
                              <MenuItem value="7">Discurso Publico</MenuItem>
                              <MenuItem value="8">Outros</MenuItem>
                            </Select>
                          </FormControl>
                        ) : (
                          <div
                            style={{
                              backgroundColor: getStatusColorTipo(statusTipo),
                              color: 'white',
                              padding: '2px',
                              borderRadius: '4px',
                              textAlign: 'center',
                              fontSize: '0.65rem',
                            }}
                          >
                            {statusTipo}
                          </div>
                        )}
                      </TableCell>

                      <TableCell align="center">{isEditing ? <TextField name="dsg_detalhes" value={editedRowData.dsg_detalhes || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.dsg_detalhes}</TableCell>
                      <TableCell align="center">{isEditing ? <TextField name="dsg_conselh" value={editedRowData.dsg_conselh || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.dsg_conselh}</TableCell>
                      <TableCell align="center">{isEditing ? <TextField name="dsg_mapa_cod" value={editedRowData.dsg_mapa_cod || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.dsg_mapa_cod}</TableCell>
                      <TableCell align="center">{isEditing ? <TextField name="dsg_mapa_end" value={editedRowData.dsg_mapa_end || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.dsg_mapa_end}</TableCell>
                      <TableCell align="center">{isEditing ? <TextField name="dsg_mapa_url" value={editedRowData.dsg_mapa_url || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.dsg_mapa_url}</TableCell>
                  
                  {/* Campo editável de status */}
                  <TableCell align="center">
                        {isEditing ? (
                          <FormControl fullWidth>
                            <Select
                              name="dsg_status"
                              value={editedRowData.dsg_status || ' '}
                              onChange={handleInputChange}
                            >
                              <MenuItem value="0">Não Designada</MenuItem>
                              <MenuItem value="1">Pendente</MenuItem>
                              <MenuItem value="2">Realizada</MenuItem>
                              <MenuItem value="3">Vencida</MenuItem>
                              <MenuItem value="4">Encerrada</MenuItem>
                              <MenuItem value="5">Pendente</MenuItem>
                              
                            </Select>
                          </FormControl>
                        ) : (
                          <div
                            style={{
                              backgroundColor: getStatusColorDesig(statusDesig),
                              color: 'white',
                              padding: '2px',
                              borderRadius: '4px',
                              textAlign: 'center',
                              fontSize: '0.65rem',
                            }}
                          >
                            {statusDesig}
                          </div>
                        )}
                      </TableCell>

    <TableCell align="center">{isEditing ? <TextField name="dsg_obs" value={editedRowData.dsg_obs || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.cod_congreg}</TableCell>
                      
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

          {/* Botão para abrir o formulário */}
          <button
            type="button"
            style={{
              ...buttonStyle,
              backgroundColor: showNewDesignCForm ? '#67e7eb' : '#202038',
              color: showNewDesignCForm ? '#202038' : '#f1f1f1',
            }}
            onMouseEnter={(e) => {
              if (!showNewDesignCForm) {
                e.currentTarget.style.backgroundColor = '#67e7eb'; // Cor ao passar o mouse
                e.currentTarget.style.color = '#202038'; // Cor do texto ao passar o mouse
              }
            }}
            onMouseLeave={(e) => {
              if (!showNewDesignCForm) {
                e.currentTarget.style.backgroundColor = '#202038'; // Cor original
                e.currentTarget.style.color = '#f1f1f1'; // Cor do texto original
              }
            }}
            onClick={handleNovoBotao}
          >
            <FaUserPlus /> Nova Designação
          </button>
        </Box>

      </Box>
      {/* Formulário de nova indicação */}
      <Box sx={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', display: showNewDesignCForm ? 'block' : 'none' }}>
        <form onSubmit={handleNewDesignCSubmit}>
          <Box sx={formBoxStyle}>
            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <TextField label="Public. Login *" variant="outlined" size="small" fullWidth value={newDesignC.pub_login} onChange={(e) => setNewDesignC({ ...newDesignC, pub_login: e.target.value })} sx={inputStyle} />
            </Box>
            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <TextField label="Public. Nome *" variant="outlined" size="small" fullWidth value={newDesignC.pub_nome} onChange={(e) => setNewDesignC({ ...newDesignC, pub_nome: e.target.value })} sx={inputStyle} />
            </Box>
            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <TextField label="Public. Obs *" variant="outlined" size="small" fullWidth value={newDesignC.pub_obs} onChange={(e) => setNewDesignC({ ...newDesignC, pub_obs: e.target.value })} sx={inputStyle} />
            </Box>
            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <TextField label="Tp. Designação *" variant="outlined" size="small" fullWidth value={newDesignC.dsg_tipo} onChange={(e) => setNewDesignC({ ...newDesignC, dsg_tipo: e.target.value })} sx={inputStyle} />
            </Box>
            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <TextField label="Detalhes Designação " variant="outlined" size="small" fullWidth value={newDesignC.dsg_detalhes} onChange={(e) => setNewDesignC({ ...newDesignC, dsg_detalhes: e.target.value })} sx={inputStyle} />
            </Box>
            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <TextField label="Conselho " variant="outlined" size="small" fullWidth value={newDesignC.dsg_conselh} onChange={(e) => setNewDesignC({ ...newDesignC, dsg_conselh: e.target.value })} sx={inputStyle} />
            </Box>
            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <TextField label="Cod. Mapa " variant="outlined" size="small" fullWidth value={newDesignC.dsg_mapa_cod} onChange={(e) => setNewDesignC({ ...newDesignC, dsg_mapa_cod: e.target.value })} sx={inputStyle} />
            </Box>
            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <TextField label="End. Mapa " variant="outlined" size="small" fullWidth value={newDesignC.dsg_mapa_end} onChange={(e) => setNewDesignC({ ...newDesignC, dsg_mapa_end: e.target.value })} sx={inputStyle} />
            </Box>
            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <TextField label="URL. Mapa " variant="outlined" size="small" fullWidth value={newDesignC.dsg_mapa_url} onChange={(e) => setNewDesignC({ ...newDesignC, dsg_mapa_url: e.target.value })} sx={inputStyle} />
            </Box>
            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <FormControl fullWidth>
                <InputLabel id="status-label">Status Designação</InputLabel>
                <Select
                  labelId="status-label"
                  id="dsg_status"
                  value={newDesignC.dsg_status}
                  label="Situação *"
                  onChange={(e) => setNewDesignC({ ...newDesignC, dsg_status: e.target.value })}
                >
                  <MenuItem value="0">Não Designada</MenuItem>
                  <MenuItem value="1">Pendente</MenuItem>
                  <MenuItem value="2">Realizada</MenuItem>
                  <MenuItem value="3">Vencida</MenuItem>
                  <MenuItem value="4">Realizada</MenuItem>
                  <MenuItem value="5">Encerrada</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <TextField label="OBS Desig. " variant="outlined" size="small" fullWidth value={newDesignC.obs} onChange={(e) => setNewDesignC({ ...newDesignC, obs: e.target.value })} sx={inputStyle} />
            </Box>
          </Box>
          <Box sx={{ marginTop: '20px' }}>
            <button
              type="submmit"
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
            > <FaShareSquare /> Enviar Designação</button>
          </Box>
        </form>
        {message && <Typography variant="body1" sx={{ color: message.includes('Erro') ? 'red' : 'green', marginTop: '10px' }}>{message}</Typography>}
      </Box>
    </Box>
  );
};

export default DesigForm;
