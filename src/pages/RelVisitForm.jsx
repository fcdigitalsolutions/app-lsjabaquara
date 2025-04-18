import React, { useState, useEffect } from 'react';
import api_service from '../services/api_service'; // Importando serviço da API
import InputMask from 'react-input-mask';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Box, Menu, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Card, CardContent, Paper, TablePagination, Button, TextField, Typography, Select, FormControl, Checkbox } from '@mui/material';
import { FaChevronDown, FaFileExport, FaUserPlus, FaShareSquare, FaUpload, FaCloudUploadAlt } from 'react-icons/fa';
import * as XLSX from 'xlsx'; // Importe a biblioteca XLSX
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';

const RelVisitForm = () => {
    const [data, setData] = useState([]);
    const [page, setPage] = useState(0);
    const [editRowId, setEditRowId] = useState(null); // ID da linha sendo editada
    const [editedRowData, setEditedRowData] = useState({}); // Dados da linha sendo editada
    const [showNewIndicationForm, setShowNewIndicationForm] = useState(false); // Controla a exibição do formulário de nova indicação
    const [message, setMessage] = useState(''); // Mensagem de sucesso ou erro
    const [selected, setSelected] = useState([]);
    const totalConcluidos = data.filter(item => item.num_visitas >= 2).length;
    const totalRegioes = new Set(data.map(item => item.cod_regiao)).size;
    const [rowsPerPage, setRowsPerPage] = useState(10); // Limite de linhas por página
    const Data_Atual = new Date();
    const [selectedRows, setSelectedRows] = useState([]);
    const [selectedFileName, setSelectedFileName] = useState(""); // Armazena o nome do arquivo selecionado
    const [openDialog, setOpenDialog] = useState(false); // Controla o estado do diálogo
    const handleOpenDialog = () => setOpenDialog(true);
    const handleCloseDialog = () => setOpenDialog(false);
    const [displayMessage, setDisplayMessage] = useState(""); // Armazena a mensagem atual
    const [messageColor, setMessageColor] = useState("black"); // Armazena a cor da mensagem

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

    const formatToDDMMYYYY = (date) => {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0'); // Janeiro é 0
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setSelectedFileName(file.name); // Atualiza o nome do arquivo selecionado
      //  setDisplayMessage(`Arquivo selecionado: ${file.name}`)
        setDisplayMessage(`Arquivo selecionado: ${selectedFileName}`);
        setMessageColor("black"); // Cor padrão para mensagem de seleção

        const reader = new FileReader();

        reader.onload = (e) => {
            const data = e.target.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            const excelSerialToDate = (serial) => {
                const excelStartDate = new Date(1899, 11, 30); // 30 de dezembro de 1899
                const convertedDate = new Date(excelStartDate.getTime() + serial * 86400000); // Adiciona dias em milissegundos
                return convertedDate.toISOString().split('T')[0]; // Retorna em formato "YYYY-MM-DD"

            };

            // Transforme os dados para o formato necessário para a API
            const formattedData = jsonData.map((row) => ({
                data_inclu: excelSerialToDate(row["Data Inclusão"] || ""),
                visit_data: excelSerialToDate(row["Data Visita"] || ""),
                pub_login: row["Publicador Login"] || "",
                pub_nome: row["Nome Publicador"] || "",
                visit_cod: row["Mapa"] || "",
                visit_url: row["Link Mapa"] || "",
                visit_ender: row["Endereço"] || "",
                visit_status: row["Encontrou?"] || "",
                num_pessoas: row["QTD de Surdos"] || 0,
                melhor_dia: row["Melhor Dia"] || "",
                melhor_hora: row["Melhor Hora"] || "",
                terr_obs: row["Detalhes"] || "",
            }));

            setSelectedRows(formattedData); // Salva os dados processados
        };

        reader.readAsBinaryString(file);
    };

    const prepareBatchData = () => {
        return selectedRows.map((row) => ({
            data_inclu: formatToDDMMYYYY(row.data_inclu),
            visit_data: formatToDDMMYYYY(row.visit_data),
            pub_login: row.pub_login,
            pub_nome: row.pub_nome,
            visit_cod: row.visit_cod,
            visit_url: row.visit_url,
            visit_ender: row.visit_ender,
            visit_status: row.visit_status,
            num_pessoas: row.num_pessoas,
            melhor_dia: row.melhor_dia,
            melhor_hora: row.melhor_hora,
            terr_obs: row.terr_obs,
        }));
    };

    const handleBatchSubmit = async () => {
        const batchData = prepareBatchData();

        if (batchData.length === 0) {
            setMessage("Nenhum registro selecionado.");
            return;
        }

        try {
            const response = await api_service.post('/rvisitas/batch', batchData);
            console.log("Lote enviado com sucesso:", response.data);
            setMessage(`Lote de ${batchData.length} registros enviado com sucesso!`);
        } catch (error) {
            console.error("Erro ao enviar o lote:", error);
            setMessage("Erro ao enviar o lote de registros.");
        }
    };

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
        api_service.get('/rvisitall')
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
            await api_service.put(`/rvisitas/${editedRowData.id}`, editedRowData); // Atualiza os dados no backend
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
                await api_service.delete(`/rvisitas/${id}`); // Envia a solicitação de exclusão para a API
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

            const response = await api_service.post('/rvisitas', newIndicationData);
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


    // Função para determinar o status com base na confirmação do endereço
    const getStatusVisit = (visit_status) => {
        switch (visit_status) {
            case 'Não':
                return 'Não';
            case 'Sim':
                return 'Sim';
            case 'Carta':
                return 'Carta';
            case 'Família':
                return 'Família';
            case 'Outros':
                return 'Outros';
            default:
                return 'transparent';
        }
    };

    // Função para determinar a cor de fundo da célula com base no status
    const getStatusColorVisit = (status) => {
        switch (status) {
            case 'Não':
                return '#EBC79E';
            case 'Sim':
                return '#5C3317';
            case 'Carta':
                return '#5C3317';
            case 'Família':
                return '#5C3317';
            case 'Outros':
                return '#5C3317';
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

    // Função para obter a lista única de logradouros (enderec)
    const getUniqueMapaCod = () => {
        const MapasUnicos = [...new Set(data.map(row => row.visit_cod))];
        return MapasUnicos;
    };

    // Função para exportar os dados filtrados para planilha
    const handleExport = () => {
        const exportData = filteredData.map(row => ({

            'Data Inclusão' 	: row.data_inclu,	
            'Data Visita'       : row.visit_data, 	
            'Publicador Login'  : row.pub_login,  	
            'Nome Publicador'   : row.pub_nome,  	
            'Mapa'              : row.visit_cod, 		
            'Link Mapa'         : row.visit_url, 		
            'Endereço'          : row.visit_ender, 	
            'Encontrou?'        : row.visit_status, 	
            'QTD de Surdos'     : row.num_pessoas, 	
            'Melhor Dia'        : row.melhor_dia, 	
            'Melhor Hora'       : row.melhor_hora, 	
            'Detalhes'          : row.terr_obs, 

        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData); // Converte os dados para uma planilha
        const workbook = XLSX.utils.book_new(); // Cria um novo workbook (arquivo Excel)
        XLSX.utils.book_append_sheet(workbook, worksheet, "Registro de Visitas"); // Adiciona a planilha

        // Exporta o arquivo Excel
        XLSX.writeFile(workbook, 'Registro_Visitas.xlsx');
    };


    return (
        <Box sx={{ padding: '16px', backgroundColor: 'rgb(255,255,255)', color: '#202038' }}>
            <h2 style={{ fontSize: '1.6rem', marginBottom: '16px' }}>Registro de Visitas</h2>

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

                        <Box sx={{ flex: 1, minWidth: '160px', maxWidth: '160px', height: '110px' }}>
                            <Card sx={{ width: '100%', backgroundColor: '#202038', color: 'white' }}>
                                <CardContent>
                                    <Typography variant="h5" sx={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                                        Num. de Mapas
                                    </Typography>
                                    <Typography variant="h2" sx={{ fontSize: '1.8rem' }}>{totalRegioes}</Typography>
                                </CardContent>
                            </Card>
                        </Box>

                        <Box sx={{ flex: 1, minWidth: '160px', maxWidth: '160px', height: '110px' }}>
                            <Card sx={{ width: '100%', backgroundColor: '#202038', color: 'white' }}>
                                <CardContent>
                                    <Typography variant="h5" sx={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                                        Participantes
                                    </Typography>
                                    <Typography variant="h2" sx={{ fontSize: '1.8rem' }}>{totalConcluidos}</Typography>
                                </CardContent>
                            </Card>
                        </Box>
                    </Box>

                    <Box sx={{
                        marginTop: '12px',
                        justifyContent: 'space-between',
                    }}>

                        {displayMessage && (
                            <Typography
                                variant="body2"
                                sx={{ color: messageColor, marginTop: '16px' }}
                            >
                                {displayMessage}
                            </Typography>
                        )}

                        <Button variant="contained" component="label"
                            style={{
                                ...buttonStyle,
                                mr: 4,
                                padding: '4px 12px',
                                fontSize: '0.60rem',
                                marginTop: '10px',
                            }}
                        >
                            <FaUpload style={{ marginRight: '6px' }} />
                            Trazer dados da Planilha
                            <input type="file" accept=".xlsx, .xls" hidden onChange={handleFileUpload} />
                        </Button>

                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleOpenDialog}

                            style={{
                                ...buttonStyle,
                                padding: '4px 12px',
                                fontSize: '0.60rem',
                                marginTop: '10px',
                                marginLeft: '10px',
                            }}
                        >
                            <FaCloudUploadAlt style={{ marginRight: '6px' }} />
                            Enviar Dados da Planilha  </Button>
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
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Data Visita</TableCell>

                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Mapa
                                        <FaChevronDown onClick={(event) => handleClick(event, 'visit_cod')} />
                                    </TableCell>

                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Observações</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Endereço</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Link Map</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Encontrou?
                                        <FaChevronDown onClick={(event) => handleClick(event, 'visit_status')} />
                                    </TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Publicador
                                        <FaChevronDown onClick={(event) => handleClick(event, 'pub_nome')} />
                                    </TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Email</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Quantidade de Surdos</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Melhor Dia</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Melhor Hora</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Ações</TableCell>

                                </TableRow>
                                {/* Menu suspenso para filtros */}
                                <Menu
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl)}
                                    onClose={handleClose}
                                >
                                    {filterColumn === 'visit_cod' && (
                                        <>
                                            <MenuItem onClick={() => handleFilterSelect('')}>Todos</MenuItem>
                                            {/* Gerar dinamicamente as congregações únicos */}
                                            {getUniqueMapaCod().map((visit_cod) => (
                                                <MenuItem key={visit_cod} onClick={() => handleFilterSelect(visit_cod)}>
                                                    {visit_cod}
                                                </MenuItem>
                                            ))}
                                        </>
                                    )}

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
                                    const statusVist = getStatusVisit(row.visit_status);

                                    return (
                                        <TableRow key={row.id}>
                                            <TableCell TableCell align="center">
                                                <Checkbox
                                                    checked={isSelected(row.id)}
                                                    onChange={() => handleSelect(row.id)}
                                                />
                                            </TableCell>
                                            <TableCell align="center">{isEditing ? <TextField name="visit_data" value={editedRowData.visit_data || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.visit_data}</TableCell>
                                            <TableCell align="center">{isEditing ? <TextField name="visit_cod" value={editedRowData.visit_cod || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.visit_cod}</TableCell>
                                            <TableCell align="center">{isEditing ? <TextField name="terr_obs" value={editedRowData.terr_obs || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.terr_obs}</TableCell>
                                            <TableCell align="center">{isEditing ? <TextField name="visit_ender" value={editedRowData.visit_ender || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.visit_ender}</TableCell>
                                            <TableCell align="center">{isEditing ? <TextField name="visit_url" value={editedRowData.visit_url || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.visit_url}
                                                <Button variant="contained" color="primary" size="small" onClick={() => handleAbreMapa(row.visit_url)} sx={{ fontSize: '0.55rem', padding: '2px 5px' }}>Abrir Mapa</Button>
                                            </TableCell>

                                            {/* Campo editável de visit_status */}
                                            <TableCell align="center">
                                                {isEditing ? (
                                                    <FormControl fullWidth>
                                                        <Select
                                                            name="visit_status"
                                                            value={editedRowData.visit_status}
                                                            onChange={handleInputChange}
                                                        >
                                                            <MenuItem value="Sim">Sim</MenuItem>
                                                            <MenuItem value="Não">Não</MenuItem>
                                                            <MenuItem value="Carta">Carta</MenuItem>
                                                            <MenuItem value="Família">Família</MenuItem>
                                                            <MenuItem value="Outros">Outros</MenuItem>
                                                        </Select>
                                                    </FormControl>
                                                ) : (
                                                    <div
                                                        style={{
                                                            backgroundColor: getStatusColorVisit(statusVist),
                                                            color: 'white',
                                                            padding: '2px',
                                                            borderRadius: '4px',
                                                            textAlign: 'center',
                                                            fontSize: '0.65rem',
                                                        }}
                                                    >
                                                        {statusVist}
                                                    </div>
                                                )}
                                            </TableCell>

                                            <TableCell align="center">{isEditing ? <TextField name="pub_nome" value={editedRowData.pub_nome || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.pub_nome}</TableCell>
                                            <TableCell align="center">{isEditing ? <TextField name="pub_login" value={editedRowData.pub_login || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.pub_login}</TableCell>
                                            <TableCell align="center">{isEditing ? <TextField name="num_pessoas" value={editedRowData.num_pessoas || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.num_pessoas}</TableCell>
                                            <TableCell align="center">{isEditing ? <TextField name="melhor_dia" value={editedRowData.melhor_dia || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.melhor_dia}</TableCell>
                                            <TableCell align="center">{isEditing ? <TextField name="melhor_hora" value={editedRowData.melhor_hora || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.melhor_hora}</TableCell>
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
                        <FaUserPlus /> Apontar Visita
                    </button>
                </Box>
            </Box>

            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
            >
                <DialogTitle>Confirmação</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Tem certeza de que deseja enviar os dados para a API? Essa ação não pode ser desfeita.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="secondary">
                        Não
                    </Button>
                    <Button
                        onClick={async () => {
                            try {
                                await handleBatchSubmit(); // Chama o envio para a API
                                setDisplayMessage("Arquivo importado com sucesso para a base de dados!");
                                setMessageColor("green");
                            } catch (error) {
                                setDisplayMessage("Erro ao importar o arquivo.");
                                setMessageColor("red");
                            } finally {
                                handleCloseDialog(); // Fecha o diálogo
                            }
                        }}
                        color="primary"
                    >
                        Sim
                    </Button>

                </DialogActions>
            </Dialog>

            {/* Formulário de nova indicação */}
            <Box sx={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', display: showNewIndicationForm ? 'block' : 'none' }}>
                <form onSubmit={handleNewIndicationSubmit}>
                    <Box sx={{ flex: 1, minWidth: '100px' }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={newIndication.end_confirm === '2'}
                                    onChange={(e) => setNewIndication({
                                        ...newIndication,
                                        end_confirm: e.target.checked ? '2' : '1'
                                    })}
                                    color="primary"
                                />
                            }
                            label="Endereço Confirmado?"
                        />
                    </Box>

                    <Box sx={formBoxStyle}>
                        <Box sx={{ flex: 1, minWidth: '200px' }}>
                            <TextField label="Seu Nome *" variant="outlined" size="small" fullWidth value={newIndication.nome_publica} onChange={(e) => setNewIndication({ ...newIndication, nome_publica: e.target.value })} sx={inputStyle} />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: '200px' }}>
                            <InputMask mask="(99) 99999-9999" value={newIndication.num_contato} onChange={(e) => setNewIndication({ ...newIndication, num_contato: e.target.value })}>
                                {(inputProps) => <TextField {...inputProps} label="Seu Telefone *" variant="outlined" size="small" fullWidth sx={inputStyle} />}
                            </InputMask>
                        </Box>
                        <Box sx={{ flex: 1, minWidth: '200px' }}>
                            <TextField label="Sua Congregação *" variant="outlined" size="small" fullWidth value={newIndication.cod_congreg} onChange={(e) => setNewIndication({ ...newIndication, cod_congreg: e.target.value })} sx={inputStyle} />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: '200px' }}>
                            <TextField label="Bairro do Surdo*" variant="outlined" size="small" fullWidth value={newIndication.cod_regiao} onChange={(e) => setNewIndication({ ...newIndication, cod_regiao: e.target.value })} sx={inputStyle} />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: '200px' }}>
                            <TextField label="Endereço do Surdo *" variant="outlined" size="small" fullWidth value={newIndication.enderec} onChange={(e) => setNewIndication({ ...newIndication, enderec: e.target.value })} sx={inputStyle} />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: '200px' }}>
                            <TextField label="Detalhes e Referências " variant="outlined" size="small" fullWidth value={newIndication.obs} onChange={(e) => setNewIndication({ ...newIndication, obs: e.target.value })} sx={inputStyle} />
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
                        > <FaShareSquare /> Enviar Indicação</button>
                    </Box>
                </form>
                {message && <Typography variant="body1" sx={{ color: message.includes('Erro') ? 'red' : 'green', marginTop: '10px' }}>{message}</Typography>}
            </Box >

        </Box >
    );
};

export default RelVisitForm;
