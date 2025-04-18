import React, { useState, useEffect } from 'react';
import api_service from '../services/api_service';
import {
  Button,
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  CircularProgress,
  IconButton,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import { FaAngleDoubleDown, FaCheckCircle, FaMapMarked, FaFileSignature, FaExchangeAlt } from 'react-icons/fa';
import { styled } from '@mui/material/styles';
import { useTheme } from '../components/ThemeContext';

const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

const FormUserView = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState({});

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [selectedItemId, setSelectedItemId] = useState(null);
  const [openVisitDialog, setOpenVisitDialog] = useState(false);
  const [openTransfDialog, setOpenTransfDialog] = useState(false);
  const [publicadores, setPublicadores] = useState([]); // Estado para armazenar as opções de Publicadores

  const [openReservMapDialog, setOpenReservMapDialog] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [pendingNewTerritor, setPendingNewTerritor] = useState(null);
  const [nextTerrNome, setNextTerrNome] = useState('');

  const [formFields, setFormFields] = useState({
    visit_status: '',
    num_pessoas: '',
    melhor_dia: '',
    melhor_hora: '',
    terr_obs: ''
  });

  const userDados = JSON.parse(sessionStorage.getItem('userData'));
  const lginUser = userDados?.iduser;
  const totalMapas = new Set(data.map(item => item.desig_id)).size;

  const handleExpandClick = (id) => {
    setExpanded((prevExpanded) => ({ ...prevExpanded, [id]: !prevExpanded[id] }));
  };

  const handleAbreMapa = (row) => {
    window.open(row, '_blank');
  };

  const { darkMode } = useTheme();

  const getStatusDesig = (dsg_status) => {
    switch (dsg_status) {
      case '0': return 'NÃO DESIGNADO';
      case '1': return 'PENDENTE';
      case '2': return 'JÁ VISITEI';
      case '3': return 'VENCIDO';
      case '4': return 'ENCERRADO';
      default: return 'Outros';
    }
  };

  const getStatusColorDesig = (status) => {
    switch (status) {
      case 'NÃO DESIGNADO': return darkMode ? '#666666' : '#666666';
      case 'PENDENTE': return darkMode ? '#CC0000' : '#CC0000';
      case 'JÁ VISITEI': return darkMode ? '#00009C' : '#00009C';
      case 'VENCIDO': return darkMode ? '#5C4033' : '#5C4033';
      case 'ENCERRADO': return darkMode ? '#000000' : '#000000';
      default: return 'transparent';
    }
  };

  // Função para determinar o status com base na confirmação do endereço
  const getStatusTpLocal = (terr_tp_local) => {
    switch (terr_tp_local) {
      case '1':
        return 'CASA';
      case '2':
        return 'TRABALHO';
      case '3':
        return 'PRÉDIO';
      default:
        return 'OUTROS';
    }
  };
  // Função para determinar o status com base na confirmação do endereço
  const getStatusClassif = (terr_classif) => {
    switch (terr_classif) {
      case '0':
        return 'SURDO';
      case '1':
        return 'D/A';
      case '2':
        return 'TRADUTOR';
      case '3':
        return 'OUVINTE';
      default:
        return 'OUTROS';
    }
  };

  // Função para determinar a cor de fundo da célula com base no status
  const getColorMapCor = (terr_cor) => {
    switch (terr_cor) {
      case '0':
        return '#00009C';
      case '1':
        return '#CC0000';
      case '2':
        return '#238E23';
      default:
        return 'transparent';
    }
  };

  useEffect(() => {
    setLoading(true);
    api_service.get(`/desig/${lginUser}`)
      .then((response) => {
        setData(response.data);
        setError(null);
      })
      .catch((error) => {
        console.error("Erro ao buscar os dados: ", error);
        setError('Erro ao carregar as designações. Tente novamente mais tarde.');
      })
      .finally(() => setLoading(false));
  }, [lginUser]);

  const handleOpenVisitDialog = (item) => {
    setSelectedItem({
      ...item,
      territor_id: item.territor_id, // Adicione o ID do território
    });

    setFormFields({
      visit_status: item.visit_status || '',
      num_pessoas: item.num_pessoas || '',
      melhor_dia: item.melhor_dia_hora || '',
      melhor_hora: item.melhor_hora || '',
      terr_obs: item.terr_obs || '',
    });

    setOpenVisitDialog(true); // Abre o diálogo
  };

  const handleOpenReservDialog = (item) => {
    setSelectedItem({
      ...item,
      territor_id: item.territor_id, // ID do território
      desig_id: item.desig_id, // ID da designação
    });

    setFormFields({
      dt_ultvisit: new Date().toLocaleDateString("pt-BR"), // Data da última visita
      pub_ultvisi: item.pub_login || '',
      terr_respons: item.pub_login || '',
      terr_status: item.terr_status || '',
      terr_desig: item.terr_desig || '',
    });

    setOpenReservMapDialog(true); // Abre o diálogo
  };

  // Função para buscar os dados da API
  useEffect(() => {
    const fetchPublicadores = async () => {
      try {
        const response = await api_service.get('/pubcallsint'); // rota da API
        setPublicadores(response.data); // a API retorna um array de dados
      } catch (error) {
        console.error('Erro ao carregar os dados:', error);
      }
    };

    fetchPublicadores(); // Chama a função para carregar os dados
  }, []);


  const handleFieldChange = (field, value) => {
    setFormFields((prevState) => ({ ...prevState, [field]: value }));
  };

  const handleOpenDialog = (item) => {
    if (!item) {
      return;
    }
    setSelectedItem(item); // Configura o item completo
    setSelectedItemId(item.desig_id); // Configura o ID
    setOpenDialog(true);
  };

  const handleEncerrar = async () => {
    setOpenDialog(false);

    // Verifica se o item está selecionado ou busca pelo ID
    if (!selectedItem && selectedItemId) {
      const itemToUpdate = data.find((item) => item.desig_id === selectedItemId);
      if (itemToUpdate) {
        setSelectedItem(itemToUpdate);
      } else {
        console.error("Nenhum item correspondente encontrado na lista.");
        return;
      }
    }

    if (!selectedItem || !selectedItem.desig_id) {
      return;
    }

    const updatedDesignacao = {
      ...selectedItem,
      dsg_status: '4', // Atualiza o status para "Encerrada"
    };

    const updatedTerritorio = {
      terr_desig: '1', // 1 - Não designado, 2 - Designado - Atualiza para indicar que o território está livre
      terr_respons: '',
      terr_status: '0', // 0 - ativo, 1 - revisita, 2 - estudante
    };

    // Atualiza o status da indicação para "confirmada"
    const updatedIndicacao = {
      ...selectedItem,
      end_confirm: '3', // Confirmado
      indic_desig: '1', // Atualiza como não-designado
    };


    try {
      // Atualiza o status da designação
      await api_service.put(`/desig/${selectedItem.desig_id}`, updatedDesignacao);
      console.log("Designação encerrada com sucesso.");

      // Atualiza o status do território
      await api_service.put(`/terrupdesp/${selectedItem.territor_id}`, updatedTerritorio);
      console.log("Território liberado com sucesso.");


      await api_service.put(`/indica/${selectedItem.indica_id}`, updatedIndicacao);
      console.log('Indicação atualizada com sucesso.');

      // Atualiza o estado local para refletir as mudanças
      setData((prevData) =>
        prevData.map((item) =>
          item.desig_id === selectedItem.desig_id
            ? { ...item, dsg_status: '4', terr_desig: '0' }
            : item
        )
      );

      setSelectedItem(null);
      setSelectedItemId(null);
    } catch (error) {
      console.error("Erro ao encerrar a designação ou liberar o território: ", error);
    }
  };


  const handleRealizar = async () => {
    if (!selectedItem || !selectedItem.desig_id) {
      return;
    }

    // Atualiza o status da designação
    const updatedData = {
      ...selectedItem,
      dsg_status: '2', // Atualiza o status para "Já Visitei"
    };

    try {
      // Faz a requisição PUT para atualizar a designação
      await api_service.put(`/desig/${selectedItem.desig_id}`, updatedData);

      // Atualiza o estado local para refletir a mudança
      setData((prevData) =>
        prevData.map((item) =>
          item.desig_id === selectedItem.desig_id ? { ...item, dsg_status: '2' } : item
        )
      );

      console.log("Designação atualizada com sucesso.");
    } catch (error) {
      console.error("Erro ao realizar a designação: ", error);
    }
  };

  const handleUpdTerrit = async () => {
    if (!selectedItem || !selectedItem.territor_id) {

      return;
    }

    const updatedTerrit = {
      num_pessoas: formFields.num_pessoas || selectedItem.num_pessoas || '',
      melhor_dia_hora: formFields.melhor_dia || selectedItem.melhor_dia_hora || '',
      melhor_hora: formFields.melhor_hora || selectedItem.melhor_hora || '',
      terr_obs: formFields.terr_obs || selectedItem.terr_obs || '',
      dt_ultvisit: new Date().toLocaleDateString("pt-BR"), // Data da última visita
      pub_ultvisi: selectedItem.pub_login, // Publicador responsável pela última visita
    };

    try {
      const response = await api_service.put(`/terrupdesp/${selectedItem.territor_id}`, updatedTerrit);
      console.log("Resposta do servidor:", response.data);

      setData((prevData) =>
        prevData.map((item) =>
          item.territor_id === selectedItem.territor_id ? { ...item, ...updatedTerrit } : item
        )
      );

      console.log("Território atualizado com sucesso.");
    } catch (error) {
      console.error("Erro ao atualizar o território:", error);
    }
  };

  const handleReservTerrit = async () => {
    if (!selectedItem || !selectedItem.territor_id) {
      return;
    }

    // Atualiza os dados do Território
    const updatedTerrit = {
      dt_ultvisit: new Date().toLocaleDateString("pt-BR"), // Data da última visita
      pub_ultvisi: selectedItem.pub_login, // Publicador responsável pela última visita
      terr_respons: selectedItem.pub_login, // Publicador responsável pelo território
      terr_status: formFields.terr_status, // Status da reserva (1 = Revisita, 2 = Estudo)
      terr_desig: '2'
    };

    // Atualiza o status da Designação correspondente
    const updatedDesignacao = {
      ...selectedItem,
      dsg_status: '2', // Atualiza o status para "Já Visitei" ou "Reservado"
    };

    try {
      // Atualiza o Território
      const responseTerrit = await api_service.put(`/terrupdesp/${selectedItem.territor_id}`, updatedTerrit);
      console.log("Resposta do servidor para Território:", responseTerrit.data);

      // Atualiza a tabela de Designações
      const responseDesignacao = await api_service.put(`/desig/${selectedItem.desig_id}`, updatedDesignacao);
      console.log("Resposta do servidor para Designação:", responseDesignacao.data);

      // Atualiza os estados locais
      setData((prevData) =>
        prevData.map((item) =>
          item.territor_id === selectedItem.territor_id
            ? { ...item, ...updatedTerrit, dsg_status: updatedDesignacao.dsg_status }
            : item
        )
      );

      console.log("Território e Designação atualizados com sucesso.");
    } catch (error) {
      console.error("Erro ao atualizar os dados:", error);
    }

    setOpenReservMapDialog(false); // Fecha o diálogo
  };


  const handleOpenTransfDialog = (item) => {
    setSelectedItem({
      ...item,
      territor_id: item.territor_id, // Adicione o ID do território
    });

    setFormFields({
      visit_status: item.visit_status || '',
      num_pessoas: item.num_pessoas || '',
      melhor_dia: item.melhor_dia_hora || '',
      melhor_hora: item.melhor_hora || '',
      terr_obs: item.terr_obs || '',
    });

    setOpenTransfDialog(true); // Abre o diálogo
  };


  const handleVisitSubmit = async () => {
    if (!selectedItem) return;
    const visitData = {
      data_inclu: new Date().toLocaleDateString("pt-BR"),
      visit_data: new Date().toLocaleDateString("pt-BR"),
      pub_login: selectedItem.pub_login,
      pub_nome: selectedItem.pub_nome,
      visit_cod: selectedItem.dsg_mapa_cod,
      visit_url: selectedItem.terr_link,
      visit_ender: selectedItem.terr_enderec,
      visit_status: formFields.visit_status,
      num_pessoas: formFields.num_pessoas,
      melhor_dia: formFields.melhor_dia,
      melhor_hora: formFields.melhor_hora,
      terr_obs: formFields.terr_obs,
    };

    try {
      await api_service.post(`/rvisitas`, visitData); // Insere a visita
      await handleRealizar(); // Atualiza o status da designação
      await handleUpdTerrit(); // Atualiza os dados do território
      setOpenVisitDialog(false); // Fecha o modal de visita


      console.log("Registro de Visita atualizado com sucesso.");
    } catch (error) {
      console.error("Erro ao registrar visita e atualizar os dados: ", error);
    }
  };

  const handleDesignar = async () => {
    if (!selectedItem || !selectedItem.desig_id || !formFields.pub_login) {
      console.error("Por favor, selecione uma designação e um publicador.");
      return;
    }

    const updatedTerritorio = {
      terr_desig: '2', // 1 - Não designado, 2 - Designado - Atualiza para indicar que o território está livre
      terr_respons: '',
      terr_status: '0', // 0 - ativo, 1 - revisita, 2 - estudante
    };

    // Atualiza o status da designação
    const updatedData = {
      ...selectedItem,
      dsg_status: '1', // Define o status como "Pendente"
      pub_login: formFields.pub_login, // Login do publicador selecionado
      pub_nome: publicadores.find(p => p.pub_chave === formFields.pub_login)?.pub_nome || '', // Nome do publicador correspondente
      dsg_data: new Date().toLocaleDateString("pt-BR"), // Data da designação
    };

    try {
      // Faz a requisição PUT para atualizar a designação
      await api_service.put(`/desig/${selectedItem.desig_id}`, updatedData);

      // Atualiza o status do território
      await api_service.put(`/terrupdesp/${selectedItem.territor_id}`, updatedTerritorio);
      console.log("Território liberado com sucesso.");

      // Atualiza o estado local para refletir as mudanças
      setData((prevData) =>
        prevData.map((item) =>
          item.desig_id === selectedItem.desig_id
            ? { ...item, dsg_status: '1', terr_desig: '0' }
            : item
        )
      );

      setOpenTransfDialog(false); // Fecha o diálogo
      console.log("Designação atualizada com sucesso.");
      //Alert("Designação atualizada com sucesso.");
    } catch (error) {
      console.error("Erro ao designar a designação: ", error);
    }
  };


  // Função para determinar o status com base na confirmação do endereço
  const getStatusDesigTipo = (desg_tipogrupo) => {
    switch (desg_tipogrupo) {
      case 'MAP': return 'Mapa';
      case 'IND': return 'Indicação';
      default: return 'Outros';
    }
  };

  const getStatusColorDsgTipo = (status) => {
    switch (status) {
      case 'Mapa': return '#2F4F2F';
      case 'Indicação': return '#191970';
      default: return 'transparent';
    }
  };

  const handleConfirmNewTerritor = async (confirm) => {
    setOpenConfirmDialog(false);
    if (confirm && pendingNewTerritor) {
      try {
        // Cria o novo território
        const response = await api_service.post('/territ', pendingNewTerritor);
        console.log('Novo registro de mapa criado:', response.data);

        // Atualiza o status da designação para "encerrada"
        const updatedDesignacao = {
          ...selectedItem,
          dsg_status: '4', // "Encerrada"
        };

        await api_service.put(`/desig/${selectedItem.desig_id}`, updatedDesignacao);
        console.log('Designação atualizada para "encerrada".');

        // Atualiza o status da indicação para "confirmada"
        const updatedIndicacao = {
          ...selectedItem,
          end_confirm: '2', // Confirmado
          indic_desig: '1', // Atualiza como não-designado
        };

        await api_service.put(`/indica/${selectedItem.indica_id}`, updatedIndicacao);
        console.log('Indicação atualizada com sucesso.');

        // Atualiza o estado local
        setData((prevData) =>
          prevData.map((item) =>
            item.desig_id === selectedItem.desig_id
              ? { ...item, dsg_status: '4', end_confirm: '2' }
              : item
          )
        );

        setPendingNewTerritor(null);
      } catch (error) {
        console.error("Erro ao processar a confirmação:", error);
      }
    }
  };


  const handleEndConfirmChange = async (row) => {
    const newTerritor = {
      data_inclu: new Date().toLocaleDateString("pt-BR"),
      dt_ultvisit: new Date().toLocaleDateString("pt-BR"),
      melhor_dia_hora: row.melhor_dia_hora,
      melhor_hora: row.melhor_hora,
      num_pessoas: row.num_pessoas || 1,
      pub_ultvisi: row.pub_nome, // Nome do publicador
      terr_classif: row.terr_classif || '0',
      terr_coord: row.terr_coord || '', // Coordenadas do território
      terr_cor: row.terr_cor || '2', // Coordenadas do território '2', // Verde por padrão
      terr_desig: '1', //'1', // Não designado
      terr_enderec: row.terr_enderec,
      terr_link: row.terr_link || '',
      terr_morador: 'SURDO (Vide Indicação)',
      terr_nome: nextTerrNome, // Nome baseado no ID
      terr_obs: row.terr_obs || '',
      terr_regiao: row.terr_regiao || '',
      terr_status: '0', // Ativo por padrão
      terr_tp_local: row.terr_tp_local || '1', // Tipo de local
    };

    setPendingNewTerritor(newTerritor);
    setSelectedItem(row); // Define o item atual
    setOpenConfirmDialog(true); // Abre o diálogo de confirmação
  };

  useEffect(() => {
    fetchLastTerrNome();
  }, []);

  // Função para buscar o último valor de `terr_nome` e calcular o próximo
  const fetchLastTerrNome = async () => {
    try {
      const response = await api_service.get('/territall');
      const data = response.data;

      if (data.length > 0) {
        // Encontrar o último código no campo `terr_nome`
        const lastTerrNome = data[data.length - 1].terr_nome;

        // Extrair a letra e o número, incrementando o número em 1
        const letterPart = lastTerrNome.match(/[A-Za-z]+/)[0];
        const numberPart = parseInt(lastTerrNome.match(/\d+/)[0]) + 1;

        // Formatar o próximo código
        const newTerrNome = `${letterPart}${numberPart}`;
        setNextTerrNome(newTerrNome);
      } else {
        setNextTerrNome('A1'); // Valor inicial se não houver registros
      }
    } catch (error) {
      console.error("Erro ao buscar o último código de `terr_nome`: ", error);
      setNextTerrNome('A1'); // Valor padrão caso ocorra erro
    }
  };

  return (
    <Box className="main-container-user" sx={{ backgroundColor: darkMode ? '#202038' : '#f0f0f0', color: darkMode ? '#67e7eb' : '#333' }}>

      <Box
        sx={{
          color: darkMode ? '#67e7eb' : '#333333',
          alignItems: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          padding: '1px',
        }}
      >
        <Typography sx={{ fontSize: '0.8rem', marginLeft: '5px', marginTop: '10px' }}>Seus Mapas - Pregação: {totalMapas} </Typography>
      </Box>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography variant="body1" color="error" align="center">{error}</Typography>
      ) : (
        <Box className="card-container-user">
          {data.map((item, index) => (
            <Box key={index} className="card-box-user">
              <Card
                className="card-user"
                sx={{
                  backgroundColor: darkMode ? '#2c2c4e' : '#ffffff',
                  color: darkMode ? '#67e7eb' : '#333',
                  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-10px) scale(1.03)', // Efeito para navegadores desktop
                    boxShadow: '0px 8px 16px rgba(0,0,0,0.3)',
                  },
                  '&:active': {
                    transform: 'translateY(-10px) scale(1.03)', // Efeito para dispositivos móveis (toque)
                    boxShadow: '0px 8px 16px rgba(0,0,0,0.3)',
                  },
                }}
              > <CardContent>
                  <Typography variant="body1" className="status-text-user">
                    <div className="status-badge-user" style={{ backgroundColor: getStatusColorDesig(getStatusDesig(item.dsg_status)) }}>
                      {getStatusDesig(item.dsg_status)}
                    </div>
                  </Typography>
                  <Box
                    onClick={() => handleOpenVisitDialog(item)}

                    sx={{
                      display: 'flex',
                      cursor: 'pointer',
                      fontSize: '0.95rem',
                      marginLeft: '55px',
                      marginTop: '-4px',
                      color: darkMode ? '#ffffff' : '#2c2c4e',
                      '&:hover': {
                        color: darkMode ? '#67e7eb' : '#333333',
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    <FaFileSignature style={{ marginRight: '4px' }} />
                    Registro de Visita
                  </Box>
                  <Typography sx={{ fontSize: '0.8rem', marginLeft: '-10px', marginTop: '10px' }}>Responsável: {item.pub_nome}</Typography>
                  <Typography sx={{ fontSize: '0.8rem', marginLeft: '-10px', marginTop: '-2px' }}>Última visita: {item.dt_ultvisit}</Typography>
                  <Typography
                    variant="body1"
                    className="status-text-user"
                    sx={{ fontSize: '0.8rem', marginLeft: '-10px', marginTop: '-6px' }}
                  >
                    <div
                      className="status-badge-user-body"
                      style={{
                        backgroundColor: getStatusColorDsgTipo(getStatusDesigTipo(item.desg_tipogrupo)),
                      }}
                    >
                      {getStatusDesigTipo(item.desg_tipogrupo)}
                    </div>
                  </Typography>
                  <Typography sx={{ fontSize: '0.8rem', marginLeft: '-10px', marginTop: '8px' }}>Mapa: {item.dsg_mapa_cod}</Typography>
                  <Typography variant="body1" className="status-text-user" sx={{ fontSize: '0.8rem', marginLeft: '-10px', marginTop: '-2px' }} >
                    Local: {getStatusTpLocal(item.terr_tp_local)}
                  </Typography>
                  <Typography sx={{ fontSize: '0.8rem', marginLeft: '-10px', marginTop: '-2px' }}>Bairro: {item.terr_regiao} </Typography>
                  <Typography sx={{ fontSize: '0.8rem', marginLeft: '-10px', marginTop: '-2px' }}>Endereço: {item.terr_enderec}</Typography>

                  <Box
                    sx={{ display: 'flex', gap: 3, marginTop: '8px' }}
                  >
                    <Box
                      onClick={() => handleAbreMapa(item.terr_link)}
                      sx={{
                        display: 'flex',
                        cursor: 'pointer',
                        fontSize: '0.95rem',
                        marginLeft: '27px',
                        color: darkMode ? '#ffffff' : '#2c2c4e',
                        '&:hover': {
                          color: darkMode ? '#67e7eb' : '#333333',
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      <FaMapMarked style={{ marginRight: '4px' }} />
                      Abrir Mapa
                    </Box>
                    <Box
                      onClick={() => handleOpenDialog(item)}
                      sx={{
                        display: 'flex',
                        cursor: 'pointer',
                        fontSize: '0.90rem',
                        color: darkMode ? '#ffffff' : '#2c2c4e',
                        '&:hover': {
                          color: darkMode ? '#67e7eb' : '#333333',
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      <FaCheckCircle style={{ marginRight: '4px' }} />
                      {item.desg_tipogrupo === "MAP"? "Encerrar" : "Não Se Aplica"}
                    </Box>
                  </Box>
                </CardContent>
                <CardActions disableSpacing sx={{ marginTop: '-20px', marginRight: '230px' }}>
                  <ExpandMore
                    expand={expanded[item.desig_id]}
                    onClick={() => handleExpandClick(item.desig_id)}
                    aria-expanded={expanded[item.desig_id]}
                    aria-label="Mostrar mais"
                  >
                    <FaAngleDoubleDown />
                  </ExpandMore>
                </CardActions>
                <Collapse in={expanded[item.desig_id]} timeout="auto" unmountOnExit>
                  <CardContent>{/* o primeiro Typography sempre margem -20px os demais segue padrão */}

                    <Box
                      onClick={() => handleOpenTransfDialog(item)}
                      sx={{
                        display: 'flex',
                        cursor: 'pointer',
                        fontSize: '0.95rem',
                        marginLeft: '20px',
                        marginTop: '-15px',
                        marginBottom: '30px',
                        color: darkMode ? '#E9C2A6' : '#871F78',
                        '&:hover': {
                          color: darkMode ? '#67e7eb' : '#333333',
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      <FaExchangeAlt style={{ marginRight: '4px' }} />
                      Enviar Outro Responsável
                    </Box>

                    <Typography variant="body2" sx={{ fontSize: '0.85rem', marginTop: '-15px', backgroundColor: getColorMapCor(item.terr_cor), color: darkMode ? '#ffffff' : '#ffffff' }}>
                      Grau: {getStatusClassif(item.terr_classif) || 'Grau não informado'}
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.8rem', marginTop: '2px', color: darkMode ? '#67e7eb' : '#333' }}>
                      Observações: {item.terr_obs || 'Nenhuma observação disponível.'}
                    </Typography>

                    {/* Botão Registrar Publicações exibido apenas se dsg_tipo for "3" */}
                    {(item.desg_tipogrupo) === 'IND' && (
                      <Box
                        onClick={() => handleEndConfirmChange(item)}
                        sx={{
                          display: 'flex',
                          cursor: 'pointer',
                          fontSize: '0.95rem',
                          marginLeft: '36px',
                          marginTop: '12px',
                          color: darkMode ? '#7FFF00' : '#2c2c4e',
                          '&:hover': {
                            color: darkMode ? '#67e7eb' : '#333333',
                            textDecoration: 'underline',
                          },
                        }}
                      >
                        <FaCheckCircle style={{ marginRight: '4px' }} />
                        Confirmar Indicação
                      </Box>
                    )}

                    {/* Botão Registrar Publicações exibido apenas se dsg_tipo for "3" */}
                    {(item.desg_tipogrupo) === 'MAP' && (
                      <Box
                        onClick={() => handleOpenReservDialog(item)}
                        sx={{
                          display: 'flex',
                          cursor: 'pointer',
                          fontSize: '0.95rem',
                          marginLeft: '36px',
                          marginTop: '12px',
                          color: darkMode ? '#7FFF00' : '#2c2c4e',
                          '&:hover': {
                            color: darkMode ? '#67e7eb' : '#333333',
                            textDecoration: 'underline',
                          },
                        }}
                      >
                        <FaCheckCircle style={{ marginRight: '4px' }} />
                        Reservar Mapa
                      </Box>
                    )}

                  </CardContent>
                </Collapse>
              </Card>
            </Box>
          ))}
        </Box>
      )}

      <Dialog open={openTransfDialog} onClose={() => setOpenTransfDialog(false)}>
        <DialogTitle>Enviar Para Outro Responsável</DialogTitle>
        <DialogContent>
          <DialogContentText></DialogContentText>
          <Typography variant="body2">De Responsável: {selectedItem?.pub_nome}</Typography>
          <Typography variant="body2">Última Visita: {selectedItem?.dt_ultvisit}</Typography>
          <Typography variant="body2">Código do Mapa: {selectedItem?.dsg_mapa_cod}</Typography>
          <Typography variant="body2">Endereço: {selectedItem?.terr_enderec}</Typography>
          <FormControl fullWidth margin="dense">
            <InputLabel>Para o Responsável*</InputLabel>
            <Select
              labelId="publicadores-label"
              id="publicadores"
              value={formFields.pub_login || ''} // Valor atual do pub_login no formFields
              onChange={(e) => handleFieldChange('pub_login', e.target.value)} // Atualiza pub_login no formFields
            >
              {publicadores.map((publicador) => (
                <MenuItem key={publicador.id} value={publicador.pub_chave}>
                  {publicador.pub_nome} {/* Exibe o nome no dropdown */}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTransfDialog(false)} color="primary">Cancelar</Button>
          <Button onClick={handleDesignar} color="primary">Confirmar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openVisitDialog} onClose={() => setOpenVisitDialog(false)}>
        <DialogTitle>Registro de Visita</DialogTitle>
        <DialogContent>
          <DialogContentText></DialogContentText>
          <Typography variant="body2">Responsável: {selectedItem?.pub_nome}</Typography>
          <Typography variant="body2">Código do Mapa: {selectedItem?.dsg_mapa_cod}</Typography>
          <Typography variant="body2">Endereço: {selectedItem?.terr_enderec}</Typography>

          <FormControl fullWidth margin="dense"
            sx={{
              fontSize: '0.85rem',
              marginTop: '15px',
            }}>
            <InputLabel>Encontrou? *</InputLabel>
            <Select
              value={formFields.visit_status}
              onChange={(e) => handleFieldChange('visit_status', e.target.value)}
            >
              <MenuItem value="Sim">Sim</MenuItem>
              <MenuItem value="Não">Não</MenuItem>
              <MenuItem value="Carta">Carta</MenuItem>
              <MenuItem value="Família">Família</MenuItem>
              <MenuItem value="Outros">Outros</MenuItem>
            </Select>
          </FormControl>

          <TextField

            margin="dense"
            label="QTD Surdos *"
            type="number"
            fullWidth
            value={formFields.num_pessoas}
            onChange={(e) => handleFieldChange('num_pessoas', e.target.value)}
          />

          <FormControl fullWidth margin="dense">
            <InputLabel>Melhor dia *</InputLabel>
            <Select
              value={formFields.melhor_dia}
              onChange={(e) => handleFieldChange('melhor_dia', e.target.value)}
            >
              <MenuItem value="Livre">Livre</MenuItem>
              <MenuItem value="Segunda">Segunda</MenuItem>
              <MenuItem value="Terça">Terça</MenuItem>
              <MenuItem value="Quarta">Quarta</MenuItem>
              <MenuItem value="Quinta">Quinta</MenuItem>
              <MenuItem value="Sexta">Sexta</MenuItem>
              <MenuItem value="Sábado">Sábado</MenuItem>
              <MenuItem value="Domingo">Domingo</MenuItem>
              <MenuItem value="Sab-Dom">Sab-Dom</MenuItem>
              <MenuItem value="Feriados">Feriados</MenuItem>
            </Select>
          </FormControl>

          <TextField
            margin="dense"
            label="Melhor Hora"
            type="text"
            fullWidth
            value={formFields.melhor_hora}
            onChange={(e) => handleFieldChange('melhor_hora', e.target.value)}
          />

          <TextField
            margin="dense"
            label="Observação"
            type="text"
            fullWidth
            multiline
            rows={3}
            value={formFields.terr_obs}
            onChange={(e) => handleFieldChange('terr_obs', e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenVisitDialog(false)} color="primary">Cancelar</Button>
          <Button onClick={handleVisitSubmit} color="primary">Confirmar</Button>
        </DialogActions>
      </Dialog>

      {/* Caixa de diálogo de confirmação */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Confirmar Ação</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Deseja enviar as informações, encerrando e devolvendo a designação ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            Não
          </Button>
          <Button
            onClick={async () => {
              setOpenDialog(false);
              await handleEncerrar();
            }}
            color="primary"
            autoFocus
          >
            Sim
          </Button>
        </DialogActions>
      </Dialog>

      {/* Caixa de diálogo de Reservar Mapa  */}
      <Dialog open={openReservMapDialog} onClose={() => setOpenReservMapDialog(false)}>
        <DialogTitle>Reservar Mapa (Estudos e Revisitas)</DialogTitle>
        <DialogContent>
          <DialogContentText></DialogContentText>
          <Typography variant="body2">Responsável: {selectedItem?.pub_nome}</Typography>
          <Typography variant="body2">Última Visita: {selectedItem?.dt_ultvisit}</Typography>
          <Typography variant="body2">Código do Mapa: {selectedItem?.dsg_mapa_cod}</Typography>
          <Typography variant="body2">Endereço: {selectedItem?.terr_enderec}</Typography>
          <FormControl fullWidth margin="dense"
            sx={{
              fontSize: '0.85rem',
              marginTop: '15px',
            }}
          >
            <InputLabel>Tipo de Reserva? *</InputLabel>
            <Select
              value={formFields.terr_status}
              onChange={(e) => handleFieldChange('terr_status', e.target.value)}
            >
              <MenuItem value="1">Revisita</MenuItem>
              <MenuItem value="2">Estudo</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReservMapDialog(false)} color="primary">Cancelar</Button>
          <Button onClick={handleReservTerrit} color="primary">Confirmar</Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de Confirmação */}
      <Dialog
        open={openConfirmDialog}
        onClose={() => handleConfirmNewTerritor(false)}
      >
        <DialogTitle>Confirmar Ação</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Um novo registro de mapa será criado para este endereço confirmado. Deseja continuar?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleConfirmNewTerritor(false)} color="primary">
            Não
          </Button>
          <Button onClick={() => handleConfirmNewTerritor(true)} color="primary" autoFocus>
            Sim
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default FormUserView;
