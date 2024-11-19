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
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import { FaAngleDoubleDown, FaMoon, FaSun, FaMapMarked, FaFileSignature } from 'react-icons/fa';
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

const FormUserEnsino = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [darkMode, setDarkMode] = useState(true);
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
  const [publicadores, setPublicadores] = useState([]); // Estado para armazenar as opções de Publicadores

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
      case '1': return 'DESIGNADA';
      case '2': return 'JÁ VISITEI';
      case '3': return 'VENCIDA';
      case '4': return 'ENCERRADA';
      default: return 'Outros';
    }
  };

  const getStatusColorDesig = (status) => {
    switch (status) {
      case 'NÃO DESIGNADA': return darkMode ? '#666666' : '#666666';
      case 'DESIGNADA': return darkMode ? '#00009C' : '#00009C';
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
    api_service.get(`/desigpend/${lginUser}`)
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


  // Função para buscar os dados da API
  useEffect(() => {
    const fetchPublicadores = async () => {
      try {
        const response = await api_service.get('/pubcall'); // rota da API
        setPublicadores(response.data); // a API retorna um array de dados
      } catch (error) {
        console.error('Erro ao carregar os dados:', error);
      }
    };

    fetchPublicadores(); // Chama a função para carregar os dados
  }, []);

  useEffect(() => {
    const fetchPublicadores = async () => {
      try {
        const response = await api_service.get('/pubcall');
        setPublicadores(response.data);
      } catch (error) {
        console.error('Erro ao carregar publicadores:', error);
      }
    };

    fetchPublicadores();
  }, []);


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

  const handleFieldChange = (field, value) => {
    if (field === 'pub_login') {
      const selectedPublicador = publicadores.find(p => p.pub_login === value);
      setFormFields((prevState) => ({
        ...prevState,
        pub_login: value, // Define o pub_login selecionado
        pub_nome: selectedPublicador?.pub_nome || '', // Define o pub_nome correspondente
      }));
    } else {
      setFormFields((prevState) => ({ ...prevState, [field]: value }));
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
      pub_nome: publicadores.find(p => p.pub_login === formFields.pub_login)?.pub_nome || '', // Nome do publicador correspondente
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

      setOpenVisitDialog(false); // Fecha o diálogo
      console.log("Designação atualizada com sucesso.");
      //Alert("Designação atualizada com sucesso.");
    } catch (error) {
      console.error("Erro ao designar a designação: ", error);
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
      {loading ?
        (
          <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
            <CircularProgress /> </Box>) : error ? (<Typography variant="body1" color="error" align="center">{error}</Typography>)
          : (

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
                        Designar/Transferir
                      </Box>
                      <Typography sx={{ fontSize: '0.8rem', marginLeft: '-10px', marginTop: '10px' }}>Última visita: {item.dt_ultvisit}</Typography>
                      <Typography sx={{ fontSize: '0.8rem', marginLeft: '-10px', marginTop: '-2px' }}>Cod. Mapa: {item.dsg_mapa_cod}</Typography>
                      <Typography variant="body1" className="status-text-user" sx={{ fontSize: '0.8rem', marginLeft: '-10px', marginTop: '-2px' }} >
                        Local: {getStatusTpLocal(item.terr_tp_local)}
                      </Typography>
                      <Typography sx={{ fontSize: '0.8rem', marginLeft: '-10px', marginTop: '-2px' }}>Bairro: {item.terr_regiao} </Typography>
                      <Typography sx={{ fontSize: '0.8rem', marginLeft: '-10px', marginTop: '-2px' }}>Endereço: {item.terr_enderec}</Typography>

                      <Box
                        className="div-map-user"
                        sx={{ display: 'flex', gap: 6, marginTop: '4px' }}
                      >
                        <Box
                          onClick={() => handleAbreMapa(item.terr_link)}
                          sx={{
                            display: 'flex',
                            cursor: 'pointer',
                            fontSize: '0.95rem',
                            marginLeft: '10px',
                            color: darkMode ? '#ffffff' : '#2c2c4e',
                            '&:hover': {
                              color: darkMode ? '#67e7eb' : '#333333',
                              textDecoration: 'underline',
                            },
                          }}
                        >
                          <FaMapMarked style={{ marginRight: '6px' }} />
                          Abrir Mapa
                        </Box>
                      </Box>
                    </CardContent>
                    <CardActions disableSpacing sx={{ marginTop: '-25px', marginRight: '230px' }}>
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
                      </CardContent>
                    </Collapse>
                  </Card>
                </Box>
              ))}
            </Box>
          )}

      <Dialog open={openVisitDialog} onClose={() => setOpenVisitDialog(false)}>
        <DialogTitle>Designar Responsável</DialogTitle>
        <DialogContent>
          <DialogContentText></DialogContentText>
          <Typography variant="body2">Última Visita: {selectedItem?.dt_ultvisit}</Typography>
          <Typography variant="body2">Código do Mapa: {selectedItem?.dsg_mapa_cod}</Typography>
          <Typography variant="body2">Endereço: {selectedItem?.terr_enderec}</Typography>

          <FormControl fullWidth margin="dense">
            <InputLabel>Escolha o Publicador*</InputLabel>
            <Select
              labelId="publicadores-label"
              id="publicadores"
              value={formFields.pub_login || ''} // Valor atual do pub_login no formFields
              onChange={(e) => handleFieldChange('pub_login', e.target.value)} // Atualiza pub_login no formFields
            >
              {publicadores.map((publicador) => (
                <MenuItem key={publicador.id} value={publicador.pub_login}>
                  {publicador.pub_nome} {/* Exibe o nome no dropdown */}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenVisitDialog(false)} color="primary">Cancelar</Button>
          <Button onClick={handleDesignar} color="primary">Confirmar</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default FormUserEnsino;
