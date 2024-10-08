import React, { useState, useEffect } from 'react';
import api_service from '../services/api_service'; // Importando serviço da API
import { useNavigate } from 'react-router-dom'; // Importe o useNavigate
import { Box, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination } from '@mui/material';
import { FaEdit } from 'react-icons/fa';

const IndicaDash = () => {
  const [data, setData] = useState([]);
  const navigate = useNavigate(); // Use o useNavigate
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(2); // Limite de linhas por página

  const totalPendentes = data.filter(item => item.end_confirm !== '2').length;
  const totalConcluidos = data.filter(item => item.end_confirm === '2').length;
  const totalRegioes = new Set(data.map(item => item.cod_congreg)).size;

  useEffect(() => {
    api_service.get('/indicaall')
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        console.error("Erro ao buscar os dados: ", error);
      });
  }, []);

  // Função para lidar com o clique do botão
  const handleNovoIndica = () => {
    navigate('/home/form-indicac'); // Navegue para a rota definida
  };

  // Função para determinar o status com base no número de visitas
  const getStatus = (end_confirm) => {
    if (end_confirm === '2') {
      return 'Confirmado';
    } else {
      return 'Pendente';
    }
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

  const buttonStyle = {
    padding: '4px 12px',
    fontSize: '0.80rem',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Cálculo do índice inicial e final das linhas a serem exibidas
  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentData = data.slice(startIndex, endIndex);

  return (
    <Box sx={{ padding: '16px', backgroundColor: 'rgb(255,255,255)', color: '#202038' }}>
      <h2 style={{ fontSize: '1.6rem', marginBottom: '16px' }}>Indicações de Surdos</h2>

      {/* Box separado para os cards */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          justifyContent: 'space-between',
          marginBottom: '20px', // Espaçamento entre os cards e a tabela
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

      {/* Box separado para a tabela */}
      <Box sx={{ backgroundColor: 'rgb(255, 255, 255)', borderRadius: '15px' }}>
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
          onClick={handleNovoIndica}
        >
          <FaEdit  /> Manutenção Indicações {/* Ícone de adição */}
          
        </button>

        <TableContainer component={Paper} sx={{ marginTop: '10px' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="center" sx={{ fontSize: '0.65rem', whiteSpace: 'nowrap' }}>Endereço</TableCell>
                <TableCell align="center" sx={{ fontSize: '0.65rem', whiteSpace: 'nowrap' }}>Detalhes</TableCell>
                <TableCell align="center" sx={{ fontSize: '0.65rem', whiteSpace: 'nowrap' }}>Confirmado?</TableCell>
                <TableCell align="center" sx={{ fontSize: '0.65rem', whiteSpace: 'nowrap' }}>Data</TableCell>
                <TableCell align="center" sx={{ fontSize: '0.65rem', whiteSpace: 'nowrap' }}>Publicador</TableCell>
                <TableCell align="center" sx={{ fontSize: '0.65rem', whiteSpace: 'nowrap' }}>Contato</TableCell>
                <TableCell align="center" sx={{ fontSize: '0.65rem', whiteSpace: 'nowrap' }}>Congregação</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentData.map((row) => {
                const status = getStatus(row.end_confirm);
                return (
                  <TableRow key={row.id} sx={{ height: '10px' }}>
                    <TableCell align="center" sx={{ fontSize: '0.65rem', whiteSpace: 'nowrap' }}>{row.enderec}</TableCell>
                    <TableCell align="center" sx={{ fontSize: '0.65rem', whiteSpace: 'nowrap' }}>{row.obs}</TableCell>
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
                    <TableCell align="center" sx={{ fontSize: '0.65rem', whiteSpace: 'nowrap'}}>{row.data_inclu}</TableCell>
                    <TableCell align="center" sx={{ fontSize: '0.65rem', whiteSpace: 'nowrap' }}>{row.nome_publica}</TableCell>
                    <TableCell align="center" sx={{ fontSize: '0.65rem', whiteSpace: 'nowrap' }}>{row.num_contato}</TableCell>
                    <TableCell align="center" sx={{ fontSize: '0.65rem', whiteSpace: 'nowrap' }}>{row.cod_congreg}</TableCell>
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
            '& .MuiTablePagination-toolbar': {
              fontSize: '0.65rem',
            },
            '& .MuiTablePagination-selectRoot': {
              fontSize: '0.65rem',
            },
            '& .MuiTablePagination-displayedRows': {
              fontSize: '0.65rem',
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default IndicaDash;
