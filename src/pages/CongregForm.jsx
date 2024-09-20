import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';
import { Box } from '@mui/material';

const CadastroCongreg = () => {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const [editRow, setEditRow] = useState(null);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');

  useEffect(() => {
    axios.get('http://127.0.0.1:5000/regionsall')
      .then((response) => {
        setRows(response.data);
      })
      .catch((error) => {
        console.error("Erro ao buscar as regiões: ", error);
      });
  }, []);

  const handleSearch = (event) => {
    setSearch(event.target.value || '');
  };

  const filteredRows = rows.filter((row) =>
    (row.nome || '').toLowerCase().includes((search || '').toLowerCase())
  );

  const clearForm = () => {
    setNome('');
    setDescricao('');
    setEditRow(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editRow) {
      try {
        await axios.put(`http://127.0.0.1:5000/regions/${editRow.id}`, { nome, descricao });
        setRows(rows.map(row => (row.id === editRow.id ? { ...row, nome, descricao } : row)));
      } catch (error) {
        console.error("Erro ao atualizar a região: ", error);
      }
    } else {
      try {
        const response = await axios.post('http://127.0.0.1:5000/regions', { nome, descricao });
        setRows([...rows, response.data]);
      } catch (error) {
        console.error("Erro ao cadastrar a região: ", error);
      }
    }
    clearForm();
  };

  const handleEdit = (row) => {
    setEditRow(row);
    setNome(row.nome);
    setDescricao(row.descricao);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:5000/regions/${id}`);
      setRows(rows.filter((row) => row.id !== id));
    } catch (error) {
      console.error("Erro ao excluir a região: ", error);
    }
  };

  return (
    <Box sx={{ padding: '10px', color: 'rgb(0, 7, 61)', backgroundColor: 'rgb(255,255,255)' }}>
      <h2 style={{ fontSize: '1.4rem', marginTop: '40px' }}>Cadastro de Congregações</h2> {/* Espaço maior acima do título */}

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
          placeholder="Nome da Região"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          style={{
            marginRight: '5px',
            padding: '3px',
            fontSize: '0.75rem',
            width: '120px',
          }}
        />
        <input
          type="text"
          placeholder="Descrição"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          style={{
            marginRight: '5px',
            padding: '3px',
            fontSize: '0.75rem',
            width: '120px',
          }}
        />
        <button
          type="submit"
          style={{
            padding: '3px 6px',
            fontSize: '0.75rem',
          }}
        >
          {editRow ? 'Atualizar' : 'Cadastrar'}
        </button>
        {editRow && (
          <button
            type="button"
            onClick={clearForm}
            style={{
              padding: '3px 6px',
              fontSize: '0.75rem',
              marginLeft: '5px',
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
            { field: 'id', headerName: 'ID', width: 28 }, // Reduzido em aproximadamente 30%
            { field: 'nome', headerName: 'Nome da Região', width: 105 }, // Reduzido em aproximadamente 30%
            { field: 'descricao', headerName: 'Descrição', width: 105 }, // Reduzido em aproximadamente 30%
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
    </Box>
  );
};

export default CadastroCongreg;
