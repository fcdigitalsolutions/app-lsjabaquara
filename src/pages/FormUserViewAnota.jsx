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
import {
  FaAngleDoubleDown,
  FaCommentDots,
  FaFileSignature,
  FaGrin,
  FaGrimace,
  FaSadTear,
  FaSadCry,
  FaTrashAlt,
} from 'react-icons/fa';
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

const FormUserViewAnota = () => {
  const [dataUAnota, setDataUAnota] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);
  const [openuAnotacDialogEdit, setOpenuAnotacDialogEdit] = useState(false);
  const [openuAnotacDialogNew, setOpenuAnotacDialogNew] = useState(false);
  const [openuAnotacDialogDelete, setOpenuAnotacDialogDelete] = useState(false);
  const [formFields, setFormFields] = useState({
    uanot_titul: '',
    uanot_legend: '',
    uanot_cor: '',
    uanot_mensag: '',
  });

  const userDados = JSON.parse(sessionStorage.getItem('userData'));
  const lginUser = userDados?.iduser;
  const totalMapas = new Set(dataUAnota.map(item => item.uanot_id)).size;

  const { darkMode } = useTheme();

  // Função para determinar o status com base no número de visitas
  const getStatusNotaCor = (uanot_cor) => {
    switch (uanot_cor) {
      case '0': return 'Tema Atual';
      case '1': return 'Azul';
      case '2': return 'Vermelho';
      case '3': return 'Verde';
      case '4': return 'Pink';
      case '5': return 'Spicy Pink';
      case '6': return 'Dark Orchid';
      case '7': return 'Chocolate';
      case '8': return 'Cinza';
      default: return 'Outros';
    }
  };

  // Função para determinar a cor de fundo da célula com base no status
  const getColorNotaCor = (status) => {
    switch (status) {
      case 'Tema Atual': return darkMode ? ' #2c2c4e' : ' #ffffff';
      case 'Azul': return ' #00009C';
      case 'Vermelho': return ' #FF0000';
      case 'Verde': return ' #238E23';
      case 'Pink': return ' #BC8F8F';
      case 'Spicy Pink': return ' #FF1CAE';
      case 'Dark Orchid': return ' #9932CD';
      case 'Chocolate': return ' #5C3317';
      case 'Cinza': return ' #A8A8A8';
      default: return 'transparent';
    }
  };


  // Função para determinar o status com base no número de visitas
  const getStatusNotaLeged = (uanot_legend) => {
    switch (uanot_legend) {
      case '0': return 'Normal';
      case '1': return 'Importante';
      case '2': return 'Urgente';
      case '3': return 'Alta Prioridade';
      default: return 'Outros';
    }
  };

  // Função para determinar a cor de fundo da célula com base no status
  const getEmotionrNotaLeged = (status) => {
    switch (status) {
      case 'Normal': return <FaGrin />;
      case 'Importante': return <FaGrimace />;
      case 'Urgente': return <FaSadTear />;
      case 'Alta Prioridade': return <FaSadCry />;
      default: return <FaGrin />;;
    }
  };

  useEffect(() => {
    setLoading(true);
    api_service.get(`/uanotpub/${lginUser}`)
      .then((response) => {
        setDataUAnota(response.data);
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

  const handleAnotacSubmit = async () => {
    const uAnotacDataNew = {
      data_inclu: new Date().toLocaleDateString("pt-BR"),
      uanot_pub: lginUser,
      uanot_titul: formFields.uanot_titul,
      uanot_legend: formFields.uanot_legend,
      uanot_cor: formFields.uanot_cor,
      uanot_mensag: formFields.uanot_mensag,
    };

    try {
      await api_service.post(`/uanotac`, uAnotacDataNew); // Insere a visita
      setOpenuAnotacDialogNew(false); // Fecha o modal de visita
    } catch (error) {
      console.error("Erro ao registrar visita e atualizar os dados: ", error);
    }
  };

  const handleAnotacUpdate = async () => {
    if (!selectedItem) return;
    const uAnotacDataEdit = {
      uanot_pub: selectedItem.uanot_pub,
      uanot_titul: formFields.uanot_titul,
      uanot_legend: formFields.uanot_legend,
      uanot_cor: formFields.uanot_cor,
      uanot_mensag: formFields.uanot_mensag,
    };

    try {
      await api_service.put(`/uanotac/${selectedItem.uanot_id}`, uAnotacDataEdit); // edita anotação
      // Atualiza os dados da anotação
      console.log("Registro alterado com sucesso.");

           // Atualiza o estado local para refletir as mudanças
           setDataUAnota((prevData) =>
            prevData.map((item) =>
              item.uanot_id === selectedItem.uanot_id
                ? { ...item, uanot_legend: selectedItem.uanot_legend, uanot_cor: selectedItem.uanot_cor }
                : item
            )
          );

      setOpenuAnotacDialogEdit(false); // Fecha o modal de visita
    } catch (error) {
      console.error("Erro ao atualizar os dados: ", error);
    }
  };

  const handleAnotacDelete = async () => {
    if (!selectedItem) return;
    const uAnotacDataDelete = {
      uanot_pub: selectedItem.uanot_pub,
      uanot_titul: formFields.uanot_titul,
      uanot_legend: formFields.uanot_legend,
      uanot_cor: formFields.uanot_cor,
      uanot_mensag: formFields.uanot_mensag,
    };

    try {
      await api_service.delete(`/uanotac/${selectedItem.uanot_id}`, uAnotacDataDelete); // edita anotação
      // Atualiza os dados da anotação
      console.log("Registro excluído com sucesso.");

           // Atualiza o estado local para refletir as mudanças
           setDataUAnota((prevData) =>
            prevData.map((item) =>
              item.uanot_id === selectedItem.uanot_id
                ? { ...item, uanot_legend: selectedItem.uanot_legend, uanot_cor: selectedItem.uanot_cor }
                : item
            )
          );

      setOpenuAnotacDialogDelete(false); // Fecha o modal de visita
    } catch (error) {
      console.error("Erro ao atualizar os dados: ", error);
    }
  };



  const handleOpenDialogNewAnot = () => {
    setFormFields({
      data_inclu: new Date().toLocaleDateString("pt-BR"),
      uanot_titul: '',
      uanot_legend: '',
      uanot_cor: '',
      uanot_mensag: '',
    });

    setOpenuAnotacDialogNew(true); // Abre o diálogo
  };


  const handleOpenDialogEditAnot = (item) => {
    setSelectedItem({
      ...item,
      uanot_id: item.uanot_id,
    });

    setFormFields({
      uanot_titul: item.uanot_titul || '',
      uanot_legend: item.uanot_legend || '',
      uanot_cor: item.uanot_cor || '',
      uanot_mensag: item.uanot_mensag || '',
    });

    setOpenuAnotacDialogEdit(true); // Abre o diálogo
  };

  const handleOpenDialogDeleteAnot = (item) => {
    setSelectedItem({
      ...item,
      uanot_id: item.uanot_id,
    });

    setFormFields({
      uanot_titul: item.uanot_titul || '',
      uanot_legend: item.uanot_legend || '',
      uanot_cor: item.uanot_cor || '',
      uanot_mensag: item.uanot_mensag || '',
    });

    setOpenuAnotacDialogDelete(true); // Abre o diálogo
  };


  const handleExpandClick = (id) => {
    setExpanded((prevExpanded) => ({ ...prevExpanded, [id]: !prevExpanded[id] }));
  };


  return (
    <Box className="main-container-user" sx={{ backgroundColor: darkMode ? '#202038' : '#f0f0f0', color: darkMode ? '#67e7eb' : '#333333' }}>
      <Box
        sx={{
          color: darkMode ? ' #67e7eb' : ' #333333',
          alignItems: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          padding: '1.8px',
        }}
      >
        <Box
          onClick={() => handleOpenDialogNewAnot(null)}
          sx={{
            display: 'flex',
            cursor: 'pointer',
            fontSize: '14px',
            marginLeft: '195px',
            marginTop: '5px',
            color: darkMode ? ' #ffffff' : '#00009C',
            '&:hover': {
              color: darkMode ? '#67e7eb' : '#7F00FF',
              textDecoration: 'underline',
            },
          }}
        >
          <FaCommentDots style={{ marginRight: '4px' }} />
          Nova Nota
        </Box>
        <Typography sx={{ fontSize: '0.8rem', marginLeft: '5px', marginTop: '10px' }}>
          Suas Anotações: {totalMapas}
        </Typography>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography variant="body1" color="error" align="center">{error}</Typography>
      ) : (
        <Box className="card-container-user-nota">
          {/* Removi um Box duplicado */}
          {dataUAnota.map((item, index) => {
            const statusnotacor = getStatusNotaCor(item.uanot_cor);
            const statusnotaLegend = getStatusNotaLeged(item.uanot_legend);

            return (
              <Box key={index} className="card-box-nota-user">
                <Card
                  className="card-user-nota"
                  sx={{
                    backgroundColor: getColorNotaCor(statusnotacor),
                    color: darkMode ? '#67e7eb' : '#333',
                    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-10px) scale(1.03)',
                      boxShadow: '0px 8px 16px rgba(0,0,0,0.3)',
                    },
                    '&:active': {
                      transform: 'translateY(-10px) scale(1.03)',
                      boxShadow: '0px 8px 16px rgba(0,0,0,0.3)',
                    },
                  }}
                >
                  <CardContent>
                    <Typography
                      sx={{
                        display: 'flex',
                        cursor: 'pointer',
                        fontSize: '35px',
                        marginLeft: '220px',
                        marginTop: '-5px',
                        marginBottom: '8px',
                        color: darkMode ? ' #D9D919' : ' #67e7eb',
                        '&:hover': {
                          color: darkMode ? ' #67e7eb' : ' #333333',
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      {getEmotionrNotaLeged(statusnotaLegend)}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '1.0rem',
                        marginLeft: '2px',
                        marginTop: '-10px',
                      }}
                    >
                    {item.uanot_titul}
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: '0.78rem',
                        marginLeft: '2px',
                        marginTop: '-3px',
                      }}
                    >
                      Data: {item.data_inclu}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '0.78rem',
                        marginLeft: '2px',
                        marginTop: '-3px',
                      }}
                    >
                      Prioridade: {getStatusNotaLeged(item.uanot_legend)}
                    </Typography>

                    <Box
                      onClick={() => handleOpenDialogEditAnot(item)}
                      sx={{
                        alignItems: 'center', 
                        display: 'flex',
                        flexDirection: 'column',
                        cursor: 'pointer',
                        fontSize: '0.80rem',
                        marginTop: '10px',
                        color: darkMode ? '#ffffff' : '#2c2c4e',
                        '&:hover': {
                          color: darkMode ? '#67e7eb' : '#333333',
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      <FaFileSignature style={{ marginRight: '4px' }} />
                      Editar Nota
                    </Box>
                  </CardContent>
                  <CardActions disableSpacing sx={{ marginTop: '-30px', marginRight: '230px' }}>
                    <ExpandMore
                      expand={expanded[item.uanot_id]}
                      onClick={() => handleExpandClick(item.uanot_id)}
                      aria-expanded={expanded[item.uanot_id]}
                      aria-label="Mostrar mais"
                    >
                      <FaAngleDoubleDown />
                    </ExpandMore>
                  </CardActions>
                  <Collapse in={expanded[item.uanot_id]} timeout="auto" unmountOnExit>
                    <CardContent>{/* o primeiro Typography sempre margem -20px os demais segue padrão */}
                      <Typography variant="body2" sx={{ fontSize: '0.8rem', marginTop: '-20px', color: darkMode ? '#67e7eb' : '#333' }}>
                        {item.uanot_mensag || 'Nenhuma nota disponível.'}
                      </Typography>
                      <Box
                      onClick={() => handleOpenDialogDeleteAnot(item)}
                      sx={{
                        alignItems: 'center', 
                        display: 'flex',
                        flexDirection: 'column',
                        cursor: 'pointer',
                        fontSize: '0.80rem',
                        marginTop: '20px',
                        color: darkMode ? '#ffffff' : '#2c2c4e',
                        '&:hover': {
                          color: darkMode ? '#67e7eb' : '#333333',
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      <FaTrashAlt style={{ marginRight: '4px' }} />
                      Excluir Nota
                    </Box>
                    </CardContent>
                  </Collapse>
                </Card>
              </Box>
            );
          })}
        </Box>
      )}

      <Dialog open={openuAnotacDialogEdit} onClose={() => setOpenuAnotacDialogEdit(false)}>
        <DialogTitle>Título: {selectedItem?.uanot_titul}</DialogTitle>
        <DialogContent>
          <DialogContentText></DialogContentText>
          <TextField
            margin="dense"
            label="Alterar Título *"
            type="text"
            fullWidth
            value={formFields.uanot_titul}
            onChange={(e) => handleFieldChange('uanot_titul', e.target.value)}
          />

          <FormControl fullWidth margin="dense">
            <InputLabel>Cor do Cartão *</InputLabel>
            <Select
              value={formFields.uanot_cor}
              onChange={(e) => handleFieldChange('uanot_cor', e.target.value)}
            >
              <MenuItem value="0">Tema Atual</MenuItem>
              <MenuItem value="1">Azul</MenuItem>
              <MenuItem value="2">Vermelho</MenuItem>
              <MenuItem value="3">Verde</MenuItem>
              <MenuItem value="4">Pink</MenuItem>
              <MenuItem value="5">Spicy Pink</MenuItem>
              <MenuItem value="6">Dark Orchid</MenuItem>
              <MenuItem value="7">Chocolate</MenuItem>
              <MenuItem value="8">Cinza</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth margin="dense">
            <InputLabel>Legenda *</InputLabel>
            <Select
              value={formFields.uanot_legend}
              onChange={(e) => handleFieldChange('uanot_legend', e.target.value)}
            >
              <MenuItem value="0">Normal</MenuItem>
              <MenuItem value="1">Importante</MenuItem>
              <MenuItem value="2">Urgente</MenuItem>
              <MenuItem value="3">Alta Prioridade</MenuItem>
            </Select>
          </FormControl>

          <TextField
            margin="dense"
            label="Anotação"
            type="text"
            fullWidth
            multiline
            rows={8}
            value={formFields.uanot_mensag}
            onChange={(e) => handleFieldChange('uanot_mensag', e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenuAnotacDialogEdit(false)} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleAnotacUpdate} color="primary">
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openuAnotacDialogNew} onClose={() => setOpenuAnotacDialogNew(false)}>

        <DialogContent>
          <DialogContentText></DialogContentText>
          <TextField
            margin="dense"
            label="Título da Anotação*"
            type="text"
            fullWidth
            value={formFields.uanot_titul}
            onChange={(e) => handleFieldChange('uanot_titul', e.target.value)}
          />

          <FormControl fullWidth margin="dense">
            <InputLabel>Cor do Cartão *</InputLabel>
            <Select
              value={formFields.uanot_cor}
              onChange={(e) => handleFieldChange('uanot_cor', e.target.value)}
            >
              <MenuItem value="0">Tema Atual</MenuItem>
              <MenuItem value="1">Azul</MenuItem>
              <MenuItem value="2">Vermelho</MenuItem>
              <MenuItem value="3">Verde</MenuItem>
              <MenuItem value="4">Rosa</MenuItem>
              <MenuItem value="5">Spicy Pink</MenuItem>
              <MenuItem value="6">Dark Orchid</MenuItem>
              <MenuItem value="7">Chocolate</MenuItem>
              <MenuItem value="8">Cinza</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth margin="dense">
            <InputLabel>Legenda *</InputLabel>
            <Select
              value={formFields.uanot_legend}
              onChange={(e) => handleFieldChange('uanot_legend', e.target.value)}
            >
              <MenuItem value="0">Normal</MenuItem>
              <MenuItem value="1">Importante</MenuItem>
              <MenuItem value="2">Urgente</MenuItem>
              <MenuItem value="3">Alta Prioridade</MenuItem>
            </Select>
          </FormControl>

          <TextField
            margin="dense"
            label="Anotação"
            type="text"
            fullWidth
            multiline
            rows={8}
            value={formFields.uanot_mensag}
            onChange={(e) => handleFieldChange('uanot_mensag', e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenuAnotacDialogNew(false)} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleAnotacSubmit} color="primary">
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Caixa de diálogo de confirmação */}
            <Dialog
              open={openuAnotacDialogDelete}
              onClose={() => setOpenuAnotacDialogDelete(false)}
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description"
            >
              <DialogTitle id="alert-dialog-title">Confirmar Ação</DialogTitle>
              <DialogContent>
                <DialogContentText id="alert-dialog-description">
                  Deseja excluir as informações da sua anotação ?
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenuAnotacDialogDelete(false)} color="primary">
                  Não
                </Button>
                <Button
                  onClick={async () => {
                    setOpenuAnotacDialogDelete(false);
                    await handleAnotacDelete();
                  }}
                  color="primary"
                  autoFocus
                >
                  Sim
                </Button>
              </DialogActions>
            </Dialog>

    </Box>
  );
};

export default FormUserViewAnota;
