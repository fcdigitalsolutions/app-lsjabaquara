import React, { useState, useEffect } from 'react';
import api_service from '../services/api_service'; // Importando serviço da API
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, TablePagination, Button, TextField, Typography
} from '@mui/material';

import { FaUserPlus, FaShareSquare } from 'react-icons/fa';

const ConfigCampoForm = () => {
  const [dataReuniao, setDataReuniao] = useState([]);
  const [dataCampo, setDataCampo] = useState([]);
  const [dataCarrinho, setDataCarrinho] = useState([]);
  const [pageCamp, setPageCamp] = useState(0);
  const [pageCarr, setPageCarr] = useState(0);
  const [pageReuniao, setPageReuniao] = useState(0);
  const [rowsPerPageReuniao] = useState(5); // Limite de linhas por página
  const [rowsPerPageCamp] = useState(5); // Limite de linhas por página
  const [rowsPerPageCarr] = useState(5); // Limite de linhas por página
  const [editRowId, setEditRowId] = useState(null); // ID da linha sendo editada
  const [editedRowData, setEditedRowData] = useState({}); // Dados da linha sendo editada
  const [showNewReuniaoForm, setShowNewReuniaoForm] = useState(false); // Controla a exibição do formulário de novo dia Campo
  const [showNewCampoForm, setShowNewCampoForm] = useState(false); // Controla a exibição do formulário de novo dia Campo
  const [showNewCarrinhoForm, setShowNewCarrinhoForm] = useState(false); // Controla a exibição do formulário de novo dia Carrinho
  const [message, setMessage] = useState(''); // Mensagem de sucesso ou erro

  const [newRegistroReuniao, setNewRegistroReuniao] = useState({
    data_inclu: new Date().toLocaleDateString("pt-BR"),  // Valor padrão para dsg_data
    cmp_tipo: '4',
    cmp_diadasem: '',
    cmp_seq: '',
    cmp_local: '',
    cmp_enderec: '',
    cmp_url: '',
    cmp_tipoativ: '',
    cmp_horaini: '',
    cmp_horafim: '',
    cmp_detalhes: ''
  });

  const [newRegistroCampo, setNewRegistroCampo] = useState({
    data_inclu: new Date().toLocaleDateString("pt-BR"),  // Valor padrão para dsg_data
    cmp_tipo: '2',
    cmp_diadasem: '',
    cmp_seq: '',
    cmp_local: '',
    cmp_enderec: '',
    cmp_url: '',
    cmp_tipoativ: '',
    cmp_horaini: '',
    cmp_horafim: '',
    cmp_detalhes: ''
  });

  const [newRegistroCarrinho, setNewRegistroCarrinho] = useState({
    data_inclu: new Date().toLocaleDateString("pt-BR"),  // Valor padrão para dsg_data
    cmp_tipo: '3',
    cmp_diadasem: '',
    cmp_seq: '',
    cmp_local: '',
    cmp_enderec: '',
    cmp_url: '',
    cmp_tipoativ: '',
    cmp_horaini: '',
    cmp_detalhes: ''
  });


    // lista todos os registros da rota de reuniao 
    useEffect(() => {
      api_service.get('/cfgreuniall')
        .then((response) => {
          setDataReuniao(response.data);
        })
        .catch((error) => {
          console.error("Erro ao buscar os dados: ", error);
        });
    }, []);
  

  // lista todos os registros da rota de campo 
  useEffect(() => {
    api_service.get('/cfgcampoall')
      .then((response) => {
        setDataCampo(response.data);
      })
      .catch((error) => {
        console.error("Erro ao buscar os dados: ", error);
      });
  }, []);


  // lista todos os registros da rota de carinho 
  useEffect(() => {
    api_service.get('/cfgcarrinall')
      .then((response) => {
        setDataCarrinho(response.data);
      })
      .catch((error) => {
        console.error("Erro ao buscar os dados: ", error);
      });
  }, []);


  // Função para lidar com alterações nos campos de entrada
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedRowData({ ...editedRowData, [name]: value }); // Atualiza os dados editados
  };

  // Função para salvar as alterações
  const handleSave = async () => {
    try {
      await api_service.put(`/cfgcampo/${editedRowData.id}`, editedRowData); // Atualiza os dados no backend
      setDataCampo(dataCampo.map(row => (row.id === editedRowData.id ? editedRowData : row))); // Atualiza os dados no frontend
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
        await api_service.delete(`/cfgcampo/${id}`); // Envia a solicitação de exclusão para a API
        setDataCampo(dataCampo.filter(row => row.id !== id)); // Remove o registro excluído do estado local
      } catch (error) {
        console.error("Erro ao excluir os dados: ", error);
      }
    }
  };

    // Função para mostrar/esconder o formulário de nova congregação
    const handleButtonIncluReuniao = () => {
      setShowNewReuniaoForm(!showNewReuniaoForm); // Alterna entre mostrar ou esconder o formulário
    };

  // Função para mostrar/esconder o formulário de nova congregação
  const handleButtonIncluCampo = () => {
    setShowNewCampoForm(!showNewCampoForm); // Alterna entre mostrar ou esconder o formulário
  };

  // Função para mostrar/esconder o formulário de nova congregação
  const handleButtonIncluCarrinh = () => {
    setShowNewCarrinhoForm(!showNewCarrinhoForm); // Alterna entre mostrar ou esconder o formulário
  };

  // Função para enviar novo dia de Campo
  const handleNewRegReuniaoSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await api_service.post('/cfgcampo', newRegistroReuniao);
      setDataCampo([...dataCampo, response.data]); // Adiciona um novo dia aos dados
      setNewRegistroReuniao({ cmp_tipo: '', cmp_diadasem: '', cmp_seq: '', cmp_local: '', cmp_enderec: '', cmp_url: '', cmp_tipoativ: '', cmp_horaini: '', cmp_detalhes: '' }); // Limpa o formulário
      setMessage('Registro incluído com sucesso!');
    } catch (error) {
      console.error("Erro ao enviar as informações: ", error);
      setMessage('Erro ao incluir o Registro.');
    }
  };

  // Função para enviar novo dia de Campo
  const handleNewRegCampoSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await api_service.post('/cfgcampo', newRegistroCampo);
      setDataCampo([...dataCampo, response.data]); // Adiciona um novo dia aos dados
      setNewRegistroCampo({ cmp_tipo: '', cmp_diadasem: '', cmp_seq: '', cmp_local: '', cmp_enderec: '', cmp_url: '', cmp_tipoativ: '', cmp_horaini: '', cmp_detalhes: '' }); // Limpa o formulário
      setMessage('Registro incluído com sucesso!');
    } catch (error) {
      console.error("Erro ao enviar as informações: ", error);
      setMessage('Erro ao incluir o Registro.');
    }
  };

  // Função para enviar novo dia de Carinnho
  const handleNewRegCarrinhoSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await api_service.post('/cfgcampo', newRegistroCarrinho);
      setDataCarrinho([...dataCarrinho, response.data]); // Adiciona um novo dia aos dados
      setNewRegistroCarrinho({ cmp_tipo: '', cmp_diadasem: '', cmp_seq: '', cmp_local: '', cmp_enderec: '', cmp_url: '', cmp_tipoativ: '', cmp_horaini: '', cmp_horafim: '', cmp_detalhes: '' }); // Limpa o formulário
      setMessage('Registro incluído com sucesso!');
    } catch (error) {
      console.error("Erro ao enviar as informações: ", error);
      setMessage('Erro ao incluir o Registro.');
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

  const handleChangePageReuniao = (event, newPage) => {
    setPageReuniao(newPage);
  };

  const handleChangePageCamp = (event, newPage) => {
    setPageCamp(newPage);
  };

  const handleChangePageCarr = (event, newPage) => {
    setPageCarr(newPage);
  };

    // Cálculo do índice inicial e final das linhas a serem exibidas
    const startIndexReuniao = pageReuniao * rowsPerPageReuniao;
    const endIndexReuniao = startIndexReuniao + rowsPerPageReuniao;
    const currentDataReuniao = dataReuniao.slice(startIndexReuniao, endIndexReuniao);
  

  // Cálculo do índice inicial e final das linhas a serem exibidas
  const startIndexCamp = pageCamp * rowsPerPageCamp;
  const endIndexCamp = startIndexCamp + rowsPerPageCamp;
  const currentDataCamp = dataCampo.slice(startIndexCamp, endIndexCamp);


  // Cálculo do índice inicial e final das linhas a serem exibidas
  const startIndexCarr = pageCarr * rowsPerPageCarr;
  const endIndexCarr = startIndexCarr + rowsPerPageCarr;
  const currentDataCarr = dataCarrinho.slice(startIndexCarr, endIndexCarr);

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
      <h2 style={{ fontSize: '1.6rem', marginBottom: '16px' }}>Programação Semanal de Atividades</h2>
      <Box sx={{ backgroundColor: 'rgb(255, 255, 255)', borderRadius: '16px' }}>
        <Box sx={{ backgroundColor: 'rgb(255, 255, 255)', borderRadius: '16px' }}>
          <Box>
            <Box sx={{ marginTop: '40px' }}></Box>
            <h4 style={{ fontSize: '1.2rem', marginBottom: '16px', color: "rgb(0, 14, 96)" }}>Programação da Reunião</h4>
            <TableContainer component={Paper} sx={{ marginTop: '10px' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell align="center">Seq</TableCell>
                    <TableCell align="center">Dia da Semana</TableCell>
                    <TableCell align="center">Local</TableCell>
                    <TableCell align="center">Endereço</TableCell>
                    <TableCell align="center">URL Local</TableCell>
                    <TableCell align="center">Tipo Atividade</TableCell>
                    <TableCell align="center">Horário</TableCell>
                    <TableCell align="center">Detalhes</TableCell>
                    <TableCell align="center">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentDataReuniao.map((row) => {
                    const isEditing = row.id === editRowId;
                    return (
                      <TableRow key={row.id}>
                        <TableCell align="center">{isEditing ? <TextField name="cmp_seq" value={editedRowData.cmp_seq || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.cmp_seq}</TableCell>
                        <TableCell align="center">{isEditing ? <TextField name="cmp_diadasem" value={editedRowData.cmp_diadasem || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.cmp_diadasem}</TableCell>
                        <TableCell align="center">{isEditing ? <TextField name="cmp_local" value={editedRowData.cmp_local || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.cmp_local}</TableCell>
                        <TableCell align="center">{isEditing ? <TextField name="cmp_enderec" value={editedRowData.cmp_enderec || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.cmp_enderec}</TableCell>
                        <TableCell align="center">{isEditing ? <TextField name="cmp_url" value={editedRowData.cmp_url || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.cmp_url}</TableCell>
                        <TableCell align="center">{isEditing ? <TextField name="cmp_tipoativ" value={editedRowData.cmp_tipoativ || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.cmp_tipoativ}</TableCell>
                        <TableCell align="center">{isEditing ? <TextField name="cmp_horaini" value={editedRowData.cmp_horaini || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.cmp_horaini}</TableCell>
                        <TableCell align="center">{isEditing ? <TextField name="cmp_detalhes" value={editedRowData.cmp_detalhes || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.cmp_detalhes}</TableCell>
                        <TableCell align="center">
                          {isEditing ? (
                            <Button variant="contained" color="primary" size="small" onClick={handleSave} sx={{ fontSize: '0.65rem', padding: '2px 5px' }}>Salvar</Button>
                          ) : (
                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
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
              count={dataReuniao.length}
              rowsPerPage={rowsPerPageReuniao}
              page={pageCamp}
              onPageChange={handleChangePageReuniao}
              sx={{
                '& .MuiTablePagination-toolbar': { fontSize: '0.65rem' },
                '& .MuiTablePagination-selectRoot': { fontSize: '0.65rem' },
                '& .MuiTablePagination-displayedRows': { fontSize: '0.65rem' },
              }}
            />

            {/* Botão para abrir o formulário dia de Reuniao*/}
            <button
              type="button"
              style={{
                ...buttonStyle,
                backgroundColor: showNewReuniaoForm ? '#67e7eb' : '#202038',
                color: showNewReuniaoForm ? '#202038' : '#f1f1f1',
              }}
              onMouseEnter={(e) => {
                if (!showNewReuniaoForm) {
                  e.currentTarget.style.backgroundColor = '#67e7eb'; // Cor ao passar o mouse
                  e.currentTarget.style.color = '#202038'; // Cor do texto ao passar o mouse
                }
              }}
              onMouseLeave={(e) => {
                if (!showNewReuniaoForm) {
                  e.currentTarget.style.backgroundColor = '#202038'; // Cor original
                  e.currentTarget.style.color = '#f1f1f1'; // Cor do texto original
                }
              }}
              onClick={handleButtonIncluReuniao}
            >
              <FaUserPlus /> Incluir Dia de Reunião
            </button>
          </Box>

          {/* Formulário de nova dia de Reunião */}
          <Box sx={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', display: showNewReuniaoForm ? 'block' : 'none' }}>
            <form onSubmit={handleNewRegReuniaoSubmit}>
              <Box sx={formBoxStyle}>
                <Box sx={{ flex: 1, minWidth: '200px' }}>
                  <TextField label="Sequência *" variant="outlined" size="small" fullWidth value={newRegistroReuniao.cmp_seq} onChange={(e) => setNewRegistroReuniao({ ...newRegistroReuniao, cmp_seq: e.target.value })} sx={inputStyle} />
                </Box>
                <Box sx={{ flex: 1, minWidth: '200px' }}>
                  <TextField label="Dia da Semana *" variant="outlined" size="small" fullWidth value={newRegistroReuniao.cmp_diadasem} onChange={(e) => setNewRegistroReuniao({ ...newRegistroReuniao, cmp_diadasem: e.target.value })} sx={inputStyle} />
                </Box>
                <Box sx={{ flex: 1, minWidth: '200px' }}>
                  <TextField label="Local *" variant="outlined" size="small" fullWidth value={newRegistroReuniao.cmp_local} onChange={(e) => setNewRegistroReuniao({ ...newRegistroReuniao, cmp_local: e.target.value })} sx={inputStyle} />
                </Box>
                <Box sx={{ flex: 1, minWidth: '200px' }}>
                  <TextField label="Endereço *" variant="outlined" size="small" fullWidth value={newRegistroReuniao.cmp_enderec} onChange={(e) => setNewRegistroReuniao({ ...newRegistroReuniao, cmp_enderec: e.target.value })} sx={inputStyle} />
                </Box>
                <Box sx={{ flex: 1, minWidth: '200px' }}>
                  <TextField label="URL Local*" variant="outlined" size="small" fullWidth value={newRegistroReuniao.cmp_url} onChange={(e) => setNewRegistroReuniao({ ...newRegistroReuniao, cmp_url: e.target.value })} sx={inputStyle} />
                </Box>
                <Box sx={{ flex: 1, minWidth: '200px' }}>
                  <TextField label="Tipo Atividade *" variant="outlined" size="small" fullWidth value={newRegistroReuniao.cmp_tipoativ} onChange={(e) => setNewRegistroReuniao({ ...newRegistroReuniao, cmp_tipoativ: e.target.value })} sx={inputStyle} />
                </Box>
                <Box sx={{ flex: 1, minWidth: '200px' }}>
                  <TextField label="Horário *" variant="outlined" size="small" fullWidth value={newRegistroReuniao.cmp_horaini} onChange={(e) => setNewRegistroReuniao({ ...newRegistroReuniao, cmp_horaini: e.target.value })} sx={inputStyle} />
                </Box>
                <Box sx={{ flex: 1, minWidth: '200px' }}>
                  <TextField label="Detalhes *" variant="outlined" size="small" fullWidth value={newRegistroReuniao.cmp_detalhes} onChange={(e) => setNewRegistroReuniao({ ...newRegistroReuniao, cmp_detalhes: e.target.value })} sx={inputStyle} />
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
                > <FaShareSquare /> Enviar dia Reunião</button>
              </Box>
            </form>
            {message && <Typography variant="body1" sx={{ color: message.includes('Erro') ? 'red' : 'green', marginTop: '10px' }}>{message}</Typography>}
          </Box>
          <Box>
            <Box sx={{ marginTop: '40px' }}></Box>
            <h4 style={{ fontSize: '1.2rem', marginBottom: '16px', color: "rgb(92, 43, 11)" }}>Programação de Campo Semanal</h4>
            <TableContainer component={Paper} sx={{ marginTop: '10px' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell align="center">Seq</TableCell>
                    <TableCell align="center">Dia da Semana</TableCell>
                    <TableCell align="center">Local</TableCell>
                    <TableCell align="center">Endereço</TableCell>
                    <TableCell align="center">URL Local</TableCell>
                    <TableCell align="center">Tipo Atividade</TableCell>
                    <TableCell align="center">Horário</TableCell>
                    <TableCell align="center">Detalhes</TableCell>
                    <TableCell align="center">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentDataCamp.map((row) => {
                    const isEditing = row.id === editRowId;
                    return (
                      <TableRow key={row.id}>
                        <TableCell align="center">{isEditing ? <TextField name="cmp_seq" value={editedRowData.cmp_seq || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.cmp_seq}</TableCell>
                        <TableCell align="center">{isEditing ? <TextField name="cmp_diadasem" value={editedRowData.cmp_diadasem || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.cmp_diadasem}</TableCell>
                        <TableCell align="center">{isEditing ? <TextField name="cmp_local" value={editedRowData.cmp_local || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.cmp_local}</TableCell>
                        <TableCell align="center">{isEditing ? <TextField name="cmp_enderec" value={editedRowData.cmp_enderec || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.cmp_enderec}</TableCell>
                        <TableCell align="center">{isEditing ? <TextField name="cmp_url" value={editedRowData.cmp_url || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.cmp_url}</TableCell>
                        <TableCell align="center">{isEditing ? <TextField name="cmp_tipoativ" value={editedRowData.cmp_tipoativ || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.cmp_tipoativ}</TableCell>
                        <TableCell align="center">{isEditing ? <TextField name="cmp_horaini" value={editedRowData.cmp_horaini || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.cmp_horaini}</TableCell>
                        <TableCell align="center">{isEditing ? <TextField name="cmp_detalhes" value={editedRowData.cmp_detalhes || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.cmp_detalhes}</TableCell>
                        <TableCell align="center">
                          {isEditing ? (
                            <Button variant="contained" color="primary" size="small" onClick={handleSave} sx={{ fontSize: '0.65rem', padding: '2px 5px' }}>Salvar</Button>
                          ) : (
                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
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
              count={dataCampo.length}
              rowsPerPage={rowsPerPageCamp}
              page={pageCamp}
              onPageChange={handleChangePageCamp}
              sx={{
                '& .MuiTablePagination-toolbar': { fontSize: '0.65rem' },
                '& .MuiTablePagination-selectRoot': { fontSize: '0.65rem' },
                '& .MuiTablePagination-displayedRows': { fontSize: '0.65rem' },
              }}
            />

            {/* Botão para abrir o formulário dia de Campo*/}
            <button
              type="button"
              style={{
                ...buttonStyle,
                backgroundColor: showNewCampoForm ? '#67e7eb' : '#202038',
                color: showNewCampoForm ? '#202038' : '#f1f1f1',
              }}
              onMouseEnter={(e) => {
                if (!showNewCampoForm) {
                  e.currentTarget.style.backgroundColor = '#67e7eb'; // Cor ao passar o mouse
                  e.currentTarget.style.color = '#202038'; // Cor do texto ao passar o mouse
                }
              }}
              onMouseLeave={(e) => {
                if (!showNewCampoForm) {
                  e.currentTarget.style.backgroundColor = '#202038'; // Cor original
                  e.currentTarget.style.color = '#f1f1f1'; // Cor do texto original
                }
              }}
              onClick={handleButtonIncluCampo}
            >
              <FaUserPlus /> Incluir Dia de Campo
            </button>
          </Box>

          {/* Formulário de nova dia de Campo */}
          <Box sx={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', display: showNewCampoForm ? 'block' : 'none' }}>
            <form onSubmit={handleNewRegCampoSubmit}>
              <Box sx={formBoxStyle}>
                <Box sx={{ flex: 1, minWidth: '200px' }}>
                  <TextField label="Sequência *" variant="outlined" size="small" fullWidth value={newRegistroCampo.cmp_seq} onChange={(e) => setNewRegistroCampo({ ...newRegistroCampo, cmp_seq: e.target.value })} sx={inputStyle} />
                </Box>
                <Box sx={{ flex: 1, minWidth: '200px' }}>
                  <TextField label="Dia da Semana *" variant="outlined" size="small" fullWidth value={newRegistroCampo.cmp_diadasem} onChange={(e) => setNewRegistroCampo({ ...newRegistroCampo, cmp_diadasem: e.target.value })} sx={inputStyle} />
                </Box>
                <Box sx={{ flex: 1, minWidth: '200px' }}>
                  <TextField label="Local *" variant="outlined" size="small" fullWidth value={newRegistroCampo.cmp_local} onChange={(e) => setNewRegistroCampo({ ...newRegistroCampo, cmp_local: e.target.value })} sx={inputStyle} />
                </Box>
                <Box sx={{ flex: 1, minWidth: '200px' }}>
                  <TextField label="Endereço *" variant="outlined" size="small" fullWidth value={newRegistroCampo.cmp_enderec} onChange={(e) => setNewRegistroCampo({ ...newRegistroCampo, cmp_enderec: e.target.value })} sx={inputStyle} />
                </Box>
                <Box sx={{ flex: 1, minWidth: '200px' }}>
                  <TextField label="URL Local*" variant="outlined" size="small" fullWidth value={newRegistroCampo.cmp_url} onChange={(e) => setNewRegistroCampo({ ...newRegistroCampo, cmp_url: e.target.value })} sx={inputStyle} />
                </Box>
                <Box sx={{ flex: 1, minWidth: '200px' }}>
                  <TextField label="Tipo Atividade *" variant="outlined" size="small" fullWidth value={newRegistroCampo.cmp_tipoativ} onChange={(e) => setNewRegistroCampo({ ...newRegistroCampo, cmp_tipoativ: e.target.value })} sx={inputStyle} />
                </Box>
                <Box sx={{ flex: 1, minWidth: '200px' }}>
                  <TextField label="Horário *" variant="outlined" size="small" fullWidth value={newRegistroCampo.cmp_horaini} onChange={(e) => setNewRegistroCampo({ ...newRegistroCampo, cmp_horaini: e.target.value })} sx={inputStyle} />
                </Box>
                <Box sx={{ flex: 1, minWidth: '200px' }}>
                  <TextField label="Detalhes *" variant="outlined" size="small" fullWidth value={newRegistroCampo.cmp_detalhes} onChange={(e) => setNewRegistroCampo({ ...newRegistroCampo, cmp_detalhes: e.target.value })} sx={inputStyle} />
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
                > <FaShareSquare /> Enviar dia Campo</button>
              </Box>
            </form>
            {message && <Typography variant="body1" sx={{ color: message.includes('Erro') ? 'red' : 'green', marginTop: '10px' }}>{message}</Typography>}
          </Box>
          <Box>
            <Box sx={{ marginTop: '60px' }}></Box>
            <h4 style={{ fontSize: '1.2rem', marginBottom: '16px', color: "rgba(78, 1, 12, 32)" }}>Programação de Carrinho Semanal</h4>
            <TableContainer component={Paper} sx={{ marginTop: '10px' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell align="center">Seq</TableCell>
                    <TableCell align="center">Dia da Semana</TableCell>
                    <TableCell align="center">Local</TableCell>
                    <TableCell align="center">Endereço</TableCell>
                    <TableCell align="center">URL Local</TableCell>
                    <TableCell align="center">Tipo Atividade</TableCell>
                    <TableCell align="center">Hora Início</TableCell>
                    <TableCell align="center">Hora Fim</TableCell>
                    <TableCell align="center">Detalhes</TableCell>
                    <TableCell align="center">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentDataCarr.map((row) => {
                    const isEditing = row.id === editRowId;
                    return (
                      <TableRow key={row.id}>
                        <TableCell align="center">{isEditing ? <TextField name="cmp_seq" value={editedRowData.cmp_seq || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.cmp_seq}</TableCell>
                        <TableCell align="center">{isEditing ? <TextField name="cmp_diadasem" value={editedRowData.cmp_diadasem || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.cmp_diadasem}</TableCell>
                        <TableCell align="center">{isEditing ? <TextField name="cmp_local" value={editedRowData.cmp_local || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.cmp_local}</TableCell>
                        <TableCell align="center">{isEditing ? <TextField name="cmp_enderec" value={editedRowData.cmp_enderec || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.cmp_enderec}</TableCell>
                        <TableCell align="center">{isEditing ? <TextField name="cmp_url" value={editedRowData.cmp_url || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.cmp_url}</TableCell>
                        <TableCell align="center">{isEditing ? <TextField name="cmp_tipoativ" value={editedRowData.cmp_tipoativ || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.cmp_tipoativ}</TableCell>
                        <TableCell align="center">{isEditing ? <TextField name="cmp_horaini" value={editedRowData.cmp_horaini || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.cmp_horaini}</TableCell>
                        <TableCell align="center">{isEditing ? <TextField name="cmp_horafim" value={editedRowData.cmp_horafim || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.cmp_horafim}</TableCell>
                        <TableCell align="center">{isEditing ? <TextField name="cmp_detalhes" value={editedRowData.cmp_detalhes || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.cmp_detalhes}</TableCell>
                        <TableCell align="center">
                          {isEditing ? (
                            <Button variant="contained" color="primary" size="small" onClick={handleSave} sx={{ fontSize: '0.65rem', padding: '2px 5px' }}>Salvar</Button>
                          ) : (
                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
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
              count={dataCarrinho.length}
              rowsPerPage={rowsPerPageCarr}
              page={pageCarr}
              onPageChange={handleChangePageCarr}
              sx={{
                '& .MuiTablePagination-toolbar': { fontSize: '0.65rem' },
                '& .MuiTablePagination-selectRoot': { fontSize: '0.65rem' },
                '& .MuiTablePagination-displayedRows': { fontSize: '0.65rem' },
              }}
            />

            {/* Botão para abrir o formulário de novo dia de Carrinho */}
            <button
              type="button"
              style={{
                ...buttonStyle,
                backgroundColor: showNewCarrinhoForm ? '#67e7eb' : '#202038',
                color: showNewCarrinhoForm ? '#202038' : '#f1f1f1',
              }}
              onMouseEnter={(e) => {
                if (!showNewCarrinhoForm) {
                  e.currentTarget.style.backgroundColor = '#67e7eb'; // Cor ao passar o mouse
                  e.currentTarget.style.color = '#202038'; // Cor do texto ao passar o mouse
                }
              }}
              onMouseLeave={(e) => {
                if (!showNewCarrinhoForm) {
                  e.currentTarget.style.backgroundColor = '#202038'; // Cor original
                  e.currentTarget.style.color = '#f1f1f1'; // Cor do texto original
                }
              }}
              onClick={handleButtonIncluCarrinh}
            >
              <FaUserPlus /> Incluir Dia de Carrinho
            </button>
          </Box>
        </Box>

        {/* Formulário de novo dia de Carrinho */}
        <Box sx={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', display: showNewCarrinhoForm ? 'block' : 'none' }}>
          <form onSubmit={handleNewRegCarrinhoSubmit}>
            <Box sx={formBoxStyle}>
              <Box sx={{ flex: 1, minWidth: '200px' }}>
                <TextField label="Sequência *" variant="outlined" size="small" fullWidth value={newRegistroCarrinho.cmp_seq} onChange={(e) => setNewRegistroCarrinho({ ...newRegistroCarrinho, cmp_seq: e.target.value })} sx={inputStyle} />
              </Box>
              <Box sx={{ flex: 1, minWidth: '200px' }}>
                <TextField label="Dia da Semana *" variant="outlined" size="small" fullWidth value={newRegistroCarrinho.cmp_diadasem} onChange={(e) => setNewRegistroCarrinho({ ...newRegistroCarrinho, cmp_diadasem: e.target.value })} sx={inputStyle} />
              </Box>
              <Box sx={{ flex: 1, minWidth: '200px' }}>
                <TextField label="Local *" variant="outlined" size="small" fullWidth value={newRegistroCarrinho.cmp_local} onChange={(e) => setNewRegistroCarrinho({ ...newRegistroCarrinho, cmp_local: e.target.value })} sx={inputStyle} />
              </Box>
              <Box sx={{ flex: 1, minWidth: '200px' }}>
                <TextField label="Endereço *" variant="outlined" size="small" fullWidth value={newRegistroCarrinho.cmp_enderec} onChange={(e) => setNewRegistroCarrinho({ ...newRegistroCarrinho, cmp_enderec: e.target.value })} sx={inputStyle} />
              </Box>
              <Box sx={{ flex: 1, minWidth: '200px' }}>
                <TextField label="URL Local*" variant="outlined" size="small" fullWidth value={newRegistroCarrinho.cmp_url} onChange={(e) => setNewRegistroCarrinho({ ...newRegistroCarrinho, cmp_url: e.target.value })} sx={inputStyle} />
              </Box>
              <Box sx={{ flex: 1, minWidth: '200px' }}>
                <TextField label="Tipo Atividade *" variant="outlined" size="small" fullWidth value={newRegistroCarrinho.cmp_tipoativ} onChange={(e) => setNewRegistroCarrinho({ ...newRegistroCarrinho, cmp_tipoativ: e.target.value })} sx={inputStyle} />
              </Box>
              <Box sx={{ flex: 1, minWidth: '200px' }}>
                <TextField label="Hora Início *" variant="outlined" size="small" fullWidth value={newRegistroCarrinho.cmp_horaini} onChange={(e) => setNewRegistroCarrinho({ ...newRegistroCarrinho, cmp_horaini: e.target.value })} sx={inputStyle} />
              </Box>
              <Box sx={{ flex: 1, minWidth: '200px' }}>
                <TextField label="Hora Final *" variant="outlined" size="small" fullWidth value={newRegistroCarrinho.cmp_horafim} onChange={(e) => setNewRegistroCarrinho({ ...newRegistroCarrinho, cmp_horafim: e.target.value })} sx={inputStyle} />
              </Box>
              <Box sx={{ flex: 1, minWidth: '200px' }}>
                <TextField label="Detalhes *" variant="outlined" size="small" fullWidth value={newRegistroCarrinho.cmp_detalhes} onChange={(e) => setNewRegistroCarrinho({ ...newRegistroCarrinho, cmp_detalhes: e.target.value })} sx={inputStyle} />
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
    </Box>
  );
};

export default ConfigCampoForm;
