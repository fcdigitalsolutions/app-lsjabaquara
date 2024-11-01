import React, { useState, useEffect } from 'react';
import api_service from '../services/api_service'; // Importando serviço da API
import { Box, Menu, Table, Card, CardContent, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination, Button, TextField, Typography, MenuItem, Select, InputLabel, FormControl, Checkbox } from '@mui/material';
import { FaUserPlus, FaShareSquare, FaChevronDown } from 'react-icons/fa';

const EnderecForm = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5); // Limite de linhas por página
  const [editRowId, setEditRowId] = useState(null); // ID da linha sendo editada
  const [editedRowData, setEditedRowData] = useState({}); // Dados da linha sendo editada
  const [showNewTerritorForm, setShowNewTerritorForm] = useState(false); // Controla a exibição do formulário de nova indicação
  const [message, setMessage] = useState(''); // Mensagem de sucesso ou erro
  const [selected, setSelected] = useState([]);

  const totalRevisitas = data.filter(item => item.terr_status === '1').length;
  const totalEstudantes = data.filter(item => item.terr_status === '2').length;
  const totalDoentes = data.filter(item => item.terr_status === '3').length;
  const totalNaoQuer = data.filter(item => item.terr_status === '6').length;
  const totalCasal = data.filter(item => item.terr_cor === '2').length;
  const totalEnderecos = new Set(data.map(item => item.id)).size;

  //Somar todos os valores de 'num_pessoas'
  const totalSurdos = data.reduce((accumulator, item) => {
    return accumulator + (item.num_pessoas || 0);
  }, 0);

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

  const [filters, setFilters] = useState({
    terr_status: '',
    terr_cor: ''
  });

  const [anchorEl, setAnchorEl] = useState(null);
  const [filterColumn, setFilterColumn] = useState(''); // Guarda a coluna sendo filtrada

  const handleClick = (event, column) => {
    setAnchorEl(event.currentTarget);
    setFilterColumn(column);
  };

  const handleClose = () => {
    setAnchorEl(null);
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
      (!filters.terr_status || row.terr_status === filters.terr_status) &&
      (!filters.terr_desig || row.terr_desig === filters.terr_desig) &&
      (!filters.terr_tp_local || row.terr_tp_local === filters.terr_tp_local) &&
      (!filters.terr_classif || row.terr_classif === filters.terr_classif) &&
      (!filters.terr_cor || row.terr_cor === filters.terr_cor)
    );
  });

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10)); // Atualiza o número de linhas por página
    setPage(0); // Reseta a página para a primeira sempre que mudar o número de linhas por página
  };

  const Data_Atual = new Date();
  const [newTerritor, setNewTerritor] = useState({
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
    num_pessoas: 0,
    melhor_dia_hora: '',
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

  // Função para iniciar a edição de uma linha
  const handleEdit = (row) => {
    setEditRowId(row.id); // Define a linha como editável
    setEditedRowData({ ...row }); // Copia os dados atuais da linha para o estado editável
  };

  // Função para iniciar a edição de uma linha
  const handleAbreMapa = (row) => {
    window.open(row, '_blank'); // Abre o link em uma nova aba
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
      await api_service.put(`/territ/${editedRowData.id}`, editedRowData); // Atualiza os dados no backend
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
        await api_service.delete(`/territ/${id}`); // Envia a solicitação de exclusão para a API
        setData(data.filter(row => row.id !== id)); // Remove o registro excluído do estado local
      } catch (error) {
        console.error("Erro ao excluir os dados: ", error);
      }
    }
  };

  // Função para mostrar/esconder o formulário de novo mapa
  const handleNovoBotao = () => {
    setShowNewTerritorForm(!showNewTerritorForm); // Alterna entre mostrar ou esconder o formulário
  };


  // Função para enviar ao novo mapa
  const handleNewTerritorSubmit = async (e) => {
    e.preventDefault();

    const { terr_nome, terr_enderec, terr_link } = newTerritor;

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
      const response = await api_service.post('/territ', newTerritor);
      setData([...data, response.data]); // Adiciona novo mapa aos dados
      setNewTerritor({
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

  const TableCellTHStyle = {
    fontSize: '0.80rem',
    color: '#202038',
    fontWeight: 'bold'
  };

  const TableCellBDStyle = {
    fontSize: '0.72rem',
    color: '#202038',
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Cálculo do índice inicial e final das linhas a serem exibidas
  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;

  // Aplicar a paginação aos dados filtrados
  const paginatedData = filteredData.slice(startIndex, endIndex);

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
        return '#32CD32';
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
        return '#238E23';
      default:
        return 'transparent';
    }
  };


  // Função para determinar o status com base na confirmação do endereço
  const getStatusTpLocal = (terr_tp_local) => {
    switch (terr_tp_local) {
      case '1':
        return 'Residência';
      case '2':
        return 'Comércio';
        case '3':
          return 'Condomínio';
      default:
        return 'Outros';
    }
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
  const getStatusDesig = (terr_desig) => {
    switch (terr_desig) {
      case '1':
        return 'Não';
      case '2':
        return 'Sim';
      default:
        return 'Outros';
    }
  };

  // Função para determinar a cor de fundo da célula com base no status
  const getStatusColorDesig = (status) => {
    switch (status) {
      case 'Não':
        return '#EBC79E';
      case 'Sim':
        return '#5C3317';
      default:
        return '#581845';
    }
  };

  // Função para determinar o status com base na confirmação do endereço
  const getStatusClassif = (terr_classif) => {
    switch (terr_classif) {
      case '0':
        return 'Surdo';
      case '1':
        return 'D/A';
      case '2':
        return 'Tradutor';
      case '3':
        return 'Ouvinte';
      default:
        return 'Outros';
    }
  };

  // Função para determinar a cor de fundo da célula com base no status
  const getStatusColorClassif = (status) => {
    switch (status) {
      case 'Surdo':
        return '#99CC32';
      case 'D/A':
        return '#5C3317'; 
      case 'Tradutor':
        return '#330033';
      case 'Ouvinte':
        return '#545454';
      default:
        return '#581845';
    }
  };

  // -- // 
  return (
    <Box sx={{ padding: '16px', backgroundColor: 'rgb(255,255,255)', color: '#202038', minWidth: '160px', maxWidth: '1420px', height: '500px' }}>
      <h2 style={{ fontSize: '1.6rem', marginBottom: '16px' }}>Manutenção dos Territórios Ativos</h2>

      {/* Box separado para os cards */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          justifyContent: 'space-between',
          marginBottom: '2px', // Espaçamento entre os cards e a tabela
          '@media (max-width: 600px)': {
            flexDirection: 'column',
            alignItems: 'left',
          },
        }}
      >
        <Box sx={{ flex: 1, minWidth: '160px', maxWidth: '160px', height: '110px' }}>
          <Card sx={{ width: '100%', backgroundColor: '#202038', color: 'white' }}>
            <CardContent>
              <Typography variant="h5" sx={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                Total de Endereços
              </Typography>
              <Typography variant="h2" sx={{ fontSize: '1.8rem' }}>{totalEnderecos}</Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: 1, minWidth: '160px', maxWidth: '160px', height: '110px' }}>
          <Card sx={{ width: '100%', backgroundColor: '#202038', color: 'white' }}>
            <CardContent>
              <Typography variant="h5" sx={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                Total de Surdos
              </Typography>
              <Typography variant="h2" sx={{ fontSize: '1.8rem' }}>{totalSurdos}</Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: 1, minWidth: '160px', maxWidth: '160px', height: '110px' }}>
          <Card sx={{ width: '100%', backgroundColor: '#00009C', color: 'white' }}>
            <CardContent>
              <Typography variant="h5" sx={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                Total de Estudantes
              </Typography>
              <Typography variant="h2" sx={{ fontSize: '1.8rem' }}>{totalEstudantes}</Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: 1, minWidth: '160px', maxWidth: '160px', height: '110px' }}>
          <Card sx={{ width: '100%', backgroundColor: '#D9D919', color: 'white' }}>
            <CardContent>
              <Typography variant="h5" sx={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                Total de Revisitas
              </Typography>
              <Typography variant="h2" sx={{ fontSize: '1.8rem' }}>{totalRevisitas}</Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: 1, minWidth: '160px', maxWidth: '160px', height: '110px' }}>
          <Card sx={{ width: '100%', backgroundColor: '#FF2400', color: 'white' }}>
            <CardContent>
              <Typography variant="h5" sx={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                Morador "Não Quer"
              </Typography>
              <Typography variant="h2" sx={{ fontSize: '1.8rem' }}>{totalNaoQuer}</Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: 1, minWidth: '160px', maxWidth: '160px', height: '110px' }}>
          <Card sx={{ width: '100%', backgroundColor: '#8C1717', color: 'white' }}>
            <CardContent>
              <Typography variant="h5" sx={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                Morador Enfermo
              </Typography>
              <Typography variant="h2" sx={{ fontSize: '1.8rem' }}>{totalDoentes}</Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: 1, minWidth: '160px', maxWidth: '160px', height: '110px' }}>
          <Card sx={{ width: '100%', backgroundColor: '#238E23', color: 'white' }}>
            <CardContent>
              <Typography variant="h5" sx={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                Casal/Família
              </Typography>
              <Typography variant="h2" sx={{ fontSize: '1.8rem' }}>{totalCasal}</Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>
      {/* Box separado para a tabela */}
      <Box sx={{ marginBottom: '20px', backgroundColor: 'white', padding: '16px', borderRadius: '8px' }}>
        <Box sx={{ backgroundColor: 'rgb(255, 255, 255)', borderRadius: '16px' }}>

          <TableContainer component={Paper} sx={{ marginTop: '10px' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align="center" sx={TableCellTHStyle} padding="checkbox">
                    <Checkbox
                      indeterminate={selected.length > 0 && selected.length < data.length}
                      checked={isAllSelected}
                      onChange={handleSelectAllClick}
                      inputProps={{ 'aria-label': 'select all items' }}
                    />
                  </TableCell>
                  <TableCell align="center" sx={TableCellTHStyle}>Código Mapa</TableCell>
                  <TableCell align="center" sx={TableCellTHStyle}>Morador</TableCell>
                  <TableCell align="center" sx={TableCellTHStyle}>Num. Pessoas</TableCell>
                  <TableCell align="center" sx={TableCellTHStyle}>Endereço</TableCell>
                  <TableCell align="center" sx={TableCellTHStyle}>Bairro</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Mapa Designado?
                    <FaChevronDown onClick={(event) => handleClick(event, 'terr_desig')} />
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Tipo de Local
                    <FaChevronDown onClick={(event) => handleClick(event, 'terr_tp_local')} />
                  </TableCell>
                  <TableCell align="center" sx={TableCellTHStyle}>Link Maps</TableCell>
                  <TableCell align="center" sx={TableCellTHStyle}>Coordenadas</TableCell>
                  <TableCell align="center" sx={TableCellTHStyle}>Melhor Dia/H</TableCell>
                  <TableCell align="center" sx={TableCellTHStyle}>Classif.
                    <FaChevronDown onClick={(event) => handleClick(event, 'terr_classif')} />
                  </TableCell>
                  <TableCell align="center" sx={TableCellTHStyle}>Cor do Mapa
                    <FaChevronDown onClick={(event) => handleClick(event, 'terr_cor')} />
                  </TableCell>
                  <TableCell align="center" sx={TableCellTHStyle}>Status
                    <FaChevronDown onClick={(event) => handleClick(event, 'terr_status')} />
                  </TableCell>
                  <TableCell align="center" sx={TableCellTHStyle}>Dt. Última Visita</TableCell>
                  <TableCell align="center" sx={TableCellTHStyle}>Pub. Última Visita</TableCell>
                  <TableCell align="center" sx={TableCellTHStyle}>Detalhes e Referências</TableCell>
                  <TableCell align="center" sx={TableCellTHStyle}>Ações</TableCell>

                </TableRow>
                {/* Menu suspenso para filtros */}
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                >
                  {filterColumn === 'terr_status' && (
                    <>
                      <MenuItem onClick={() => handleFilterSelect('')}>Todos</MenuItem>
                      <MenuItem onClick={() => handleFilterSelect('0')}>Ativo</MenuItem>
                      <MenuItem onClick={() => handleFilterSelect('1')}>Revisita</MenuItem>
                      <MenuItem onClick={() => handleFilterSelect('2')}>Estudante</MenuItem>
                      <MenuItem onClick={() => handleFilterSelect('3')}>Doente</MenuItem>
                      <MenuItem onClick={() => handleFilterSelect('4')}>Mudou</MenuItem>
                      <MenuItem onClick={() => handleFilterSelect('5')}>Faleceu</MenuItem>
                      <MenuItem onClick={() => handleFilterSelect('6')}>Não Quer</MenuItem>
                    </>
                  )}
                  {filterColumn === 'terr_classif' && (
                    <>
                      <MenuItem onClick={() => handleFilterSelect('')}>Todos</MenuItem>
                      <MenuItem onClick={() => handleFilterSelect('0')}>Surdo</MenuItem>
                      <MenuItem onClick={() => handleFilterSelect('1')}>D/A</MenuItem>
                      <MenuItem onClick={() => handleFilterSelect('2')}>Tradutor</MenuItem>
                      <MenuItem onClick={() => handleFilterSelect('3')}>Ouvinte</MenuItem>
                    </>
                  )}
                  {filterColumn === 'terr_cor' && (
                    <>
                      <MenuItem onClick={() => handleFilterSelect('')}>Todos</MenuItem>
                      <MenuItem onClick={() => handleFilterSelect('0')}>Azul</MenuItem>
                      <MenuItem onClick={() => handleFilterSelect('1')}>Vermelho</MenuItem>
                      <MenuItem onClick={() => handleFilterSelect('2')}>Verde</MenuItem>
                    </>
                  )}
                  {filterColumn === 'terr_desig' && (
                    <>
                      <MenuItem onClick={() => handleFilterSelect('')}>Todos</MenuItem>
                      <MenuItem onClick={() => handleFilterSelect('1')}>Não</MenuItem>
                      <MenuItem onClick={() => handleFilterSelect('2')}>Sim</MenuItem>
                    </>
                  )}

                  {filterColumn === 'terr_tp_local' && (
                    <>
                      <MenuItem onClick={() => handleFilterSelect('')}>Todos</MenuItem>
                      <MenuItem onClick={() => handleFilterSelect('1')}>Residência</MenuItem>
                      <MenuItem onClick={() => handleFilterSelect('2')}>Comércio</MenuItem>
                      <MenuItem onClick={() => handleFilterSelect('3')}>Condomínio</MenuItem>
                    </>
                  )}

                </Menu>
              </TableHead>
              <TableBody>

                {paginatedData.map((row) => {

                  const isEditing = row.id === editRowId;

                  const statusmpcor = getStatusMapCor(row.terr_cor);
                  const statusSit = getStatusSit(row.terr_status);
                  const statusDsg = getStatusDesig(row.terr_desig);
                  const statusTploc = getStatusTpLocal(row.terr_tp_local);
                  const statusClassif = getStatusClassif(row.terr_classif);

                  return (
                    <TableRow key={row.id}>
                      <TableCell TableCell align="center" sx={TableCellBDStyle}>
                        <Checkbox
                          checked={isSelected(row.id)}
                          onChange={() => handleSelect(row.id)}
                        />
                      </TableCell>
                      <TableCell align="center" sx={TableCellBDStyle} >{isEditing ? <TextField name="terr_nome" value={editedRowData.terr_nome || ''} onChange={handleInputChange} size="small" sx={TableCellBDStyle} /> : row.terr_nome}</TableCell>
                      <TableCell align="center" sx={TableCellBDStyle} >{isEditing ? <TextField name="terr_morador" value={editedRowData.terr_morador || ''} onChange={handleInputChange} size="small" sx={TableCellBDStyle} /> : row.terr_morador}</TableCell>
                      <TableCell align="center" sx={TableCellBDStyle} >{isEditing ? <TextField name="num_pessoas" value={editedRowData.num_pessoas || ''} onChange={handleInputChange} size="small" sx={TableCellBDStyle} /> : row.num_pessoas}</TableCell>
                      <TableCell align="center" sx={TableCellBDStyle} >{isEditing ? <TextField name="terr_enderec" value={editedRowData.terr_enderec || ''} onChange={handleInputChange} size="small" sx={TableCellBDStyle} /> : row.terr_enderec}</TableCell>
                      <TableCell align="center" sx={TableCellBDStyle} >{isEditing ? <TextField name="terr_regiao" value={editedRowData.terr_regiao || ''} onChange={handleInputChange} size="small" sx={TableCellBDStyle} /> : row.terr_regiao}</TableCell>

                      {/* Campo editável de Terr. Designado */}
                      <TableCell align="center">
                        {isEditing ? (
                          <FormControl fullWidth>
                            <Select
                              name="terr_desig"
                              value={editedRowData.terr_desig || '1'}
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
                              name="terr_tp_local"
                              value={editedRowData.terr_tp_local || '1'}
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

                      <TableCell align="center" sx={TableCellBDStyle} >{isEditing ? <TextField name="terr_link" value={editedRowData.terr_link || ''} onChange={handleInputChange} size="small" sx={TableCellBDStyle} /> : row.terr_link}
                        <Button variant="contained" color="primary" size="small" onClick={() => handleAbreMapa(row.terr_link)} sx={{ fontSize: '0.55rem', padding: '2px 5px' }}>Abrir Mapa</Button>
                      </TableCell>
                      <TableCell align="center" sx={TableCellBDStyle} >{isEditing ? <TextField name="terr_coord" value={editedRowData.terr_coord || ''} onChange={handleInputChange} size="small" sx={TableCellBDStyle} /> : row.terr_coord}</TableCell>
                      <TableCell align="center" sx={TableCellBDStyle} >{isEditing ? <TextField name="melhor_dia_hora" value={editedRowData.melhor_dia_hora || ''} onChange={handleInputChange} size="small" sx={TableCellBDStyle} /> : row.melhor_dia_hora}</TableCell>

                      {/* Campo editável de status cor do mapa */}
                      <TableCell align="center" sx={TableCellBDStyle}>
                        {isEditing ? (
                          <FormControl fullWidth>
                            <Select
                              name="terr_classif"
                              value={editedRowData.terr_classif || ' '}
                              onChange={handleInputChange}
                            >
                              <MenuItem value="0">Surdo</MenuItem>
                              <MenuItem value="1">D/A</MenuItem>
                              <MenuItem value="2">Tradutor</MenuItem>
                              <MenuItem value="3">Ouvinte</MenuItem>
                              <MenuItem value="4">Outros</MenuItem>
                            </Select>
                          </FormControl>
                        ) : (
                          <div
                            style={{
                              backgroundColor: getStatusColorClassif(statusClassif),
                              color: 'white',
                              padding: '2px',
                              borderRadius: '4px',
                              textAlign: 'center',
                              fontSize: '0.65rem',
                            }}
                          >
                            {statusClassif}
                          </div>
                        )}
                      </TableCell>

                      {/* Campo editável de status cor do mapa */}
                      <TableCell align="center" sx={TableCellBDStyle}>
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
                      <TableCell align="center" sx={TableCellBDStyle}>
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
                      <TableCell align="center" sx={TableCellBDStyle} >{isEditing ? <TextField name="dt_ultvisit" value={formatDateGrid(editedRowData.dt_ultvisit) || ''} onChange={handleInputChange} size="small" sx={TableCellBDStyle} /> : formatDateGrid(row.dt_ultvisit)}</TableCell>
                      <TableCell align="center" sx={TableCellBDStyle} >{isEditing ? <TextField name="pub_ultvisi" value={editedRowData.pub_ultvisi || ''} onChange={handleInputChange} size="small" sx={TableCellBDStyle} /> : row.pub_ultvisi}</TableCell>

                      <TableCell align="center" sx={TableCellBDStyle} >{isEditing ? <TextField name="terr_obs" value={editedRowData.terr_obs || ''} onChange={handleInputChange} size="small" sx={TableCellBDStyle} /> : row.terr_obs}</TableCell>

                      <TableCell align="center">
                        {isEditing ? (
                          <Button variant="contained" color="primary" size="small" onClick={handleSave} sx={{ fontSize: '0.55rem', padding: '2px 5px' }}>Salvar</Button>
                        ) : (
                          <Box sx={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                            <Button variant="contained" color="primary" size="small" onClick={() => handleEdit(row)} sx={{ fontSize: '0.55rem', padding: '2px 5px' }}>Editar</Button>
                            <Button variant="contained" color="error" size="small" onClick={() => handleDelete(row.id)} sx={{ fontSize: '0.55rem', padding: '2px 5px' }}>Excluir</Button>
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


          {/* Botão para abrir o formulário */}
          <button
            type="button"
            style={{
              ...buttonStyle,
              backgroundColor: showNewTerritorForm ? '#67e7eb' : '#202038',
              color: showNewTerritorForm ? '#202038' : '#f1f1f1',
            }}
            onMouseEnter={(e) => {
              if (!showNewTerritorForm) {
                e.currentTarget.style.backgroundColor = '#67e7eb'; // Cor ao passar o mouse
                e.currentTarget.style.color = '#202038'; // Cor do texto ao passar o mouse
              }
            }}
            onMouseLeave={(e) => {
              if (!showNewTerritorForm) {
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
      <Box sx={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', display: showNewTerritorForm ? 'block' : 'none' }}>
        <form onSubmit={handleNewTerritorSubmit}>
          <Box sx={formBoxStyle}>
            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <TextField label="Código Mapa *" variant="outlined" size="small" fullWidth value={newTerritor.terr_nome} onChange={(e) => setNewTerritor({ ...newTerritor, terr_nome: e.target.value })} sx={inputStyle} />
            </Box>
            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <TextField label="Morador *" variant="outlined" size="small" fullWidth value={newTerritor.terr_morador} onChange={(e) => setNewTerritor({ ...newTerritor, terr_morador: e.target.value })} sx={inputStyle} />
            </Box>
            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <TextField label="Endereço do Surdo *" variant="outlined" size="small" fullWidth value={newTerritor.terr_enderec} onChange={(e) => setNewTerritor({ ...newTerritor, terr_enderec: e.target.value })} sx={inputStyle} />
            </Box>
            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <TextField label="Bairro do Surdo*" variant="outlined" size="small" fullWidth value={newTerritor.terr_regiao} onChange={(e) => setNewTerritor({ ...newTerritor, terr_regiao: e.target.value })} sx={inputStyle} />
            </Box>
            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <TextField label="Link Maps *" variant="outlined" size="small" fullWidth value={newTerritor.terr_link} onChange={(e) => setNewTerritor({ ...newTerritor, terr_link: e.target.value })} sx={inputStyle} />
            </Box>
            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <TextField label="Coordenadas *" variant="outlined" size="small" fullWidth value={newTerritor.terr_coord} onChange={(e) => setNewTerritor({ ...newTerritor, terr_coord: e.target.value })} sx={inputStyle} />
            </Box>
            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <FormControl fullWidth sx={inputStyle}>
                <InputLabel id="cormapa-label">Cor do Mapa: </InputLabel>
                <Select
                  labelId="cormapa-label"
                  id="cormapa"
                  value={newTerritor.terr_cor}
                  label="Cor do Mapa *"
                  onChange={(e) => setNewTerritor({ ...newTerritor, terr_cor: e.target.value })}
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
                    value={newTerritor.terr_status}
                    label="Situação *"
                    onChange={(e) => setNewTerritor({ ...newTerritor, terr_status: e.target.value })}
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
              <TextField label="Detalhes e Referências " variant="outlined" size="small" fullWidth value={newTerritor.terr_obs} onChange={(e) => setNewTerritor({ ...newTerritor, terr_obs: e.target.value })} sx={inputStyle} />
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
