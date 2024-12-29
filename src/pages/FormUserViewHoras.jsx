
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
  InputLabel,
} from '@mui/material';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, } from 'recharts';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';

import {
  FaAngleDoubleDown,
  FaClock,
  FaFileSignature,
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

const FormUserViewHoras = () => {

  const { darkMode } = useTheme();
  const userDados = JSON.parse(sessionStorage.getItem('userData'));
  const lginUser = userDados?.iduser;

  const [dataUHrsPreg, setDataUHrsPreg] = useState([]);
  const [selectedYear, setSelectedYear] = useState('2024'); // Ano padrão (exemplo)
  const [selectedMonth, setSelectedMonth] = useState('12'); // Mês padrão (exemplo)
  const [selectedHorasEspecial, setSelectedHorasEspecial] = useState('100'); // Pioneiro Regular
  const [selectedHorasRegular, setSelectedHorasRegular] = useState('50'); // Pioneiro Regular
  const [selectedHorasAuxliar1, setSelectedHorasAuxliar1] = useState('30'); // Pioneiro Auxiliar 1
  const [selectedHorasAuxliar2, setSelectedHorasAuxliar2] = useState('15'); // Pioneiro Auxiliar 2
  const [selectedHorasPublicador, setselectedHorasPublicador] = useState('0.25'); // Pioneiro Auxiliar 2
  const [selectedMetaType, setSelectedMetaType] = useState(''); // Meta padrão será definida após carregar a API
  const [userPublicad, setUserPublicad] = useState([]);

  const [expanded, setExpanded] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);
  const [openuHrsPregcDialogEdit, setOpenuHrsPregcDialogEdit] = useState(false);
  const [openuHrsPregcDialogNew, setOpenuHrsPregcDialogNew] = useState(false);
  const [openuHrsPregcDialogDelete, setOpenuHrsPregcDialogDelete] = useState(false);
  const [formFields, setFormFields] = useState({
    mhrsp_data: dayjs(), // ex.: inicia com a data de hoje
    mhrsp_ativ: '',
    mhrsp_hrs: '',
    mhrsp_min: '',
    mhrsp_ensino: '',
    mhrsp_mensag: '',
  });

  // Mapeamento para `desig_campo`
const desigCampoMap = {
  0: { label: "Publicador", meta: selectedHorasPublicador },
  1: { label: "Pioneiro Auxiliar", meta: selectedHorasAuxliar1 },
  2: { label: "Pioneiro Regular", meta: selectedHorasRegular },
  3: { label: "Pioneiro Especial", meta: selectedHorasEspecial },
  4: { label: "Pioneiro Auxiliar (Campanha)", meta: selectedHorasAuxliar2 },
};
  useEffect(() => {
    api_service.get(`/hrsprg/${lginUser}`)
      .then((response) => {
        setDataUHrsPreg(response.data);

      })
      .catch((error) => {
        console.error("Erro ao buscar os dados: ", error);
      })
  }, [lginUser]);


  // Filtrar os dados conforme ano e mês
  const filteredData = dataUHrsPreg.filter((item) => {
    return (
      item.mhrsp_anocal === selectedYear &&
      item.mhrsp_mes === selectedMonth
    );
  });

  useEffect(() => {
    const fetchUserPublicad = async () => {
      try {
        const response = await api_service.get(`/pubc/${lginUser}`);
        setUserPublicad(response.data);
  
        // Inicializar o `selectedMetaType` com base no `desig_campo`
        const publicador = response.data.find((p) => p.pub_chave === lginUser);
        if (publicador && publicador.desig_campo !== undefined) {
          setSelectedMetaType(publicador.desig_campo.toString()); // Salva o valor numérico como string
        } else {
          setSelectedMetaType("0"); // Valor padrão
        }
      } catch (error) {
        console.error("Erro ao carregar os dados:", error);
      }
    };
  
    fetchUserPublicad();
  }, [lginUser]);



  // Função para somar horas e minutos (exemplo reaproveitando a lógica)
  const calcularHoras = (itens, atividade) => {
    const { totalHoras, totalMins } = itens
      .filter(item => item.mhrsp_ativ === atividade)
      .reduce((acc, item) => {
        const horasNum = parseFloat(item.mhrsp_hrs) || 0;
        const minsNum = parseFloat(item.mhrsp_min) || 0;
        return {
          totalHoras: acc.totalHoras + horasNum,
          totalMins: acc.totalMins + minsNum,
        };
      }, { totalHoras: 0, totalMins: 0 });

    let horasFinais = totalHoras;
    let minsFinais = totalMins;

    const extraHours = Math.floor(minsFinais / 60);
    horasFinais += extraHours;
    minsFinais = minsFinais % 60;

    const hh = horasFinais.toString().padStart(2, '0');
    const mm = minsFinais.toString().padStart(2, '0');
    return `${hh}:${mm}`;
  };

  // Totais usando os itens filtrados
  const totalHorasCamp = calcularHoras(filteredData, '1'); // Pregação
  const totalHorasProj = calcularHoras(filteredData, '2'); // Projetos

  // Função para somar estudos (exemplo reaproveitando a lógica)
  const calcularEstudos = (itens) => {
    const { totalEstudos } = itens
      .reduce((acc, item) => {
        const EstudoNum = parseFloat(item.mhrsp_ensino) || 0;

        return {
          totalEstudos: acc.totalEstudos + EstudoNum,
        };
      }, { totalEstudos: 0 });

    let totalValor = totalEstudos;


    return totalValor;
  };

  const totalEstudos = calcularEstudos(filteredData); // Projetos

  const dataFilteredByYear = dataUHrsPreg.filter((item) => item.mhrsp_anocal === selectedYear);

  const barChartData = dataFilteredByYear.reduce((acc, item) => {
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
    ];
    const mesIndex = parseInt(item.mhrsp_mes) - 1;
    if (!acc[mesIndex]) {
      acc[mesIndex] = { mes: meses[mesIndex], pregação: 0, projetos: 0, estudos: 0 };
    }
    acc[mesIndex].pregação += parseFloat(item.mhrsp_ativ === '1' ? item.mhrsp_hrs || 0 : 0);
    acc[mesIndex].projetos += parseFloat(item.mhrsp_ativ === '2' ? item.mhrsp_hrs || 0 : 0);
    acc[mesIndex].estudos += parseFloat(item.mhrsp_ensino || 0);
    return acc;
  }, []).filter(Boolean);


  const handleFieldChange = (field, value) => {
    setFormFields((prevState) => ({ ...prevState, [field]: value }));
  };

  const handleHrsPregcSubmit = async () => {
    const uHrsPregcDataNew = {
      data_inclu: new Date().toLocaleDateString("pt-BR"),
      mhrsp_data: formFields.mhrsp_data.format('DD/MM/YYYY'),
      mhrsp_pub: lginUser,
      mhrsp_anosrv: formFields.mhrsp_anosrv,
      mhrsp_anocal: formFields.mhrsp_anocal,
      mhrsp_mes: formFields.mhrsp_mes,
      mhrsp_ativ: formFields.mhrsp_ativ,
      mhrsp_hrs: formFields.mhrsp_hrs,
      mhrsp_min: formFields.mhrsp_min,
      mhrsp_ensino: formFields.mhrsp_ensino,
      mhrsp_mensag: formFields.mhrsp_mensag,
    };

    try {
      await api_service.post(`/hrsprg`, uHrsPregcDataNew); // Insere a visita
      setOpenuHrsPregcDialogNew(false); // Fecha o modal de visita
    } catch (error) {
      console.error("Erro ao registrar visita e atualizar os dados: ", error);
    }
  };

  const handleHrsPregcUpdate = async () => {
    if (!selectedItem) return;
    const uHrsPregcDataEdit = {
      mhrsp_pub: selectedItem.mhrsp_pub,
      mhrsp_anosrv: selectedItem.mhrsp_anosrv,
      mhrsp_anocal: selectedItem.mhrsp_anocal,
      mhrsp_data: formFields.mhrsp_data.format('DD/MM/YYYY'),
      mhrsp_mes: selectedItem.mhrsp_mes,
      mhrsp_ativ: formFields.mhrsp_ativ,
      mhrsp_hrs: formFields.mhrsp_hrs,
      mhrsp_min: formFields.mhrsp_min,
      mhrsp_ensino: formFields.mhrsp_ensino,
      mhrsp_mensag: formFields.mhrsp_mensag,
    };

    try {
      await api_service.put(`/hrsprg/${selectedItem.mhrsp_id}`, uHrsPregcDataEdit); // edita anotação
      // Atualiza os dados da anotação
      console.log("Registro alterado com sucesso.");

      // Atualiza o estado local para refletir as mudanças
      setDataUHrsPreg((prevData) =>
        prevData.map((item) =>
          item.mhrsp_id === selectedItem.mhrsp_id
            ? { ...item, mhrsp_ativ: selectedItem.mhrsp_ativ }
            : item
        )
      );

      setOpenuHrsPregcDialogEdit(false); // Fecha o modal de visita
    } catch (error) {
      console.error("Erro ao atualizar os dados: ", error);
    }
  };

  const handleHrsPregcDelete = async () => {
    if (!selectedItem) return;
    const uHrsPregcDataDelete = {
      mhrsp_pub: selectedItem.mhrsp_pub,
      mhrsp_anosrv: selectedItem.mhrsp_anosrv,
      mhrsp_anocal: selectedItem.mhrsp_anocal,
      mhrsp_mes: selectedItem.mhrsp_mes,
    };

    try {
      await api_service.delete(`/hrsprg/${selectedItem.mhrsp_id}`, uHrsPregcDataDelete); // edita anotação
      // Atualiza os dados da anotação
      console.log("Registro excluído com sucesso.");
      setOpenuHrsPregcDialogDelete(false); // Fecha o modal de visita
    } catch (error) {
      console.error("Erro ao atualizar os dados: ", error);
    }
  };

  const handleOpenDialogNewHoras = () => {
    setFormFields({
      ...formFields,
      mhrsp_anosrv: selectedYear, // Por exemplo, se você chama esse campo de "mhrsp_anosrv"
      mhrsp_anocal: selectedYear, // Ajuste se for esse o campo
      mhrsp_mes: selectedMonth,
      mhrsp_ativ: '',    // Zere ou defina o padrão
      mhrsp_hrs: '',
      mhrsp_min: '',
      mhrsp_ensino: '',
      mhrsp_mensag: '',
    });

    setOpenuHrsPregcDialogNew(true); // Abre o diálogo
  };

  const handleOpenDialogEditAnot = (item) => {
    setSelectedItem({
      ...item,
      mhrsp_id: item.mhrsp_id,
    });

    // Converte a string de data em dayjs
    const parsedDate = item.mhrsp_data
      ? dayjs(item.mhrsp_data, 'DD/MM/YYYY') // Se vier em "DD/MM/YYYY"
      : null;

    setFormFields({
      mhrsp_data: parsedDate,
      mhrsp_ativ: item.mhrsp_ativ || '',
      mhrsp_hrs: item.mhrsp_hrs || '',
      mhrsp_min: item.mhrsp_min || '',
      mhrsp_ensino: item.mhrsp_ensino || '',
      mhrsp_mensag: item.mhrsp_mensag || '',
    });

    setOpenuHrsPregcDialogEdit(true); // Abre o diálogo
  };

  const handleOpenDialogDeleteAnot = (item) => {
    setSelectedItem({
      ...item,
      mhrsp_id: item.mhrsp_id,
    });

    setFormFields({
      mhrsp_ativ: item.mhrsp_ativ || '',
      mhrsp_hrs: item.mhrsp_hrs || '',
      mhrsp_min: item.mhrsp_min || '',
      mhrsp_ensino: item.mhrsp_ensino || '',
      mhrsp_mensag: item.mhrsp_mensag || '',
    });

    setOpenuHrsPregcDialogDelete(true); // Abre o diálogo
  };

  const handleExpandClick = (id) => {
    setExpanded((prevExpanded) => ({ ...prevExpanded, [id]: !prevExpanded[id] }));
  };

  const getStatusTpHoras = (mhrsp_ativ) => {
    switch (mhrsp_ativ) {
      case '1':
        return 'Pregação';
      case '2':
        return 'Projetos';
      default:
        return 'Outros';
    }
  };

  const getStatusNomeMes = (mhrsp_mes) => {
    switch (mhrsp_mes) {
      case '1':
        return 'Janeiro';
      case '2':
        return 'Fevereiro';
      case '3':
        return 'Março';
      case '4':
        return 'Abril';
      case '5':
        return 'Maio';
      case '6':
        return 'Junho';
      case '7':
        return 'Julho';
      case '8':
        return 'Agosto';
      case '9':
        return 'Setembro';
      case '10':
        return 'Outubro';
      case '11':
        return 'Novembro';
      case '12':
        return 'Dezembro';
      default:
        return 'Outros';
    }
  };


