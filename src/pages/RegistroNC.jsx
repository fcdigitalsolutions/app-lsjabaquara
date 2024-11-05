import React, { useState, useEffect } from 'react';
import api_service from '../services/api_service'; // Importando serviço da API
import { Box, Menu, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination, Button, TextField, Typography, MenuItem, Select, FormControl, Checkbox } from '@mui/material';
import { FaFileExport, FaUserPlus, FaShareSquare, FaChevronDown } from 'react-icons/fa';
import * as XLSX from 'xlsx'; // Importe a biblioteca XLSX

const RegistroNC = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10); // Limite de linhas por página
  const Data_Atual = new Date();

  const [editRowId, setEditRowId] = useState(null); // ID da linha sendo editada
  const [editedRowData, setEditedRowData] = useState({}); // Dados da linha sendo editada
  const [showNewIndicationForm, setShowNewIndicationForm] = useState(false); // Controla a exibição do formulário de nova indicação
  const [message, setMessage] = useState(''); // Mensagem de sucesso ou erro
  const [selected, setSelected] = useState([]);
  const [newIndication, setNewIndication] = useState({
    cod_regiao: '',
    //  enderec: '',
    obs: '',
  });

  const formatDateTime = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Adiciona zero se necessário
    const day = String(date.getDate()).padStart(2, '0');
    return `${day}/${month}/${year}`;
  };

  // Função para enviar a nova indicação
  const handleNewIndicationSubmit = async (e) => {
    e.preventDefault();

    // Verifica se todos os campos obrigatórios estão preenchidos
    const { cod_regiao, enderec, obs } = newIndication;
    if (!cod_regiao || !enderec || !obs) {
      setMessage('Por favor, preencha todos os campos obrigatórios.');
      return; // Impede o envio para a API
    }

    try {
      const defaultNumVisitas = 1;
      const defaultDtUltVisit = formatDateTime(Data_Atual); // Formato 'YYYY-MM-DD'
      const defaultDtInclu = formatDateTime(Data_Atual);

      // Faz uma requisição POST para a API
      const response = await api_service.post('/registnc', {
        data_inclu: defaultDtInclu,
        nome_publica: '', // Caso necessário, você pode preencher esse campo
        telefone: '', // Caso necessário
        cod_congreg: '', // Caso necessário
        num_visitas: defaultNumVisitas,
        dt_ult_visit: defaultDtUltVisit,
        cod_regiao: newIndication.cod_regiao,
        enderec: newIndication.enderec, // Envia o campo enderec corretamente
        obs: newIndication.obs, // Envia o campo obs corretamente
      });

      setData([...data, response.data]); // Adiciona a nova indicação aos dados
      setNewIndication({ cod_regiao: '', enderec: '', obs: '' }); // Limpa o formulário

      setMessage('Registro incluído com sucesso!');
    } catch (error) {
      console.error("Erro ao enviar as informações: ", error);
      setMessage('Erro ao incluir o registro.');
    }
  };

  // Função para obter a lista única de logradouros (enderec)
  const getUniqueEnderec = () => {
    const enderecosUnicos = [...new Set(data.map(row => row.enderec))];
    return enderecosUnicos;
  };

  // Função para obter a lista única de logradouros (enderec)
  const getUniqueRegiao = () => {
    const RegiaoUnicos = [...new Set(data.map(row => row.cod_regiao))];
    return RegiaoUnicos;
  };


  const [anchorEl, setAnchorEl] = useState(null);
  const [filterColumn, setFilterColumn] = useState(''); // Guarda a coluna sendo filtrada
  const [filters, setFilters] = useState({
    num_visitas: '',
    enderec: ''
  });

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

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClick = (event, column) => {
    setAnchorEl(event.currentTarget);
    setFilterColumn(column);
  };

  const handleFilterSelect = (value) => {
    setFilters({
      ...filters,
      [filterColumn]: value
    });
    handleClose(); // Fecha o menu
  };

  // Verifica se todas as linhas estão selecionadas
  const isAllSelected = selected.length === data.length;
  const totalPendentes = data.filter(item => item.num_visitas <= 1).length;
  const totalConcluidos = data.filter(item => item.num_visitas >= 2).length;
  const totalRegioes = new Set(data.map(item => item.cod_regiao)).size;

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
    if (num_visitas === 1) {
      return 'Pendente';
    } else if (num_visitas === 2) {
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

  // Dados filtrados com base nos filtros das colunas
  const filteredData = data.filter((row) => {
    return (
      (!filters.cod_regiao || row.cod_regiao === filters.cod_regiao) &&
      (!filters.num_visitas || row.num_visitas === filters.num_visitas) &&
      (!filters.enderec || row.enderec === filters.enderec)
    );
  });

  // Aplicar a paginação aos dados filtrados
  const paginatedData = filteredData.slice(startIndex, endIndex);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10)); // Atualiza o número de linhas por página
    setPage(0); // Reseta a página para a primeira sempre que mudar o número de linhas por página
  };

  // Função para exportar os dados filtrados para planilha
  const handleExport = () => {
    const exportData = filteredData.map(row => ({
      'Região/Bairro': row.cod_regiao,
      'Status': row.num_visitas === 2 ? 'Concluído' : 'Pendente',
      'Logradouro': row.enderec,
      'Números': row.obs,
      'Primeira Visita': row.data_inclu,
      'Última Visita': row.dt_ult_visit
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData); // Converte os dados para uma planilha
    const workbook = XLSX.utils.book_new(); // Cria um novo workbook (arquivo Excel)
    XLSX.utils.book_append_sheet(workbook, worksheet, "Registros NC"); // Adiciona a planilha

    // Exporta o arquivo Excel
    XLSX.writeFile(workbook, 'Registros_NC.xlsx');
  };

  return (
    <Box sx={{ padding: '16px', backgroundColor: 'rgb(255,255,255)', color: '#202038' }}>
      <h2 style={{ fontSize: '1.6rem', marginBottom: '16px' }}>Registro NC</h2>

      <Box sx={{ marginBottom: '16px', backgroundColor: 'white', padding: '16px', borderRadius: '8px' }}>
        <Box sx={{ backgroundColor: 'rgb(255, 255, 255)', borderRadius: '16px' }}>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1, // Reduzido o espaçamento
              justifyContent: 'space-between',
              '@media (max-width: 600px)': {
                flexDirection: 'column',
                alignItems: 'left'
              }
            }}
          >
            <Box sx={{ flex: 1, minWidth: '160px', maxWidth: '160px', height: '110px' }}>
              <Card sx={{ width: '100%', backgroundColor: '#202038', color: 'white' }}>
                <CardContent>
                  <Typography variant="h5" sx={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>Total de Registros</Typography> {/* Fonte ajustada */}
                  <Typography variant="h2" sx={{ fontSize: '1.8rem' }}>{data.length}</Typography>
                </CardContent>
              </Card>
            </Box>

            <Box sx={{ flex: 1, minWidth: '160px', maxWidth: '160px', height: '110px' }}>
              <Card sx={{ width: '100%', backgroundColor: '#202038', color: 'white' }}>
                <CardContent>
                  <Typography variant="h5" sx={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>Regiões Distintas</Typography> {/* Fonte ajustada */}
                  <Typography variant="h2" sx={{ fontSize: '1.8rem' }}>{totalRegioes}</Typography>
                </CardContent>
              </Card>
            </Box>

            <Box sx={{ flex: 1, minWidth: '160px', maxWidth: '160px', height: '110px' }}>
              <Card sx={{ width: '100%', backgroundColor: '#202038', color: 'white' }}>
                <CardContent>
                  <Typography variant="h5" sx={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>Registros Finalizados</Typography> {/* Fonte ajustada */}
                  <Typography variant="h2" sx={{ fontSize: '1.8rem' }}>{totalConcluidos}</Typography>
                </CardContent>
              </Card>
            </Box>

            <Box sx={{ flex: 1, minWidth: '160px', maxWidth: '160px', height: '110px' }}>
              <Card sx={{ width: '100%', backgroundColor: '#202038', color: 'white' }}>
                <CardContent>
                  <Typography variant="h5" sx={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>Registros Pendentes</Typography> {/* Fonte ajustada */}
                  <Typography variant="h2" sx={{ fontSize: '1.8rem' }}>{totalPendentes}</Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>

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
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Região/Bairro
                    <FaChevronDown onClick={(event) => handleClick(event, 'cod_regiao')} />
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Status
                    <FaChevronDown onClick={(event) => handleClick(event, 'num_visitas')} />
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Logradouro
                    <FaChevronDown onClick={(event) => handleClick(event, 'enderec')} />
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Números</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Primeira Visita</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Última Visita</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Ações</TableCell>
                </TableRow>
                {/* Menu suspenso para filtros */}
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                >

                  {filterColumn === 'cod_regiao' && (
                    <>
                      <MenuItem onClick={() => handleFilterSelect('')}>Todos</MenuItem>
                      {/* Gerar dinamicamente os logradouros únicos */}
                      {getUniqueRegiao().map((cod_regiao) => (
                        <MenuItem key={cod_regiao} onClick={() => handleFilterSelect(cod_regiao)}>
                          {cod_regiao}
                        </MenuItem>
                      ))}
                    </>
                  )}

                  {filterColumn === 'num_visitas' && (
                    <>
                      <MenuItem onClick={() => handleFilterSelect('')}>Todos</MenuItem>
                      <MenuItem onClick={() => handleFilterSelect(2)}>Concluído</MenuItem>
                      <MenuItem onClick={() => handleFilterSelect(1)}>Pendente</MenuItem>
                    </>
                  )}

                  {filterColumn === 'enderec' && (
                    <>
                      <MenuItem onClick={() => handleFilterSelect('')}>Todos</MenuItem>
                      {/* Gerar dinamicamente os logradouros únicos */}
                      {getUniqueEnderec().map((enderec) => (
                        <MenuItem key={enderec} onClick={() => handleFilterSelect(enderec)}>
                          {enderec}
                        </MenuItem>
                      ))}
                    </>
                  )}
                </Menu>
              </TableHead>
              <TableBody>
                {paginatedData.map((row) => {
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
                              value={editedRowData.num_visitas || ' '}
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
                      <TableCell align="center">{isEditing ? <TextField name="data_inclu" value={editedRowData.data_inclu || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.data_inclu}</TableCell>
                      <TableCell align="center">{isEditing ? <TextField name="dt_ult_visit" value={editedRowData.dt_ult_visit || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.dt_ult_visit}</TableCell>
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
            rowsPerPageOptions={[5, 10, 25]} // Caso queira outras opções
            component="div"
            count={filteredData.length} // Número total de linhas após filtragem
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage} // Função para mudar o número de linhas por página
            labelRowsPerPage="Linhas por página:" // Texto personalizado
            sx={{
              '& .MuiTablePagination-toolbar': { fontSize: '0.80rem' },
              '& .MuiTablePagination-selectRoot': { fontSize: '0.80rem' },
              '& .MuiTablePagination-displayedRows': { fontSize: '0.80rem' },
            }}
          />
          <p>
            {/* Botão de exportação */}
            <Button
              variant="contained"
              color="primary"
              onClick={handleExport}
              style={{
                ...buttonStyle,
                fontSize: '0.60rem',
              }}
            >
              <FaFileExport style={{ marginRight: '8px' }} /> Exportar Planilha
            </Button>
          </p><br></br>

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
              <TextField
                label="Região/Bairro *"
                variant="outlined"
                size="small"
                fullWidth
                value={newIndication.cod_regiao}
                onChange={(e) => setNewIndication({ ...newIndication, cod_regiao: e.target.value })} // Atualiza o campo cod_regiao
              />
            </Box>
            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <TextField
                label="Informe a Rua/Av/Trav/ *"
                variant="outlined"
                size="small"
                fullWidth
                value={newIndication.enderec}
                onChange={(e) => setNewIndication({ ...newIndication, enderec: e.target.value })} // Atualiza o campo enderec
              />
            </Box>
            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <TextField
                label="Numeros exemp: 1234 / 34553 / 34344 *"
                variant="outlined"
                size="small"
                fullWidth
                value={newIndication.obs}
                onChange={(e) => setNewIndication({ ...newIndication, obs: e.target.value })} // Atualiza o campo obs
              />
            </Box>
          </Box>
          <Box sx={{ marginTop: '20px' }}>
            <button
              type="submit"
              style={{
                padding: '4px 12px',
                fontSize: '0.80rem',
                backgroundColor: '#202038',
                color: '#f1f1f1',
                borderRadius: '4px',
                transition: 'background-color 0.2s ease',
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

