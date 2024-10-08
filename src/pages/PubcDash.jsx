import React, { useState, useEffect } from 'react';
import api_service from '../services/api_service'; // Importando serviço da API
import { useNavigate } from 'react-router-dom'; // Importe o useNavigate
import { Box, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination } from '@mui/material';
import { FaEdit } from 'react-icons/fa';

const PubcgDash = () => {
  const [data, setData] = useState([]);
  const navigate = useNavigate(); // Use o useNavigate
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(2); // Limite de linhas por página

  const totalAtivos = new Set(data.map(item => item.pub_status)).size;

  useEffect(() => {
    api_service.get('/pubcall')
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        console.error("Erro ao buscar os dados: ", error);
      });
  }, []);

  // Função para lidar com o clique do botão
  const handleNovoIndica = () => {
    navigate('/home/form-pubc'); // Navegue para a rota definida
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
      <h2 style={{ fontSize: '1.6rem', marginBottom: '16px' }}>Publicadores</h2>

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
                Num. de Publicadores
              </Typography>
              <Typography variant="h2" sx={{ fontSize: '1.8rem' }}>{data.length}</Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: 1, minWidth: '160px', maxWidth: '160px', height: '110px' }}>
          <Card sx={{ width: '100%', backgroundColor: '#202038', color: 'white' }}>
            <CardContent>
              <Typography variant="h5" sx={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                Total Ativos
              </Typography>
              <Typography variant="h2" sx={{ fontSize: '1.8rem' }}>{totalAtivos}</Typography>
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
          <FaEdit  /> Manutenção Publicadores {/* Ícone de adição */}
          
        </button>

        <TableContainer component={Paper} sx={{ marginTop: '10px' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="center" sx={{ fontSize: '0.65rem', whiteSpace: 'nowrap' }}>Publicador</TableCell>
                <TableCell align="center" sx={{ fontSize: '0.65rem', whiteSpace: 'nowrap' }}>Contato</TableCell>
                <TableCell align="center" sx={{ fontSize: '0.65rem', whiteSpace: 'nowrap' }}>Status</TableCell>
                <TableCell align="center" sx={{ fontSize: '0.65rem', whiteSpace: 'nowrap' }}>Login</TableCell>
                <TableCell align="center" sx={{ fontSize: '0.65rem', whiteSpace: 'nowrap' }}>Email</TableCell>
                <TableCell align="center" sx={{ fontSize: '0.65rem', whiteSpace: 'nowrap' }}>Endereço</TableCell>
                <TableCell align="center" sx={{ fontSize: '0.65rem', whiteSpace: 'nowrap' }}>Região</TableCell>
                <TableCell align="center" sx={{ fontSize: '0.65rem', whiteSpace: 'nowrap' }}>UF</TableCell>
                <TableCell align="center" sx={{ fontSize: '0.65rem', whiteSpace: 'nowrap' }}>Batismo</TableCell>
                <TableCell align="center" sx={{ fontSize: '0.65rem', whiteSpace: 'nowrap' }}>Nascimento</TableCell>
                <TableCell align="center" sx={{ fontSize: '0.65rem', whiteSpace: 'nowrap' }}>Desig. Serviço</TableCell>
                <TableCell align="center" sx={{ fontSize: '0.65rem', whiteSpace: 'nowrap' }}>Desig. Campo</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
              {currentData.map((row) => {
                return (
                  <TableRow key={row.id} sx={{ height: '10px' }}>
                    <TableCell align="center" sx={{ fontSize: '0.65rem', whiteSpace: 'nowrap' }}>{row.pub_nome}</TableCell>
                    <TableCell align="center" sx={{ fontSize: '0.65rem', whiteSpace: 'nowrap' }}>{row.pub_contat}</TableCell>
                    <TableCell align="center" sx={{ fontSize: '0.65rem', whiteSpace: 'nowrap' }}>{row.pub_status}</TableCell>
                    <TableCell align="center" sx={{ fontSize: '0.65rem', whiteSpace: 'nowrap' }}>{row.pub_login}</TableCell>
                    <TableCell align="center" sx={{ fontSize: '0.65rem', whiteSpace: 'nowrap' }}>{row.pub_email}</TableCell>
                    <TableCell align="center" sx={{ fontSize: '0.65rem', whiteSpace: 'nowrap' }}>{row.pub_endereco}</TableCell>
                    <TableCell align="center" sx={{ fontSize: '0.65rem', whiteSpace: 'nowrap' }}>{row.pub_regiao}</TableCell>
                    <TableCell align="center" sx={{ fontSize: '0.65rem', whiteSpace: 'nowrap' }}>{row.pub_uf}</TableCell>
                    <TableCell align="center" sx={{ fontSize: '0.65rem', whiteSpace: 'nowrap' }}>{row.pub_dtbatism}</TableCell>
                    <TableCell align="center" sx={{ fontSize: '0.65rem', whiteSpace: 'nowrap' }}>{row.pub_dtnasc}</TableCell>
                    <TableCell align="center" sx={{ fontSize: '0.65rem', whiteSpace: 'nowrap' }}>{row.desig_campo}</TableCell>
                    <TableCell align="center" sx={{ fontSize: '0.65rem', whiteSpace: 'nowrap' }}>{row.resp_obs}</TableCell>
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

export default PubcgDash;