// Função para calcular as horas restantes
const getHorasRestantes = () => {
  const metaAtual = desigCampoMap[selectedMetaType]?.meta || 0;
  return metaAtual - (parseFloat(totalHorasCamp) + parseFloat(totalHorasProj));
};


   const getStatusMetaHoras = (horasRestantes) => {
    if (horasRestantes <= 0) {
      return 'Parabéns, você já alcançou sua meta!!';
    } else {
      return `Faltam: ${horasRestantes}h para atingir sua meta!`;
    }
  };

  return (
    <Box className="main-container-user" sx={{ backgroundColor: darkMode ? '#202038' : '#f0f0f0', color: darkMode ? '#67e7eb' : '#333333' }}>

      <Box className="card-container-user-horas">
        {/* SELETORES DE ANO E MÊS */}
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            marginTop: '14px',
            marginBottom: '6px',
          }}>
          <FormControl size="small"
            sx={{ minWidth: 120, color: darkMode ? '#D9D919' : '#202038', }}>
            <InputLabel sx={{
              color: darkMode ? '#67e7eb' : '#333',


            }}>Ano</InputLabel>
            <Select
              sx={{
                color: darkMode ? '#67e7eb' : '#333',
              }}
              value={selectedYear}
              label="Ano"
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <MenuItem value="2023">2023</MenuItem>
              <MenuItem value="2024">2024</MenuItem>
              <MenuItem value="2025">2025</MenuItem>
              <MenuItem value="2026">2026</MenuItem>
              <MenuItem value="2027">2027</MenuItem>
              <MenuItem value="2028">2028</MenuItem>
              <MenuItem value="2029">2029</MenuItem>
              <MenuItem value="2030">2030</MenuItem>
              {/* insira os anos manualmente */}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120, color: darkMode ? '#67e7eb' : '#333', }}>
            <InputLabel sx={{
              color: darkMode ? '#67e7eb' : '#333',
            }}>Mês</InputLabel>
            <Select
              sx={{
                color: darkMode ? '#67e7eb' : '#333',
              }}
              value={selectedMonth}
              label="Mês"
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <MenuItem value="01">Janeiro</MenuItem>
              <MenuItem value="02">Fevereiro</MenuItem>
              <MenuItem value="03">Março</MenuItem>
              <MenuItem value="04">Abril</MenuItem>
              <MenuItem value="05">Maio</MenuItem>
              <MenuItem value="06">Junho</MenuItem>
              <MenuItem value="07">Julho</MenuItem>
              <MenuItem value="08">Agosto</MenuItem>
              <MenuItem value="09">Setembro</MenuItem>
              <MenuItem value="10">Outubro</MenuItem>
              <MenuItem value="11">Novembro</MenuItem>
              <MenuItem value="12">Dezembro</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box
          sx={{
            gap: 1,
            marginTop: '5px',
            marginBottom: '1px',
            marginLeft: '-45px',
          }}>
          <BarChart width={350} height={140} data={barChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="pregação" fill="#8884d8" />
            <Bar dataKey="projetos" fill="#82ca9d" />
            <Bar dataKey="estudos" fill="#ffc658" />
          </BarChart>
        </Box>

        {/*  card estático com o total dos cards filtrados pelo ano + mês  */}
        <Box className="card-box-horas-user">
          <Card
            className="card-user-horas"
            sx={{
              backgroundColor: darkMode ? '#174A63' : '#67e7eb',
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
                  fontSize: '0.90rem',
                  marginLeft: '2px',
                  marginTop: '-5px',
                  fontWeight: 'bold',
                  marginBottom: '10px',
                }}
              >
                {getStatusNomeMes(selectedMonth)} / {selectedYear}
              </Typography>

              {/* Select para escolher a meta */}
              <FormControl size="small" sx={{ minWidth: 100, marginBottom: '12px', }}>
                <InputLabel sx={{
                  color: darkMode ? '#D9D919' : '#202038',
                }}>Meta</InputLabel>
                <Select
                  sx={{
                    color: darkMode ? '#D9D919' : '#202038',
                  }}
                  value={selectedMetaType}
                  onChange={(e) => setSelectedMetaType(e.target.value)}
                  label="Meta"
                >  
                  <MenuItem value="0">Publicador</MenuItem>
                  <MenuItem value="1">Pioneiro Auxiliar</MenuItem>
                  <MenuItem value="2">Pioneiro Regular</MenuItem>
                  <MenuItem value="3">Pioneiro Especial</MenuItem>
                  <MenuItem value="4">Pioneiro Auxiliar (Campanha)</MenuItem>

                </Select>
              </FormControl>
              <Typography
                sx={{
                  fontSize: '0.80rem',
                  marginLeft: '2px',
                  marginTop: '-5px',
                }}
              >
                Horas de Pregação: {totalHorasCamp}
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.80rem',
                  marginLeft: '2px',
                  marginTop: '-3px',
                }}
              >
                Horas de Projetos: {totalHorasProj}
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.80rem',
                  marginLeft: '2px',
                  marginTop: '-3px',
                }}
              >
                Estudos: {totalEstudos}
              </Typography>

              <Typography
                sx={{
                  fontSize: '0.80rem',
                  marginLeft: '2px',
                  marginTop: '-3px',
                }}
              >
                {getStatusMetaHoras(getHorasRestantes())}
                
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

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
          onClick={() => handleOpenDialogNewHoras(null)}
          sx={{
            display: 'flex',
            cursor: 'pointer',
            fontSize: '14px',
            marginLeft: '195px',
            marginTop: '15px',
            marginBottom: '10px',
            color: darkMode ? ' #ffffff' : '#00009C',
            '&:hover': {
              color: darkMode ? '#67e7eb' : '#7F00FF',
              textDecoration: 'underline',
            },
          }}
        >
          <FaClock style={{ marginRight: '4px' }} />
          Lançar Horas
        </Box>

      </Box>

      <Box className="card-container-user-horas">
        {filteredData.map((item, index) => {

          return (
            <Box key={index} className="card-box-horas-user">
              <Card
                className="card-user-horas"
                sx={{
                  backgroundColor: darkMode ? '#174A63' : '#67e7eb',
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
                      fontSize: '0.78rem',
                      marginLeft: '2px',
                      marginTop: '-3px',
                    }}
                  >
                    Data: {item.mhrsp_data}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '0.78rem',
                      marginLeft: '2px',
                      marginTop: '-3px',
                    }}
                  >
                    Atividade: {getStatusTpHoras(item.mhrsp_ativ)}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '0.78rem',
                      marginLeft: '2px',
                      marginTop: '-3px',
                    }}
                  >
                    Horas: {item.mhrsp_hrs}:{item.mhrsp_min}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '0.78rem',
                      marginLeft: '2px',
                      marginTop: '-3px',
                    }}
                  >
                    Estudos: {item.mhrsp_ensino}
                  </Typography>

                  <Box
                    onClick={() => handleOpenDialogEditAnot(item)}
                    sx={{
                      alignItems: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer',
                      fontSize: '0.80rem',
                      marginTop: '-8px',
                      color: darkMode ? '#ffffff' : '#2c2c4e',
                      '&:hover': {
                        color: darkMode ? '#67e7eb' : '#333333',
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    <FaFileSignature style={{ marginRight: '4px' }} />
                    Alterar Horas
                  </Box>
                </CardContent>
                <CardActions disableSpacing sx={{ marginTop: '-40px', marginRight: '230px' }}>
                  <ExpandMore
                    expand={expanded[item.mhrsp_id]}
                    onClick={() => handleExpandClick(item.mhrsp_id)}
                    aria-expanded={expanded[item.mhrsp_id]}
                    aria-label="Mostrar mais"
                  >
                    <FaAngleDoubleDown />
                  </ExpandMore>
                </CardActions>
                <Collapse in={expanded[item.mhrsp_id]} timeout="auto" unmountOnExit>
                  <CardContent>{/* o primeiro Typography sempre margem -20px os demais segue padrão */}
                    <Typography variant="body2" sx={{ fontSize: '0.8rem', marginTop: '-20px', color: darkMode ? '#67e7eb' : '#333' }}>
                      {item.mhrsp_mensag || 'Nenhuma nota disponível.'}
                    </Typography>
                    <Box
                      onClick={() => handleOpenDialogDeleteAnot(item)}
                      sx={{
                        alignItems: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        cursor: 'pointer',
                        fontSize: '0.80rem',
                        marginTop: '15px',
                        color: darkMode ? '#ffffff' : '#2c2c4e',
                        '&:hover': {
                          color: darkMode ? '#67e7eb' : '#333333',
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      <FaTrashAlt style={{ marginRight: '4px' }} />
                      Excluir Horas
                    </Box>
                  </CardContent>
                </Collapse>
              </Card>
            </Box>
          );
        })}
      </Box>

      {/* Caixa de diálogo de lançamento do novo apontamento de horas */}
      <Dialog open={openuHrsPregcDialogNew} onClose={() => setOpenuHrsPregcDialogNew(false)}>
        <DialogTitle>Período: {getStatusNomeMes(selectedMonth)} / {selectedYear} </DialogTitle>
        <DialogContent>
          <DialogContentText></DialogContentText>

          <LocalizationProvider
            dateAdapter={AdapterDayjs}
            adapterLocale="pt-br"
          >
            <DatePicker
              value={formFields.mhrsp_data} // ex.: dayjs() ou null
              onChange={(newValue) => handleFieldChange('mhrsp_data', newValue)}
              renderInput={(params) => <TextField {...params} />}
            />
          </LocalizationProvider>

          <FormControl fullWidth margin="dense">
            <InputLabel>Tipo de Horas *</InputLabel>
            <Select
              value={formFields.mhrsp_ativ}
              onChange={(e) => handleFieldChange('mhrsp_ativ', e.target.value)}
            >
              <MenuItem value="1">Pregação</MenuItem>
              <MenuItem value="2">Projetos</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Horas*"
            type="text"
            fullWidth
            value={formFields.mhrsp_hrs}
            onChange={(e) => handleFieldChange('mhrsp_hrs', e.target.value)}
          />
          <TextField
            margin="dense"
            label="Minutos*"
            type="text"
            fullWidth
            value={formFields.mhrsp_min}
            onChange={(e) => handleFieldChange('mhrsp_min', e.target.value)}
          />
          <TextField
            margin="dense"
            label="Estudos*"
            type="text"
            fullWidth
            value={formFields.mhrsp_ensino}
            onChange={(e) => handleFieldChange('mhrsp_ensino', e.target.value)}
          />
          <TextField
            margin="dense"
            label="Observações Pessoais"
            type="text"
            fullWidth
            multiline
            rows={8}
            value={formFields.mhrsp_mensag}
            onChange={(e) => handleFieldChange('mhrsp_mensag', e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenuHrsPregcDialogNew(false)} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleHrsPregcSubmit} color="primary">
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>


      {/* Caixa de diálogo de edição das horas anotadas */}
      <Dialog open={openuHrsPregcDialogEdit} onClose={() => setOpenuHrsPregcDialogEdit(false)}>
        <DialogTitle>Período: {getStatusNomeMes(selectedItem?.mhrsp_mes)} / {selectedItem?.mhrsp_anosrv}</DialogTitle>
        <DialogContent>
          <DialogContentText></DialogContentText>
          <LocalizationProvider
            dateAdapter={AdapterDayjs}
            adapterLocale="pt-br"
          >
            <DatePicker
              value={formFields.mhrsp_data} // ex.: dayjs() ou null
              onChange={(newValue) => handleFieldChange('mhrsp_data', newValue)}
              renderInput={(params) => <TextField {...params} />}
            />
          </LocalizationProvider>
          <DialogContentText></DialogContentText>
          <FormControl fullWidth margin="dense">
            <InputLabel>Tipo de Horas *</InputLabel>
            <Select
              value={formFields.mhrsp_ativ}
              onChange={(e) => handleFieldChange('mhrsp_ativ', e.target.value)}
            >
              <MenuItem value="1">Pregação</MenuItem>
              <MenuItem value="2">Projetos</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Horas*"
            type="text"
            fullWidth
            value={formFields.mhrsp_hrs}
            onChange={(e) => handleFieldChange('mhrsp_hrs', e.target.value)}
          />
          <TextField
            margin="dense"
            label="Minutos*"
            type="text"
            fullWidth
            value={formFields.mhrsp_min}
            onChange={(e) => handleFieldChange('mhrsp_min', e.target.value)}
          />
          <TextField
            margin="dense"
            label="Estudos*"
            type="text"
            fullWidth
            value={formFields.mhrsp_ensino}
            onChange={(e) => handleFieldChange('mhrsp_ensino', e.target.value)}
          />
          <TextField
            margin="dense"
            label="Observações Pessoais"
            type="text"
            fullWidth
            multiline
            rows={8}
            value={formFields.mhrsp_mensag}
            onChange={(e) => handleFieldChange('mhrsp_mensag', e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenuHrsPregcDialogEdit(false)} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleHrsPregcUpdate} color="primary">
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Caixa de diálogo de confirmação */}
      <Dialog
        open={openuHrsPregcDialogDelete}
        onClose={() => setOpenuHrsPregcDialogDelete(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Confirmar Ação</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Deseja excluir o lançamento dessas horas ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenuHrsPregcDialogDelete(false)} color="primary">
            Não
          </Button>
          <Button
            onClick={async () => {
              setOpenuHrsPregcDialogDelete(false);
              await handleHrsPregcDelete();
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

export default FormUserViewHoras;

