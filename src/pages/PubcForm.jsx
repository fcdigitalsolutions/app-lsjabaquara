import React, { useState, useEffect } from 'react';
import api_service from '../services/api_service'; // Importando serviço da API
import { useNavigate } from 'react-router-dom'; // Importe o useNavigate
import InputMask from 'react-input-mask';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination, Button, TextField, Typography, MenuItem, Select, FormControl, InputLabel } from '@mui/material';

import { FaChartPie, FaUserPlus, FaShareSquare } from 'react-icons/fa';

const PubcForm = () => {
  const [data, setData] = useState([]);
  const navigate = useNavigate(); // Use o useNavigate
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(5); // Limite de linhas por página
  const [editRowId, setEditRowId] = useState(null); // ID da linha sendo editada
  const [editedRowData, setEditedRowData] = useState({}); // Dados da linha sendo editada
  const [shownewPublicadForm, setShownewPublicadForm] = useState(false); // Controla a exibição do formulário de nova indicação
  const [message, setMessage] = useState(''); // Mensagem de sucesso ou erro
  const [pub_status, setPubStatus] = useState('');
  const [desig_campo, setPubDCampo] = useState('');
  const [desig_servic, setPubDServico] = useState('');

  const [newPublicad, setnewPublicad] = useState({
    data_inclu: '',
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

  const formatDateTime = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Adiciona zero se necessário
    const day = String(date.getDate()).padStart(2, '0');

    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    api_service.get('/pubcall')
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        console.error("Erro ao buscar os dados: ", error);
      });
  }, []);

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


  // Função para enviar a nova indicação
  const handlenewPublicadSubmit = async (e) => {
    e.preventDefault();

    //  const { pub_nome,pub_contat,pub_login,pub_email,pub_endereco,pub_regiao,pub_uf,desig_servic,desig_campo,pub_status } = newPublicad;

    //  if (!pub_nome || !pub_contat || !pub_login || !pub_email || !pub_endereco || !pub_regiao || !pub_uf || !desig_servic || !desig_campo || !pub_status ) {
    //    setMessage('Por favor, preencha todos os campos obrigatórios.');
    //    return;
    //  }

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
  const getStatus = (pub_status) => {
    if (pub_status === '2') {
      return 'Inativo';
    } else {
      return 'Ativo';
    }
  };

  // Função para determinar a cor de fundo da célula com base no status
  const getStatusColor = (status) => {
    switch (status) {
      case 'Ativo':
        return 'green';
      case 'Inativo':
        return '#202038';
      default:
        return 'transparent';
    }
  };

  return (
    <Box sx={{ padding: '16px', backgroundColor: 'rgb(255,255,255)', color: '#202038' }}>
      <h2 style={{ fontSize: '1.6rem', marginBottom: '16px' }}>Manutenção dos Publicadores</h2>

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
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Login</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Email</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Endereço</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Região</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>UF</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Batismo</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Nascimento</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Desig. Serviço</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Desig. Campo</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Obs Respon.</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentData.map((row) => {
                  const isEditing = row.id === editRowId;
                  const status = getStatus(row.pub_status);
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
                              value={editedRowData.pub_status || '1'}
                              onChange={handleInputChange}
                            >
                              <MenuItem value="1">Ativo</MenuItem>
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
                      <TableCell align="center">{isEditing ? <TextField name="pub_login" value={editedRowData.pub_login || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.pub_login}</TableCell>
                      <TableCell align="center">{isEditing ? <TextField name="pub_email" value={editedRowData.pub_email || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.pub_email}</TableCell>
                      <TableCell align="center">{isEditing ? <TextField name="pub_endereco" value={editedRowData.pub_endereco || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.pub_endereco}</TableCell>
                      <TableCell align="center">{isEditing ? <TextField name="pub_regiao" value={editedRowData.pub_regiao || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.pub_regiao}</TableCell>
                      <TableCell align="center">{isEditing ? <TextField name="pub_uf" value={editedRowData.pub_uf || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.pub_uf}</TableCell>
                      <TableCell align="center">{isEditing ? <TextField name="pub_dtbatism" value={editedRowData.pub_dtbatism || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.pub_dtbatism}</TableCell>
                      <TableCell align="center">{isEditing ? <TextField name="pub_dtnasc" value={editedRowData.pub_dtnasc || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.pub_dtnasc}</TableCell>
                      <TableCell align="center">{isEditing ? <TextField name="desig_servic" value={editedRowData.desig_servic || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.desig_servic}</TableCell>
                      <TableCell align="center">{isEditing ? <TextField name="desig_campo" value={editedRowData.desig_campo || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.desig_campo}</TableCell>
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
                <InputLabel id="servic-label">Designação de Serviço ?</InputLabel>
                <Select
                  labelId="servic-label"
                  id="desig_servic"
                  value={desig_servic}
                  label="Designação de Campo *"
                  onChange={(e) => setPubDServico(e.target.value)}
                >
                  <MenuItem value="Estudante">Estudante</MenuItem>
                  <MenuItem value="Publicador Batizado">Publicador Batizado</MenuItem>
                  <MenuItem value="Servo Ministerial">Servo Ministerial</MenuItem>
                  <MenuItem value="Ancião">Ancião</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <FormControl fullWidth>
                <InputLabel id="campo-label">Designação de Campo ?</InputLabel>
                <Select
                  labelId="campo-label"
                  id="desig_campo"
                  value={desig_campo}
                  label="Designação de Campo *"
                  onChange={(e) => setPubDCampo(e.target.value)}
                >
                  <MenuItem value="Publicador">Publicador</MenuItem>
                  <MenuItem value="Pioneiro Auxiliar">Pioneiro Auxiliar</MenuItem>
                  <MenuItem value="Pioneiro Regular">Pioneiro Regular</MenuItem>
                  <MenuItem value="Pioneiro Especial">Pioneiro Especial</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <FormControl fullWidth>
                <InputLabel id="status-label">Situação ?</InputLabel>
                <Select
                  labelId="status-label"
                  id="pub_status"
                  value={pub_status}
                  label="Situação *"
                  onChange={(e) => setPubStatus(e.target.value)}
                >
                  <MenuItem value="Ativo">Ativo</MenuItem>
                  <MenuItem value="Inativo">Inativo</MenuItem>
                  <MenuItem value="Novo">Novo</MenuItem>
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
            > <FaShareSquare /> Enviar Indicação</button>
          </Box>
        </form>
        {message && <Typography variant="body1" sx={{ color: message.includes('Erro') ? 'red' : 'green', marginTop: '10px' }}>{message}</Typography>}
      </Box>

    </Box>
  );
};

export default PubcForm;
