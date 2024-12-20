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
import { FaAngleDoubleDown, FaCheckCircle, FaMapMarked, FaFileSignature } from 'react-icons/fa';
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

const FormUserViewHoras = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [openVisitDialog, setOpenVisitDialog] = useState(false);
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
      case '0': return 'NÃO DESIGNADA';
      case '1': return 'PENDENTE';
      case '2': return 'VISITANDO';
      case '3': return 'VENCIDA';
      case '4': return 'ENCERRADA';
      default: return 'Outros';
    }
  };

  const getStatusColorDesig = (status) => {
    switch (status) {
      case 'NÃO DESIGNADA': return darkMode ? '#666666' : '#666666';
      case 'PENDENTE': return darkMode ? '#CC0000' : '#CC0000';
      case 'VISITANDO': return darkMode ? '#00009C' : '#00009C';
      case 'VENCIDA': return darkMode ? '#5C4033' : '#5C4033';
      case 'ENCERRADA': return darkMode ? '#000000' : '#000000';
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
    api_service.get(`/desigensin/${lginUser}`)
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



  const handleFieldChange = (field, value) => {
    setFormFields((prevState) => ({ ...prevState, [field]: value }));
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

    try {
      // Atualiza o status da designação
      await api_service.put(`/desig/${selectedItem.desig_id}`, updatedDesignacao);
      console.log("Designação encerrada com sucesso.");

      // Atualiza o status do território
      await api_service.put(`/terrupdesp/${selectedItem.territor_id}`, updatedTerritorio);
      console.log("Território liberado com sucesso.");

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
    if (!selectedItem || !selectedItem.id) {
      return;
    }

    // Atualiza o status da designação
    const updatedData = {
      ...selectedItem,
      dsg_status: '2', // Atualiza o status para "Já Visitei"
    };

    try {
      // Faz a requisição PUT para atualizar a designação
      await api_service.put(`/desig/${selectedItem.id}`, updatedData);

      // Atualiza o estado local para refletir a mudança
      setData((prevData) =>
        prevData.map((item) =>
          item.id === selectedItem.id ? { ...item, dsg_status: '2' } : item
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
    } catch (error) {
      console.error("Erro ao registrar visita e atualizar os dados: ", error);
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
        <Typography sx={{ fontSize: '0.8rem', marginLeft: '5px', marginTop: '10px' }}>Seus Apontamentos de Horas: {totalMapas} </Typography>
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

            </Box>
          ))}
        </Box>
      )}

      <Dialog open={openVisitDialog} onClose={() => setOpenVisitDialog(false)}>
        <DialogTitle>Registro de Visita</DialogTitle>
        <DialogContent>
          <DialogContentText></DialogContentText>
          <Typography variant="body2">Responsável: {selectedItem?.pub_nome}</Typography>
          <Typography variant="body2">Código do Mapa: {selectedItem?.dsg_mapa_cod}</Typography>
          <Typography variant="body2">Endereço: {selectedItem?.terr_enderec}</Typography>

          <FormControl fullWidth margin="dense">
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
          <Button onClick={handleEncerrar} color="primary" autoFocus>
            Sim
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default FormUserViewHoras;
