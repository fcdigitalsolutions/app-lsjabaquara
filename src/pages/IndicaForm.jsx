import React, { useState, useEffect } from 'react';
import api_service from '../services/api_service'; // Importando serviço da API
import InputMask from 'react-input-mask';
import { Box, Menu, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Card, CardContent, Paper, TablePagination, Button, TextField, Typography, MenuItem, Select, FormControl, Checkbox } from '@mui/material';
import { FaChevronDown, FaFileExport, FaUserPlus, FaShareSquare } from 'react-icons/fa';
import * as XLSX from 'xlsx'; // Importe a biblioteca XLSX

const IndicaForm = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [editRowId, setEditRowId] = useState(null); // ID da linha sendo editada
  const [editedRowData, setEditedRowData] = useState({}); // Dados da linha sendo editada
  const [showNewIndicationForm, setShowNewIndicationForm] = useState(false); // Controla a exibição do formulário de nova indicação
  const [message, setMessage] = useState(''); // Mensagem de sucesso ou erro
  const [selected, setSelected] = useState([]);
  const totalPendentes = data.filter(item => item.num_visitas <= 1).length;
  const totalConcluidos = data.filter(item => item.num_visitas >= 2).length;
  const totalRegioes = new Set(data.map(item => item.cod_regiao)).size;
  const [rowsPerPage, setRowsPerPage] = useState(10); // Limite de linhas por página

  const [newIndication, setNewIndication] = useState({
    nome_publica: '',
    num_contato: '',
    cod_congreg: '',
    cod_regiao: '',
    enderec: '',
    origem: '',
    obs: ''
  });

  const [anchorEl, setAnchorEl] = useState(null);
  const [filterColumn, setFilterColumn] = useState(''); // Guarda a coluna sendo filtrada
  const [filters, setFilters] = useState({
    num_visitas: '',
    enderec: ''
  });

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

  useEffect(() => {
    api_service.get('/indicaall')
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

    const { nome_publica, end_confirm, num_contato, cod_congreg, enderec } = newIndication;

    if (!nome_publica || !end_confirm || !num_contato || !cod_congreg || !enderec) {
      setMessage('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      const response = await api_service.post('/indica', newIndication);
      setData([...data, response.data]); // Adiciona a nova indicação aos dados
      setNewIndication({ nome_publica: '', end_confirm: '', num_contato: '', cod_congreg: '', cod_regiao: '', enderec: '', origem: '', obs: '' }); // Limpa o formulário
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


 // Função para determinar a cor de fundo da célula com base no status
 const getStatusMPExist = (map_exist) => {
  switch (map_exist) {
    case '0':
      return 'Pendente';
    case '1':
      return 'Mapa Já Existe';
    default:
      return 'Outros';
  }
};
    // Função para determinar a cor de fundo da célula com base no status
    const getStatusColorMPExist = (status) => {
      switch (status) {
        case 'Pendente':
          return 'transparent';
        case 'Mapa Já Existe':
          return '#00009C';
        default:
          return 'transparent';
      }
    };
  // Função para determinar o status com base na confirmação do endereço
  const getStatus = (end_confirm) => {
    if (end_confirm === '2') {
      return 'Confirmado';
    } else if (end_confirm ?? '2') {
      return 'Pendente';
    }
    return 'Desconhecido'; // Fallback para casos inesperados
  };

  // Função para determinar a cor de fundo da célula com base no status
  const getStatusColor = (status) => {
    switch (status) {
      case 'Pendente':
        return 'green';
      case 'Confirmado':
        return '#202038';
      default:
        return 'transparent';
    }
  };

  // Função para determinar o status com base na confirmação do endereço
  const getStatusTpLocal = (indic_tp_local) => {
    if (indic_tp_local === '1') {
      return 'Residência';
    } else if (indic_tp_local === '2') {
      return 'Comércio';
    }else if (indic_tp_local === '3') {
      return 'Condomínio';
    }
    return 'Desconhecido'; // Fallback para casos inesperados
  };

  // Função para determinar a cor de fundo da célula com base no status
  const getStatusColorTpLocal = (status) => {
    switch (status) {
      case 'Residência':
        return '#007FFF';
      case 'Comércio':
        return '#8B4513';
        case 'Condomínio':
          return '#42426F';
      default:
        return 'transparent';
    }
  };

  // Função para determinar o status com base na confirmação do endereço
  const getStatusDesig = (indic_desig) => {
    if (indic_desig === '1') {
      return 'Não';
    } else if (indic_desig === '2') {
      return 'Sim';
    }
    return 'Desconhecido'; // Fallback para casos inesperados
  };

  // Função para determinar a cor de fundo da célula com base no status
  const getStatusColorDesig = (status) => {
    switch (status) {
      case 'Não':
        return '#EBC79E';
      case 'Sim':
        return '#5C3317';
      default:
        return 'transparent';
    }
  };

  // Função para iniciar a edição de uma linha
  const handleAbreMapa = (row) => {
    window.open(row, '_blank'); // Abre o link em uma nova aba
  };

  // Dados filtrados com base nos filtros das colunas
  const filteredData = data.filter((row) => {
    return (
      (!filters.end_confirm || row.end_confirm === filters.end_confirm) &&
      (!filters.indic_desig || row.indic_desig === filters.indic_desig) &&
      (!filters.indic_tp_local || row.indic_tp_local === filters.indic_tp_local) &&
      (!filters.nome_publica || row.nome_publica === filters.nome_publica) &&
      (!filters.cod_congreg || row.cod_congreg === filters.cod_congreg)
    );
  });

  // Aplicar a paginação aos dados filtrados
  const paginatedData = filteredData.slice(startIndex, endIndex);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10)); // Atualiza o número de linhas por página
    setPage(0); // Reseta a página para a primeira sempre que mudar o número de linhas por página
  };

  // Função para obter a lista única de logradouros (enderec)
  const getUniquePublicad = () => {
    const PublicadUnicos = [...new Set(data.map(row => row.nome_publica))];
    return PublicadUnicos;
  };

  // Função para obter a lista única de logradouros (enderec)
  const getUniqueCongreg = () => {
    const CongregUnicos = [...new Set(data.map(row => row.cod_congreg))];
    return CongregUnicos;
  };

  // Função para exportar os dados filtrados para planilha
  const handleExport = () => {
    const exportData = filteredData.map(row => ({
      'Endereço': row.enderec,
      'Detalhes': row.obs,
      'Link Mapa': row.indic_url_map,
      'Status': row.end_confirm === '2' ? 'Confirmado' : 'Pendente',
      'Designado?': row.indic_desig === '2' ? 'Sim' : 'Não',
      'Tipo de Local': row.indic_tp_local === '2' ? 'Comércio' : 'Residência',
      'Data': row.data_inclu,
      'Publicador': row.nome_publica,
      'Contato': row.num_contato,
      'Congregação': row.cod_congreg
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData); // Converte os dados para uma planilha
    const workbook = XLSX.utils.book_new(); // Cria um novo workbook (arquivo Excel)
    XLSX.utils.book_append_sheet(workbook, worksheet, "Indicações Surdo"); // Adiciona a planilha

    // Exporta o arquivo Excel
    XLSX.writeFile(workbook, 'Indicações_Surdo.xlsx');
  };


  return (
    <Box sx={{ padding: '16px', backgroundColor: 'rgb(255,255,255)', color: '#202038' }}>
      <h2 style={{ fontSize: '1.6rem', marginBottom: '16px' }}>Indicações de Surdos</h2>

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
                  <Typography variant="h5" sx={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                    Total de Registros
                  </Typography>
                  <Typography variant="h2" sx={{ fontSize: '1.8rem' }}>{data.length}</Typography>
                </CardContent>
              </Card>
            </Box>

            <Box sx={{ flex: 1, minWidth: '160px', maxWidth: '160px', height: '110px' }}>
              <Card sx={{ width: '100%', backgroundColor: '#202038', color: 'white' }}>
                <CardContent>
                  <Typography variant="h5" sx={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                    Congregações
                  </Typography>
                  <Typography variant="h2" sx={{ fontSize: '1.8rem' }}>{totalRegioes}</Typography>
                </CardContent>
              </Card>
            </Box>

            <Box sx={{ flex: 1, minWidth: '160px', maxWidth: '160px', height: '110px' }}>
              <Card sx={{ width: '100%', backgroundColor: '#202038', color: 'white' }}>
                <CardContent>
                  <Typography variant="h5" sx={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                    Indicações Confirmadas
                  </Typography>
                  <Typography variant="h2" sx={{ fontSize: '1.8rem' }}>{totalConcluidos}</Typography>
                </CardContent>
              </Card>
            </Box>

            <Box sx={{ flex: 1, minWidth: '160px', maxWidth: '160px', height: '110px' }}>
              <Card sx={{ width: '100%', backgroundColor: '#202038', color: 'white' }}>
                <CardContent>
                  <Typography variant="h5" sx={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                    Indicações Pendentes
                  </Typography>
                  <Typography variant="h2" sx={{ fontSize: '1.8rem' }}>{totalPendentes}</Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>

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
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Endereço</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Detalhes</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Link Map</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Confirmado?
                    <FaChevronDown onClick={(event) => handleClick(event, 'end_confirm')} />
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Mapa Designado?
                    <FaChevronDown onClick={(event) => handleClick(event, 'indic_desig')} />
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Tipo de Local
                    <FaChevronDown onClick={(event) => handleClick(event, 'indic_tp_local')} />
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Data</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Publicador
                    <FaChevronDown onClick={(event) => handleClick(event, 'nome_publica')} />
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Contato</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Congregação
                    <FaChevronDown onClick={(event) => handleClick(event, 'cod_congreg')} />
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Ações</TableCell>
                </TableRow>
                {/* Menu suspenso para filtros */}
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                >
                  {filterColumn === 'end_confirm' && (
                    <>
                      <MenuItem onClick={() => handleFilterSelect('')}>Todos</MenuItem>
                      <MenuItem onClick={() => handleFilterSelect('2')}>Confirmado</MenuItem>
                      <MenuItem onClick={() => handleFilterSelect()}>Pendente</MenuItem>
                    </>
                  )}
                  {filterColumn === 'indic_desig' && (
                    <>
                      <MenuItem onClick={() => handleFilterSelect('')}>Todos</MenuItem>
                      <MenuItem onClick={() => handleFilterSelect('1')}>Não</MenuItem>
                      <MenuItem onClick={() => handleFilterSelect('2')}>Sim</MenuItem>
                    </>
                  )}

                  {filterColumn === 'indic_tp_local' && (
                    <>
                      <MenuItem onClick={() => handleFilterSelect('')}>Todos</MenuItem>
                      <MenuItem onClick={() => handleFilterSelect('1')}>Residência</MenuItem>
                      <MenuItem onClick={() => handleFilterSelect('2')}>Comércio</MenuItem>
                      <MenuItem onClick={() => handleFilterSelect('3')}>Condomínio</MenuItem>
                    </>
                  )}

                  {filterColumn === 'nome_publica' && (
                    <>
                      <MenuItem onClick={() => handleFilterSelect('')}>Todos</MenuItem>
                      {/* Gerar dinamicamente os nome de publicador únicos */}
                      {getUniquePublicad().map((nome_publica) => (
                        <MenuItem key={nome_publica} onClick={() => handleFilterSelect(nome_publica)}>
                          {nome_publica}
                        </MenuItem>
                      ))}
                    </>
                  )}
                  {filterColumn === 'cod_congreg' && (
                    <>
                      <MenuItem onClick={() => handleFilterSelect('')}>Todos</MenuItem>
                      {/* Gerar dinamicamente as congregações únicos */}
                      {getUniqueCongreg().map((cod_congreg) => (
                        <MenuItem key={cod_congreg} onClick={() => handleFilterSelect(cod_congreg)}>
                          {cod_congreg}
                        </MenuItem>
                      ))}
                    </>
                  )}
                </Menu>
              </TableHead>
              <TableBody>
                {paginatedData.map((row) => {
                  const isEditing = row.id === editRowId;
                  const status = getStatus(row.end_confirm);
                  const statusDsg = getStatusDesig(row.indic_desig);
                  const statusTploc = getStatusTpLocal(row.indic_tp_local);
                  const statusMapExist = getStatusMPExist(row.map_exist);
                  

                  return (
                    <TableRow key={row.id}>
                      <TableCell TableCell align="center">
                        <Checkbox
                          checked={isSelected(row.id)}
                          onChange={() => handleSelect(row.id)}
                        />
                      </TableCell>

                      <TableCell align="center">{isEditing ? <TextField name="enderec" value={editedRowData.enderec || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.enderec}
                      <div
                            style={{
                              backgroundColor: getStatusColorMPExist(statusMapExist),
                              color: 'white',
                              padding: '2px',
                              borderRadius: '4px',
                              textAlign: 'center',
                              fontSize: '0.65rem',
                            }}
                          >
                            {statusMapExist}
                          </div>
                      </TableCell>
                      <TableCell align="center">{isEditing ? <TextField name="obs" value={editedRowData.obs || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.obs}</TableCell>
                      <TableCell align="center">{isEditing ? <TextField name="indic_url_map" value={editedRowData.indic_url_map || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.indic_url_map}
                        <Button variant="contained" color="primary" size="small" onClick={() => handleAbreMapa(row.indic_url_map)} sx={{ fontSize: '0.55rem', padding: '2px 5px' }}>Abrir Mapa</Button>
                      </TableCell>

                      {/* Campo editável de end. confirmado */}
                      <TableCell align="center">
                        {isEditing ? (
                          <FormControl fullWidth>
                            <Select
                              name="end_confirm"
                              value={editedRowData.end_confirm || '1'}
                              onChange={handleInputChange}
                            >
                              <MenuItem value="1">Pendente</MenuItem>
                              <MenuItem value="2">Confirmado</MenuItem>
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

                      {/* Campo editável de Terr. Designado */}
                      <TableCell align="center">
                        {isEditing ? (
                          <FormControl fullWidth>
                            <Select
                              name="indic_desig"
                              value={editedRowData.indic_desig || '1'}
                              onChange={handleInputChange}
                            >
                              <MenuItem value="1">Não</MenuItem>
                              <MenuItem value="2">Sim</MenuItem>
                            </Select>
                          </FormControl>
                        ) : (
                          <div
                            style={{
                              backgroundColor: getStatusColorDesig(statusDsg),
                              color: 'white',
                              padding: '2px',
                              borderRadius: '4px',
                              textAlign: 'center',
                              fontSize: '0.65rem',
                            }}
                          >
                            {statusDsg}
                          </div>
                        )}
                      </TableCell>
                      {/* Campo editável Tipo do território */}
                      <TableCell align="center">
                        {isEditing ? (
                          <FormControl fullWidth>
                            <Select
                              name="indic_tp_local"
                              value={editedRowData.indic_tp_local || '1'}
                              onChange={handleInputChange}
                            >
                              <MenuItem value="1">Residência</MenuItem>
                              <MenuItem value="2">Comércio</MenuItem>
                              <MenuItem value="3">Condomínio</MenuItem>
                            </Select>
                          </FormControl>
                        ) : (
                          <div
                            style={{
                              backgroundColor: getStatusColorTpLocal(statusTploc),
                              color: 'white',
                              padding: '2px',
                              borderRadius: '4px',
                              textAlign: 'center',
                              fontSize: '0.65rem',
                            }}
                          >
                            {statusTploc}
                          </div>
                        )}
                      </TableCell>
                      <TableCell align="center">{isEditing ? <TextField name="data_inclu" value={editedRowData.data_inclu || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.data_inclu}</TableCell>
                      <TableCell align="center">{isEditing ? <TextField name="nome_publica" value={editedRowData.nome_publica || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.nome_publica}</TableCell>
                      <TableCell align="center">{isEditing ? <TextField name="num_contato" value={editedRowData.num_contato || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.num_contato}</TableCell>
                      <TableCell align="center">{isEditing ? <TextField name="cod_congreg" value={editedRowData.cod_congreg || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.cod_congreg}</TableCell>
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
            <FaUserPlus /> Nova Indicação
          </button>
        </Box>
      </Box>

      {/* Formulário de nova indicação */}
      <Box sx={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', display: showNewIndicationForm ? 'block' : 'none' }}>
        <form onSubmit={handleNewIndicationSubmit}>
          <Box sx={formBoxStyle}>
            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <TextField label="Seu Nome *" variant="outlined" size="small" fullWidth value={newIndication.nome_publica} onChange={(e) => setNewIndication({ ...newIndication, nome_publica: e.target.value })} sx={inputStyle} />
            </Box>
            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <InputMask mask="(99) 99999-9999" value={newIndication.num_contato} onChange={(e) => setNewIndication({ ...newIndication, num_contato: e.target.value })}>
                {(inputProps) => <TextField {...inputProps} label="Seu Telefone *" variant="outlined" size="small" fullWidth sx={inputStyle} />}
              </InputMask>
            </Box>
            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <TextField label="Sua Congregação *" variant="outlined" size="small" fullWidth value={newIndication.cod_congreg} onChange={(e) => setNewIndication({ ...newIndication, cod_congreg: e.target.value })} sx={inputStyle} />
            </Box>
            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <TextField label="Bairro do Surdo*" variant="outlined" size="small" fullWidth value={newIndication.cod_regiao} onChange={(e) => setNewIndication({ ...newIndication, cod_regiao: e.target.value })} sx={inputStyle} />
            </Box>
            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <TextField label="Endereço do Surdo *" variant="outlined" size="small" fullWidth value={newIndication.enderec} onChange={(e) => setNewIndication({ ...newIndication, enderec: e.target.value })} sx={inputStyle} />
            </Box>
            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <TextField label="Detalhes e Referências " variant="outlined" size="small" fullWidth value={newIndication.obs} onChange={(e) => setNewIndication({ ...newIndication, obs: e.target.value })} sx={inputStyle} />
            </Box>
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
            > <FaShareSquare /> Enviar Indicação</button>
          </Box>
        </form>
        {message && <Typography variant="body1" sx={{ color: message.includes('Erro') ? 'red' : 'green', marginTop: '10px' }}>{message}</Typography>}
      </Box >
    </Box >
  );
};

export default IndicaForm;
