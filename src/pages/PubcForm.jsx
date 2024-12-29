import React, { useState, useEffect } from 'react';
import api_service from '../services/api_service'; // Importando serviço da API
import { useNavigate } from 'react-router-dom'; // Importe o useNavigate
import InputMask from 'react-input-mask';
import { Box, Card, CardContent, Menu, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination, Button, TextField, Typography, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { FaChartPie, FaUserPlus, FaShareSquare, FaChevronDown, FaFileExport } from 'react-icons/fa';
import * as XLSX from 'xlsx'; // Importe a biblioteca XLSX

const PubcForm = () => {
  const [data, setData] = useState([]);
  const navigate = useNavigate(); // Use o useNavigate
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10); // Limite de linhas por página
  const [editRowId, setEditRowId] = useState(null); // ID da linha sendo editada
  const [editedRowData, setEditedRowData] = useState({}); // Dados da linha sendo editada
  const [shownewPublicadForm, setShownewPublicadForm] = useState(false); // Controla a exibição do formulário de nova indicação
  const [message, setMessage] = useState(''); // Mensagem de sucesso ou erro
  const Data_Atual = new Date();

  const formatDateTime = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Adiciona zero se necessário
    const day = String(date.getDate()).padStart(2, '0');
    return `${day}/${month}/${year}`;
  };

  const defaultDtInclu = formatDateTime(Data_Atual);

  // Totalizando os CARDs 
  const totalPionerAux = data.filter(item => (item.desig_campo === '1')).length;
  const totalPionerReg = data.filter(item => item.desig_campo === '2').length;
  const totalServos = data.filter(item => item.desig_servic === '2').length;
  const totalAnciaos = data.filter(item => item.desig_servic === '3').length;
  const totalInativos = data.filter(item => item.pub_status === '1').length;

  // Cálculo do índice inicial e final das linhas a serem exibidas
  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;


  const [newPublicad, setnewPublicad] = useState({
    data_inclu: defaultDtInclu,
    pub_nome: '',
    pub_contat: '',
    pub_login: '',
    pub_email: '',
    pub_endereco: '',
    pub_regiao: '',
    pub_uf: '',
    pub_dtbatism: '',
    pub_dtnasc: '',
    desig_servic: '',
    desig_campo: '',
    pub_status: '',
    resp_obs: '',
  });

  useEffect(() => {
    api_service.get('/pubcall')
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        console.error("Erro ao buscar os dados: ", error);
      });
  }, []);

  const [anchorEl, setAnchorEl] = useState(null);
  const [filterColumn, setFilterColumn] = useState(''); // Guarda a coluna sendo filtrada
  const [filters, setFilters] = useState({
    pub_status: '',
    desig_servic: '',
    desig_campo: ''
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

  // Dados filtrados com base nos filtros das colunas
  const filteredData = data.filter((row) => {
    return (
      (!filters.pub_status || row.pub_status === filters.pub_status) &&
      (!filters.desig_servic || row.desig_servic === filters.desig_servic) &&
      (!filters.desig_campo || row.desig_campo === filters.desig_campo)

    );
  });

  // Aplicar a paginação aos dados filtrados
  const paginatedData = filteredData.slice(startIndex, endIndex);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10)); // Atualiza o número de linhas por página
    setPage(0); // Reseta a página para a primeira sempre que mudar o número de linhas por página
  };

  // Função para redirecionar ao dashboard
  const handleRetornaDash = () => {
    navigate('/home/dash-pubc'); // Navegue para a rota definida
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
      await api_service.put(`/pubc/${editedRowData.id}`, editedRowData); // Atualiza os dados no backend
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
        await api_service.delete(`/pubc/${id}`); // Envia a solicitação de exclusão para a API
        setData(data.filter(row => row.id !== id)); // Remove o registro excluído do estado local
      } catch (error) {
        console.error("Erro ao excluir os dados: ", error);
        console.error("Erro ao excluir os dados: ", id);
      }
    }
  };

  // Função para mostrar/esconder o formulário de nova indicação
  const handleNovoBotao = () => {
    setShownewPublicadForm(!shownewPublicadForm); // Alterna entre mostrar ou esconder o formulário
  };


  // Função para enviar novo registro
  const handlenewPublicadSubmit = async (e) => {
    e.preventDefault();

    try {

      const response = await api_service.post('/pubc', newPublicad);
      setData([...data, response.data]); // Adiciona um novo Publicador aos dados
      setnewPublicad({ pub_nome: '', pub_contat: '', pub_login: '', pub_email: '', pub_endereco: '', pub_regiao: '', pub_uf: '', pub_dtbatism: '', pub_dtnasc: '', desig_servic: '', desig_campo: '', pub_status: '', resp_obs: '' }); // Limpa o formulário

      setMessage('Publicador incluído com sucesso!');
    } catch (error) {
      console.error("Erro ao enviar as informações: ", error);
      setMessage('Erro ao incluir o Publicador.');
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
  const getStatus = (pub_status) => {
    switch (pub_status) {
      case '0':
        return 'Ativo';
      case '1':
        return 'Inativo';
      default:
        return 'Outros';
    }
  };

  // Função para determinar a cor de fundo da célula com base no status
  const getStatusColor = (status) => {
    switch (status) {
      case 'Ativo':
        return '#32CD32';
      case 'Inativo':
        return '#A9A9A9';
      default:
        return 'transparent';
    }
  };

  // Função para determinar o status com base no número de visitas
  const getStatusDesgServ = (desig_servic) => {
    switch (desig_servic) {
      case '0':
        return 'Estudante';
      case '1':
        return 'Publicador Batizado';
      case '2':
        return 'Servo Ministerial';
      case '3':
        return 'Ancião';
      default:
        return 'Outros';
    }
  };

  // Função para determinar a cor de fundo da célula com base no status
  const getStatusColorDesgServ = (status) => {
    switch (status) {
      case 'Estudante':
        return '#FFA500';
      case 'Publicador Batizado':
        return '#32CD32';
      case 'Servo Ministerial':
        return '#6A5ACD';
      case 'Ancião':
        return '#8B4513';
      default:
        return 'transparent';
    }
  };


  // Função para determinar o status com base no número de visitas
  const getStatusDesgCamp = (desig_campo) => {
    switch (desig_campo) {
      case '0':
        return 'Publicador';
      case '1':
        return 'Pioneiro Auxiliar';
      case '2':
        return 'Pioneiro Regular';
      case '3':
        return 'Pioneiro Especial';
      case '4':
          return 'Pioneiro Auxiliar (Campanha)';
      default:
        return 'Outros';
    }
  };

  // Função para determinar a cor de fundo da célula com base no status
  const getStatusColorDesgCamp = (status) => {
    switch (status) {
      case 'Publicador':
        return '#FFA500';
      case 'Pioneiro Auxiliar':
        return '#32CD32';
      case 'Pioneiro Regular':
        return '#6A5ACD';
      case 'Pioneiro Especial':
        return '#8B4513';
      default:
        return 'transparent';
    }
  };

  // Função para exportar os dados filtrados para planilha
  const handleExport = () => {
    const exportData = filteredData.map(row => ({
      'Publicador': row.pub_nome,
      'Contato': row.pub_contat,
      'Status?': getStatus(row.pub_status),
      'Login': row.pub_login,
      'Email': row.pub_email,
      'ID Publicador': row.pub_id_publica,
      'Endereço': row.pub_endereco,
      'Região': row.pub_regiao,
      'UF': row.pub_uf,
      'Dt. Nasc': row.pub_dtnasc,
      'Dt. Batismo': row.pub_dtbatism,
      'Desig. Serv?': getStatusDesgServ(row.desig_servic),
      'Desig. Campo?': getStatusDesgCamp(row.desig_campo),
      'OBS': row.data_inclu,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData); // Converte os dados para uma planilha
    const workbook = XLSX.utils.book_new(); // Cria um novo workbook (arquivo Excel)
    XLSX.utils.book_append_sheet(workbook, worksheet, "Relação de Publicadores"); // Adiciona a planilha

    // Exporta o arquivo Excel
    XLSX.writeFile(workbook, 'Relação_Publicadores.xlsx');
  };


  return (
    <Box sx={{ padding: '16px', backgroundColor: 'rgb(255,255,255)', color: '#202038' }}>
      <h2 style={{ fontSize: '1.6rem', marginBottom: '16px' }}>Manutenção dos Publicadores</h2>
      <Box sx={{ padding: '16px', backgroundColor: 'rgb(255,255,255)', color: '#202038' }}>  </Box>
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
                Total de Publicadores
              </Typography>
              <Typography variant="h2" sx={{ fontSize: '1.8rem' }}>{data.length}</Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: 1, minWidth: '160px', maxWidth: '160px', height: '110px' }}>
          <Card sx={{ width: '100%', backgroundColor: '#A9A9A9', color: 'white' }}>
            <CardContent>
              <Typography variant="h5" sx={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                Total Inativos
              </Typography>
              <Typography variant="h2" sx={{ fontSize: '1.8rem' }}>{totalInativos}</Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: 1, minWidth: '160px', maxWidth: '160px', height: '110px' }}>
          <Card sx={{ width: '100%', backgroundColor: '#6A5ACD', color: 'white' }}>
            <CardContent>
              <Typography variant="h5" sx={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                Pioneiros Regulares
              </Typography>
              <Typography variant="h2" sx={{ fontSize: '1.8rem' }}>{totalPionerReg}</Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: 1, minWidth: '160px', maxWidth: '160px', height: '110px' }}>
          <Card sx={{ width: '100%', backgroundColor: '#32CD32', color: 'white' }}>
            <CardContent>
              <Typography variant="h5" sx={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                Pioneiros Auxiliares
              </Typography>
              <Typography variant="h2" sx={{ fontSize: '1.8rem' }}>{totalPionerAux}</Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: 1, minWidth: '160px', maxWidth: '160px', height: '110px' }}>
          <Card sx={{ width: '100%', backgroundColor: '#6A5ACD', color: 'white' }}>
            <CardContent>
              <Typography variant="h5" sx={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                Servos Ministeriais
              </Typography>
              <Typography variant="h2" sx={{ fontSize: '1.8rem' }}>{totalServos}</Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: 1, minWidth: '160px', maxWidth: '160px', height: '110px' }}>
          <Card sx={{ width: '100%', backgroundColor: '#8B4513', color: 'white' }}>
            <CardContent>
              <Typography variant="h5" sx={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                Anciãos
              </Typography>
              <Typography variant="h2" sx={{ fontSize: '1.8rem' }}>{totalAnciaos}</Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>
      {/* Box separado para a tabela */}
      <Box sx={{ marginBottom: '16px', backgroundColor: 'white', padding: '16px', borderRadius: '8px' }}>
        <Box sx={{ backgroundColor: 'rgb(255, 255, 255)', borderRadius: '16px' }}>
          {/* Botão Dashboard Publicadores */}
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
            <FaChartPie />  DashBoard Publicadores
          </button>

          <TableContainer component={Paper} sx={{ marginTop: '10px' }}>
            <Table>
              <TableHead>

                <TableRow>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Publicador</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Contato</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Status
                    <FaChevronDown onClick={(event) => handleClick(event, 'pub_status')} />
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Login</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Email</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>ID Publicador</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Endereço</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Região</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>UF</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Nascimento</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Batismo</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Desig. Serviço
                    <FaChevronDown onClick={(event) => handleClick(event, 'desig_servic')} />
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Desig. Campo
                    <FaChevronDown onClick={(event) => handleClick(event, 'desig_campo')} />
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Obs Respon.</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Ações</TableCell>
                </TableRow>
                {/* Menu suspenso para filtros */}
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                >
                  {filterColumn === 'pub_status' && (
                    <>
                      <MenuItem onClick={() => handleFilterSelect('')}>Todos</MenuItem>
                      <MenuItem onClick={() => handleFilterSelect('0')}>Ativo</MenuItem>
                      <MenuItem onClick={() => handleFilterSelect('1')}>Inativo</MenuItem>
                      <MenuItem onClick={() => handleFilterSelect('2')}>Outros</MenuItem>
                    </>
                  )}
                  {filterColumn === 'desig_servic' && (
                    <>
                      <MenuItem onClick={() => handleFilterSelect('')}>Todos</MenuItem>
                      <MenuItem onClick={() => handleFilterSelect('0')}>Estudante</MenuItem>
                      <MenuItem onClick={() => handleFilterSelect('1')}>Publicador Batizado</MenuItem>
                      <MenuItem onClick={() => handleFilterSelect('2')}>Servo Ministerial</MenuItem>
                      <MenuItem onClick={() => handleFilterSelect('3')}>Ancião</MenuItem>
                    </>
                  )}

                  {filterColumn === 'desig_campo' && (
                    <>
                      <MenuItem onClick={() => handleFilterSelect('')}>Todos</MenuItem>
                      <MenuItem onClick={() => handleFilterSelect('0')}>Publicador</MenuItem>
                      <MenuItem onClick={() => handleFilterSelect('1')}>Pioneiro Auxiliar</MenuItem>
                      <MenuItem onClick={() => handleFilterSelect('2')}>Pioneiro Regular</MenuItem>
                      <MenuItem onClick={() => handleFilterSelect('3')}>Pioneiro Especial</MenuItem>
                      <MenuItem onClick={() => handleFilterSelect('4')}>Pioneiro Auxiliar (Campanha)</MenuItem>
                    </>
                  )}
                </Menu>
              </TableHead>
              <TableBody>
                {paginatedData.map((row) => {
                  const isEditing = row.id === editRowId;
                  const status = getStatus(row.pub_status);
                  const statusDesgServ = getStatusDesgServ(row.desig_servic);
                  const statusDesgCamp = getStatusDesgCamp(row.desig_campo);
                  return (
                    <TableRow key={row.id}>

                      <TableCell align="center">{isEditing ? <TextField name="pub_nome" value={editedRowData.pub_nome || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.pub_nome}</TableCell>
                      <TableCell align="center">{isEditing ? <TextField name="pub_contat" value={editedRowData.pub_contat || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.pub_contat}</TableCell>

                      {/* Campo editável de status */}
                      <TableCell align="center">
                        {isEditing ? (
                          <FormControl fullWidth>
                            <Select
                              name="pub_status"
                              value={editedRowData.pub_status || ' '}
                              onChange={handleInputChange}
                            >
                              <MenuItem value="0">Ativo</MenuItem>
                              <MenuItem value="1">Inativo</MenuItem>
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
                      <TableCell align="center">{isEditing ? <TextField name="pub_login" value={editedRowData.pub_login || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.pub_login}</TableCell>
                      <TableCell align="center">{isEditing ? <TextField name="pub_email" value={editedRowData.pub_email || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.pub_email}</TableCell>
                      <TableCell align="center">{isEditing ? <TextField name="pub_id_publica" value={editedRowData.pub_id_publica || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.pub_id_publica}</TableCell>
                      <TableCell align="center">{isEditing ? <TextField name="pub_endereco" value={editedRowData.pub_endereco || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.pub_endereco}</TableCell>
                      <TableCell align="center">{isEditing ? <TextField name="pub_regiao" value={editedRowData.pub_regiao || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.pub_regiao}</TableCell>
                      <TableCell align="center">{isEditing ? <TextField name="pub_uf" value={editedRowData.pub_uf || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.pub_uf}</TableCell>
                      <TableCell align="center">
                        {isEditing ? (
                          <InputMask
                            mask="99/99/9999"
                            value={editedRowData.pub_dtnasc || ''}
                            onChange={(e) => handleInputChange({ target: { name: 'pub_dtnasc', value: e.target.value } })}
                          >
                            {(inputProps) => (
                              <TextField
                                {...inputProps}
                                name="pub_dtnasc"
                                size="small"
                                fullWidth
                                sx={{ width: '100%' }}
                              />
                            )}
                          </InputMask>
                        ) : (
                          row.pub_dtnasc
                        )}
                      </TableCell>

                      <TableCell align="center">
                        {isEditing ? (
                          <InputMask
                            mask="99/99/9999"
                            value={editedRowData.pub_dtbatism || ''}
                            onChange={(e) => handleInputChange({ target: { name: 'pub_dtbatism', value: e.target.value } })}
                          >
                            {(inputProps) => (
                              <TextField
                                {...inputProps}
                                name="pub_dtbatism"
                                size="small"
                                fullWidth
                                sx={{ width: '100%' }}
                              />
                            )}
                          </InputMask>
                        ) : (
                          row.pub_dtbatism
                        )}
                      </TableCell>

                      <TableCell align="center">
                        {isEditing ? (
                          <FormControl fullWidth>
                            <Select
                              name="desig_servic"
                              value={editedRowData.desig_servic || ' '}
                              onChange={handleInputChange}
                            >
                              <MenuItem value="0">Estudante</MenuItem>
                              <MenuItem value="1">Publicador Batizado</MenuItem>
                              <MenuItem value="2">Servo Ministerial</MenuItem>
                              <MenuItem value="3">Ancião</MenuItem>
                            </Select>
                          </FormControl>
                        ) : (
                          <div
                            style={{
                              backgroundColor: getStatusColorDesgServ(statusDesgServ),
                              color: 'white',
                              padding: '2px',
                              borderRadius: '4px',
                              textAlign: 'center',
                              fontSize: '0.65rem',
                            }}
                          >
                            {statusDesgServ}
                          </div>
                        )}
                      </TableCell>

                      <TableCell align="center">
                        {isEditing ? (
                          <FormControl fullWidth>
                            <Select
                              name="desig_campo"
                              value={editedRowData.desig_campo || ' '}
                              onChange={handleInputChange}
                            >
                              <MenuItem value="0">Publicador</MenuItem>
                              <MenuItem value="1">Pioneiro Auxiliar</MenuItem>
                              <MenuItem value="2">Pioneiro Regular</MenuItem>
                              <MenuItem value="3">Pioneiro Especial</MenuItem>
                              <MenuItem value="4">Pioneiro Auxiliar (Campanha)</MenuItem>
                         </Select>
                          </FormControl>
                        ) : (
                          <div
                            style={{
                              backgroundColor: getStatusColorDesgCamp(statusDesgCamp),
                              color: 'white',
                              padding: '2px',
                              borderRadius: '4px',
                              textAlign: 'center',
                              fontSize: '0.65rem',
                            }}
                          >
                            {statusDesgCamp}
                          </div>
                        )}
                      </TableCell>

                      <TableCell align="center">{isEditing ? <TextField name="resp_obs" value={editedRowData.resp_obs || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.resp_obs}</TableCell>
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
              backgroundColor: shownewPublicadForm ? '#67e7eb' : '#202038',
              color: shownewPublicadForm ? '#202038' : '#f1f1f1',
            }}
            onMouseEnter={(e) => {
              if (!shownewPublicadForm) {
                e.currentTarget.style.backgroundColor = '#67e7eb'; // Cor ao passar o mouse
                e.currentTarget.style.color = '#202038'; // Cor do texto ao passar o mouse
              }
            }}
            onMouseLeave={(e) => {
              if (!shownewPublicadForm) {
                e.currentTarget.style.backgroundColor = '#202038'; // Cor original
                e.currentTarget.style.color = '#f1f1f1'; // Cor do texto original
              }
            }}
            onClick={handleNovoBotao}
          >
            <FaUserPlus /> Novo Publicador
          </button>
        </Box>

      </Box>
      {/* Formulário de nova indicação */}
      <Box sx={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', display: shownewPublicadForm ? 'block' : 'none' }}>
        <form onSubmit={handlenewPublicadSubmit}>
          <Box sx={formBoxStyle}>
            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <TextField label="Publicador *" variant="outlined" size="small" fullWidth value={newPublicad.pub_nome} onChange={(e) => setnewPublicad({ ...newPublicad, pub_nome: e.target.value })} sx={inputStyle} />
            </Box>
            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <InputMask mask="(99) 99999-9999" value={newPublicad.pub_contat} onChange={(e) => setnewPublicad({ ...newPublicad, pub_contat: e.target.value })}>
                {(inputProps) => <TextField {...inputProps} label="Contato *" variant="outlined" size="small" fullWidth sx={inputStyle} />}
              </InputMask>
            </Box>
            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <TextField label="Login *" variant="outlined" size="small" fullWidth value={newPublicad.pub_login} onChange={(e) => setnewPublicad({ ...newPublicad, pub_login: e.target.value })} sx={inputStyle} />
            </Box>
            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <TextField label="Email *" variant="outlined" size="small" fullWidth value={newPublicad.pub_email} onChange={(e) => setnewPublicad({ ...newPublicad, pub_email: e.target.value })} sx={inputStyle} />
            </Box>
            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <TextField label="Endereço *" variant="outlined" size="small" fullWidth value={newPublicad.pub_endereco} onChange={(e) => setnewPublicad({ ...newPublicad, pub_endereco: e.target.value })} sx={inputStyle} />
            </Box>
            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <TextField label="Região " variant="outlined" size="small" fullWidth value={newPublicad.pub_regiao} onChange={(e) => setnewPublicad({ ...newPublicad, pub_regiao: e.target.value })} sx={inputStyle} />
            </Box>
            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <TextField label="UF " variant="outlined" size="small" fullWidth value={newPublicad.pub_uf} onChange={(e) => setnewPublicad({ ...newPublicad, pub_uf: e.target.value })} sx={inputStyle} />
            </Box>
            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <InputMask
                mask="99/99/9999"
                onChange={(e) => setnewPublicad({ ...newPublicad, pub_dtbatism: e.target.value })}
              >
                {(inputProps) => (
                  <TextField
                    {...inputProps}
                    label="Batismo *"
                    variant="outlined"
                    size="small"
                    fullWidth
                  />
                )}
              </InputMask>
            </Box>
            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <InputMask
                mask="99/99/9999"
                onChange={(e) => setnewPublicad({ ...newPublicad, pub_dtnasc: e.target.value })}
              >
                {(inputProps) => (
                  <TextField
                    {...inputProps}
                    label="Dt. Nasc. *"
                    variant="outlined"
                    size="small"
                    fullWidth
                  />
                )}
              </InputMask>
            </Box>
            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <FormControl fullWidth>
                <InputLabel id="servic-label">Designação de Serviço?</InputLabel>
                <Select
                  labelId="servic-label"
                  id="desig_servic"
                  value={newPublicad.desig_servic}
                  label="Designação de Serviço *"
                  onChange={(e) => setnewPublicad({ ...newPublicad, desig_servic: e.target.value })}
                >
                  <MenuItem value="0">Estudante</MenuItem>
                  <MenuItem value="1">Publicador Batizado</MenuItem>
                  <MenuItem value="2">Servo Ministerial</MenuItem>
                  <MenuItem value="3">Ancião</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <FormControl fullWidth>
                <InputLabel id="campo-label">Designação de Campo ?</InputLabel>
                <Select
                  labelId="campo-label"
                  id="desig_campo"
                  value={newPublicad.desig_campo}
                  label="Designação de Campo *"
                  onChange={(e) => setnewPublicad({ ...newPublicad, desig_campo: e.target.value })}
                >
                  <MenuItem value="0">Publicador</MenuItem>
                  <MenuItem value="1">Pioneiro Auxiliar</MenuItem>
                  <MenuItem value="2">Pioneiro Regular</MenuItem>
                  <MenuItem value="3">Pioneiro Especial</MenuItem>
                  <MenuItem value="4">Pioneiro Auxiliar (Campanha)</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <FormControl fullWidth>
                <InputLabel id="status-label">Situação ?</InputLabel>
                <Select
                  labelId="status-label"
                  id="pub_status"
                  value={newPublicad.pub_status}
                  label="Situação *"
                  onChange={(e) => setnewPublicad({ ...newPublicad, pub_status: e.target.value })}
                >
                  <MenuItem value="0">Ativo</MenuItem>
                  <MenuItem value="1">Inativo</MenuItem>
                  <MenuItem value="2">Novo</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <FormControl fullWidth>
                <TextField label="Obs do Responsável " variant="outlined" size="small" fullWidth value={newPublicad.resp_obs} onChange={(e) => setnewPublicad({ ...newPublicad, resp_obs: e.target.value })} sx={inputStyle} />
              </FormControl>
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
            > <FaShareSquare /> Enviar Publicador</button>
          </Box>
        </form>
        {message && <Typography variant="body1" sx={{ color: message.includes('Erro') ? 'red' : 'green', marginTop: '10px' }}>{message}</Typography>}
      </Box>

    </Box>
  );
};

export default PubcForm;
