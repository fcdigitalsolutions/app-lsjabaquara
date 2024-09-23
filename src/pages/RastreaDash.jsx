import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Importe o useNavigate
import { Box, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination } from '@mui/material';

const RegNCDash = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(2); // Limite de linhas por página
  const navigate = useNavigate();

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

  const totalPendentes = data.filter(item => item.num_visitas <= 1).length;
  const totalConcluidos = data.filter(item => item.num_visitas >= 2).length;
  const totalRegioes = new Set(data.map(item => item.cod_regiao)).size;

  useEffect(() => {
    axios.get('https://ls-jabaquara.com.br/rastrearall')
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        console.error("Erro ao buscar os dados: ", error);
      });
  }, []);

  const handleNovoRastreamento = () => {
    navigate('/home/form-rastrea'); // Navegue para a rota definida
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Em andamento':
        return 'green';
      case 'Pendente':
        return 'gray';
      case 'Concluído':
        return '#202038';
      default:
        return 'transparent';
    }
  };

  const buttonStyle = {
    padding: '4px 12px',
    fontSize: '0.75rem',
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
      <h2 style={{ fontSize: '1.6rem', marginBottom: '16px' }}>Rastreamentos</h2>

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
              <Typography variant="h5" sx={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>Congregações</Typography> {/* Fonte ajustada */}
              <Typography variant="h2" sx={{ fontSize: '1.8rem' }}>{data.length}</Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: 1, minWidth: '160px', maxWidth: '160px', height: '110px' }}>
          <Card sx={{ width: '100%', backgroundColor: '#202038', color: 'white' }}>
            <CardContent>
              <Typography variant="h5" sx={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>Mapas Vinculados</Typography> {/* Fonte ajustada */}
              <Typography variant="h2" sx={{ fontSize: '1.8rem' }}>{totalRegioes}</Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: 1, minWidth: '160px', maxWidth: '160px', height: '110px' }}>
          <Card sx={{ width: '100%', backgroundColor: '#202038', color: 'white' }}>
            <CardContent>
              <Typography variant="h5" sx={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>Mapas Concluídos</Typography> {/* Fonte ajustada */}
              <Typography variant="h2" sx={{ fontSize: '1.8rem' }}>{totalConcluidos}</Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: 1, minWidth: '160px', maxWidth: '160px', height: '110px' }}>
          <Card sx={{ width: '100%', backgroundColor: '#202038', color: 'white' }}>
            <CardContent>
              <Typography variant="h5" sx={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>Rastrea. Concluídos</Typography> {/* Fonte ajustada */}
              <Typography variant="h2" sx={{ fontSize: '1.8rem' }}>{totalPendentes}</Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>
      <Box sx={{ backgroundColor: 'rgb(255, 255, 255)', padding: '11px', borderRadius: '15px' }}>      </Box>
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
          onClick={handleNovoRastreamento}
        >
          + Manutenção Rastreamento
        </button>
        <TableContainer component={Paper} sx={{ marginTop: '10px' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="center" sx={{ fontSize: '0.65rem', whiteSpace: 'nowrap' }}>Congregação</TableCell>
                <TableCell align="center" sx={{ fontSize: '0.65rem', whiteSpace: 'nowrap' }}>Status</TableCell>
                <TableCell align="center" sx={{ fontSize: '0.65rem', whiteSpace: 'nowrap' }}>Dt. Início</TableCell>
                <TableCell align="center" sx={{ fontSize: '0.65rem', whiteSpace: 'nowrap' }}>Dt. Fim</TableCell>
                <TableCell align="center" sx={{ fontSize: '0.65rem', whiteSpace: 'nowrap' }}>Mapas Ativos</TableCell>
                <TableCell align="center" sx={{ fontSize: '0.65rem', whiteSpace: 'nowrap' }}>Mapas Concluídos</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentData.map((row) => {
                const status = getStatus(row.cod_status);
                return (
                  <TableRow key={row.id} sx={{ height: '10px' }}>
                    <TableCell align="center" sx={{ fontSize: '0.65rem', whiteSpace: 'nowrap' }}>{row.cod_congreg}</TableCell>
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
                    <TableCell align="center" sx={{ fontSize: '0.65rem', whiteSpace: 'nowrap' }}>{row.data_inicio}</TableCell>
                    <TableCell align="center" sx={{ fontSize: '0.65rem', whiteSpace: 'nowrap' }}>{row.data_fim}</TableCell>
                    <TableCell align="center" sx={{ fontSize: '0.65rem', whiteSpace: 'nowrap' }}>{row.num_enderec}</TableCell>
                    <TableCell align="center" sx={{ fontSize: '0.65rem', whiteSpace: 'nowrap' }}>{row.num_endconcl}</TableCell>
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

export default RegNCDash;
