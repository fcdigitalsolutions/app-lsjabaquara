import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';
import {Box } from '@mui/material';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const RastreaForm = () => {
  const [rastrear, setRastrear] = useState([]);
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const [editRow, setEditRow] = useState(null);
  const [cod_congreg, setCodCongreg] = useState('');
  const [data_inicio, setDtInicio] = useState('');
  const [data_fim   , setDtFim] = useState('');
  const [cod_status, setCodStatus] = useState('');
  const Data_Atual = new Date();

  useEffect(() => {
    axios.get('https://ls-jabaquara.com.br/rastrearall')
      .then((response) => {
        setRows(response.data);
        setRastrear(response.data); // Set initial data for export
      })
      .catch((error) => {
        console.error("Erro ao buscar os rastreamentos: ", error);
      });
  }, []);

  const handleSearch = (event) => {
    setSearch(event.target.value || '');
  };

  const filteredRows = rows.filter((row) =>
    (row.nome || '').toLowerCase().includes((search || '').toLowerCase())
  );

  const clearForm = () => {
    setCodCongreg('');
    setDtInicio('');
    setDtFim('');
    setCodStatus('');
    setEditRow(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editRow) {
      try {
        await axios.put(`https://ls-jabaquara.com.br/rastrear/${editRow.id}`, { cod_congreg,data_inicio,data_fim,cod_status});
        setRows(rows.map(row => (row.id === editRow.id ? { ...row, cod_congreg, data_inicio,data_fim,cod_status } : row)));
      } catch (error) {
        console.error("Erro ao atualizar o rastreamento: ", error);
      }
    } else {
      try {
        const defaultDtInclu = Data_Atual.toLocaleDateString();
        const defaultNumEnderecos = 45;
        const defaultNumEnderconcl = 44;
        const defaultStatus = '0';
        
        const response = await axios.post('https://ls-jabaquara.com.br/rastrear', { 
          cod_congreg,
          data_inclu: defaultDtInclu,
          data_inicio,
          data_fim,
          num_enderec: defaultNumEnderecos,
          num_endconcl: defaultNumEnderconcl,
          cod_status: defaultStatus
        });
        setRows([...rows, response.data]);
      } catch (error) {
        console.error("Erro ao cadastrar o rastreamento: ", error);
      }
    }
    clearForm();
  };

  const handleEdit = (row) => {
    setEditRow(row);
    setCodCongreg(row.cod_congreg);
    setDtInicio(row.data_inicio);
    setDtFim(row.data_fim);
    setCodStatus(row.cod_status);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://ls-jabaquara.com.br/rastrear/${id}`);
      setRows(rows.filter((row) => row.id !== id));
    } catch (error) {
      console.error("Erro ao excluir o rastreamento: ", error);
    }
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(rastrear);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Rastreamento');
    XLSX.writeFile(wb, 'rastreamentos.xlsx');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['ID', 'Status','Congregação', 'Dt. Início', 'Dt. Fim', 'Endereços', 'Endereços Concluídos']],
      body: rastrear.map(row => [
        row.id,
        row.cod_status,
        row.cod_congreg,
        row.data_inicio,
        row.data_fim,
        row.num_enderec,
        row.enderec,
        row.num_endconcl,       
      ]),
    });
    doc.save('rastreamentos.pdf');
  };

  const buttonStyle = {
    padding: '2px 5px',
    fontSize: '0.65rem',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
  };

  return (
    <Box sx={{ padding: '10px', color: 'rgb(0, 7, 61)', backgroundColor: 'rgb(255,255,255)' }}>
      <h2 style={{ fontSize: '1.4rem', marginTop: '40px' }}>Manutenção dos Rastreamentos</h2> 

      <input
        type="text"
        placeholder="Pesquisar..."
        value={search}
        onChange={handleSearch}
        style={{
          marginBottom: '15px', // Espaço vertical entre o título e o input
          marginTop: '15px', // Espaço vertical entre o título e o input
          padding: '3px',
          width: '150px',
          fontSize: '0.75rem',
        }}
      />

      <form onSubmit={handleSubmit} style={{ marginBottom: '10px' }}>
        <input
          type="text"
          placeholder="Congregação"
          value={cod_congreg}
          onChange={(e) => setCodCongreg(e.target.value)}
          style={{
            marginRight: '5px',
            padding: '3px',
            fontSize: '0.75rem',
            width: '120px',
          }}
        />
        <input
          type="text"
          placeholder="Dt. Início"
          value={data_inicio}
          onChange={(e) => setDtInicio(e.target.value)}
          style={{
            marginRight: '5px',
            padding: '3px',
            fontSize: '0.75rem',
            width: '120px',
          }}
        />
           <input
          type="text"
          placeholder="Dt. Fim"
          value={data_fim}
          onChange={(e) => setDtFim(e.target.value)}
          style={{
            marginRight: '5px',
            padding: '3px',
            fontSize: '0.75rem',
            width: '120px',
          }}
        />
        
     <br></br>
        <button
          type="submit"
          style={{
            ...buttonStyle,
            backgroundColor: 'rgb(0, 7, 61)', // Cor de fundo para botão de submit
            marginRight: '5px',
          }}
        >
          {editRow ? 'Atualizar' : 'Cadastrar'}
        </button>
        {editRow && (
          <button
            type="button"
            onClick={clearForm}
            style={{
              ...buttonStyle,
              backgroundColor: 'rgb(200, 0, 0)', // Cor de fundo para botão de cancelar
            }}
          >
            Cancelar
          </button>
        )}
      </form>

      <Box sx={{ height: 300, width: '95%' }}>
        <DataGrid
          sx={{
            backgroundColor: 'rgb(255, 255, 255)',
            color: 'rgb(0, 0, 0)',
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: 'rgb(255, 255, 255)', // Fundo branco
              color: 'rgb(0, 0, 0)', // Texto preto
              fontWeight: 'bold', // Cabeçalho em negrito
              fontSize: '0.75rem', // Reduzindo o tamanho da fonte
            },
            '& .MuiDataGrid-cell': {
              color: 'rgb(0, 7, 61)',
              fontSize: '0.65rem', // Reduzindo a fonte das células
              padding: '3px',
            },
            '& .MuiDataGrid-footerContainer': {
              backgroundColor: 'rgb(255, 255, 255)', // Fundo branco para o rodapé
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: 'rgba(241, 241, 241)', // Cor ao passar o mouse
            },
            '& .MuiCheckbox-root': {
              transform: 'scale(0.6)', // Reduzindo o tamanho do checkbox em 20%
            },
            '@media (max-width: 500px)': {
              '& .MuiDataGrid-root': {
                fontSize: '0.50rem', // Fonte menor para telas pequenas
              },
              '& .MuiDataGrid-cell': {
                padding: '2px', // Padding menor
              },
            },
          }}
          rows={filteredRows}
          columns={[
            { field: 'id', headerName: 'ID', width: 28 }, 
            { field: 'cod_congreg', headerName: 'Congregação', width: 105 },
            { field: 'data_inclu', headerName: 'Dt. Inclusão', width: 105 }, 
            { field: 'data_inicio', headerName: 'Dt. Início', width: 105 }, 
            { field: 'data_fim', headerName: 'Dt. Fim', width: 105 }, 
            { field: 'num_enderec', headerName: 'Mapas', width: 105 }, 
            { field: 'num_endconcl', headerName: 'Mapas Concluídos', width: 105 }, 
            { field: 'cod_status', headerName: 'Status', width: 105 }, 
            {
              field: 'actions',
              headerName: 'Ações',
              width: 114, // Aumentado em aproximadamente 10%
              renderCell: (params) => (
                <>
                  <button
                    onClick={() => handleEdit(params.row)}
                    style={{
                      marginRight: '2px',
                      padding: '2px 5px',
                      fontSize: '0.65rem',
                      backgroundColor: 'rgb(0, 7, 61)',
                      color: 'white',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(params.row.id)}
                    style={{
                      padding: '2px 5px',
                      fontSize: '0.65rem',
                      backgroundColor: 'rgb(200, 0, 0)',
                      color: 'white',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    Excluir
                  </button>
                </>
              ),
            },
          ]}
          pageSize={5}
          rowsPerPageOptions={[5, 10, 20]}
          checkboxSelection // Incluindo o componente checkbox
          getRowId={(row) => row.id} // Adicionando getRowId
        />
      </Box>
         {/* Botões de exportação */}
         <Box sx={{ marginTop: '10px', textAlign: 'center' }}>
        <button
          onClick={exportToExcel}
          style={{
            ...buttonStyle,
            backgroundColor: 'rgb(0, 7, 61)', // Cor de fundo para botão Exportar Excel
            marginRight: '10px',
          }}
        >
          Exportar para Excel
        </button>
        <button
          onClick={exportToPDF}
          style={{
            ...buttonStyle,
            backgroundColor: 'rgb(200, 0, 0)', // Cor de fundo para botão Exportar PDF
          }}
        >
          Exportar para PDF
        </button>
      </Box>
    </Box>
  );
};

export default RastreaForm;
