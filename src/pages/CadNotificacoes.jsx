import React, { useState, useEffect } from 'react';
import api_service from '../services/api_service'; // Importando serviço da API
import {
    Box, Menu, MenuItem, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Card, CardContent, Paper, TablePagination,
    Button, TextField, Typography, Select, FormControl, Checkbox,
    InputLabel,
} from '@mui/material';
import { FaFileExport, FaUserPlus, FaShareSquare } from 'react-icons/fa';
import * as XLSX from 'xlsx'; // Importe a biblioteca XLSX

const CadNotificacoes = () => {
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
        setFilterColumn(null);
    };

    const handleFilterSelect = (value) => {
        setFilters({
            ...filters,
            [filterColumn]: value
        });
        handleClose(); // Fecha o menu
    };

    useEffect(() => {
        api_service.get('/notifall')
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
            await api_service.put(`/notif/${editedRowData.id}`, editedRowData); // Atualiza os dados no backend
            setData(data.map(row => (row.id === editedRowData.id ? editedRowData : row))); // Atualiza os dados no frontend
            setEditRowId(null); // Sai do modo de edição
        } catch (error) {
            console.error("Erro ao salvar os dados: ", error);
        }
    };

    // Função para excluir o registro
    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("Você realmente deseja excluir este registro?");
        console.error("Id da mensagem a ser excluída", id);
        if (confirmDelete) {
            try {
                await api_service.delete(`/notif/${id}`); // Envia a solicitação de exclusão para a API
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
        try {
            const newIndicationData = {
                ...newIndication,
                data_inclu: defaultDtInclu,
            };
            const response = await api_service.post('/notif', newIndicationData);
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
            'Endereço': row.enderec,
            'Detalhes': row.obs,
            'Link Mapa': row.indic_url_map,
            'Status': row.end_confirm === '2' ? 'Confirmado' : 'Pendente',
            'Designado?': row.indic_desig === '2' ? 'Sim' : 'Não',
            'Tipo de Local': row.indic_tp_local === '2' ? 'Comércio' : 'Residência',
            'Data': row.data_inclu,
            'Publicador': row.nome_publica,
            'Contato': row.num_contato,
            'Congregação': row.cod_congreg
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData); // Converte os dados para uma planilha
        const workbook = XLSX.utils.book_new(); // Cria um novo workbook (arquivo Excel)
        XLSX.utils.book_append_sheet(workbook, worksheet, "Cadastro Notificações"); // Adiciona a planilha

        // Exporta o arquivo Excel
        XLSX.writeFile(workbook, 'Cad_Notificacoes.xlsx');
    };

    // Função para determinar o status com base no número de visitas
    const getStatusDesgServ = (noti_servic) => {
        switch (noti_servic) {
            case '0':
                return 'Estudante';
            case '1':
                return 'Publicador Batizado';
            case '2':
                return 'Servo Ministerial';
            case '3':
                return 'Ancião';
            case '4':
                return 'Todos';
            default:
                return 'Outros';
        }
    };

    // Função para determinar a cor de fundo da célula com base no status
    const getStatusColorDesgServ = (status) => {
        switch (status) {
            case 'Estudante':
                return '#FFA500';
            case 'Publicador Batizado':
                return '#32CD32';
            case 'Servo Ministerial':
                return '#6A5ACD';
            case 'Ancião':
                return '#8B4513';
            case 'Todos':
                return '#5C3317';
            default:
                return 'transparent';
        }
    };


    // Função para determinar o status com base no número de visitas
    const getStatusDesgCamp = (noti_campo) => {
        switch (noti_campo) {
            case '0':
                return 'Publicador';
            case '1':
                return 'Pioneiro Auxiliar';
            case '2':
                return 'Pioneiro Regular';
            case '3':
                return 'Pioneiro Especial';
            case '4':
                return 'Todos';
            default:
                return 'Outros';
        }
    };

    // Função para determinar a cor de fundo da célula com base no status
    const getStatusColorDesgCamp = (status) => {
        switch (status) {
            case 'Publicador':
                return '#FFA500';
            case 'Pioneiro Auxiliar':
                return '#32CD32';
            case 'Pioneiro Regular':
                return '#6A5ACD';
            case 'Pioneiro Especial':
                return '#8B4513';
            case 'Todos':
                return '#5C3317';
            default:
                return 'transparent';
        }
    };

    return (
        <Box sx={{ padding: '16px', backgroundColor: 'rgb(255,255,255)', color: '#202038' }}>
            <h2 style={{ fontSize: '1.6rem', marginBottom: '16px' }}>Cadastro de Notificações / Mensagens</h2>
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
                                        Total de Registros
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
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Data Início</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Data Expiração</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Tipo de Mensagem</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Destinatários - Dsg. Serviço</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Destinatários - Dsg. Campo</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Texto da Mensagem</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Detalhes</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Ações</TableCell>
                                </TableRow>
                                {/* Menu suspenso para filtros */}
                                <Menu
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl)}
                                    onClose={handleClose}
                                >


                                    {filterColumn === 'visit_status' && (
                                        <>
                                            <MenuItem onClick={() => handleFilterSelect('')}>Todos</MenuItem>
                                            <MenuItem onClick={() => handleFilterSelect('Sim')}>Sim</MenuItem>
                                            <MenuItem onClick={() => handleFilterSelect('Não')}>Não</MenuItem>
                                            <MenuItem onClick={() => handleFilterSelect('Carta')}>Carta</MenuItem>
                                            <MenuItem onClick={() => handleFilterSelect('Família')}>Família</MenuItem>
                                            <MenuItem onClick={() => handleFilterSelect('Outros')}>Outros</MenuItem>
                                        </>
                                    )}
                                    {filterColumn === 'pub_nome' && (
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
                                    const statusDesgServ = getStatusDesgServ(row.noti_servic);
                                    const statusDesgCamp = getStatusDesgCamp(row.noti_campo);

                                    return (
                                        <TableRow key={row.id}>
                                            <TableCell TableCell align="center">
                                                <Checkbox
                                                    checked={isSelected(row.id)}
                                                    onChange={() => handleSelect(row.id)}
                                                />
                                            </TableCell>
                                            <TableCell align="center">{isEditing ? <TextField name="noti_dtini" value={editedRowData.noti_dtini || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.noti_dtini}</TableCell>
                                            <TableCell align="center">{isEditing ? <TextField name="noti_dtexp" value={editedRowData.noti_dtexp || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.noti_dtexp}</TableCell>
                                            <TableCell align="center">{isEditing ? <TextField name="noti_tipo" value={editedRowData.noti_tipo || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.noti_servic}</TableCell>
                                            {/* Campo editável de noti_servic */}
                                            <TableCell align="center">
                                                {isEditing ? (
                                                    <FormControl fullWidth>
                                                        <Select
                                                            name="noti_servic"
                                                            value={editedRowData.noti_servic}
                                                            onChange={handleInputChange}
                                                        >
                                                            <MenuItem value="0">Estudante</MenuItem>
                                                            <MenuItem value="1">Publicador</MenuItem>
                                                            <MenuItem value="2">Servo Ministerial</MenuItem>
                                                            <MenuItem value="3">Ancião</MenuItem>
                                                            <MenuItem value="4">Todos</MenuItem>
                                                        </Select>
                                                    </FormControl>
                                                ) : (
                                                    <div
                                                        style={{
                                                            backgroundColor: getStatusColorDesgServ(statusDesgServ),
                                                            color: 'white',
                                                            padding: '2px',
                                                            borderRadius: '4px',
                                                            textAlign: 'center',
                                                            fontSize: '0.65rem',
                                                        }}
                                                    >
                                                        {statusDesgServ}
                                                    </div>
                                                )}
                                            </TableCell>
                                            {/* Campo editável de noti_servic */}
                                            <TableCell align="center">
                                                {isEditing ? (
                                                    <FormControl fullWidth>
                                                        <Select
                                                            name="noti_campo"
                                                            value={editedRowData.noti_campo}
                                                            onChange={handleInputChange}
                                                        >
                                                            <MenuItem value="0">Publicador</MenuItem>
                                                            <MenuItem value="1">Pioneiro Auxiliar</MenuItem>
                                                            <MenuItem value="2">Pioneiro Regular</MenuItem>
                                                            <MenuItem value="3">Pioneiro Especial</MenuItem>
                                                            <MenuItem value="4">Todos</MenuItem>
                                                        </Select>
                                                    </FormControl>
                                                ) : (
                                                    <div
                                                        style={{
                                                            backgroundColor: getStatusColorDesgCamp(statusDesgCamp),
                                                            color: 'white',
                                                            padding: '2px',
                                                            borderRadius: '4px',
                                                            textAlign: 'center',
                                                            fontSize: '0.65rem',
                                                        }}
                                                    >
                                                        {statusDesgCamp}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell align="center">{isEditing ? <TextField name="noti_mensag" value={editedRowData.noti_mensag || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.noti_mensag}</TableCell>
                                            <TableCell align="center">{isEditing ? <TextField name="noti_detalhes" value={editedRowData.noti_detalhes || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.noti_detalhes}</TableCell>
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
                        <FaUserPlus /> Incluir Notificação
                    </button>
                </Box>
            </Box>


            {/* Formulário de nova indicação */}
            <Box sx={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', display: showNewIndicationForm ? 'block' : 'none' }}>
                <form onSubmit={handleNewIndicationSubmit}>
                    <Box sx={formBoxStyle}>
                        <Box sx={{ flex: 1, minWidth: '200px' }}>
                            <TextField label="Data Início *" variant="outlined" size="small" fullWidth value={newIndication.noti_dtini} onChange={(e) => setNewIndication({ ...newIndication, noti_dtini: e.target.value })} sx={inputStyle} />
                        </Box>

                        <Box sx={{ flex: 1, minWidth: '200px' }}>
                            <TextField label="Data Expiração *" variant="outlined" size="small" fullWidth value={newIndication.noti_dtexp} onChange={(e) => setNewIndication({ ...newIndication, noti_dtexp: e.target.value })} sx={inputStyle} />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: '200px' }}>
                            <TextField label="Tipo de Mensagem*" variant="outlined" size="small" fullWidth value={newIndication.noti_tipo} onChange={(e) => setNewIndication({ ...newIndication, noti_tipo: e.target.value })} sx={inputStyle} />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: '250px' }}>
                            <FormControl fullWidth sx={inputStyle}>
                                <InputLabel id="notiserv-label">Alvo - Dsg Serviço: </InputLabel>
                                <Select
                                    labelId="notiserv-label"
                                    id="notiserv"
                                    value={newIndication.noti_servic}
                                    label="Alvo - Dsg Serviço *"
                                    fullWidth
                                    onChange={(e) => setNewIndication({ ...newIndication, noti_servic: e.target.value })}
                                >
                                    <MenuItem value="0">Estudante</MenuItem>
                                    <MenuItem value="1">Publicador</MenuItem>
                                    <MenuItem value="2">Servo Ministerial</MenuItem>
                                    <MenuItem value="3">Ancião</MenuItem>
                                    <MenuItem value="4">Todos</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                        <Box sx={{ flex: 1, minWidth: '250px' }}>
                            <FormControl fullWidth sx={inputStyle}>
                                <InputLabel id="noticampo-label">Alvo - Dsg Campo: </InputLabel>
                                <Select
                                    labelId="noticampo-label"
                                    id="noticampo"
                                    value={newIndication.noti_campo}
                                    label="Alvo - Dsg Campo: *"
                                    onChange={(e) => setNewIndication({ ...newIndication, noti_campo: e.target.value })}
                                >
                                    <MenuItem value="0">Publicador</MenuItem>
                                    <MenuItem value="1">Pioneiro Auxiliar</MenuItem>
                                    <MenuItem value="2">Pioneiro Regular</MenuItem>
                                    <MenuItem value="3">Pioneiro Especial</MenuItem>
                                    <MenuItem value="4">Todos</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                        <Box sx={{ flex: 1, minWidth: '200px' }}>
                            <TextField label="Texto da Mensagem* " variant="outlined" size="small" fullWidth value={newIndication.noti_mensag} onChange={(e) => setNewIndication({ ...newIndication, noti_mensag: e.target.value })} sx={inputStyle} />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: '200px' }}>
                            <TextField label="Detalhes e Referências " variant="outlined" size="small" fullWidth value={newIndication.noti_detalhes} onChange={(e) => setNewIndication({ ...newIndication, noti_detalhes: e.target.value })} sx={inputStyle} />
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
                        > <FaShareSquare /> Gravar Notificação</button>
                    </Box>
                </form>
                {message && <Typography variant="body1" sx={{ color: message.includes('Erro') ? 'red' : 'green', marginTop: '10px' }}>{message}</Typography>}
            </Box >

        </Box >
    );
};

export default CadNotificacoes;
