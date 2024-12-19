import React, { useState, useEffect } from 'react';
import api_service from '../services/api_service'; // Importando serviço da API
import { Box, Menu, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Card, CardContent, Paper, TablePagination, Button, TextField, Typography, Select, FormControl, Checkbox } from '@mui/material';
import { FaChevronDown, FaFileExport, FaUserPlus, FaShareSquare } from 'react-icons/fa';
import * as XLSX from 'xlsx'; // Importe a biblioteca XLSX

const RegPublicacoes = () => {
    const [data, setData] = useState([]);
    const [page, setPage] = useState(0);
    const [editRowId, setEditRowId] = useState(null); // ID da linha sendo editada
    const [editedRowData, setEditedRowData] = useState({}); // Dados da linha sendo editada
    const [showNewIndicationForm, setShowNewIndicationForm] = useState(false); // Controla a exibição do formulário de nova indicação
    const [message, setMessage] = useState(''); // Mensagem de sucesso ou erro
    const [selected, setSelected] = useState([]);
    const [rowsPerPage, setRowsPerPage] = useState(10); // Limite de linhas por página
    const Data_Atual = new Date();

    const formatDateTime = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Adiciona zero se necessário
        const day = String(date.getDate()).padStart(2, '0');

        return `${day}/${month}/${year}`;
    };

    const defaultDtInclu = formatDateTime(Data_Atual);

    const [newIndication, setNewIndication] = useState({
        end_confirm: '1',
        nome_publica: '',
        num_contato: '',
        cod_congreg: '',
        cod_regiao: '',
        enderec: '',
        origem: '',
        obs: ''
    });

    const [anchorEl, setAnchorEl] = useState(null);
    const [filterColumn, setFilterColumn] = useState(''); // Guarda a coluna sendo filtrada
    const [filters, setFilters] = useState({
        num_visitas: '',
        enderec: ''
    });

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleClick = (event, column) => {
        setAnchorEl(event.currentTarget);
        setFilterColumn(column);
    };

    const handleFilterSelect = (value) => {
        setFilters({
            ...filters,
            [filterColumn]: value
        });
        handleClose(); // Fecha o menu
    };

    useEffect(() => {
        api_service.get('/rgpublicall')
            .then((response) => {
                setData(response.data);
            })
            .catch((error) => {
                console.error("Erro ao buscar os dados: ", error);
            });
    }, []);

    const handleSelect = (id) => {
        setSelected((prevSelected) =>
            prevSelected.includes(id)
                ? prevSelected.filter((item) => item !== id) // Desmarca se já estiver selecionado
                : [...prevSelected, id] // Marca se não estiver
        );
    };
    const isSelected = (id) => selected.includes(id);

    // Função para controlar a seleção de todas as linhas
    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
            const newSelected = data.map((row) => row.id);
            setSelected(newSelected);
        } else {
            setSelected([]);
        }
    };

    // Verifica se todas as linhas estão selecionadas
    const isAllSelected = selected.length === data.length;

    // Função para iniciar a edição de uma linha
    const handleEdit = (row) => {
        setEditRowId(row.id); // Define a linha como editável
        setEditedRowData({ ...row }); // Copia os dados atuais da linha para o estado editável
    };

    // Função para lidar com alterações nos campos de entrada
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedRowData({ ...editedRowData, [name]: value }); // Atualiza os dados editados
    };

    // Função para salvar as alterações
    const handleSave = async () => {
        try {
            await api_service.put(`/rgpublic/${editedRowData.id}`, editedRowData); // Atualiza os dados no backend
            setData(data.map(row => (row.id === editedRowData.id ? editedRowData : row))); // Atualiza os dados no frontend
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
                await api_service.delete(`/rgpublic/${id}`); // Envia a solicitação de exclusão para a API
                setData(data.filter(row => row.id !== id)); // Remove o registro excluído do estado local
            } catch (error) {
                console.error("Erro ao excluir os dados: ", error);
            }
        }
    };

    // Função para mostrar/esconder o formulário de nova indicação
    const handleNovoBotao = () => {
        setShowNewIndicationForm(!showNewIndicationForm); // Alterna entre mostrar ou esconder o formulário
    };


    // Função para enviar a nova indicação
    const handleNewIndicationSubmit = async (e) => {
        e.preventDefault();

        const { nome_publica, end_confirm, num_contato, cod_congreg, enderec } = newIndication;

        if (!nome_publica || !end_confirm || !num_contato || !cod_congreg || !enderec) {
            setMessage('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        try {

            const newIndicationData = {
                ...newIndication,
                data_inclu: defaultDtInclu,
            };

            const response = await api_service.post('/rgpublic', newIndicationData);
            setData([...data, response.data]); // Adiciona a nova indicação aos dados
            setNewIndication({ nome_publica: '', end_confirm: '', num_contato: '', cod_congreg: '', cod_regiao: '', enderec: '', origem: '', obs: '' }); // Limpa o formulário
            setMessage('Indicação incluída com sucesso!');
        } catch (error) {
            console.error("Erro ao enviar as informações: ", error);
            setMessage('Erro ao incluir a indicação.');
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

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    // Cálculo do índice inicial e final das linhas a serem exibidas
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

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

    // Função para determinar tipo de publicação
    const getStatusPublicac = (rgp_publicac) => {
        switch (rgp_publicac) {
            case '1':
                return 'Folheto';
            case '2':
                return 'Revista';
            case '3':
                return 'Brochura';
            case '4':
                return 'Livro';
            case '5':
                return 'Bíblia';
            case '6':
                return 'CD/DVD';
            case '7':
                return 'Volte p/ Jeová';
            default:
                return 'Outros';
        }
    };

    // Função para determinar a cor de fundo da célula com base no status
    const getStatusColorPublicac = (status) => {
        switch (status) {
            case 'Folheto':
                return '#EBC79E';
            case 'Revista':
                return '#8C1717';
            case 'Brochura':
                return '#2F2F4F';
            case 'Livro':
                return '#009900';
            case 'Bíblia':
                return '#5C3317';
            case 'CD/DVD':
                return '#666666';
            case 'Volte p/ Jeová':
                return '#990000';
            default:
                return 'transparent';
        }
    };


    // Função para determinar tipo de publicação
    const getStatusAtivid = (rgp_tipoativ) => {
        switch (rgp_tipoativ) {
            case 'TPL':
                return 'TPL';
            case 'TPE':
                return 'TPE';
            case 'Outros':
                return 'Outros';
            default:
                return 'transparent';
        }
    };

    // Função para determinar a cor de fundo da célula com base no status
    const getStatusColorAtivid = (status) => {
        switch (status) {
            case 'TPL':
                return '#00009C';
            case 'TPE':
                return '#8E2323';
            default:
                return 'transparent';
        }
    };


    // Função para iniciar a edição de uma linha
    const handleAbreMapa = (row) => {
        window.open(row, '_blank'); // Abre o link em uma nova aba
    };

    // Dados filtrados com base nos filtros das colunas
    const filteredData = data.filter((row) => {
        return (
            (!filters.visit_status || row.visit_status === filters.visit_status) &&
            (!filters.pub_nome || row.pub_nome === filters.pub_nome) &&
            (!filters.visit_cod || row.visit_cod === filters.visit_cod)
        );
    });

    // Aplicar a paginação aos dados filtrados
    const paginatedData = filteredData.slice(startIndex, endIndex);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10)); // Atualiza o número de linhas por página
        setPage(0); // Reseta a página para a primeira sempre que mudar o número de linhas por página
    };

    // Função para obter a lista única de logradouros (enderec)
    const getUniquePublicad = () => {
        const PublicadUnicos = [...new Set(data.map(row => row.pub_nome))];
        return PublicadUnicos;
    };

    // Função para exportar os dados filtrados para planilha
    const handleExport = () => {
        const exportData = filteredData.map(row => ({
            'Data': row.rgp_data,
            'Publicador': row.rgp_pub,
            'Dia Semana': row.rgp_diadasem,
            'Local': row.rgp_local,
            'Url Local': row.rgp_url,
            'Tipo de Atividade': row.rgp_tipoativ === '1' ? 'TPL' : 'TPE',
            'Publicação': getStatusPublicac(row.rgp_publicac),
            'Quantidade': row.rgp_qtd,
            'Detalhes': row.rgp_detalhes,
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData); // Converte os dados para uma planilha
        const workbook = XLSX.utils.book_new(); // Cria um novo workbook (arquivo Excel)
        XLSX.utils.book_append_sheet(workbook, worksheet, "Registro de Publicações"); // Adiciona a planilha

        // Exporta o arquivo Excel
        XLSX.writeFile(workbook, 'Registro_Publicacoes.xlsx');
    };


    return (
        <Box sx={{ padding: '16px', backgroundColor: 'rgb(255,255,255)', color: '#202038' }}>
            <h2 style={{ fontSize: '1.6rem', marginBottom: '16px' }}>Registro de Publicações</h2>

            <Box sx={{ marginBottom: '16px', backgroundColor: 'white', padding: '16px', borderRadius: '8px' }}>
                <Box sx={{ backgroundColor: 'rgb(255, 255, 255)', borderRadius: '16px' }}>
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
                                    <Typography variant="h5" sx={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                                        Total de Lançamentos
                                    </Typography>
                                    <Typography variant="h2" sx={{ fontSize: '1.8rem' }}>{data.length}</Typography>
                                </CardContent>
                            </Card>
                        </Box>
                    </Box>

                    <TableContainer component={Paper} sx={{ marginTop: '10px' }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }} padding="checkbox">
                                        <Checkbox
                                            indeterminate={selected.length > 0 && selected.length < data.length}
                                            checked={isAllSelected}
                                            onChange={handleSelectAllClick}
                                            inputProps={{ 'aria-label': 'select all items' }}
                                        />
                                    </TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Data Registro</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Publicador
                                        <FaChevronDown onClick={(event) => handleClick(event, 'pub_nome')} />
                                    </TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Dia da Semana</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Local</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Link Map</TableCell>

                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Tipo Atividade</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Publicação</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Quantidade</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Detalhes</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Ações</TableCell>

                                </TableRow>
                                {/* Menu suspenso para filtros */}
                                <Menu
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl)}
                                    onClose={handleClose}
                                >

                                    {filterColumn === 'rgp_pub' && (
                                        <>
                                            <MenuItem onClick={() => handleFilterSelect('')}>Todos</MenuItem>
                                            {/* Gerar dinamicamente os nome de publicador únicos */}
                                            {getUniquePublicad().map((pub_nome) => (
                                                <MenuItem key={pub_nome} onClick={() => handleFilterSelect(pub_nome)}>
                                                    {pub_nome}
                                                </MenuItem>
                                            ))}
                                        </>
                                    )}

                                </Menu>
                            </TableHead>
                            <TableBody>
                                {paginatedData.map((row) => {
                                    const isEditing = row.id === editRowId;
                                    const statusPublicac = getStatusPublicac(row.rgp_publicac); 
                                    const statusAtivid = getStatusAtivid(row.rgp_tipoativ);

                                    return (
                                        <TableRow key={row.id}>
                                            <TableCell TableCell align="center">
                                                <Checkbox
                                                    checked={isSelected(row.id)}
                                                    onChange={() => handleSelect(row.id)}
                                                />
                                            </TableCell>
                                            <TableCell align="center">{isEditing ? <TextField name="rgp_data" value={editedRowData.rgp_data || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.rgp_data}</TableCell>
                                            <TableCell align="center">{isEditing ? <TextField name="rgp_pub" value={editedRowData.rgp_pub || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.rgp_pub}</TableCell>
                                            <TableCell align="center">{isEditing ? <TextField name="rgp_diadasem" value={editedRowData.rgp_diadasem || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.rgp_diadasem}</TableCell>
                                            <TableCell align="center">{isEditing ? <TextField name="rgp_local" value={editedRowData.rgp_local || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.rgp_local}</TableCell>
                                            <TableCell align="center">{isEditing ? <TextField name="rgp_url" value={editedRowData.rgp_url || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.rgp_url}
                                                <Button variant="contained" color="primary" size="small" onClick={() => handleAbreMapa(row.rgp_url)} sx={{ fontSize: '0.55rem', padding: '2px 5px' }}>Abrir Mapa</Button>
                                            </TableCell>

                                            {/* Campo editável de rgp_tipoativ */}
                                            <TableCell align="center">
                                                {isEditing ? (
                                                    <FormControl fullWidth>
                                                        <Select
                                                            name="rgp_tipoativ"
                                                            value={editedRowData.rgp_tipoativ}
                                                            onChange={handleInputChange}
                                                        >
                                                            <MenuItem value="TPL">TPL</MenuItem>
                                                            <MenuItem value="TPE">TPE</MenuItem>
                                                            <MenuItem value="Outras">Outras</MenuItem>
                                                        </Select>
                                                    </FormControl>
                                                ) : (
                                                    <div
                                                        style={{
                                                            backgroundColor: getStatusColorAtivid(statusAtivid),
                                                            color: 'white',
                                                            padding: '2px',
                                                            borderRadius: '4px',
                                                            textAlign: 'center',
                                                            fontSize: '0.65rem',
                                                        }}
                                                    >
                                                        {statusAtivid}
                                                    </div>
                                                )}
                                            </TableCell>

                                            {/* Campo editável de rgp_publicac */}
                                            <TableCell align="center">
                                                {isEditing ? (
                                                    <FormControl fullWidth>
                                                        <Select
                                                            name="rgp_publicac"
                                                            value={editedRowData.rgp_publicac}
                                                            onChange={handleInputChange}
                                                        >
                                                            <MenuItem value="1">Folheto</MenuItem>
                                                            <MenuItem value="2">Revista</MenuItem>
                                                            <MenuItem value="3">Brochura</MenuItem>
                                                            <MenuItem value="4">Livro</MenuItem>
                                                            <MenuItem value="5">Bíblia</MenuItem>
                                                            <MenuItem value="6">CD/DVD</MenuItem>
                                                            <MenuItem value="7">Volte p/ Jeová</MenuItem>
                                                        </Select>
                                                    </FormControl>
                                                ) : (
                                                    <div
                                                        style={{
                                                            backgroundColor: getStatusColorPublicac(statusPublicac),
                                                            color: 'white',
                                                            padding: '2px',
                                                            borderRadius: '4px',
                                                            textAlign: 'center',
                                                            fontSize: '0.65rem',
                                                        }}
                                                    >
                                                        {statusPublicac}
                                                    </div>
                                                )}
                                            </TableCell>


                                            <TableCell align="center">{isEditing ? <TextField name="rgp_qtd" value={editedRowData.rgp_qtd || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.rgp_qtd}</TableCell>
                                            <TableCell align="center">{isEditing ? <TextField name="rgp_detalhes" value={editedRowData.rgp_detalhes || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.rgp_detalhes}</TableCell>
                                            <TableCell align="center">
                                                {isEditing ? (
                                                    <Button variant="contained" color="primary" size="small" onClick={handleSave} sx={{ fontSize: '0.65rem', padding: '2px 5px' }}>Salvar</Button>
                                                ) : (
                                                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                                        <Button variant="contained" color="primary" size="small" onClick={() => handleEdit(row)} sx={{ fontSize: '0.65rem', padding: '2px 5px' }}>Editar</Button>
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
                        rowsPerPageOptions={[5, 10, 25]} // Caso queira outras opções
                        component="div"
                        count={filteredData.length} // Número total de linhas após filtragem
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage} // Função para mudar o número de linhas por página
                        labelRowsPerPage="Linhas por página:" // Texto personalizado
                        sx={{
                            '& .MuiTablePagination-toolbar': { fontSize: '0.80rem' },
                            '& .MuiTablePagination-selectRoot': { fontSize: '0.80rem' },
                            '& .MuiTablePagination-displayedRows': { fontSize: '0.80rem' },
                        }}
                    />
                    <p>
                        {/* Botão de exportação */}
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleExport}
                            style={{
                                ...buttonStyle,
                                fontSize: '0.60rem',
                            }}
                        >
                            <FaFileExport style={{ marginRight: '8px' }} /> Exportar dados para Excel
                        </Button>
                    </p><br></br>

                    {/* Botão para abrir o formulário */}
                    <button
                        type="button"
                        style={{
                            ...buttonStyle,
                            backgroundColor: showNewIndicationForm ? '#67e7eb' : '#202038',
                            color: showNewIndicationForm ? '#202038' : '#f1f1f1',
                        }}
                        onMouseEnter={(e) => {
                            if (!showNewIndicationForm) {
                                e.currentTarget.style.backgroundColor = '#67e7eb'; // Cor ao passar o mouse
                                e.currentTarget.style.color = '#202038'; // Cor do texto ao passar o mouse
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!showNewIndicationForm) {
                                e.currentTarget.style.backgroundColor = '#202038'; // Cor original
                                e.currentTarget.style.color = '#f1f1f1'; // Cor do texto original
                            }
                        }}
                        onClick={handleNovoBotao}
                    >
                        <FaUserPlus /> Registrar Publicações
                    </button>
                </Box>
            </Box>

            {/* Formulário de nova indicação */}
            <Box sx={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', display: showNewIndicationForm ? 'block' : 'none' }}>
                <form onSubmit={handleNewIndicationSubmit}>
                    <Box sx={formBoxStyle}>
                        <Box sx={{ flex: 1, minWidth: '200px' }}>
                            <TextField label="Publicador *" variant="outlined" size="small" fullWidth value={newIndication.nome_publica} onChange={(e) => setNewIndication({ ...newIndication, nome_publica: e.target.value })} sx={inputStyle} />
                        </Box>

                        <Box sx={{ flex: 1, minWidth: '200px' }}>
                            <TextField label="Dia Semana *" variant="outlined" size="small" fullWidth value={newIndication.cod_congreg} onChange={(e) => setNewIndication({ ...newIndication, cod_congreg: e.target.value })} sx={inputStyle} />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: '200px' }}>
                            <TextField label="Local *" variant="outlined" size="small" fullWidth value={newIndication.cod_regiao} onChange={(e) => setNewIndication({ ...newIndication, cod_regiao: e.target.value })} sx={inputStyle} />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: '200px' }}>
                            <TextField label="URL Local *" variant="outlined" size="small" fullWidth value={newIndication.enderec} onChange={(e) => setNewIndication({ ...newIndication, enderec: e.target.value })} sx={inputStyle} />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: '200px' }}>
                            <TextField label="Tp. Atividade *" variant="outlined" size="small" fullWidth value={newIndication.enderec} onChange={(e) => setNewIndication({ ...newIndication, enderec: e.target.value })} sx={inputStyle} />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: '200px' }}>
                            <TextField label="Publicação *" variant="outlined" size="small" fullWidth value={newIndication.enderec} onChange={(e) => setNewIndication({ ...newIndication, enderec: e.target.value })} sx={inputStyle} />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: '200px' }}>
                            <TextField label="Quantidade *" variant="outlined" size="small" fullWidth value={newIndication.enderec} onChange={(e) => setNewIndication({ ...newIndication, enderec: e.target.value })} sx={inputStyle} />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: '200px' }}>
                            <TextField label="Detalhes  " variant="outlined" size="small" fullWidth value={newIndication.obs} onChange={(e) => setNewIndication({ ...newIndication, obs: e.target.value })} sx={inputStyle} />
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
                        > <FaShareSquare /> Enviar Publicação</button>
                    </Box>
                </form>
                {message && <Typography variant="body1" sx={{ color: message.includes('Erro') ? 'red' : 'green', marginTop: '10px' }}>{message}</Typography>}
            </Box >
        </Box >
    );
};

export default RegPublicacoes;
