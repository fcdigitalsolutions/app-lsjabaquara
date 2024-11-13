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
import { FaAngleDoubleDown, FaMoon, FaSun, FaCheckCircle,FaMapMarked,FaFileSignature } from 'react-icons/fa';
import { styled } from '@mui/material/styles';

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
  const [darkMode, setDarkMode] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [openVisitDialog, setOpenVisitDialog] = useState(false);
  const [formFields, setFormFields] = useState({
    visit_status: 'Família',
    num_pessoas: '',
    melhor_dia: '',
    melhor_hora: '',
    terr_obs: ''
  });

  const userDados = JSON.parse(sessionStorage.getItem('userData'));
  const lginUser = userDados?.iduser;

  const handleExpandClick = (id) => {
    setExpanded((prevExpanded) => ({ ...prevExpanded, [id]: !prevExpanded[id] }));
  };

  const handleAbreMapa = (row) => {
    window.open(row, '_blank');
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const getStatusTipo = (dsg_tipo) => {
    switch (dsg_tipo) {
      case '0': return 'Mapa';
      case '1': return 'Indicação';
      case '2': return 'Dirigente Campo';
      case '3': return 'Carrinho';
      case '4': return 'Mecanicas';
      case '5': return 'Reunião RMWB';
      case '6': return 'Reunião FDS';
      case '7': return 'Discurso Publico';
      default: return 'Outros';
    }
  };

  const getStatusColorTipo = (status) => {
    switch (status) {
      case 'Mapa': return darkMode ? '#2c2c4e' : '#ffffff';
      case 'Indicação': return darkMode ? '#2c2c4e' : '#ffffff';
      case 'Dirigente Campo': return darkMode ? '#2c2c4e' : '#ffffff';
      case 'Carrinho': return darkMode ? '#2c2c4e' : '#ffffff';
      case 'Mecanicas': return darkMode ? '#2c2c4e' : '#ffffff';
      case 'Reunião RMWB': return darkMode ? '#2c2c4e' : '#ffffff';
      case 'Reunião FDS': return darkMode ? '#2c2c4e' : '#ffffff';
      case 'Discurso Publico': return darkMode ? '#2c2c4e' : '#ffffff';
      default: return 'transparent';
    }
  };

  const getStatusDesig = (dsg_status) => {
    switch (dsg_status) {
      case '0': return 'Não Designada';
      case '1': return 'Pendente';
      case '2': return 'Realizada';
      case '3': return 'Vencida';
      case '4': return 'Encerrada';
      default: return 'Outros';
    }
  };

  const getStatusColorDesig = (status) => {
    switch (status) {
      case 'Não Designada': return darkMode ? '#D8BFD8' : '#D8BFD8';
      case 'Pendente': return darkMode ? '#CC0000' : '#CC0000';
      case 'Realizada': return darkMode ? '#00009C' : '#00009C';
      case 'Vencida': return darkMode ? '#5C4033' : '#5C4033';
      case 'Encerrada': return darkMode ? '#000000' : '#000000';
      default: return 'transparent';
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
    setSelectedItem(item);
    setFormFields({
      visit_status: 'Família',
      num_pessoas: 1,
      melhor_dia: 'Sábado',
      melhor_hora: '',
      terr_obs: ''
    });
    setOpenVisitDialog(true);
  };

  const handleFieldChange = (field, value) => {
    setFormFields(prevState => ({ ...prevState, [field]: value }));
  };

  const handleOpenDialog = (id) => {
    setSelectedItemId(id);
    setOpenDialog(true);
  };

  const handleEncerrar = async () => {
    setOpenDialog(false);
    if (!selectedItemId) return;
    const itemToUpdate = data.find((item) => item.id === selectedItemId);
    if (!itemToUpdate) return;
    const updatedData = {
      ...itemToUpdate,
      dsg_status: '4',
    };
    try {
      await api_service.put(`/desig/${selectedItemId}`, updatedData);
      setData(data.map((item) =>
        item.id === selectedItemId ? { ...item, dsg_status: '4' } : item
      ));
      setSelectedItemId(null);
    } catch (error) {
      console.error("Erro ao encerrar a designação: ", error);
    }
  };

  const handleRealizar = async () => {
    if (!selectedItem) return;
    const updatedData = {
      ...selectedItem,
      dsg_status: '2',
    };
    try {
      await api_service.put(`/desig/${selectedItem.id}`, updatedData);
      setData(data.map((item) =>
        item.id === selectedItem.id ? { ...item, dsg_status: '2' } : item
      ));
    } catch (error) {
      console.error("Erro ao realizar a designação: ", error);
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
      visit_url: selectedItem.dsg_mapa_url,
      visit_ender: selectedItem.dsg_mapa_end,
      visit_status: formFields.visit_status,
      num_pessoas: formFields.num_pessoas,
      melhor_dia: formFields.melhor_dia,
      melhor_hora: formFields.melhor_hora,
      terr_obs: formFields.terr_obs,
    };

    try {
      await api_service.post(`/rvisitas`, visitData);
      await handleRealizar();  // Chama handleRealizar ao enviar o relatório
      setOpenVisitDialog(false);
    } catch (error) {
      console.error("Erro ao registrar visita: ", error);
    }
  };

  return (
    <Box className="main-container-user" sx={{ backgroundColor: darkMode ? '#202038' : '#f0f0f0', color: darkMode ? '#67e7eb' : '#333' }}>
      <Button onClick={toggleTheme} sx={{ margin: '2px', fontSize: '12px' }} startIcon={darkMode ? <FaSun /> : <FaMoon />}>
        {darkMode ? 'Modo Claro' : 'Modo Escuro'}
      </Button>
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
              <Card className="card-user" sx={{ backgroundColor: darkMode ? '#2c2c4e' : '#ffffff', color: darkMode ? '#67e7eb' : '#333' }}>
                <CardContent>
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
                        fontSize: '0.8rem',
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
                      Apontar Visita
                    </Box>
                  <Typography sx={{ fontSize: '0.7rem', marginLeft: '-30px', marginTop: '10px' }}>Responsável: {item.pub_nome}</Typography>
                  <Typography sx={{ fontSize: '0.7rem', marginLeft: '-30px', marginTop: '-2px' }}>Data: {item.dsg_data}</Typography>

                  <Typography sx={{ fontSize: '0.7rem', marginLeft: '-30px', marginTop: '-2px' }}>
                    <div style={{ backgroundColor: getStatusColorTipo(getStatusTipo(item.dsg_tipo)) }}>
                      Tipo: {getStatusTipo(item.dsg_tipo)}
                    </div>
                  </Typography>
                 
                  <Typography sx={{ fontSize: '0.7rem', marginLeft: '-30px', marginTop: '-2px' }}>Local: {item.dsg_detalhes}</Typography>
                  <Typography sx={{ fontSize: '0.7rem', marginLeft: '-30px', marginTop: '-2px' }}>Mapa: {item.dsg_mapa_cod}</Typography>
                  <Typography sx={{ fontSize: '0.7rem', marginLeft: '-30px', marginTop: '-2px' }}>Endereço: {item.dsg_mapa_end}</Typography>
                  <Box
                    className="div-map-user"
                    sx={{ display: 'flex', gap: 6, marginTop: '4px' }}
                  >
                    <Box
                      onClick={() => handleAbreMapa(item.dsg_mapa_url)}
                      sx={{
                        display: 'flex',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        marginLeft: '-20px',
                        color: darkMode ? '#ffffff' : '#2c2c4e',
                        '&:hover': {
                          color: darkMode ? '#67e7eb' : '#333333',
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      <FaMapMarked style={{ marginRight: '4px' }} />
                      Mapa
                    </Box>
                    <Box
                      onClick={() => handleOpenDialog(item.id)}
                      sx={{
                        display: 'flex',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        color: darkMode ? '#ffffff' : '#2c2c4e',
                        '&:hover': {
                          color: darkMode ? '#67e7eb' : '#333333',
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      <FaCheckCircle style={{ marginRight: '4px' }} />
                      Encerrar
                    </Box>
                   
                  </Box>
                </CardContent>
                <CardActions disableSpacing sx={{ marginTop: '-25px' }}>
                  <ExpandMore
                    expand={expanded[item.id]}
                    onClick={() => handleExpandClick(item.id)}
                    aria-expanded={expanded[item.id]}
                    aria-label="Mostrar mais"
                  >
                    <FaAngleDoubleDown />
                  </ExpandMore>
                </CardActions>
                <Collapse in={expanded[item.id]} timeout="auto" unmountOnExit>
                  <CardContent>
                    <Typography variant="body2" sx={{ fontSize: '0.60rem', marginTop: '2px', color: darkMode ? '#67e7eb' : '#333' }}>
                      Observações: {item.dsg_obs || 'Nenhuma observação disponível.'}
                    </Typography>
                  </CardContent>
                </Collapse>
              </Card>
            </Box>
          ))}
        </Box>
      )}

      {/* Modal de Visita */}
      <Dialog open={openVisitDialog} onClose={() => setOpenVisitDialog(false)}>
        <DialogTitle>Registro de Visita</DialogTitle>
        <DialogContent>
          <DialogContentText></DialogContentText>
          <Typography variant="body2">Responsável: {selectedItem?.pub_nome}</Typography>
          <Typography variant="body2">Código do Mapa: {selectedItem?.dsg_mapa_cod}</Typography>
          <Typography variant="body2">Endereço: {selectedItem?.dsg_mapa_end}</Typography>
          <FormControl fullWidth margin="dense">
            <InputLabel>Status da Visita *</InputLabel>
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
            label="Número de Pessoas *"
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

export default FormUserView;
