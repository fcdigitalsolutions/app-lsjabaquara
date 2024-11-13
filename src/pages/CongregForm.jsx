import React, { useState, useEffect } from 'react';
import api_service from '../services/api_service'; // Importando serviço da API
import { useNavigate } from 'react-router-dom'; // Importe o useNavigate
import InputMask from 'react-input-mask';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination, Button, TextField, Typography } from '@mui/material';
import { FaChartPie, FaUserPlus, FaShareSquare } from 'react-icons/fa';

const CongregaForm = () => {
  const [data, setData] = useState([]);
  const navigate = useNavigate(); // Use o useNavigate
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(5); // Limite de linhas por página
  const [editRowId, setEditRowId] = useState(null); // ID da linha sendo editada
  const [editedRowData, setEditedRowData] = useState({}); // Dados da linha sendo editada
  const [showNewRegistroForm, setShowNewRegistroForm] = useState(false); // Controla a exibição do formulário de nova congregação
  const [message, setMessage] = useState(''); // Mensagem de sucesso ou erro
  const [newRegistro, setNewRegistro] = useState({
    nome: '',
    regiao: '',
    enderedo: '',
    cca_nome: '',
    cca_contato: '',
    ss_nome: '',
    ss_contato: '',
    srv_terr_nome: '',    
    srv_terr_contat: ''
  });


  useEffect(() => {
    api_service.get('/congregsall')
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        console.error("Erro ao buscar os dados: ", error);
      });
  }, []);

  // Função para redirecionar ao dashboard
  const handleRetornaDash = () => {
    navigate('/home/dash-congreg'); // Navegue para a rota definida
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
      await api_service.put(`/congregs/${editedRowData.id}`, editedRowData); // Atualiza os dados no backend
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
        await api_service.delete(`/congregs/${id}`); // Envia a solicitação de exclusão para a API
        setData(data.filter(row => row.id !== id)); // Remove o registro excluído do estado local
      } catch (error) {
        console.error("Erro ao excluir os dados: ", error);
      }
    }
  };

  // Função para mostrar/esconder o formulário de nova congregação
  const handleNovoBotao = () => {
    setShowNewRegistroForm(!showNewRegistroForm); // Alterna entre mostrar ou esconder o formulário
  };


  // Função para enviar a nova congregação
  const handleNewRegistroSubmit = async (e) => {
    e.preventDefault();

    const { nome, regiao, endereco, cca_nome, cca_contato, ss_nome, ss_contato } = newRegistro;

    if (!nome || !regiao || !endereco || !cca_nome || !cca_contato || !ss_nome || !ss_contato) {
      setMessage('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      const response = await api_service.post('/congregs', newRegistro);
      setData([...data, response.data]); // Adiciona a nova congregação aos dados
      setNewRegistro({ nome: '', regiao: '', endereco: '', cca_nome: '', cca_contato: '', ss_nome: '', ss_contato: '', srv_terr_nome: '', srv_terr_contat: '' }); // Limpa o formulário
      setMessage('Congregação incluída com sucesso!');
    } catch (error) {
      console.error("Erro ao enviar as informações: ", error);
      setMessage('Erro ao incluir a congregação.');
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
      <h2 style={{ fontSize: '1.6rem', marginBottom: '16px' }}>Manutenção das Congregações</h2>

      {/* Box separado para a tabela */}
      <Box sx={{ marginBottom: '16px', backgroundColor: 'white', padding: '16px', borderRadius: '8px' }}>
        <Box sx={{ backgroundColor: 'rgb(255, 255, 255)', borderRadius: '16px' }}>
          {/* Botão Dashboard congregações */}
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
            <FaChartPie />  DashBoard congregações
          </button>

          <TableContainer component={Paper} sx={{ marginTop: '10px' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align="center">Congregação</TableCell>
                  <TableCell align="center">Região</TableCell>
                  <TableCell align="center">Endereço</TableCell>
                  <TableCell align="center">CCA Nome</TableCell>
                  <TableCell align="center">Cca Contato</TableCell>
                  <TableCell align="center">SS Nome</TableCell>
                  <TableCell align="center">SS Contato</TableCell>
                  <TableCell align="center">Serv. Territó</TableCell>
                  <TableCell align="center">Srv. Terr. Contato</TableCell>
                  <TableCell align="center">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentData.map((row) => {
                  const isEditing = row.id === editRowId;
                  return (
                    <TableRow key={row.id}>
                      <TableCell align="center">{isEditing ? <TextField name="nome" value={editedRowData.nome || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.nome}</TableCell>
                      <TableCell align="center">{isEditing ? <TextField name="regiao" value={editedRowData.regiao || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.regiao}</TableCell>
                      <TableCell align="center">{isEditing ? <TextField name="endereco" value={editedRowData.endereco || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.endereco}</TableCell>
                      <TableCell align="center">{isEditing ? <TextField name="cca_nome" value={editedRowData.cca_nome || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.cca_nome}</TableCell>
                      <TableCell align="center">{isEditing ? <TextField name="cca_contato" value={editedRowData.cca_contato || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.cca_contato}</TableCell>
                      <TableCell align="center">{isEditing ? <TextField name="ss_nome" value={editedRowData.ss_nome || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.ss_nome}</TableCell>
                      <TableCell align="center">{isEditing ? <TextField name="ss_contato" value={editedRowData.ss_contato || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.ss_contato}</TableCell>
                      <TableCell align="center">{isEditing ? <TextField name="srv_terr_nome" value={editedRowData.srv_terr_nome || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.srv_terr_nome}</TableCell>
                      <TableCell align="center">{isEditing ? <TextField name="srv_terr_contat" value={editedRowData.srv_terr_contat || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.srv_terr_contat}</TableCell>
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
              backgroundColor: showNewRegistroForm ? '#67e7eb' : '#202038',
              color: showNewRegistroForm ? '#202038' : '#f1f1f1',
            }}
            onMouseEnter={(e) => {
              if (!showNewRegistroForm) {
                e.currentTarget.style.backgroundColor = '#67e7eb'; // Cor ao passar o mouse
                e.currentTarget.style.color = '#202038'; // Cor do texto ao passar o mouse
              }
            }}
            onMouseLeave={(e) => {
              if (!showNewRegistroForm) {
                e.currentTarget.style.backgroundColor = '#202038'; // Cor original
                e.currentTarget.style.color = '#f1f1f1'; // Cor do texto original
              }
            }}
            onClick={handleNovoBotao}
          >
            <FaUserPlus /> Nova Congregação
          </button>
        </Box>

      </Box>
      {/* Formulário de nova congregação */}
      <Box sx={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', display: showNewRegistroForm ? 'block' : 'none' }}>
        <form onSubmit={handleNewRegistroSubmit}>
          <Box sx={formBoxStyle}>
            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <TextField label="Congregação *" variant="outlined" size="small" fullWidth value={newRegistro.nome} onChange={(e) => setNewRegistro({ ...newRegistro, nome: e.target.value })} sx={inputStyle} />
            </Box>
            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <TextField label="Região *" variant="outlined" size="small" fullWidth value={newRegistro.regiao} onChange={(e) => setNewRegistro({ ...newRegistro, regiao: e.target.value })} sx={inputStyle} />
            </Box>
            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <TextField label="Endereço *" variant="outlined" size="small" fullWidth value={newRegistro.endereco} onChange={(e) => setNewRegistro({ ...newRegistro, endereco: e.target.value })} sx={inputStyle} />
            </Box>
            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <TextField label="CCA Nome *" variant="outlined" size="small" fullWidth value={newRegistro.cca_nome} onChange={(e) => setNewRegistro({ ...newRegistro, cca_nome: e.target.value })} sx={inputStyle} />
            </Box>
            <Box sx={{ flex: 1, minWidth: '200px' }}>
            <InputMask
              mask="(99) 99999-9999"
              onChange={(e) => setNewRegistro({ ...newRegistro, cca_contato: e.target.value })}
            >
              {(inputProps) => (
                <TextField
                  {...inputProps}
                  label="CCA Contato *"
                  variant="outlined"
                  size="small"
                  fullWidth
                />
              )}
            </InputMask>
          </Box>
            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <TextField label="SS Nome *" variant="outlined" size="small" fullWidth value={newRegistro.ss_nome} onChange={(e) => setNewRegistro({ ...newRegistro, ss_nome: e.target.value })} sx={inputStyle} />
            </Box>
            <Box sx={{ flex: 1, minWidth: '200px' }}>
            <InputMask
              mask="(99) 99999-9999"
              onChange={(e) => setNewRegistro({ ...newRegistro, ss_contato: e.target.value })}
            >
              {(inputProps) => (
                <TextField
                  {...inputProps}
                  label="SS Contato *"
                  variant="outlined"
                  size="small"
                  fullWidth
                />
              )}
            </InputMask>
          </Box>

            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <TextField label="Serv. Terr. Nome *" variant="outlined" size="small" fullWidth value={newRegistro.srv_terr_nome} onChange={(e) => setNewRegistro({ ...newRegistro, srv_terr_nome: e.target.value })} sx={inputStyle} />
            </Box>
            <Box sx={{ flex: 1, minWidth: '200px' }}>
            <InputMask
              mask="(99) 99999-9999"
              onChange={(e) => setNewRegistro({ ...newRegistro, srv_terr_contat: e.target.value })}
            >
              {(inputProps) => (
                <TextField
                  {...inputProps}
                  label="Serv. Terr. Contato *"
                  variant="outlined"
                  size="small"
                  fullWidth
                />
              )}
            </InputMask>
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
            > <FaShareSquare /> Enviar congregação</button>
          </Box>
        </form>
        {message && <Typography variant="body1" sx={{ color: message.includes('Erro') ? 'red' : 'green', marginTop: '10px' }}>{message}</Typography>}
      </Box>

    </Box>
  );
};

export default CongregaForm;
