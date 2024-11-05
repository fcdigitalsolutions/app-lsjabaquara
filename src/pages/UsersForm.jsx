import React, { useState, useEffect } from 'react';
import api_service from '../services/api_service'; // Importando serviço da API
import { Box, Menu, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Card, CardContent, Paper, TablePagination, Button, TextField, Typography, MenuItem, Select, FormControl, Checkbox } from '@mui/material';
import { FaChevronDown, FaFileExport, FaUserPlus, FaShareSquare } from 'react-icons/fa';
import * as XLSX from 'xlsx'; // Importe a biblioteca XLSX
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';

const UsersForm = () => {
    const [data, setData] = useState([]);
    const [page, setPage] = useState(0);
    const [editRowId, setEditRowId] = useState(null); // ID da linha sendo editada
    const [editedRowData, setEditedRowData] = useState({}); // Dados da linha sendo editada
    const [message, setMessage] = useState(''); // Mensagem de sucesso ou erro
    const [selected, setSelected] = useState([]);
    const totalGestores = data.filter(item => item.user_gestor === '2').length;
    const totalRecbMsg = data.filter(item => item.user_receb_msg === '2').length;
    const [rowsPerPage, setRowsPerPage] = useState(10); // Limite de linhas por página
    const [showNewUserLoginForm, setShowNewUserLoginForm] = useState(false); // Controla a exibição do formulário de novo Usuário
    const [maskedPassword, setMaskedPassword] = useState(''); // Para mascarar a senha
    const [visiblePassword, setVisiblePassword] = useState(''); // Para exibir temporariamente o último caractere

    const Data_Atual = new Date();

    const formatDateTime = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Adiciona zero se necessário
        const day = String(date.getDate()).padStart(2, '0');

        return `${day}/${month}/${year}`;
    };

    const defaultDtInclu = formatDateTime(Data_Atual);

    const [newUserLogin, setNewUserLogin] = useState({
        user_login: '',
        user_name: '',
        user_gestor: '1',
        user_gestor_terr: '1',
        user_gestor_rmwb: '1',
        user_gestor_rfds: '1',
        user_gestor_mecan: '1',
        user_id_publica: '',
        user_receb_msg: '1',
        user_dt_inclu: defaultDtInclu,
        user_pswd: '' // senha adicionada aqui
    });

    const [anchorEl, setAnchorEl] = useState(null);
    const [filterColumn, setFilterColumn] = useState(''); // Guarda a coluna sendo filtrada
    const [filters, setFilters] = useState({
        user_gestor: '',
        user_gestor_terr: '',
        user_gestor_rmwb: '',
        user_gestor_rfds: '',
        user_gestor_mecan: '',
        user_receb_msg: ''
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
        api_service.get('/authxall')
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
        setMaskedPassword(row.user_pswd || '');
    };

     // Função para lidar com a edição de senha com máscara
     const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setVisiblePassword(newPassword); // Temporariamente exibe o novo caractere
        setMaskedPassword((prev) => prev + newPassword.slice(-1));

        setTimeout(() => {
            setMaskedPassword((prev) => prev.slice(0, -1) + '*');
            setVisiblePassword(maskedPassword);
        }, 2500); // Tempo de exibição do caractere

        setEditedRowData({ ...editedRowData, user_pswd: newPassword });
    };

    // Função para lidar com alterações nos campos de entrada
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedRowData({ ...editedRowData, [name]: value }); // Atualiza os dados editados
    };

    // Função para salvar as alterações
    const handleSave = async () => {
        try {
            await api_service.put(`/authxadd1/${editedRowData.id}`, editedRowData); // Atualiza os dados no backend
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
                await api_service.delete(`/authxadd1/${id}`); // Envia a solicitação de exclusão para a API
                setData(data.filter(row => row.id !== id)); // Remove o registro excluído do estado local
            } catch (error) {
                console.error("Erro ao excluir os dados: ", error);
            }
        }
    };

    // Função para mostrar/esconder o formulário de novo Usuário
    const handleNovoBotao = () => {
        setShowNewUserLoginForm(!showNewUserLoginForm); // Alterna entre mostrar ou esconder o formulário
    };

    // Função para enviar a novo Usuário
    const handleNewUserLoginSubmit = async (e) => {
        e.preventDefault();

        const { user_login, user_name, user_pswd } = newUserLogin;

        if (!user_login || !user_name || !user_pswd) {
            setMessage('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        try {

            const newUserLoginData = {
                ...newUserLogin,
                user_dt_inclu: defaultDtInclu,
            };

            const response = await api_service.post('/authxadd1', newUserLoginData);
            setData([...data, response.data]); // Adiciona a novo Usuário aos dados
            setNewUserLogin({
                user_login: '',
                user_name: '',
                user_gestor: '1',
                user_gestor_terr: '1',
                user_gestor_rmwb: '1',
                user_gestor_rfds: '1',
                user_id_publica: '',
                user_receb_msg: '1'
            }); // Limpa o formulário
            setMessage('Usuário incluída com sucesso!');
        } catch (error) {
            console.error("Erro ao enviar as informações: ", error);
            setMessage('Erro ao enviar as informações: ', error);
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

    // Função para determinar o status com base na confirmação do endereço
    const getStatusGestor = (indic_tp_local) => {
        switch (indic_tp_local) {
            case '1':
                return 'Não';
            case '2':
                return 'Sim';
            default:
                return 'Outros';
        }
    };

    // Função para determinar a cor de fundo da célula com base no status
    const getStatusColorGestor = (status) => {
        switch (status) {
            case 'Não':
                return '#007FFF';
            case 'Sim':
                return '#8B4513';
            default:
                return 'transparent';
        }
    };

    // Função para determinar o status com base na confirmação do endereço
    const getStatusRecbMsg = (user_receb_msg) => {
        switch (user_receb_msg) {
            case '1':
                return 'Não';
            case '2':
                return 'Sim';
            default:
                return 'Outros';
        }
    };

    // Função para determinar a cor de fundo da célula com base no status
    const getStatusColorRecbMsg = (status) => {
        switch (status) {
            case 'Não':
                return '#EBC79E';
            case 'Sim':
                return '#5C3317';
            default:
                return 'transparent';
        }
    };


    // Função para determinar o status com base na confirmação do endereço
    const getStatusGestTerr = (user_gestor_terr) => {
        switch (user_gestor_terr) {
            case '1':
                return 'Não';
            case '2':
                return 'Sim';
            default:
                return 'Outros';
        }
    };

    // Função para determinar a cor de fundo da célula com base no status
    const getStatusColorGestTerr = (status) => {
        switch (status) {
            case 'Não':
                return '#EBC79E';
            case 'Sim':
                return '#5C3317';
            default:
                return 'transparent';
        }
    };

    // Função para determinar o status com base na confirmação do endereço
    const getStatusGestRmwb = (user_gestor_rmwb) => {
        switch (user_gestor_rmwb) {
            case '1':
                return 'Não';
            case '2':
                return 'Sim';
            default:
                return 'Outros';
        }
    };

    // Função para determinar a cor de fundo da célula com base no status
    const getStatusColorGestRmwb = (status) => {
        switch (status) {
            case 'Não':
                return '#EBC79E';
            case 'Sim':
                return '#5C3317';
            default:
                return 'transparent';
        }
    };

    // Função para determinar o status com base na confirmação do endereço
    const getStatusGestRfds = (user_gestor_rfds) => {
        switch (user_gestor_rfds) {
            case '1':
                return 'Não';
            case '2':
                return 'Sim';
            default:
                return 'Outros';
        }
    };

    // Função para determinar a cor de fundo da célula com base no status
    const getStatusColorGestRfds = (status) => {
        switch (status) {
            case 'Não':
                return '#EBC79E';
            case 'Sim':
                return '#5C3317';
            default:
                return 'transparent';
        }
    };

    // Função para determinar o status com base na confirmação do endereço
    const getStatusGestMec = (user_gestor_mecan) => {
        switch (user_gestor_mecan) {
            case '1':
                return 'Não';
            case '2':
                return 'Sim';
            default:
                return 'Outros';
        }
    };

    // Função para determinar a cor de fundo da célula com base no status
    const getStatusColorGestMec = (status) => {
        switch (status) {
            case 'Não':
                return '#EBC79E';
            case 'Sim':
                return '#5C3317';
            default:
                return 'transparent';
        }
    };

    // Dados filtrados com base nos filtros das colunas
    const filteredData = data.filter((row) => {
        return (
            (!filters.user_gestor || row.user_gestor === filters.user_gestor) &&
            (!filters.user_gestor_terr || row.user_gestor_terr === filters.user_gestor_terr) &&
            (!filters.user_gestor_rmwb || row.user_gestor_rmwb === filters.user_gestor_rmwb) &&
            (!filters.user_gestor_rfds || row.user_gestor_rfds === filters.user_gestor_rfds) &&
            (!filters.user_gestor_mecan || row.user_gestor_mecan === filters.user_gestor_mecan) &&
            (!filters.user_receb_msg || row.user_receb_msg === filters.user_receb_msg)
        );
    });

    // Aplicar a paginação aos dados filtrados
    const paginatedData = filteredData.slice(startIndex, endIndex);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10)); // Atualiza o número de linhas por página
        setPage(0); // Reseta a página para a primeira sempre que mudar o número de linhas por página
    };

    // Função para exportar os dados filtrados para planilha
    const handleExport = () => {
        const exportData = filteredData.map(row => ({
            'Nome': row.user_name,
            'Usuário': row.user_login,
            'Acesso adm?': row.user_gestor === '2' ? 'Sim' : 'Não',
            'Recebe Msg Bot?': row.user_receb_msg === '2' ? 'Sim' : 'Não',
            'ID do Publicador': row.user_id_publica,
            'Data': row.user_dt_inclu,
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData); // Converte os dados para uma planilha
        const workbook = XLSX.utils.book_new(); // Cria um novo workbook (arquivo Excel)
        XLSX.utils.book_append_sheet(workbook, worksheet, "Controle_Usuários"); // Adiciona a planilha

        // Exporta o arquivo Excel
        XLSX.writeFile(workbook, 'Controle_Usuários.xlsx');
    };

    
    return (
        <Box sx={{ padding: '16px', backgroundColor: 'rgb(255,255,255)', color: '#202038' }}>
            <h2 style={{ fontSize: '1.6rem', marginBottom: '16px' }}>Controle de Usuários</h2>

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
                                        Total de Usuários
                                    </Typography>
                                    <Typography variant="h2" sx={{ fontSize: '1.8rem' }}>{data.length}</Typography>
                                </CardContent>
                            </Card>
                        </Box>

                        <Box sx={{ flex: 1, minWidth: '160px', maxWidth: '160px', height: '110px' }}>
                            <Card sx={{ width: '100%', backgroundColor: '#202038', color: 'white' }}>
                                <CardContent>
                                    <Typography variant="h5" sx={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                                        Gestores
                                    </Typography>
                                    <Typography variant="h2" sx={{ fontSize: '1.8rem' }}>{totalGestores}</Typography>
                                </CardContent>
                            </Card>
                        </Box>
                        <Box sx={{ flex: 1, minWidth: '160px', maxWidth: '160px', height: '110px' }}>
                            <Card sx={{ width: '100%', backgroundColor: '#202038', color: 'white' }}>
                                <CardContent>
                                    <Typography variant="h5" sx={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                                        Users Recebem Msg
                                    </Typography>
                                    <Typography variant="h2" sx={{ fontSize: '1.8rem' }}>{totalRecbMsg}</Typography>
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
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Nome</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Usuário</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Senha de Acesso</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Adm. Master (SS)?
                                        <FaChevronDown onClick={(event) => handleClick(event, 'user_gestor')} />
                                    </TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Adm. Territórios?
                                        <FaChevronDown onClick={(event) => handleClick(event, 'user_gestor_terr')} />
                                    </TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Adm. Reunião MWB?
                                        <FaChevronDown onClick={(event) => handleClick(event, 'user_gestor_rmwb')} />
                                    </TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Adm. Reunião FDS?
                                        <FaChevronDown onClick={(event) => handleClick(event, 'user_gestor_rfds')} />
                                    </TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Adm. Desig. Mecânicas?
                                        <FaChevronDown onClick={(event) => handleClick(event, 'user_gestor_mecan')} />
                                    </TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Recebe Mensagens?
                                        <FaChevronDown onClick={(event) => handleClick(event, 'user_receb_msg')} />
                                    </TableCell>

                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>ID do Publicador</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Data Cadastro</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Ações</TableCell>
                                </TableRow>
                                {/* Menu suspenso para filtros */}
                                <Menu
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl)}
                                    onClose={handleClose}
                                >
                                    {filterColumn === 'user_gestor' && (
                                        <>
                                            <MenuItem onClick={() => handleFilterSelect('')}>Todos</MenuItem>
                                            <MenuItem onClick={() => handleFilterSelect('1')}>Não</MenuItem>
                                            <MenuItem onClick={() => handleFilterSelect('2')}>Sim</MenuItem>
                                        </>
                                    )}
                                    {filterColumn === 'user_gestor_terr' && (
                                        <>
                                            <MenuItem onClick={() => handleFilterSelect('')}>Todos</MenuItem>
                                            <MenuItem onClick={() => handleFilterSelect('1')}>Não</MenuItem>
                                            <MenuItem onClick={() => handleFilterSelect('2')}>Sim</MenuItem>
                                        </>
                                    )}
                                    {filterColumn === 'user_gestor_rmwb' && (
                                        <>
                                            <MenuItem onClick={() => handleFilterSelect('')}>Todos</MenuItem>
                                            <MenuItem onClick={() => handleFilterSelect('1')}>Não</MenuItem>
                                            <MenuItem onClick={() => handleFilterSelect('2')}>Sim</MenuItem>
                                        </>
                                    )}
                                    {filterColumn === 'user_gestor_rfds' && (
                                        <>
                                            <MenuItem onClick={() => handleFilterSelect('')}>Todos</MenuItem>
                                            <MenuItem onClick={() => handleFilterSelect('1')}>Não</MenuItem>
                                            <MenuItem onClick={() => handleFilterSelect('2')}>Sim</MenuItem>
                                        </>
                                    )}
                                    {filterColumn === 'user_gestor_mecan' && (
                                        <>
                                            <MenuItem onClick={() => handleFilterSelect('')}>Todos</MenuItem>
                                            <MenuItem onClick={() => handleFilterSelect('1')}>Não</MenuItem>
                                            <MenuItem onClick={() => handleFilterSelect('2')}>Sim</MenuItem>
                                        </>
                                    )}

                                    {filterColumn === 'user_receb_msg' && (
                                        <>
                                            <MenuItem onClick={() => handleFilterSelect('')}>Todos</MenuItem>
                                            <MenuItem onClick={() => handleFilterSelect('1')}>Não</MenuItem>
                                            <MenuItem onClick={() => handleFilterSelect('2')}>Sim</MenuItem>
                                        </>
                                    )}
                                </Menu>
                            </TableHead>
                            <TableBody>
                                {paginatedData.map((row) => {
                                    const isEditing = row.id === editRowId;
                                    const statusGestor = getStatusGestor(row.user_gestor);
                                    const statusGestTerr = getStatusGestTerr(row.user_gestor_terr);
                                    const statusGestRmwb = getStatusGestRmwb(row.user_gestor_rmwb);
                                    const statusGestRfds = getStatusGestRfds(row.user_gestor_rfds);
                                    const statusGestMec = getStatusGestMec(row.user_gestor_mecan);
                                    const statusRecbMsg = getStatusRecbMsg(row.user_receb_msg);

                                    return (
                                        <TableRow key={row.id}>
                                            <TableCell TableCell align="center">
                                                <Checkbox
                                                    checked={isSelected(row.id)}
                                                    onChange={() => handleSelect(row.id)}
                                                />
                                            </TableCell>

                                            <TableCell align="center">{isEditing ? <TextField name="user_name" value={editedRowData.user_name || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.user_name}</TableCell>
                                            <TableCell align="center">{isEditing ? <TextField name="user_login" value={editedRowData.user_login || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.user_login}</TableCell>
                                            <TableCell align="center">
                                                {isEditing ? (
                                                    <TextField
                                                        name="user_pswd"
                                                        type="password" // Define o tipo como senha para ocultar os caracteres
                                                        value={visiblePassword}
                                                        onChange={handlePasswordChange}
                                                        size="small"
                                                        sx={{ width: '100%' }}
                                                    />
                                                ) : (
                                                    '●●●●●●●' // Exibe uma máscara de pontos (ou deixe vazio) quando não está em modo de edição
                                                )}
                                            </TableCell>
                                            {/* Campo editável de end. confirmado */}
                                            <TableCell align="center">
                                                {isEditing ? (
                                                    <FormControl fullWidth>
                                                        <Select
                                                            name="user_gestor"
                                                            value={editedRowData.user_gestor}
                                                            onChange={handleInputChange}
                                                        >
                                                            <MenuItem value="1">Não</MenuItem>
                                                            <MenuItem value="2">Sim</MenuItem>
                                                        </Select>
                                                    </FormControl>
                                                ) : (
                                                    <div
                                                        style={{
                                                            backgroundColor: getStatusColorGestor(statusGestor),
                                                            color: 'white',
                                                            padding: '2px',
                                                            borderRadius: '4px',
                                                            textAlign: 'center',
                                                            fontSize: '0.65rem',
                                                        }}
                                                    >
                                                        {statusGestor}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell align="center">
                                                {isEditing ? (
                                                    <FormControl fullWidth>
                                                        <Select
                                                            name="user_gestor_terr"
                                                            value={editedRowData.user_gestor_terr}
                                                            onChange={handleInputChange}
                                                        >
                                                            <MenuItem value="1">Não</MenuItem>
                                                            <MenuItem value="2">Sim</MenuItem>
                                                        </Select>
                                                    </FormControl>
                                                ) : (
                                                    <div
                                                        style={{
                                                            backgroundColor: getStatusColorGestTerr(statusGestTerr),
                                                            color: 'white',
                                                            padding: '2px',
                                                            borderRadius: '4px',
                                                            textAlign: 'center',
                                                            fontSize: '0.65rem',
                                                        }}
                                                    >
                                                        {statusGestTerr}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell align="center">
                                                {isEditing ? (
                                                    <FormControl fullWidth>
                                                        <Select
                                                            name="user_gestor_rmwb"
                                                            value={editedRowData.user_gestor_rmwb}
                                                            onChange={handleInputChange}
                                                        >
                                                            <MenuItem value="1">Não</MenuItem>
                                                            <MenuItem value="2">Sim</MenuItem>
                                                        </Select>
                                                    </FormControl>
                                                ) : (
                                                    <div
                                                        style={{
                                                            backgroundColor: getStatusColorGestRmwb(statusGestRmwb),
                                                            color: 'white',
                                                            padding: '2px',
                                                            borderRadius: '4px',
                                                            textAlign: 'center',
                                                            fontSize: '0.65rem',
                                                        }}
                                                    >
                                                        {statusGestRmwb}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell align="center">
                                                {isEditing ? (
                                                    <FormControl fullWidth>
                                                        <Select
                                                            name="user_gestor_rfds"
                                                            value={editedRowData.user_gestor_rfds}
                                                            onChange={handleInputChange}
                                                        >
                                                            <MenuItem value="1">Não</MenuItem>
                                                            <MenuItem value="2">Sim</MenuItem>
                                                        </Select>
                                                    </FormControl>
                                                ) : (
                                                    <div
                                                        style={{
                                                            backgroundColor: getStatusColorGestRfds(statusGestRfds),
                                                            color: 'white',
                                                            padding: '2px',
                                                            borderRadius: '4px',
                                                            textAlign: 'center',
                                                            fontSize: '0.65rem',
                                                        }}
                                                    >
                                                        {statusGestRfds}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell align="center">
                                                {isEditing ? (
                                                    <FormControl fullWidth>
                                                        <Select
                                                            name="user_gestor_mecan"
                                                            value={editedRowData.user_gestor_mecan}
                                                            onChange={handleInputChange}
                                                        >
                                                            <MenuItem value="1">Não</MenuItem>
                                                            <MenuItem value="2">Sim</MenuItem>
                                                        </Select>
                                                    </FormControl>
                                                ) : (
                                                    <div
                                                        style={{
                                                            backgroundColor: getStatusColorGestMec(statusGestMec),
                                                            color: 'white',
                                                            padding: '2px',
                                                            borderRadius: '4px',
                                                            textAlign: 'center',
                                                            fontSize: '0.65rem',
                                                        }}
                                                    >
                                                        {statusGestMec}
                                                    </div>
                                                )}
                                            </TableCell>

                                            {/* Campo editável de Terr. Designado */}
                                            <TableCell align="center">
                                                {isEditing ? (
                                                    <FormControl fullWidth>
                                                        <Select
                                                            name="user_receb_msg"
                                                            value={editedRowData.user_receb_msg}
                                                            onChange={handleInputChange}
                                                        >
                                                            <MenuItem value="1">Não</MenuItem>
                                                            <MenuItem value="2">Sim</MenuItem>
                                                        </Select>
                                                    </FormControl>
                                                ) : (
                                                    <div
                                                        style={{
                                                            backgroundColor: getStatusColorRecbMsg(statusRecbMsg),
                                                            color: 'white',
                                                            padding: '2px',
                                                            borderRadius: '4px',
                                                            textAlign: 'center',
                                                            fontSize: '0.65rem',
                                                        }}
                                                    >
                                                        {statusRecbMsg}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell align="center">{isEditing ? <TextField name="user_id_publica" value={editedRowData.user_id_publica || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.user_id_publica}</TableCell>
                                            <TableCell align="center">{row.user_dt_inclu}</TableCell>
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
                            <FaFileExport style={{ marginRight: '8px' }} /> Exportar Planilha
                        </Button>
                    </p><br></br>

                    {/* Botão para abrir o formulário */}
                    <button
                        type="button"
                        style={{
                            ...buttonStyle,
                            backgroundColor: showNewUserLoginForm ? '#67e7eb' : '#202038',
                            color: showNewUserLoginForm ? '#202038' : '#f1f1f1',
                        }}
                        onMouseEnter={(e) => {
                            if (!showNewUserLoginForm) {
                                e.currentTarget.style.backgroundColor = '#67e7eb'; // Cor ao passar o mouse
                                e.currentTarget.style.color = '#202038'; // Cor do texto ao passar o mouse
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!showNewUserLoginForm) {
                                e.currentTarget.style.backgroundColor = '#202038'; // Cor original
                                e.currentTarget.style.color = '#f1f1f1'; // Cor do texto original
                            }
                        }}
                        onClick={handleNovoBotao}
                    >
                        <FaUserPlus /> Novo Usuário
                    </button>
                </Box>
            </Box>

            {/* Formulário de Novo Usuário */}
            <Box sx={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', display: showNewUserLoginForm ? 'block' : 'none' }}>
                <form onSubmit={handleNewUserLoginSubmit}>
                    <Box sx={{ flex: 1, minWidth: '100px' }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={newUserLogin.user_gestor === '2'}
                                    onChange={(e) => setNewUserLogin({
                                        ...newUserLogin,
                                        user_gestor: e.target.checked ? '2' : '1'
                                    })}
                                    color="primary"
                                />
                            }
                            label="Adm. Master (SS)?"
                        />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: '100px' }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={newUserLogin.user_gestor_terr === '2'}
                                    onChange={(e) => setNewUserLogin({
                                        ...newUserLogin,
                                        user_gestor_terr: e.target.checked ? '2' : '1'
                                    })}
                                    color="primary"
                                />
                            }
                            label="Adm. Territórios?"
                        />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: '100px' }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={newUserLogin.user_gestor_rmwb === '2'}
                                    onChange={(e) => setNewUserLogin({
                                        ...newUserLogin,
                                        user_gestor_rmwb: e.target.checked ? '2' : '1'
                                    })}
                                    color="primary"
                                />
                            }
                            label="Adm. Reunião MWB?"
                        />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: '100px' }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={newUserLogin.user_gestor_rfds === '2'}
                                    onChange={(e) => setNewUserLogin({
                                        ...newUserLogin,
                                        user_gestor_rfds: e.target.checked ? '2' : '1'
                                    })}
                                    color="primary"
                                />
                            }
                            label="Adm. Reunião FDS?"
                        />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: '100px' }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={newUserLogin.user_gestor_mecan === '2'}
                                    onChange={(e) => setNewUserLogin({
                                        ...newUserLogin,
                                        user_gestor_mecan: e.target.checked ? '2' : '1'
                                    })}
                                    color="primary"
                                />
                            }
                            label="Adm. Desig. Mecânicas?"
                        />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: '100px' }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={newUserLogin.user_receb_msg === '2'}
                                    onChange={(e) => setNewUserLogin({
                                        ...newUserLogin,
                                        user_receb_msg: e.target.checked ? '2' : '1'
                                    })}
                                    color="primary"
                                />
                            }
                            label="Recebe Alertas Bot?"
                        />
                    </Box><br></br>

                    <Box sx={formBoxStyle}>
                        <Box sx={{ flex: 1, minWidth: '200px' }}>
                            <TextField label="Login *" variant="outlined" size="small" fullWidth value={newUserLogin.user_login} onChange={(e) => setNewUserLogin({ ...newUserLogin, user_login: e.target.value })} sx={inputStyle} />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: '200px' }}>
                            <TextField label="Nome Completo *" variant="outlined" size="small" fullWidth value={newUserLogin.user_name} onChange={(e) => setNewUserLogin({ ...newUserLogin, user_name: e.target.value })} sx={inputStyle} />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: '200px' }}>
                            <TextField label="ID do Publicador *" variant="outlined" size="small" fullWidth value={newUserLogin.user_id_publica} onChange={(e) => setNewUserLogin({ ...newUserLogin, user_id_publica: e.target.value })} sx={inputStyle} />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: '200px' }}>
                            <TextField label="User Senha *" variant="outlined" size="small" fullWidth value={newUserLogin.user_pswd} onChange={(e) => setNewUserLogin({ ...newUserLogin, user_pswd: e.target.value })} sx={inputStyle} />
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
                        > <FaShareSquare /> Enviar Usuário</button>
                    </Box>
                </form>
                {message && <Typography variant="body1" sx={{ color: message.includes('Erro') ? 'red' : 'green', marginTop: '10px' }}>{message}</Typography>}
            </Box >
        </Box >
    );
};

export default UsersForm;
