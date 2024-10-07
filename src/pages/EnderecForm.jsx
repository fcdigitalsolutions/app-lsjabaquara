import React, { useState, useEffect } from 'react';
import api_service from '../services/api_service'; // Importando serviço da API
import { useNavigate } from 'react-router-dom'; // Importe o useNavigate
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination, Button, TextField, Typography, MenuItem, Select, InputLabel, FormControl, Checkbox } from '@mui/material';
import { FaChartPie, FaUserPlus, FaShareSquare } from 'react-icons/fa';

const EnderecForm = () => {
  const [data, setData] = useState([]);
  const navigate = useNavigate(); // Use o useNavigate
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(5); // Limite de linhas por página
  const [editRowId, setEditRowId] = useState(null); // ID da linha sendo editada
  const [editedRowData, setEditedRowData] = useState({}); // Dados da linha sendo editada
  const [showNewIndicationForm, setShowNewIndicationForm] = useState(false); // Controla a exibição do formulário de nova indicação
  const [message, setMessage] = useState(''); // Mensagem de sucesso ou erro
  const [selected, setSelected] = useState([]);

  const Data_Atual = new Date();

  const formatDateGrid = (date) => {
    const parsedDate = new Date(date);
    const year = String(parsedDate.getFullYear()); // Apenas os últimos 2 dígitos do ano
    const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
    const day = String(parsedDate.getDate()).padStart(2, '0');
    return `${day}/${month}/${year}`;
  };

  const formatDateTime = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Adiciona zero se necessário
    const day = String(date.getDate()).padStart(2, '0');

    return `${day}/${month}/${year}`;
  };

  const [newIndication, setNewIndication] = useState({
    data_inclu: formatDateTime(Data_Atual),
    dt_ultvisit: formatDateTime(Data_Atual),
    dt_visit02: formatDateTime(Data_Atual),
    dt_visit03: formatDateTime(Data_Atual),
    dt_visit04: formatDateTime(Data_Atual),
    terr_nome: '',
    terr_morador: '',
    terr_enderec: '',
    terr_regiao: '',
    terr_link: '',
    terr_coord: '',
    terr_cor: '',
    terr_status: '',
    terr_obs: ''
  });

  useEffect(() => {
    api_service.get('/territall')
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
      await api_service.put(`/territ/${editedRowData.id}`, editedRowData); // Atualiza os dados no backend
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
        await api_service.delete(`/territ/${id}`); // Envia a solicitação de exclusão para a API
        setData(data.filter(row => row.id !== id)); // Remove o registro excluído do estado local
      } catch (error) {
        console.error("Erro ao excluir os dados: ", error);
      }
    }
  };

  // Função para mostrar/esconder o formulário de novo mapa
  const handleNovoBotao = () => {
    setShowNewIndicationForm(!showNewIndicationForm); // Alterna entre mostrar ou esconder o formulário
  };


  // Função para enviar ao novo mapa
  const handleNewIndicationSubmit = async (e) => {
    e.preventDefault();

    const { terr_nome, terr_enderec, terr_link } = newIndication;

    if (!terr_nome || !terr_enderec || !terr_link) {
      setMessage('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      //
      const defaultDtInclu = formatDateTime(Data_Atual);
      const defaultUltvisit = formatDateTime(Data_Atual);
      const defaultDvisit02 = formatDateTime(Data_Atual);
      const defaultDvisit03 = formatDateTime(Data_Atual);
      const defaultDvisit04 = formatDateTime(Data_Atual);
      //
      const response = await api_service.post('/territ', newIndication);
      setData([...data, response.data]); // Adiciona novo mapa aos dados
      setNewIndication({
        data_inclu: defaultDtInclu,
        dt_ultvisit: defaultUltvisit,
        dt_visit02: defaultDvisit02,
        dt_visit03: defaultDvisit03,
        dt_visit04: defaultDvisit04,
        terr_nome: '',
        terr_morador: '',
        terr_enderec: '',
        terr_regiao: '',
        terr_link: '',
        terr_coord: '',
        terr_cor: '',
        terr_status: '',
        terr_obs: ''
      }); // Limpa o formulário
      setMessage('Mapa incluído com sucesso!');
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

  // Função para determinar o status com base no número de visitas
  const getStatusSit = (terr_status) => {
    switch (terr_status) {
      case '0':
        return 'Ativo';
      case '1':
        return 'Revisita';
      case '2':
        return 'Estudante';
      case '3':
        return 'Doente';
      case '4':
        return 'Mudou';
      case '5':
        return 'Faleceu';
      case '6':
        return 'Nao Quer';
      default:
        return 'Outros';
    }
  };

  // Função para determinar a cor de fundo da célula com base no status
  const getStatusSitColor = (statusSit) => {
    switch (statusSit) {
      case 'Ativo':
        return 'green';
      case 'Revisita':
        return '#D9D919';
      case 'Estudante':
        return '#00009C';
      case 'Doente':
        return '#8C1717';
      case 'Mudou':
        return '#5F9F9F';
      case 'Faleceu':
        return '#D8BFD8';
      case 'Nao Quer':
        return '#FF2400';
      default:
        return 'transparent';
    }
  };

  // Função para determinar o status com base no número de visitas
  const getStatusMapCor = (terr_cor) => {
    switch (terr_cor) {
      case '0':
        return 'Azul';
      case '1':
        return 'Vermelho';
      case '2':
        return 'Verde';
      default:
        return 'Outros';
    }
  };

  // Função para determinar a cor de fundo da célula com base no status
  const getStatusColorMpCor = (statusmpcor) => {
    switch (statusmpcor) {
      case 'Azul':
        return 'blue';
      case 'Vermelho':
        return 'Red';
      case 'Verde':
        return 'green';
      default:
        return 'transparent';
    }
  };

  return (
    <Box sx={{ padding: '16px', backgroundColor: 'rgb(255,255,255)', color: '#202038' }}>
      <h2 style={{ fontSize: '1.6rem', marginBottom: '16px' }}>Manutenção dos Territórios Ativos</h2>

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
            <FaChartPie />  DashBoard Territórios
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
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Código Mapa</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Morador</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Endereço</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Bairro</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Link Maps</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Coordenadas</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Cor do Mapa</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Dt. Última Visita</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Pub. Última Visita</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Detalhes e Referências</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Ações</TableCell>

                </TableRow>
              </TableHead>
              <TableBody>
                {currentData.map((row) => {
                  const isEditing = row.id === editRowId;

                  const statusmpcor = getStatusMapCor(row.terr_cor);
                  const statusSit = getStatusSit(row.terr_status);

                  return (
                    <TableRow key={row.id}>
                      <TableCell TableCell align="center">
                        <Checkbox
                          checked={isSelected(row.id)}
                          onChange={() => handleSelect(row.id)}
                        />
                      </TableCell>
                      <TableCell align="center">{isEditing ? <TextField name="terr_nome" value={editedRowData.terr_nome || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.terr_nome}</TableCell>
                      <TableCell align="center">{isEditing ? <TextField name="terr_morador" value={editedRowData.terr_morador || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.terr_morador}</TableCell>
                      <TableCell align="center">{isEditing ? <TextField name="terr_enderec" value={editedRowData.terr_enderec || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.terr_enderec}</TableCell>
                      <TableCell align="center">{isEditing ? <TextField name="terr_regiao" value={editedRowData.terr_regiao || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.terr_regiao}</TableCell>
                      <TableCell align="center">{isEditing ? <TextField name="terr_link" value={editedRowData.terr_link || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.terr_link}</TableCell>
                      <TableCell align="center">{isEditing ? <TextField name="terr_coord" value={editedRowData.terr_coord || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.terr_coord}</TableCell>

                      {/* Campo editável de status cor do mapa */}
                      <TableCell align="center">
                        {isEditing ? (
                          <FormControl fullWidth>
                            <Select
                              name="terr_cor"
                              value={editedRowData.terr_cor || '0'}
                              onChange={handleInputChange}
                            >
                              <MenuItem value="0">Azul</MenuItem>
                              <MenuItem value="1">Vermelho</MenuItem>
                              <MenuItem value="2">Verde</MenuItem>
                            </Select>
                          </FormControl>
                        ) : (
                          <div
                            style={{
                              backgroundColor: getStatusColorMpCor(statusmpcor),
                              color: 'white',
                              padding: '2px',
                              borderRadius: '4px',
                              textAlign: 'center',
                              fontSize: '0.65rem',
                            }}
                          >
                            {statusmpcor}
                          </div>
                        )}
                      </TableCell>
                      {/* Campo editável de status situacao */}
                      <TableCell align="center">
                        {isEditing ? (
                          <FormControl fullWidth>
                            <Select
                              name="terr_status"
                              value={editedRowData.terr_status || '0'}
                              onChange={handleInputChange}
                            >
                              <MenuItem value="0">Ativo</MenuItem>
                              <MenuItem value="1">Revisita</MenuItem>
                              <MenuItem value="2">Estudante</MenuItem>
                              <MenuItem value="3">Doente</MenuItem>
                              <MenuItem value="4">Mudou</MenuItem>
                              <MenuItem value="5">Faleceu</MenuItem>
                              <MenuItem value="6">Nao Quer</MenuItem>
                              <MenuItem value="9">Outros</MenuItem>
                            </Select>
                          </FormControl>
                        ) : (
                          <div
                            style={{
                              backgroundColor: getStatusSitColor(statusSit),
                              color: 'white',
                              padding: '2px',
                              borderRadius: '4px',
                              textAlign: 'center',
                              fontSize: '0.65rem',
                            }}
                          >
                            {statusSit}
                          </div>
                        )}
                      </TableCell>
                      <TableCell align="center">{isEditing ? <TextField name="dt_ultvisit" value={editedRowData.dt_ultvisit || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : formatDateGrid(row.dt_ultvisit)}</TableCell>
                      <TableCell align="center">{isEditing ? <TextField name="pub_ultvisi" value={editedRowData.pub_ultvisi || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.pub_ultvisi}</TableCell>

                      <TableCell align="center">{isEditing ? <TextField name="terr_obs" value={editedRowData.terr_obs || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.terr_obs}</TableCell>

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
            <FaUserPlus /> Incluir Novo Mapa
          </button>
        </Box>

      </Box>
      {/* Formulário de nova indicação */}
      <Box sx={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', display: showNewIndicationForm ? 'block' : 'none' }}>
        <form onSubmit={handleNewIndicationSubmit}>
          <Box sx={formBoxStyle}>
            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <TextField label="Código Mapa *" variant="outlined" size="small" fullWidth value={newIndication.terr_nome} onChange={(e) => setNewIndication({ ...newIndication, terr_nome: e.target.value })} sx={inputStyle} />
            </Box>
            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <TextField label="Morador *" variant="outlined" size="small" fullWidth value={newIndication.terr_morador} onChange={(e) => setNewIndication({ ...newIndication, terr_morador: e.target.value })} sx={inputStyle} />
            </Box>
            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <TextField label="Endereço do Surdo *" variant="outlined" size="small" fullWidth value={newIndication.terr_enderec} onChange={(e) => setNewIndication({ ...newIndication, terr_enderec: e.target.value })} sx={inputStyle} />
            </Box>
            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <TextField label="Bairro do Surdo*" variant="outlined" size="small" fullWidth value={newIndication.terr_regiao} onChange={(e) => setNewIndication({ ...newIndication, terr_regiao: e.target.value })} sx={inputStyle} />
            </Box>
            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <TextField label="Link Maps *" variant="outlined" size="small" fullWidth value={newIndication.terr_link} onChange={(e) => setNewIndication({ ...newIndication, terr_link: e.target.value })} sx={inputStyle} />
            </Box>
            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <TextField label="Coordenadas *" variant="outlined" size="small" fullWidth value={newIndication.terr_coord} onChange={(e) => setNewIndication({ ...newIndication, terr_coord: e.target.value })} sx={inputStyle} />
            </Box>
            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <FormControl fullWidth sx={inputStyle}>
                <InputLabel id="cormapa-label">Cor do Mapa: </InputLabel>
                <Select
                  labelId="cormapa-label"
                  id="cormapa"
                  value={newIndication.terr_cor}
                  label="Cor do Mapa *"
                  onChange={(e) => setNewIndication({ ...newIndication, terr_cor: e.target.value })}
                >
                  <MenuItem value="0">Azul</MenuItem>
                  <MenuItem value="1">Vermelho</MenuItem>
                  <MenuItem value="2">Verde</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <TableCell align="center">
                <FormControl fullWidth sx={inputStyle}>
                  <InputLabel id="vsituacao-label">Situação: </InputLabel>
                  <Select
                    labelId="vsituacao-label"
                    id="vsituacao"
                    value={newIndication.terr_status}
                    label="Situação *"
                    onChange={(e) => setNewIndication({ ...newIndication, terr_status: e.target.value })}
                  >
                    <MenuItem value="0">Ativo</MenuItem>
                    <MenuItem value="1">Revisita</MenuItem>
                    <MenuItem value="2">Estudante</MenuItem>
                    <MenuItem value="3">Doente</MenuItem>
                    <MenuItem value="4">Mudou</MenuItem>
                    <MenuItem value="5">Faleceu</MenuItem>
                    <MenuItem value="6">Nao Quer</MenuItem>
                    <MenuItem value="9">Outros</MenuItem>
                  </Select>
                </FormControl>
              </TableCell>
            </Box>

            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <TextField label="Detalhes e Referências " variant="outlined" size="small" fullWidth value={newIndication.terr_obs} onChange={(e) => setNewIndication({ ...newIndication, terr_obs: e.target.value })} sx={inputStyle} />
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
            > <FaShareSquare /> Enviar Mapa/Endereço</button>
          </Box>
        </form>
        {message && <Typography variant="body1" sx={{ color: message.includes('Erro') ? 'red' : 'green', marginTop: '10px' }}>{message}</Typography>}
      </Box>

    </Box>
  );
};

export default EnderecForm;
