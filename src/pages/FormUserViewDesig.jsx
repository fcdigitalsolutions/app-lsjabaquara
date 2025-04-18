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
import { FaAngleDoubleDown, FaMapMarked, FaUserCheck } from 'react-icons/fa';
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

const FormUserEnsino = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);
  const [openVisitDialog, setOpenVisitDialog] = useState(false);
  const [formFields, setFormFields] = useState({
    visit_status: '',
    num_pessoas: '',
    melhor_dia: '',
    melhor_hora: '',
    terr_obs: ''
  });

  //const userDados = JSON.parse(sessionStorage.getItem('userData'));
  //const lginUser = userDados?.iduser;
  const [publicadores, setPublicadores] = useState([]); // Estado para armazenar as opções de Publicadores

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
      case '1': return 'DESIGNADO';
      case '2': return 'JÁ VISITEI';
      case '3': return 'VENCIDO';
      case '4': return 'ENCERRADO';
      default: return 'Outros';
    }
  };

  const getStatusColorDesig = (status) => {
    switch (status) {
      case 'NÃO DESIGNADO': return darkMode ? '#666666' : '#666666';
      case 'DESIGNADO': return darkMode ? '#00009C' : '#00009C';
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
    api_service.get(`/desigpend`)
      .then((response) => {
        setData(response.data);
        setError(null);
      })
      .catch((error) => {
        console.error("Erro ao buscar os dados: ", error);
        setError('Erro ao carregar as designações. Tente novamente mais tarde.');
      })
      .finally(() => setLoading(false));
  }, []);


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
      const selectedPublicador = publicadores.find(p => p.pub_chave === value);
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
    if (!selectedItem || !formFields.pub_login) {
      console.error("Por favor, selecione uma designação e um publicador.");
      return;
    }

    // Dados comuns para ambas as rotas
    const updatedData = {
      ...selectedItem,
      dsg_status: '1', // Define o status como "Pendente"
      pub_login: formFields.pub_login, // Login do publicador selecionado
      pub_nome: publicadores.find((p) => p.pub_chave === formFields.pub_login)?.pub_nome || '', // Nome do publicador correspondente
      dsg_data: new Date().toLocaleDateString('pt-BR'), // Data da designação
    };

    try {
      if (selectedItem.desg_tipogrupo === 'IND') {
        // Atualizar a rota de indicações
        const updatedIndicacao = {
          indic_desig: '2', // Atualiza como designado

        };
        await api_service.put(`/indica/${selectedItem.indica_id}`, updatedIndicacao);
        console.log('Indicação atualizada com sucesso.');
      } else if (selectedItem.desg_tipogrupo === 'MAP') {
        // Atualizar a rota de territórios
        const updatedTerritorio = {
          terr_desig: '2', // Define como designado
          terr_respons: '',
          terr_status: '0', // Define como ativo
        };
        await api_service.put(`/terrupdesp/${selectedItem.territor_id}`, updatedTerritorio);
        console.log('Território atualizado com sucesso.');
      }

      // Atualiza a designação
      await api_service.put(`/desig/${selectedItem.desig_id}`, updatedData);

      // Atualizar o estado local
      setData((prevData) =>
        prevData.map((item) =>
          item.desig_id === selectedItem.desig_id
            ? { ...item, dsg_status: '1', terr_desig: selectedItem.desg_tipogrupo === 'IND' ? '0' : '2' }
            : item
        )
      );

      setOpenVisitDialog(false); // Fecha o diálogo
      console.log('Designação atualizada com sucesso.');
    } catch (error) {
      console.error('Erro ao designar a designação:', error);
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
        <Typography sx={{ fontSize: '0.8rem', marginLeft: '5px', marginTop: '10px' }}>Responsável Mapas Enviar: {totalMapas} </Typography>
      </Box>

      {loading ?
        (
          <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
            <CircularProgress /> </Box>) : error ? (<Typography variant="body1" color="error" align="center">{error}</Typography>)
          : (

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
                  >  <CardContent>
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
                        <FaUserCheck style={{ marginRight: '4px' }} />
                        Designar/Transferir
                      </Box>
                      <Typography sx={{ fontSize: '0.8rem', marginLeft: '-10px', marginTop: '10px' }}>Última visita: {item.dt_ultvisit}</Typography>

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
                <MenuItem key={publicador.id} value={publicador.pub_chave}>
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
