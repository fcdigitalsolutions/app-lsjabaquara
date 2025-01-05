import React, { useState, useEffect } from 'react';
import api_service from '../services/api_service';
import {
  Button,
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
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
import { FaAngleDoubleDown, FaCheckCircle, FaMapMarked } from 'react-icons/fa';
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

const FormUserViewOutras = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState({});

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [selectedItemId, setSelectedItemId] = useState(null);
  const [openRegPublicDialog, setOpenRegPublicDialog] = useState(false);
  const [formFields, setFormFields] = useState({
    visit_status: '',
    num_pessoas: '',
    melhor_dia: '',
    melhor_hora: '',
    terr_obs: ''
  });

  const userDados = JSON.parse(sessionStorage.getItem('userData'));
  const lginUser = userDados?.iduser;
  const totalCards = new Set(data.map(item => item.desig_id)).size;

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
  const getStatusDesigTipo = (dsg_tipo) => {
    switch (dsg_tipo) {
      case '0': return 'Mapa';
      case '1': return 'Indicação';
      case '2': return 'Dirigente Campo';
      case '3': return 'Carrinho';
      case '4': return 'Mídias / Zoom';
      case '5': return 'Câmera';
      case '6': return 'Indicador';
      case '7': return 'Reunião RMWB';
      case '8': return 'Reunião FDS';
      case '9': return 'Discurso Publico';
      default: return 'Outros';
    }
  };

  const getStatusColorDsgTipo = (status) => {
    switch (status) {
      case 'Mapa': return '#2F4F2F';
      case 'Indicação': return '#CC0000';
      case 'Dirigente Campo': return '#42426F';
      case 'Carrinho': return '#93DB70';
      case 'Mídias / Zoom': return '#191970';
      case 'Câmera': return '#000000';
      case 'Indicador': return '#800000';
      case 'Reunião RMWB': return '#000000';
      case 'Reunião FDS': return '#000000';
      case 'Discurso Publico': return '#000000';
      default: return 'transparent';
    }
  };

  useEffect(() => {
    api_service.get(`/desigoutras/${lginUser}`)
      .then((response) => {
        setData(response.data);
        setError(null);
      })
      .catch((error) => {
        console.error("Erro ao buscar os dados: ", error);
        setError('Erro ao carregar as designações. Tente novamente mais tarde.');
      })
  }, [lginUser]);

  const handleOpenRegPublicDialog = (item) => {
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

    setOpenRegPublicDialog(true); // Abre o diálogo
  };


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

    try {
      // Atualiza o status da designação
      await api_service.put(`/desig/${selectedItem.desig_id}`, updatedDesignacao);
      console.log("Designação encerrada com sucesso.");

      // Atualiza o estado local para refletir as mudanças
      setData((prevData) =>
        prevData.map((item) =>
          item.desig_id === selectedItem.desig_id
            ? { ...item, dsg_status: '4' }
            : item
        )
      );

      setSelectedItem(null);
      setSelectedItemId(null);
    } catch (error) {
      console.error("Erro ao encerrar a designação ou liberar o território: ", error);
    }
  };

  const handleRegPublicSubmit = async () => {
    if (!selectedItem || !selectedItem.desig_id) {
      return;
    }

    // Atualiza os dados de Publicações
    const updatedRegPublic = {
      data_inclu: new Date().toLocaleDateString("pt-BR"), // Data da última visita
      rgp_data: new Date().toLocaleDateString("pt-BR"), // Data da última visita
      rgp_pub: selectedItem.pub_login, // Publicador responsável pela última visita
      rgp_diadasem: selectedItem.dsg_mapa_cod,
      rgp_local: selectedItem.cmp_local,
      rgp_url: selectedItem.cmp_url,
      rgp_tipoativ: selectedItem.cmp_tipoativ,
      rgp_publicac: formFields.rgp_publicac,
      rgp_qtd: formFields.rgp_qtd,
      rgp_detalhes: formFields.rgp_detalhes,
    };


    // Atualiza os DAdos
    try {
      await api_service.post(`/rgpublic`, updatedRegPublic); // Insere a visita
      setOpenRegPublicDialog(false);


      console.log("Dados atualizados com sucesso.");
    } catch (error) {
      console.error("Erro ao atualizar os dados:", error);
    }

    setOpenRegPublicDialog(false); // Fecha o diálogo
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
        <Typography sx={{ fontSize: '0.8rem', marginLeft: '5px', marginTop: '10px' }}>Suas Atividades Pendentes: {totalCards} {error} </Typography>
      </Box>
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
              onClick={() => console.log("Card clicado!")} // Ação do toque
            >
              <CardContent>
                <Typography variant="body1" className="status-text-user">
                  <div
                    className="status-badge-user"
                    style={{
                      backgroundColor: getStatusColorDesig(getStatusDesig(item.dsg_status)),
                    }}
                  >
                    {getStatusDesig(item.dsg_status)}
                  </div>
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', marginLeft: '-10px', marginTop: '-5px' }}>
                  Responsável: {item.pub_nome}
                </Typography>

                {/* Botão Registrar Publicações exibido apenas se dsg_tipo for "3" */}
                {(item.dsg_tipo) === '3' && (
                  <Box>
                    <Typography sx={{ fontSize: '0.8rem', marginLeft: '-10px', marginTop: '-2px' }}>
                      Resp. 02: {item.cmp_publicador02}
                    </Typography>
                    <Typography sx={{ fontSize: '0.8rem', marginLeft: '-10px', marginTop: '-2px' }}>
                      Resp. 03: {item.cmp_publicador03}
                    </Typography>
                    <Typography sx={{ fontSize: '0.8rem', marginLeft: '-10px', marginTop: '-2px' }}>
                      Resp. 04: {item.cmp_publicador04}
                    </Typography>

                  </Box>
                )}

                <Typography
                  variant="body1"
                  className="status-text-user"
                  sx={{ fontSize: '0.8rem', marginLeft: '-10px', marginTop: '-2px' }}
                >
                  <div
                    className="status-badge-user-body"
                    style={{
                      backgroundColor: getStatusColorDsgTipo(getStatusDesigTipo(item.dsg_tipo)),
                    }}
                  >
                    {getStatusDesigTipo(item.dsg_tipo)}
                  </div>
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', marginLeft: '-10px', marginTop: '10px' }}>
                  Será Realizada: {item.dsg_data}
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', marginLeft: '-10px', marginTop: '-2px' }}>
                  Dia: {item.dsg_mapa_cod}
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', marginLeft: '-10px', marginTop: '-2px' }}>
                  Horário: {item.cmp_horaini}
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', marginLeft: '-10px', marginTop: '-2px' }}>
                  Local: {item.cmp_local}
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', marginLeft: '-10px', marginTop: '-2px' }}>
                  Endereço: {item.cmp_enderec}
                </Typography>

                <Box sx={{ display: 'flex', gap: 3, marginTop: '8px' }}>
                  <Box
                    onClick={() => handleAbreMapa(item.cmp_url)}
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
                      fontSize: '0.95rem',
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
              <CardActions
                disableSpacing
                sx={{ marginTop: '-20px', marginRight: '230px' }}
              >
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
                <CardContent>
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: '0.8rem',
                      marginTop: '2px',
                      color: darkMode ? '#67e7eb' : '#333',
                    }}
                  >
                    Observações: {item.dsg_obs || 'Nenhuma observação disponível.'}
                  </Typography>

                  {/* Botão Registrar Publicações exibido apenas se dsg_tipo for "3" */}
                  {(item.dsg_tipo) === '3' && (
                    <Box
                      onClick={() => handleOpenRegPublicDialog(item)}
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
                      Registrar Publicações
                    </Box>
                  )}
                </CardContent>
              </Collapse>

            </Card>
          </Box>
        ))}
      </Box>


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

      {/* Caixa de diálogo de Apontar Publicações  */}
      <Dialog open={openRegPublicDialog} onClose={() => setOpenRegPublicDialog(false)}>
        <DialogTitle>Registrar Publicações (Carrinho)</DialogTitle>
        <DialogContent>
          <DialogContentText></DialogContentText>
          <Typography variant="body2">Responsável: {selectedItem?.pub_nome}</Typography>
          <Typography variant="body2">Data: {selectedItem?.dsg_data}</Typography>
          <Typography variant="body2">Dia: {selectedItem?.dsg_mapa_cod}</Typography>
          <Typography variant="body2">Endereço: {selectedItem?.cmp_enderec}</Typography>
          <FormControl fullWidth margin="dense"
            sx={{
              fontSize: '0.85rem',
              marginTop: '15px',
            }}
          >
            <InputLabel>Tipo de Publicação? *</InputLabel>
            <Select
              value={formFields.rgp_publicac}
              onChange={(e) => handleFieldChange('rgp_publicac', e.target.value)}
            >
              <MenuItem value="1">Folheto</MenuItem>
              <MenuItem value="2">Revista</MenuItem>
              <MenuItem value="3">Brochura</MenuItem>
              <MenuItem value="4">Livro</MenuItem>
              <MenuItem value="5">Bíblia</MenuItem>
              <MenuItem value="6">CD/DVD</MenuItem>
              <MenuItem value="7">Volte p/ Jeová</MenuItem>
            </Select>
            <TextField

              margin="dense"
              label="Quantidade? *"
              type="number"
              fullWidth
              value={formFields.rgp_qtd}
              onChange={(e) => handleFieldChange('rgp_qtd', e.target.value)}
            />
            <TextField
              margin="dense"
              label="Detalhes? "
              type="text"
              fullWidth
              multiline
              rows={3}
              value={formFields.rgp_detalhes}
              onChange={(e) => handleFieldChange('rgp_detalhes', e.target.value)}
            />
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRegPublicDialog(false)} color="primary">Cancelar</Button>
          <Button onClick={handleRegPublicSubmit} color="primary">Confirmar</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default FormUserViewOutras;
