import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Card, CardContent, Typography } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Importe o useNavigate

const RastreaDash = () => {

  
  console.log('RastreaDash rendered');
  const [data, setData] = useState([]);
  const navigate = useNavigate(); // Use o useNavigate

  const totalConcluidos = data.filter(item => item.cod_status === 'Concluído').length;

  useEffect(() => {
    axios.get('http://127.0.0.1:5000/rastrearall')
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        console.error("Erro ao buscar os dados: ", error);
      });
  }, []);

  // Função para lidar com o clique do botão
  const handleNovoRastreamento = () => {
    navigate('/home/form-rastrea'); // Navegue para a rota definida
  };

  // Função para determinar a cor de fundo da célula com base no status
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

  // Colunas para o DataGrid
  const columns = [
    { field: 'cod_congreg', headerName: 'Congregação', width: 180, align: 'center', headerAlign: 'center' },
    {
      field: 'cod_status',
      headerName: 'Status',
      width: 150,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <div
          style={{
            backgroundColor: getStatusColor(params.value),
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
          {params.value}
        </div>
      ),
    },
    { field: 'data_inicio', headerName: 'Dt. Início', width: 95, align: 'center', headerAlign: 'center' },
    { field: 'data_fim', headerName: 'Dt. Fim', width: 95, align: 'center', headerAlign: 'center' },
    { field: 'num_enderec', headerName: 'Mapas Ativos', width: 105, align: 'center', headerAlign: 'center' },
    { field: 'num_endconcl', headerName: 'Mapas Concluídos', width: 150, align: 'center', headerAlign: 'center' },
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
      <h2 style={{ fontSize: '1.8rem', marginBottom: '25px' }}>Rastreamentos</h2>

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
            <Typography variant="h5" sx={{ fontSize: '1.1rem' }}>Total de Congregações</Typography>
            <Typography variant="h2" sx={{ fontSize: '2.2rem' }}>{data.length}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ width: '85%', backgroundColor: '#202038', color: 'white' }}>
          <CardContent>
            <Typography variant="h5" sx={{ fontSize: '1.1rem' }}>Mapas Vinculados</Typography>
            <Typography variant="h2" sx={{ fontSize: '2.2rem' }}>
              {data.reduce((acc, curr) => acc + curr.num_enderec, 0)}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ width: '85%', backgroundColor: '#202038;', color: 'white' }}>
          <CardContent>
            <Typography variant="h5" sx={{ fontSize: '1.1rem' }}>Mapas Concluídos</Typography>
            <Typography variant="h2" sx={{ fontSize: '2.2rem' }}>
              {data.reduce((acc, curr) => acc + curr.num_endconcl, 0)}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ width: '85%', backgroundColor: '#202038', color: 'white' }}>
          <CardContent>
            <Typography variant="h5" sx={{ fontSize: '1.1rem' }}>Rastreamentos Concluídos</Typography>
            <Typography variant="h2" sx={{ fontSize: '2.2rem' }}>{totalConcluidos}</Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Lista de rastreamentos */}
      <Box sx={{ backgroundColor: 'rgb(255, 255, 255)', padding: '20px', borderRadius: '15px' }}>
        <h3>Status dos Rastreamentos</h3>

        <button
          type="button"
          style={{
            ...buttonStyle,
            backgroundColor: '#202038', // Cor de fundo para botão
            marginLeft: '630px',
          }}
          onClick={handleNovoRastreamento} // Função chamada ao clicar no botão
        >
          + Novo Rastreamento
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

export default RastreaDash;
