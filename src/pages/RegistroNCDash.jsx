import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Card, CardContent, Typography } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Importe o useNavigate

const RegNCDash = () => {

  const [data, setData] = useState([]);
  const navigate = useNavigate(); // Use o useNavigate

  // Função para determinar o status com base no número de visitas
  const getStatus = (num_visitas) => {
    if (num_visitas <= 1) {
      return 'Pendente';
    } else if (num_visitas >= 2) {
      return 'Concluído';
    }
    return 'Desconhecido'; // Fallback para casos inesperados
  };

  const totalPendentes = data.filter(item => item.num_visitas <= 1).length;
  const totalConcluidos = data.filter(item => item.num_visitas >= 2).length;
  const totalRegioes = new Set(data.map(item => item.cod_regiao)).size;


  useEffect(() => {
    axios.get('https://ls-jabaquara.com.br/registncall')
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        console.error("Erro ao buscar os dados: ", error);
      });
  }, []);

  // Função para lidar com o clique do botão
  const handleNovoRegistroNC = () => {
    navigate('/home/form-registnc'); // Navegue para a rota definida
  };

  // Função para determinar a cor de fundo da célula com base no status
  const getStatusColor = (status) => {
    switch (status) {
      case 'Pendente':
        return 'green';
      case 'Concluído':
        return '#202038';
      default:
        return 'transparent';
    }
  };

  // Colunas para o DataGrid
  const columns = [
    { field: 'cod_regiao', headerName: 'Região', width: 95, align: 'center', headerAlign: 'center' },
    {
      field: 'num_visitas',
      headerName: 'Status',
      width: 150,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const status = getStatus(params.value); // Chama a função getStatus com base no valor de num_visitas
        return (
          <div
            style={{
              backgroundColor: getStatusColor(status),
              color: 'white',
              padding: '3px',
              borderRadius: '4px',
              textAlign: 'center',
              width: '100%',
              lineHeight: '1.2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
            }}
          >
            {status}
          </div>
        );
      },
    },
    { field: 'enderec', headerName: 'Logradouro', width: 105, align: 'center', headerAlign: 'center' },
    { field: 'obs', headerName: 'Números', width: 150, align: 'center', headerAlign: 'center' },
    { field: 'data_inclu', headerName: 'Primeira Visita', width: 95, align: 'center', headerAlign: 'center' },
    { field: 'dt_ult_visit', headerName: 'Última Visita', width: 95, align: 'center', headerAlign: 'center' },
  ];

  const buttonStyle = {
    padding: '4px 12px',
    fontSize: '0.80rem',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
  };

  return (
    <Box sx={{ padding: '20px', backgroundColor: 'rgb(255,255,255)', color: '#202038' }}>
      <h2 style={{ fontSize: '1.8rem', marginBottom: '25px' }}>Registros NC</h2>

      {/* Cards de resumo */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(176px, 1fr))', // Aumentado em 10%
          gap: '5px',
          marginBottom: '20px',
        }}
      >
        <Card sx={{ width: '85%', backgroundColor: '#202038', color: 'white' }}>
          <CardContent>
            <Typography variant="h5" sx={{ fontSize: '1.1rem' }}>Total de Registros NC</Typography>
            <Typography variant="h2" sx={{ fontSize: '2.2rem' }}>{data.length}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ width: '85%', backgroundColor: '#202038', color: 'white' }}>
          <CardContent>
            <Typography variant="h5" sx={{ fontSize: '1.1rem' }}>Num. Regiões Distintas</Typography>
            <Typography variant="h2" sx={{ fontSize: '2.2rem' }}>{totalRegioes}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ width: '85%', backgroundColor: '#202038;', color: 'white' }}>
          <CardContent>
            <Typography variant="h5" sx={{ fontSize: '1.1rem' }}>Registros Finalizados</Typography>
            <Typography variant="h2" sx={{ fontSize: '2.2rem' }}>{totalConcluidos}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ width: '85%', backgroundColor: '#202038', color: 'white' }}>
          <CardContent>
            <Typography variant="h5" sx={{ fontSize: '1.1rem' }}>Registros Pendentes</Typography>
            <Typography variant="h2" sx={{ fontSize: '2.2rem' }}>{totalPendentes}</Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Lista de Registros NC */}
      <Box sx={{ backgroundColor: 'rgb(255, 255, 255)', padding: '20px', borderRadius: '15px' }}>
        <h3>Status dos Registros NC</h3>

        <button
          type="button"
          style={{
            ...buttonStyle,
            backgroundColor: '#202038', // Cor de fundo para botão
            marginLeft: '630px',
          }}
          onClick={handleNovoRegistroNC} // Função chamada ao clicar no botão
        >
          + Manutenção Registros NC
        </button>
        <br></br> 

        <Box sx={{ height: 320, width: '100%' }}>
          <DataGrid
            rows={data}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5, 10, 20]}
            disableSelectionOnClick
            getRowId={(row) => row.id}
            sx={{
              backgroundColor: 'rgb(255, 255, 255)',
              color: '#202038',
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: 'rgb(240, 240, 240)',
                color: '#202038',
                fontWeight: 'bold',
              },
              '& .MuiDataGrid-cell': {
                fontSize: '0.775rem',
                padding: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              },
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default RegNCDash;
