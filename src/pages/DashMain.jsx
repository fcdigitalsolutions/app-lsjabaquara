import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import axios from 'axios';

const DashMain = () => {
  const [data, setData] = useState([]);

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

  return (
    <Box sx={{ padding: '20px', backgroundColor: 'rgb(255,255,255)', color: 'rgb(0, 7, 61)' }}>
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
        <Card sx={{ width: '85%', backgroundColor: 'rgb(0, 7, 61)', color: 'white' }}>
          <CardContent>
            <Typography variant="h5" sx={{ fontSize: '1.1rem' }}>Total de Congregações</Typography>
            <Typography variant="h2" sx={{ fontSize: '2.2rem' }}>{data.length}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ width: '85%', backgroundColor: 'rgb(0, 7, 61)', color: 'white' }}>
          <CardContent>
            <Typography variant="h5" sx={{ fontSize: '1.1rem' }}>Mapas Vinculados</Typography>
            <Typography variant="h2" sx={{ fontSize: '2.2rem' }}>
              {data.reduce((acc, curr) => acc + curr.num_enderec, 0)}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ width: '85%', backgroundColor: 'rgb(0, 7, 61)', color: 'white' }}>
          <CardContent>
            <Typography variant="h5" sx={{ fontSize: '1.1rem' }}>Mapas Concluídos</Typography>
            <Typography variant="h2" sx={{ fontSize: '2.2rem' }}>
              {data.reduce((acc, curr) => acc + curr.num_endconcl, 0)}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ width: '85%', backgroundColor: 'rgb(0, 7, 61)', color: 'white' }}>
          <CardContent>
            <Typography variant="h5" sx={{ fontSize: '1.1rem' }}>Rastreamentos Concluídos</Typography>
            <Typography variant="h2" sx={{ fontSize: '2.2rem' }}>{totalConcluidos}</Typography>
          </CardContent>
        </Card>
      </Box>

   
    </Box>
  );
};

export default DashMain;
