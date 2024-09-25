import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import api_service from '../services/api_service'; // Importando serviço da API
import {Box } from '@mui/material';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const IndicaForm = () => {
  const [indicacoes, setIndicacoes] = useState([]);
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const [editRow, setEditRow] = useState(null);
  const [data_inclu, setDtInclu] = useState('  /  /  ');
  const [nome_publica, setNomePub] = useState('');
  const [cod_congreg, setCodCongreg] = useState('');
  const [cod_regiao, setCodRegiao] = useState('');
  const [enderec, setEnderec] = useState('');
  const [end_confirm, setEndConfim] = useState('');
  const [origem, setOrigem] = useState('');
  const [obs, setObs] = useState('');

  useEffect(() => {
    api_service.get('/indicaall')
      .then((response) => {
        setRows(response.data);
        setIndicacoes(response.data); // Set initial data for export
      })
      .catch((error) => {
        console.error("Erro ao buscar as indicações: ", error);
      });
  }, []);

  const handleSearch = (event) => {
    setSearch(event.target.value || '');
  };

  const filteredRows = rows.filter((row) =>
    (row.enderec || '').toLowerCase().includes((search || '').toLowerCase())
  );

  const clearForm = () => {
    setDtInclu('');
    setNomePub('');
    setCodCongreg('');
    setCodRegiao('');
    setEnderec('');
    setEndConfim('');
    setOrigem('');
    setObs('');
    setEditRow(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editRow) {
      try {
        await api_service.put(`/indica/${editRow.id}`, { nome_publica, enderec, end_confirm, obs });
        setRows(rows.map(row => (row.id === editRow.id ? { ...row, nome_publica, enderec, end_confirm, obs } : row)));
      } catch (error) {
        console.error("Erro ao atualizar a indicação: ", error);
      }
    } else {
      try {
        const response = await api_service.post('/indica', { data_inclu, nome_publica, cod_congreg, cod_regiao, enderec, end_confirm, origem, obs });
        setRows([...rows, response.data]);
        setIndicacoes([...rows, response.data]); // Update data for export
      } catch (error) {
        console.error("Erro ao cadastrar a indicação: ", error);
      }
    }
    clearForm();
  };

  const handleEdit = (row) => {
    setEditRow(row);
    setDtInclu(row.data_inclu);
    setNomePub(row.nome_publica);
    setCodCongreg(row.cod_congreg);
    setCodRegiao(row.cod_regiao);
    setEnderec(row.enderec);
    setEndConfim(row.end_confirm);
    setOrigem(row.origem);
    setObs(row.obs);
  };

  const handleDelete = async (id) => {
    try {
      await api_service.delete(`/indica/${id}`);
      setRows(rows.filter((row) => row.id !== id));
      setIndicacoes(rows.filter((row) => row.id !== id)); // Update data for export
    } catch (error) {
      console.error("Erro ao excluir a indicação: ", error);
    }
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(indicacoes);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Indicações');
    XLSX.writeFile(wb, 'indicacoes.xlsx');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['ID', 'Data', 'Publicador', 'Congregação', 'Região', 'Endereço', 'Confirmado?', 'Origem']],
      body: indicacoes.map(row => [
        row.id,
        row.data_inclu,
        row.nome_publica,
        row.cod_congreg,
        row.cod_regiao,
        row.enderec,
        row.end_confirm,
        row.origem
      ]),
    });
    doc.save('indicacoes.pdf');
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
      <h2 style={{ fontSize: '1.4rem', marginTop: '40px' }}>Manutenção das Indicações</h2> 

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
          placeholder="Data"
          value={data_inclu}
          onChange={(e) => setDtInclu(e.target.value)}
          style={{
            marginRight: '5px',
            padding: '3px',
            fontSize: '0.75rem',
            width: '120px',
          }}
        />

        <input
          type="text"
          placeholder="Nome Publicador"
          value={nome_publica}
          onChange={(e) => setNomePub(e.target.value)}
          style={{
            marginRight: '5px',
            padding: '3px',
            fontSize: '0.75rem',
            width: '120px',
          }}
        />
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
          placeholder="Região"
          value={cod_regiao}
          onChange={(e) => setCodRegiao(e.target.value)}
          style={{
            marginRight: '5px',
            padding: '3px',
            fontSize: '0.75rem',
            width: '120px',
          }}
        />
        <input
          type="text"
          placeholder="Endereço"
          value={enderec}
          onChange={(e) => setEnderec(e.target.value)}
          style={{
            marginRight: '5px',
            padding: '3px',
            fontSize: '0.75rem',
            width: '180px',
          }}
        />
        <input
          type="text"
          placeholder="Confirmado?"
          value={end_confirm}
          onChange={(e) => setEndConfim(e.target.value)}
          style={{
            marginRight: '5px',
            padding: '3px',
            fontSize: '0.75rem',
            width: '120px',
          }}
        />
        <input
          type="text"
          placeholder="Origem"
          value={origem}
          onChange={(e) => setOrigem(e.target.value)}
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

      <Box sx={{ height: 300, width: '98%' }}>
        <DataGrid
          sx={{
            backgroundColor: 'rgb(255, 255, 255)',
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: 'rgb(200, 200, 200)', // Fundo cinza para cabeçalhos
              color: 'black', // Texto preto
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
            { field: 'data_inclu', headerName: 'Data', width: 105 },
            { field: 'nome_publica', headerName: 'Publicador', width: 105 },
            { field: 'cod_congreg', headerName: 'Congregação', width: 105 },
            { field: 'cod_regiao', headerName: 'Região', width: 105 },
            { field: 'enderec', headerName: 'Indicação', width: 105 },
            { field: 'end_confirm', headerName: 'Confirmado?', width: 105 },
            { field: 'origem', headerName: 'Origem', width: 105 },
            {
              field: 'actions',
              headerName: 'Ações',
              width: 114,
              renderCell: (params) => (
                <>
                  <button
                    onClick={() => handleEdit(params.row)}
                    style={{
                      ...buttonStyle,
                      backgroundColor: 'rgb(0, 7, 61)', // Cor de fundo para botão Editar
                      marginRight: '2px',
                    }}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(params.row.id)}
                    style={{
                      ...buttonStyle,
                      backgroundColor: 'rgb(200, 0, 0)', // Cor de fundo para botão Excluir
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
          checkboxSelection
          getRowId={(row) => row.id}
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

export default IndicaForm;
