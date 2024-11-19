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
import { FaAngleDoubleDown, FaMoon, FaSun, FaCheckCircle, FaMapMarked, FaFileSignature } from 'react-icons/fa';
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
  const [selectedItem, setSelectedItem] = useState(null);

  const [selectedItemId, setSelectedItemId] = useState(null);
  const [openVisitDialog, setOpenVisitDialog] = useState(false);
  const [openReservMapDialog, setOpenReservMapDialog] = useState(false);
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

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const getStatusDesig = (dsg_status) => {
    switch (dsg_status) {
      case '0': return 'NÃO DESIGNADA';
      case '1': return 'PENDENTE';
      case '2': return 'JÁ VISITEI';
      case '3': return 'VENCIDA';
      case '4': return 'ENCERRADA';
      default: return 'Outros';
    }
  };

  const getStatusColorDesig = (status) => {
    switch (status) {
      case 'NÃO DESIGNADA': return darkMode ? '#666666' : '#666666';
      case 'PENDENTE': return darkMode ? '#CC0000' : '#CC0000';
      case 'JÁ VISITEI': return darkMode ? '#00009C' : '#00009C';
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


  return (
    <Box className="main-container-user" sx={{ backgroundColor: darkMode ? '#202038' : '#f0f0f0', color: darkMode ? '#67e7eb' : '#333' }}>
      <Button onClick={toggleTheme} sx={{ margin: '2px', fontSize: '12px' }} startIcon={darkMode ? <FaSun /> : <FaMoon />}>
        {darkMode ? 'Modo Claro' : 'Modo Escuro'}
      </Button>
      <Box
        sx={{
          display: 'flex',
          fontSize: '0.85rem',
          marginLeft: '110px',
          marginTop: '-5px',
          marginBottom: '5px',
          color: darkMode ? '#ffffff' : '#2c2c4e',
          '&:hover': {
            color: darkMode ? '#67e7eb' : '#333333',
          },
        }}
      >
        Total de Mapas: {totalMapas}

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
                  <Typography sx={{ fontSize: '0.8rem', marginLeft: '-10px', marginTop: '-2px' }}>Cód. Mapa: {item.dsg_mapa_cod}</Typography>
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
                <CardActions disableSpacing sx={{ marginTop: '-20px', marginRight: '230px' }}>
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
                  <CardContent>{/* o primeiro Typography sempre margem -20px os demais segue padrão */}
                    <Typography variant="body2" sx={{ fontSize: '0.85rem', marginTop: '-15px', backgroundColor: getColorMapCor(item.terr_cor), color: darkMode ? '#ffffff' : '#ffffff' }}>
                      Grau: {getStatusClassif(item.terr_classif) || 'Grau não informado'}
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.8rem', marginTop: '2px', color: darkMode ? '#67e7eb' : '#333' }}>
                      Observações: {item.terr_obs || 'Nenhuma observação disponível.'}
                    </Typography>
                    <Box
                      onClick={() => handleOpenReservDialog(item)}
                      sx={{
                        display: 'flex',
                        cursor: 'pointer',
                        fontSize: '0.95rem',
                        marginLeft: '55px',
                        marginTop: '10px',
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
                  </CardContent>
                </Collapse>
              </Card>
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


    </Box>
  );
};

export default FormUserView;
