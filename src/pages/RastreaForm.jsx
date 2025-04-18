import React, { useState, useEffect } from 'react';
import api_service from '../services/api_service'; // Importando serviço da API
import { useNavigate } from 'react-router-dom'; // Importe o useNavigate
import InputMask from 'react-input-mask';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination, Button, TextField, Typography, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import { FaChartPie, FaUserPlus, FaShareSquare } from 'react-icons/fa';

const RastreaForm = () => {
  const [data, setData] = useState([]);
  const navigate = useNavigate(); // Use o useNavigate
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(5); // Limite de linhas por página
  const [editRowId, setEditRowId] = useState(null); // ID da linha sendo editada
  const [editedRowData, setEditedRowData] = useState({}); // Dados da linha sendo editada
  const [showNewIndicationForm, setShowNewIndicationForm] = useState(false); // Controla a exibição do formulário de nova rastreamento
  const [message, setMessage] = useState(''); // Mensagem de sucesso ou erro
  const [newIndication, setNewIndication] = useState({
    nome_publica: '',
    num_contato: '',
    cod_congreg: '',
    cod_regiao: '',
    enderec: '',
    origem: '',
    obs: ''
  });

  useEffect(() => {
    api_service.get('/rastrearall')
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        console.error("Erro ao buscar os dados: ", error);
      });
  }, []);

  // Função para redirecionar ao dashboard
  const handleRetornaDash = () => {
    navigate('/home/dash-rastrea'); // Navegue para a rota definida
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
      await api_service.put(`/rastrear/${editedRowData.id}`, editedRowData); // Atualiza os dados no backend
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
        await api_service.delete(`/rastrear/${id}`); // Envia a solicitação de exclusão para a API
        setData(data.filter(row => row.id !== id)); // Remove o registro excluído do estado local
      } catch (error) {
        console.error("Erro ao excluir os dados: ", error);
      }
    }
  };

  // Função para mostrar/esconder o formulário de novo rastreamento
  const handleNovoBotao = () => {
    setShowNewIndicationForm(!showNewIndicationForm); // Alterna entre mostrar ou esconder o formulário
  };

  // Função para enviar novo rastreamento
  const handleNewIndicationSubmit = async (e) => {
    e.preventDefault();
    const { nome_publica, num_contato, cod_congreg, cod_regiao, enderec, origem } = newIndication;

    if (!nome_publica || !num_contato || !cod_congreg || !cod_regiao || !enderec || !origem) {
      setMessage('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      const response = await api_service.post('/rastrear', newIndication);
      setData([...data, response.data]); // Adiciona a nova rastreamento aos dados
      setNewIndication({ nome_publica: '', num_contato: '', cod_congreg: '', cod_regiao: '', enderec: '', origem: '', obs: '' }); // Limpa o formulário
      setMessage('rastreamento incluído com sucesso!');
    } catch (error) {
      console.error("Erro ao enviar as informações: ", error);
      setMessage('Erro ao incluir a rastreamento.');
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

  const getStatus = (cod_status) => {
    if (cod_status === '0') {
      return 'Pendente';
    } else if (cod_status === '1') {
      return 'Em Andamento';
    
  } else if (cod_status === '2') {
    return 'Concluído';
  }
    return 'Desconhecido'; // Fallback para casos inesperados
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Em Andamento':
        return 'green';
      case 'Pendente':
        return 'gray';
      case 'Concluído':
        return '#202038';
      default:
        return 'transparent';
    }
  };

  return (
    <Box sx={{ padding: '16px', backgroundColor: 'rgb(255,255,255)', color: '#202038' }}>
      <h2 style={{ fontSize: '1.6rem', marginBottom: '16px' }}>Rastreamentos</h2>

      {/* Box separado para a tabela */}
      <Box sx={{ marginBottom: '16px', backgroundColor: 'white', padding: '16px', borderRadius: '8px' }}>
        <Box sx={{ backgroundColor: 'rgb(255, 255, 255)', borderRadius: '16px' }}>
          {/* Botão Dashboard rastreamentos */}
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
            <FaChartPie />  DashBoard rastreamentos
          </button>

          <TableContainer component={Paper} sx={{ marginTop: '10px' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align="center">Congregação</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">Dt. Início</TableCell>
                  <TableCell align="center">Dt. Fim</TableCell>
                  <TableCell align="center">Endereços</TableCell>
                  <TableCell align="center">Endereços Concluídos</TableCell>
                   <TableCell align="center">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentData.map((row) => {
                  const isEditing = row.id === editRowId;
                  const status = getStatus(row.cod_status);
                  return (
                    <TableRow key={row.id}>
                      <TableCell align="center">{isEditing ? <TextField name="cod_congreg" value={editedRowData.cod_congreg || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.cod_congreg}</TableCell>
                      <TableCell align="center">
                      <div
                        style={{
                          backgroundColor: getStatusColor(status),
                          color: 'white',
                          padding: '2px',
                          borderRadius: '4px',
                          textAlign: 'center',
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.65rem',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {status}
                      </div>
                    </TableCell> 
                      <TableCell align="center">{isEditing ? <TextField name="cod_status" value={editedRowData.cod_status || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.cod_status === '2' ? 'Concluído' : row.cod_status === '1'? 'Em Andamento': 'Pendente' }</TableCell>
                      <TableCell align="center">{isEditing ? <TextField name="data_inicio" value={editedRowData.data_inicio || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.data_inicio}</TableCell>
                      <TableCell align="center">{isEditing ? <TextField name="data_fim" value={editedRowData.data_fim || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.data_fim}</TableCell>
                      <TableCell align="center">{isEditing ? <TextField name="num_enderec" value={editedRowData.num_enderec || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.num_enderec}</TableCell>
                      <TableCell align="center">{isEditing ? <TextField name="num_endconcl" value={editedRowData.num_endconcl || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.num_endconcl}</TableCell>
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
            <FaUserPlus /> Novo Rastreamento
          </button>
        </Box>

      </Box>
      {/* Formulário de nova rastreamento */}
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
              <FormControl fullWidth sx={inputStyle}>
                <InputLabel id="origem-label">Origem</InputLabel>
                <Select labelId="origem-label" id="origem" value={newIndication.origem} label="Origem " onChange={(e) => setNewIndication({ ...newIndication, origem: e.target.value })}>
                  <MenuItem value="Rastreamento Casa em Casa">Casa em Casa</MenuItem>
                  <MenuItem value="Rastreamento Comércio">Comércio</MenuItem>
                  <MenuItem value="Outros">Outros</MenuItem>
                </Select>
              </FormControl>
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
            > <FaShareSquare /> Enviar rastreamento</button>
          </Box>
        </form>
        {message && <Typography variant="body1" sx={{ color: message.includes('Erro') ? 'red' : 'green', marginTop: '10px' }}>{message}</Typography>}
      </Box>

    </Box>
  );
};

export default RastreaForm;
