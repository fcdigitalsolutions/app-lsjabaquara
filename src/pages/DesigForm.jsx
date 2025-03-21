import React, { useState, useEffect } from 'react';
import api_service from '../services/api_service'; // Importando serviço da API

import {
  Box, Menu, Table, InputLabel, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, TablePagination, Button, TextField,
  Typography, MenuItem, Select, FormControl, Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  Backdrop,
} from '@mui/material';

import { FaChevronDown, FaUserPlus, FaShareSquare, FaUpload } from 'react-icons/fa';
import * as XLSX from 'xlsx'; // Importe a biblioteca XLSX

const DesigForm = () => {
  const [dataDesig, setDataDesig] = useState([]);
  const [dataSugest, setDataSugest] = useState([]);
  const [pageSugest, setPageSugest] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(15); // Limite de linhas por página
  const [editRowId, setEditRowId] = useState(null); // ID da linha sendo editada
  const [editedRowData, setEditedRowData] = useState({}); // Dados da linha sendo editada
  const [showNewDesignCForm, setShowNewDesignCForm] = useState(false); // Controla a exibição do formulário de nova indicação
  const [message, setMessage] = useState(''); // Mensagem de sucesso ou erro
  const [selected, setSelected] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [filterColumn, setFilterColumn] = useState(''); // Guarda a coluna sendo filtrada  
  const [openImportCarrDialog, setOpenImportCarrDialog] = useState(false);
  const [openImportMecanicDialog, setOpenImportMecanicDialog] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState(""); // Armazena o nome do arquivo selecionado
  const [selectedRows, setSelectedRows] = useState([]); // Armazena as linhas processadas

  const [displayMessage, setDisplayMessage] = useState(""); // Armazena a mensagem atual
  const [messageColor, setMessageColor] = useState("black"); // Armazena a cor da mensagem
  const [isLoading, setIsLoading] = useState(false); // Estado para controlar o loading
  const [value, setValue] = useState(0); // Estado para o progresso
  const [publicadores, setPublicadores] = useState([]);

  const [tipoTerr, setTipoTerr] = useState('1');  // Valor padrão
  const [tipoGrupoMap, setTipoGrupoMap] = useState('MAP');  // Valor padrão

  const excelSerialToDate = (value) => {
    if (!value) return ""; // Se o valor for nulo ou vazio, retorna vazio.

    // Verifica se é um número (serial do Excel).
    if (!isNaN(value)) {
      const excelStartDate = new Date(1899, 11, 30); // Data base do Excel.
      const convertedDate = new Date(excelStartDate.getTime() + value * 86400000); // Adiciona dias em milissegundos.
      const day = String(convertedDate.getDate()).padStart(2, "0");
      const month = String(convertedDate.getMonth() + 1).padStart(2, "0");
      const year = convertedDate.getFullYear();
      return `${day}/${month}/${year}`; // Retorna no formato "DD/MM/YYYY".
    }

    // Trata o caso de string no formato "DD/MM/YYYY".
    if (typeof value === "string" && value.includes("/")) {
      const [day, month, year] = value.split("/").map(Number); // Divide a string em partes numéricas.
      return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`; // Retorna no formato "DD/MM/YYYY".
    }

    return ""; // Retorna vazio para valores inválidos.
  };



  useEffect(() => {
    let timer;

    if (isLoading) {
      timer = setInterval(() => {
        setValue((prev) => {
          const nextValue = prev + 10;

          // Verifica se o valor alcançou ou excedeu 100
          if (nextValue >= 100) {
            clearInterval(timer);
            setIsLoading(false); // Finaliza o loading
            return 100; // Garante que não passe de 100
          }

          return nextValue;
        });
      }, 500); // Intervalo de 500ms
    }

    // Cleanup para limpar o intervalo quando o efeito for desmontado
    return () => {
      clearInterval(timer);
    };
  }, [isLoading]);

  useEffect(() => {
    // Lógica que reage ao valor de `value`
    if (value === 100) {
      console.log('O progresso atingiu 100%.');
      // Outras ações que deseja realizar
    }
  }, [value]); // Reage a mudanças no valor de `value`


  const handleUploadFileCarrinh = (event) => {
    const file = event.target.files[0];
    if (!file) {
      setDisplayMessage("Nenhum arquivo foi selecionado.");
      setMessageColor("red");
      return;
    }

    setSelectedFile(file);
    setSelectedFileName(file.name);
    setDisplayMessage(`Arquivo selecionado: ${selectedFileName}`);
    setMessageColor("black");

    const reader = new FileReader();

    reader.onload = (e) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const formattedData = jsonData.map((row) => {
        // Extrair o primeiro nome e a inicial do sobrenome da planilha
        const partialName = row["Dirigente"]?.split(" ")[0];
        const initialLastName = row["Dirigente"]?.split(" ")[1];

        // Localizar o publicador correspondente
        const publicador = publicadores.find((pub) => {
          const pubFirstName = pub.pub_nome.split(" ")[0];
          const pubLastNameInitial = pub.pub_nome.split(" ")[1];

          return (
            pubFirstName === partialName &&
            (!initialLastName || pubLastNameInitial === initialLastName)
          );
        });


        return {
          data_inclu: excelSerialToDate(row["Data Inclusão"] || ""),
          dsg_data: excelSerialToDate(row["Data"] || ""),
          dsg_mapa_cod: row["Dia Sem."] || "",
          dsg_horaini: row["Horario"] || "",
          pub_login: publicador ? publicador.pub_chave : "",
          pub_nome: publicador ? publicador.pub_nome : row["Dirigente"] || "",
          pub_obs: row["OBS Publicador"] || "",
          dsg_tipo: row["Tipo"] || "2",
          dsg_detalhes: "4",
          dsg_conselh: row["Conselho"] || "00",
          dsg_mapa_url: row["Url"] || "",
          dsg_mapa_end: row["Endereço"] || "",
          dsg_status: row["Status"] || "1",
          dsg_obs: row["Observ"] || "",
        };
      });

      setDataDesig(formattedData); // Atualiza os dados processados
    };

    reader.readAsBinaryString(file);
  };


  const handleUploadCarrinhType3 = (event) => {
    const file = event.target.files[0];
    if (!file) {
      setDisplayMessage("Nenhum arquivo foi selecionado.");
      setMessageColor("red");
      return;
    }

    setSelectedFile(file); // Armazena o arquivo selecionado
    setSelectedFileName(file.name); // Atualiza o nome do arquivo selecionado
    setDisplayMessage(`Arquivo selecionado: ${file.name}`);
    setMessageColor("black");

    const reader = new FileReader();

    reader.onload = (e) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const processedData = jsonData.flatMap((row) => {
        // Localiza publicadores da rota
        const publicadores01 = publicadores.find(
          (pub) => pub.pub_nome === row["Publicador 01"]
        );
        const publicadores02 = publicadores.find(
          (pub) => pub.pub_nome === row["Publicador 02"]
        );
        const publicadores03 = publicadores.find(
          (pub) => pub.pub_nome === row["Publicador 03"]
        );
        const publicadores04 = publicadores.find(
          (pub) => pub.pub_nome === row["Publicador 04"]
        );

        const baseRow = {
          data_inclu: new Date().toLocaleDateString("pt-BR"),
          dsg_data: row["Data"] || "",
          dsg_mapa_cod: row["Dia Sem."] || "",
          dsg_horaini: row["Início"] || "",
          dsg_detalhes: "4",
          dsg_conselh: row["Conselho"] || "00",
          dsg_mapa_url: row["Url"] || "",
          dsg_mapa_end: row["Endereço"] || "",
          dsg_status: row["Status"] || "1",
          dsg_obs: row["Observ"] || "",
          dsg_tipo: row["Tipo"] || "3",
        };

        // Cria uma linha para cada publicador encontrado
        const publicadorRows = [];
        if (publicadores01) {
          publicadorRows.push({
            ...baseRow,
            pub_login: publicadores01.pub_chave,
            pub_nome: publicadores01.pub_nome,
          });
        }
        if (publicadores02) {
          publicadorRows.push({
            ...baseRow,
            pub_login: publicadores02.pub_chave,
            pub_nome: publicadores02.pub_nome,
          });
        }
        if (publicadores03) {
          publicadorRows.push({
            ...baseRow,
            pub_login: publicadores03.pub_chave,
            pub_nome: publicadores03.pub_nome,
          });
        }
        if (publicadores04) {
          publicadorRows.push({
            ...baseRow,
            pub_login: publicadores04.pub_chave,
            pub_nome: publicadores04.pub_nome,
          });
        }

        return publicadorRows; // Adiciona as linhas para cada publicador
      });

      setSelectedRows(processedData); // Atualiza o estado com os dados processados
      console.log("Dados processados para Tipo 3:", processedData);
    };

    reader.readAsBinaryString(file);
  };


  const handleImportAndSubmitCarrinh = async () => {
    if (!selectedFile) {
      setDisplayMessage("Por favor, selecione uma planilha antes de importar.");
      setMessageColor("red");
      return;
    }

    setIsLoading(true); // Ativa o loading
    // Simulação de uma tarefa
    setTimeout(() => {
      setOpenImportCarrDialog(false); // Fecha o diálogo após a tarefa
      setIsLoading(false); // Finaliza o loading
    }, 1000); // Tempo total de execução (ajuste conforme necessário)

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Processar os dados e realizar a correspondência
        const formattedData = jsonData.map((row) => {
          // Extrair o primeiro nome e a inicial do sobrenome da planilha
          const partialName = row["Dirigente"]?.split(" ")[0];
          const initialLastName = row["Dirigente"]?.split(" ")[1];

          // Localizar o publicador correspondente
          const publicador = publicadores.find((pub) => {
            const pubFirstName = pub.pub_nome.split(" ")[0];
            const pubLastNameInitial = pub.pub_nome.split(" ")[1];
            return (
              pubFirstName === partialName &&
              (!initialLastName || pubLastNameInitial === initialLastName)
            );
          });

          return {
            data_inclu: new Date().toLocaleDateString("pt-BR"),
            dsg_data: row["Data"] || "",
            dsg_mapa_cod: row["Dia Sem."] || "",
            dsg_horaini: row["Horario"] || "",
            pub_login: publicador ? publicador.pub_chave : row["Dirigente"] || "",
            pub_nome: publicador ? publicador.pub_nome : row["Dirigente"] || "",
            pub_obs: row["OBS Publicador"] || "",
            dsg_tipo: row["Tipo"] || "2",
            dsg_detalhes: row["Detalhes"] || "4",
            dsg_conselh: row["Conselho"] || "00",
            dsg_mapa_url: row["Url"] || "",
            dsg_mapa_end: row["Endereço"] || "",
            dsg_status: row["Status"] || "1",
            dsg_obs: row["Observ"] || "",
          };
        });

        // Enviar os dados para a API
        try {
          const response = await api_service.post('/desiglot', formattedData);

          console.log("Dados enviados enviados dos Dirigentes:", formattedData);

          if (response.status === 201) {
            setDisplayMessage("Importação e envio concluídos com sucesso!");
            setMessageColor("green");
            setSelectedFile(null); // Limpar o arquivo selecionado
          } else {
            setDisplayMessage("Erro ao enviar os dados. Verifique e tente novamente.");
            setMessageColor("red");
          }
        } catch (error) {
          console.error("Erro ao enviar os dados:", error);
          setDisplayMessage("Erro ao enviar os dados. Tente novamente.");
          setMessageColor("red");
        }
      };

      reader.readAsBinaryString(selectedFile);
    } catch (error) {
      console.error("Erro ao processar o arquivo:", error);
      setDisplayMessage("Erro ao processar a planilha. Verifique o arquivo e tente novamente.");
      setMessageColor("red");
    } finally {
      setIsLoading(false); // Desativa o estado de loading
    }
  };

  const handleSubmitCarrinhType3 = async () => {
    if (!selectedRows || selectedRows.length === 0) {
      setDisplayMessage("Por favor, processe o arquivo antes de importar.");
      setMessageColor("red");
      return;
    }

    console.log("Dados enviados do Carrinho (já processados):", selectedRows);

    try {
      const response = await api_service.post('/desiglot', selectedRows);

      if (response.status === 201) {
        setDisplayMessage("Importação concluída com sucesso!");
        setMessageColor("green");
        setSelectedRows([]); // Limpar os dados processados
        setSelectedFile(null);
      } else {
        setDisplayMessage("Erro ao enviar os dados. Verifique e tente novamente.");
        setMessageColor("red");
      }
    } catch (error) {
      console.error("Erro ao enviar os dados:", error);
      setDisplayMessage("Erro ao enviar os dados. Tente novamente.");
      setMessageColor("red");
    }
  };

  const normalizeText = (text) => {
    if (!text) return ""; // Retorna vazio para entradas nulas ou indefinidas
    return text
      .normalize("NFD") // Decompõe caracteres com acento
      .replace(/[\u0300-\u036f]/g, "") // Remove os acentos
      .toLowerCase(); // Converte para letras minúsculas
  };

  const handleUploadMecanicType456 = (event) => {
    const file = event.target.files[0];
    if (!file) {
      setDisplayMessage("Nenhum arquivo foi selecionado.");
      setMessageColor("red");
      return;
    }

    setSelectedFile(file); // Armazena o arquivo selecionado
    setSelectedFileName(file.name); // Atualiza o nome do arquivo selecionado
    setDisplayMessage(`Arquivo selecionado: ${file.name}`);
    setMessageColor("black");

    const reader = new FileReader();

    reader.onload = (e) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const processedData = jsonData.flatMap((row) => {
        console.log("Linha atual:", row); // Log para depuração

        const findPublicador = (name) => {
          if (!name) return null;

          const [firstName, lastNamePart] = name.split(" ").map(normalizeText);

          if (lastNamePart && lastNamePart.endsWith(".")) {
            // Busca com abreviação de sobrenome
            return publicadores.find((pub) => {
              const pubParts = pub.pub_nome.split(" ").map(normalizeText);
              return (
                pubParts[0] === firstName &&
                pubParts.some((part) => part.startsWith(lastNamePart[0]))
              );
            });
          } else if (lastNamePart) {
            // Busca com sobrenome completo
            return publicadores.find((pub) => {
              const pubParts = pub.pub_nome.split(" ").map(normalizeText);
              return (
                pubParts[0] === firstName &&
                pubParts.includes(lastNamePart)
              );
            });
          }

          // Busca apenas pelo primeiro nome
          return publicadores.find((pub) => {
            const [pubFirstName] = pub.pub_nome.split(" ").map(normalizeText);
            return pubFirstName === firstName;
          });
        };


        const publicadMidias = row["Mídias"] ? findPublicador(row["Mídias"]) : null;
        const publicadCamera = row["Câmera"] ? findPublicador(row["Câmera"]) : null;
        const publicadIndicad = row["Indicador"] ? findPublicador(row["Indicador"]) : null;

        // Logs para correspondência
        if (!publicadMidias && row["Mídias"]) console.warn(`Publicador não encontrado para Mídias: ${row["Mídias"]}`);
        if (!publicadCamera && row["Câmera"]) console.warn(`Publicador não encontrado para Câmera: ${row["Câmera"]}`);
        if (!publicadIndicad && row["Indicador"]) console.warn(`Publicador não encontrado para Indicador: ${row["Indicador"]}`);

        const baseRow = {
          data_inclu: new Date().toLocaleDateString("pt-BR"),
          dsg_data: excelSerialToDate(row["Data"] || ""),
          dsg_mapa_cod: row["Dia"] || "",
          dsg_horaini: row["Início"] || "",
          dsg_detalhes: "4",
          dsg_conselh: row["Conselho"] || "00",
          dsg_mapa_url: row["Url"] || "",
          dsg_mapa_end: row["Endereço"] || "",
          dsg_status: row["Status"] || "1",
          dsg_obs: row["Observ"] || "",
        };

        const publicadorRows = [];
        if (publicadMidias) {
          publicadorRows.push({
            ...baseRow,
            pub_login: publicadMidias.pub_chave,
            pub_nome: publicadMidias.pub_nome,
            dsg_tipo: "4",
          });
        }
        if (publicadCamera) {
          publicadorRows.push({
            ...baseRow,
            pub_login: publicadCamera.pub_chave,
            pub_nome: publicadCamera.pub_nome,
            dsg_tipo: "5",
          });
        }
        if (publicadIndicad) {
          publicadorRows.push({
            ...baseRow,
            pub_login: publicadIndicad.pub_chave,
            pub_nome: publicadIndicad.pub_nome,
            dsg_tipo: "6",
          });
        }

        return publicadorRows;
      });

      setSelectedRows(processedData); // Atualiza o estado com os dados processados
      console.log("Dados processados para Tipo 4,5,6:", processedData);
    };

    reader.readAsBinaryString(file);
  };



  const handleSubmitMecanicType456 = async () => {
    if (!selectedRows || selectedRows.length === 0) {
      setDisplayMessage("Por favor, processe o arquivo antes de importar.");
      setMessageColor("red");
      return;
    }

    try {
      // Enviar os dados processados para a API
      const response = await api_service.post('/desiglot', selectedRows);

      if (response.status === 201) {
        setDisplayMessage("Importação concluída com sucesso!");
        setMessageColor("green");
        setSelectedRows([]); // Limpar os dados processados
      } else {
        setDisplayMessage("Erro ao enviar os dados. Verifique e tente novamente.");
        setMessageColor("red");
      }
    } catch (error) {
      console.error("Erro ao enviar os dados:", error);
      setDisplayMessage("Erro ao enviar os dados. Tente novamente.");
      setMessageColor("red");
    }
  };


  // designações de carrinho - chama upload
  const handleUploadCarrinhCombined = (event) => {
    // Chama as duas handles com base na necessidade
    handleUploadFileCarrinh(event); // Handle para o Tipo padrão
    handleUploadCarrinhType3(event); // Handle para o Tipo 3

  };

  // designações de carrinho - chama envio para rota 
  const handleSubmitCombinedCarrinh = async (event) => {
    await handleSubmitCarrinhType3();
    await handleImportAndSubmitCarrinh();
  };


  const [newDesignC, setNewDesignC] = useState({
    nome_publica: '',
    num_contato: '',
    cod_congreg: '',
    cod_regiao: '',
    enderec: '',
    origem: '',
    obs: ''
  });

  const [filters, setFilters] = useState({
    terr_status: '',
    terr_cor: ''
  });

  // seleciona toda lista de designações disponíveis
  useEffect(() => {
    api_service.get('/desigaall')
      .then((response) => {
        setDataDesig(response.data);
      })
      .catch((error) => {
        console.error("Erro ao buscar os dados: ", error);
      });
  }, []);

  // seleciona sugestões de designações baseado no cadastro de territórios / mapas ativos
  useEffect(() => {
    // Requisição à API sempre que `tipoTerr` mudar
    if (tipoTerr && tipoGrupoMap) {
      api_service.get(`/desigsuges/${tipoTerr}/${tipoGrupoMap}`)
        .then((response) => {
          setDataSugest(response.data);
        })
        .catch((error) => {
          console.error("Erro ao buscar os dados: ", error);
        });
    }
  }, [tipoTerr, tipoGrupoMap]);

  const handleTipoTerrChange = (e) => {
    const newTipoTerr = e.target.value;

    // Atualiza `tipoTerr` com o novo valor
    setTipoTerr(newTipoTerr);

    // Define `tipoGrupoMap` baseado em uma lógica específica
    if (newTipoTerr === '4') {
      setTipoGrupoMap('IND');
    } else {
      setTipoGrupoMap('MAP'); // Valor padrão ou específico
    }
  };

  useEffect(() => {
    const fetchPublicadores = async () => {
      try {
        const response = await api_service.get('/pubcallsint');
        console.log('Publicadores carregados:', response.data);
        setPublicadores(response.data);
      } catch (error) {
        console.error('Erro ao carregar os publicadores:', error);
      }
    };
    fetchPublicadores();
  }, []);

  const handleSelect = (id) => {
    console.log("Selecionando/desmarcando ID:", id); // Debug
    setSelected((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((item) => item !== id) // Desmarca se já estiver selecionado
        : [...prevSelected, id] // Marca se não estiver
    );
  };

  // Verifica se uma linha específica está selecionada
  const isSelected = (id) => selected.includes(id);

  // Função para controlar a seleção de todas as linhas das designações
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = dataSugest.map((row) => row.id_padrao);
      setSelected(newSelected);
    } else {
      setSelected([]);
    }
  };

  // Verifica se todas as linhas estão selecionadas
  const isAllSelected = selected.length === dataSugest.length;

  // Função para iniciar a edição de uma linha
  const handleEdit = (row) => {
    setEditRowId(row.desig_id); // Define a linha como editável
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
      await api_service.put(`/desig/${editedRowData.desig_id}`, editedRowData); // Atualiza os dados no backend
      setDataDesig(dataDesig.map(row => (row.desig_id === editedRowData.desig_id ? editedRowData : row))); // Atualiza os dados no frontend
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
        await api_service.delete(`/desig/${id}`); // Envia a solicitação de exclusão para a API
        setDataDesig(dataDesig.filter(row => row.desig_id !== id)); // Remove o registro excluído do estado local
      } catch (error) {
        console.error("Erro ao excluir os dados: ", error);
      }
    }
  };

  // Função para mostrar/esconder o formulário de novo mapa
  const handleNovoBotao = () => {
    setShowNewDesignCForm(!showNewDesignCForm); // Alterna entre mostrar ou esconder o formulário
  };

  // Função para enviar nova designação para API 
  const handleNewDesignCSubmit = async (e) => {
    e.preventDefault();

    const { pub_login, pub_nome, dsg_tipo, dsg_status } = newDesignC;
    if (!pub_login || !pub_nome || !dsg_tipo || !dsg_status) {
      setMessage('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    try {
      const response = await api_service.post('/desig', newDesignC);
      setDataDesig([...dataDesig, response.data]); // Adiciona novo mapa aos dados
      setNewDesignC({ data_inclu: '', dsg_data: '', pub_login: '', pub_nome: '', dsg_tipo: '', dsg_detalhes: '', dsg_conselh: '', dsg_mapa_cod: '', dsg_mapa_end: '', dsg_mapa_url: '', dsg_status: '', dsg_obs: '', pub_obs: '' }); // Limpa o formulário
      setMessage('Informações enviadas com sucesso!');
    } catch (error) {
      console.error("Erro ao enviar as informações: ", error);
      setMessage('Erro ao incluir a designação  .');
    }
  };

  const handleOpenImportCarrCampDlg = () => {
    setOpenImportCarrDialog(true); // Abre o diálogo
  };

  const handleOpenImportMecanicDlg = () => {
    setOpenImportMecanicDialog(true); // Abre o diálogo
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

  const TableCellBDStyle = {
    fontSize: '0.72rem',
    color: '#202038',
  };

  const handleChangePageSugest = (event, newPage) => {
    setPageSugest(newPage);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };


  // Dados filtrados com base nos filtros das colunas
  const FilterDataDesig = dataDesig.filter((row) => {
    return (
      (!filters.dsg_detalhes || row.dsg_detalhes === filters.dsg_detalhes) &&
      (!filters.dsg_data || row.dsg_data === filters.dsg_data) &&
      (!filters.pub_login || row.pub_login === filters.pub_login) &&
      (!filters.pub_nome || row.pub_nome === filters.pub_nome) &&
      (!filters.dsg_mapa_cod || row.dsg_mapa_cod === filters.dsg_mapa_cod) &&
      (!filters.dsg_status || row.dsg_status === filters.dsg_status) &&
      (!filters.dsg_tipo || row.dsg_tipo === filters.dsg_tipo) &&
      (!filters.terr_cor || row.terr_cor === filters.terr_cor)
    );
  });


  // Cálculo do índice inicial e final das linhas a serem exibidas
  const startIndexSug = pageSugest * rowsPerPage;
  const endIndexSug = startIndexSug + rowsPerPage;
  const currentDataSugest = dataSugest.slice(startIndexSug, endIndexSug);


  // Cálculo do índice inicial e final das linhas a serem exibidas
  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedData = FilterDataDesig.slice(startIndex, endIndex);

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

  const handleClick = (event, column) => {
    setAnchorEl(event.currentTarget);
    setFilterColumn(column);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleFilterSelect = (value) => {
    setFilters({
      ...filters,
      [filterColumn]: value
    });
    handleClose(); // Fecha o menu
  };

  // Função para obter a lista única de logradouros (enderec)
  const getUniqueBairro = () => {
    const BairrosUnicos = [...new Set(dataDesig.map(row => row.terr_regiao))];
    return BairrosUnicos;
  };

  const handleBatchSubmit = async () => {
    if (selected.length === 0) {
      setMessage('Nenhum item selecionado para envio.');
      return;
    }

    // Filtrar os dados selecionados com base nos IDs
    const selectedData = dataSugest.filter((row) => selected.includes(row.id_padrao));
    const cleanedData = selectedData.map((row) => ({
      dsg_data: new Date().toLocaleDateString("pt-BR"),  // Valor padrão 
      data_inclu: new Date().toLocaleDateString("pt-BR"),  // Valor padrão 
      pub_login: '',
      pub_nome: '',
      pub_obs: '',
      dsg_tipo: row.desg_tipogrupo === 'MAP' ? '0' : '1', // 0 - Mapa, 1 - Indicação, ...
      dsg_detalhes: row.terr_tp_local || '',
      dsg_conselh: '00',
      dsg_mapa_cod: row.terr_nome || '',  // Valor padrão para dsg_mapa_cod
      dsg_horaini: '',  // Valor padrão para dsg_horaini
      dsg_mapa_url: row.terr_link || '',  // Valor padrão para dsg_mapa_url
      dsg_mapa_end: row.terr_enderec || '',  // Valor padrão para dsg_mapa_end
      dsg_status: '0',  // 0 - Não Designada, 1 - Pendente, ...
      dsg_obs: '', // Valor padrão para dsg_obs
    }));

    try {
      // Enviar os dados em lote para a API
      const response = await api_service.post('/desiglot', cleanedData);

      if (response.status === 201) {
        setMessage('Sugestões efetivadas com sucesso!');

        setSelected([]); // Limpa a seleção
      } else {
        setMessage('Erro ao efetivar sugestões. Verifique os dados e tente novamente.');
      }
    } catch (error) {
      console.error("Erro ao enviar os dados: ", error);
      setMessage('Erro ao enviar sugestões. Tente novamente.');
    }
  };




  const getStatusTipo = (dsg_tipo) => {
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
      case '9': return 'Discurso Público';
      default: return 'Outros';
    }
  };


  const getStatusColorTipo = (status) => {
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
      case 'Discurso Público': return '#000000';
      default: return 'transparent';
    }
  };

  const getStatusDesig = (dsg_status) => {
    switch (dsg_status) {
      case '0': return 'NÃO DESIGNADA';
      case '1': return 'PENDENTE';
      case '2': return 'REALIZADA';
      case '3': return 'VENCIDA';
      case '4': return 'ENCERRADA';
      default: return 'Outros';
    }
  };

  const getStatusColorDesig = (status) => {
    switch (status) {
      case 'NÃO DESIGNADA': return '#666666';
      case 'PENDENTE': return '#CC0000';
      case 'REALIZADA': return '#42426F';
      case 'VENCIDA': return '#5C4033';
      case 'ENCERRADA': return '#000000';
      default: return 'transparent';
    }
  };

  // Função para determinar o status com base no número de visitas
  const getStatusSit = (terr_status) => {
    switch (terr_status) {
      case '0':
        return 'Ativo';
      case '1':
        return 'Revisita';
      case '2':
        return 'Estudante';
      case '3':
        return 'Doente';
      case '4':
        return 'Mudou';
      case '5':
        return 'Faleceu';
      case '6':
        return 'Nao Quer';
      default:
        return 'Outros';
    }
  };


  // Função para determinar a cor de fundo da célula com base no status
  const getStatusSitColor = (statusSit) => {
    switch (statusSit) {
      case 'Ativo':
        return '#32CD32';
      case 'Revisita':
        return '#D9D919';
      case 'Estudante':
        return '#00009C';
      case 'Doente':
        return '#8C1717';
      case 'Mudou':
        return '#5F9F9F';
      case 'Faleceu':
        return '#D8BFD8';
      case 'Nao Quer':
        return '#FF2400';
      default:
        return 'transparent';
    }
  };

  // Função para determinar o status com base no número de visitas
  const getStatusMapCor = (terr_cor) => {
    switch (terr_cor) {
      case '0':
        return 'Azul';
      case '1':
        return 'Vermelho';
      case '2':
        return 'Verde';
      default:
        return 'Outros';
    }
  };

  // Função para determinar a cor de fundo da célula com base no status
  const getStatusColorMpCor = (statusmpcor) => {
    switch (statusmpcor) {
      case 'Azul':
        return 'blue';
      case 'Vermelho':
        return 'Red';
      case 'Verde':
        return '#238E23';
      default:
        return 'transparent';
    }
  };

  // Função para determinar o status com base na confirmação do endereço
  const getStatusTpLocal = (terr_tp_local) => {
    switch (terr_tp_local) {
      case '1':
        return 'Casa';
      case '2':
        return 'Trabalho';
      case '3':
        return 'Prédio';
      default:
        return 'Outros';
    }
  };

  // Função para determinar a cor de fundo da célula com base no status
  const getStatusColorTpLocal = (status) => {
    switch (status) {
      case 'Casa':
        return '#007FFF';
      case 'Trabalho':
        return '#8B4513';
      case 'Prédio':
        return '#42426F';
      default:
        return 'transparent';
    }
  };

  // Função para determinar o status com base na confirmação do endereço
  const getStatusClassif = (terr_classif) => {
    switch (terr_classif) {
      case '0':
        return 'Surdo';
      case '1':
        return 'D/A';
      case '2':
        return 'Tradutor';
      case '3':
        return 'Ouvinte';
      default:
        return 'Outros';
    }
  };

  // Função para determinar a cor de fundo da célula com base no status
  const getStatusColorClassif = (status) => {
    switch (status) {
      case 'Surdo':
        return '#99CC32';
      case 'D/A':
        return '#5C3317';
      case 'Tradutor':
        return '#330033';
      case 'Ouvinte':
        return '#545454';
      default:
        return '#581845';
    }
  };

  // Função para determinar o status com base na confirmação do endereço
  const getStatusDesigDetalhes = (dsg_detalhes) => {
    switch (dsg_detalhes) {
      case '1':
        return 'Casa';
      case '2':
        return 'Trabalho';
      case '3':
        return 'Prédio';
      case '4':
        return 'Atividades';
      default:
        return 'Outros';
    }
  };

  // Função para determinar a cor de fundo da célula com base no status
  const getStatusColorDesigDetalhes = (status) => {
    switch (status) {
      case 'Casa':
        return '#007FFF';
      case 'Trabalho':
        return '#FF2400';
      case 'Prédio':
        return '#42426F';
      case 'Atividades':
        return '#8E6B23';
      default:
        return 'transparent';
    }
  };


  // Função para obter a lista única de logradouros (enderec)
  const getUniqueDataDesig = () => {
    const DatasUnicas = [...new Set(FilterDataDesig.map(row => row.dsg_data))];
    return DatasUnicas;
  };

  // Função para obter a lista única de logradouros (enderec)
  const getUniqueCodDesig = () => {
    const CodMapaUnic = [...new Set(FilterDataDesig.map(row => row.dsg_mapa_cod))];
    return CodMapaUnic;
  };

  // Função para obter a lista única de logradouros (enderec)
  const getUniquePubDesig = () => {
    const CodMapaUnic = [...new Set(FilterDataDesig.map(row => row.pub_nome))];
    return CodMapaUnic;
  };


  return (
    <Box sx={{ padding: '16px', backgroundColor: 'rgb(255,255,255)', color: '#202038' }}>
      <h2 style={{ fontSize: '1.6rem', marginBottom: '16px' }}>Manutenção das Designações</h2>
      {/* Box separado para a tabela */}
      <Box sx={{ marginBottom: '16px', backgroundColor: 'white', padding: '16px', borderRadius: '8px' }}>
        <Box sx={{ backgroundColor: 'rgb(255, 255, 255)', borderRadius: '16px' }}>
          <Box>
            <h4 style={{ fontSize: '1.2rem', marginBottom: '16px', color: "#42426F" }}>Sugestão de Designações - Efetivar</h4>
            <Box sx={formBoxStyle}>
              <Box sx={{ flex: 1, minWidth: '200px' }}>
                <button
                  type="button"
                  style={{
                    ...buttonStyle,
                    backgroundColor: '#202038',
                    color: '#f1f1f1',
                    transition: 'background-color 0.2s ease',
                    align: 'right',
                    borderRadius: '4px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#67e7eb';
                    e.currentTarget.style.color = '#202038';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#202038';
                    e.currentTarget.style.color = '#f1f1f1';
                  }}
                  onClick={handleBatchSubmit} // Chama a nova função
                >
                  <FaShareSquare /> Efetivar Sugestão dos Mapas
                </button>
              </Box>
              <Box
                sx={{
                  flex: 1,
                  backgroundColor: '#00009C',
                  color: 'white',    // cor do texto para contraste
                  padding: '8px',   // espaçamento interno
                  borderRadius: '6px', // bordas arredondadas, se desejar
                  minWidth: '250px',
                  maxWidth: '250px',
                }}
              >
                <Typography variant="body1">
                  Escolha o tipo de Campanha:
                </Typography>
              </Box>
              <Box sx={{ flex: 1, minWidth: '200px' }}>
                <FormControl>
                  <Select
                    value={tipoTerr}
                    variant="outlined"
                    margin="dense"
                    size="small"
                    sx={{ minWidth: '200px' }}
                    onChange={handleTipoTerrChange}
                  >
                    <MenuItem value="1">Pregação: Casa em Casa</MenuItem>
                    <MenuItem value="2">Campanha: Trabalho</MenuItem>
                    <MenuItem value="3">Campanha: Prédio</MenuItem>
                    <MenuItem value="4">Campanha: Indicações</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
            {message && <Typography variant="body1" sx={{ color: message.includes('Erro') ? 'red' : 'green', marginTop: '10px' }}>{message}</Typography>}

            <TableContainer component={Paper} sx={{ marginTop: '10px' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }} padding="checkbox">
                      <Checkbox
                        indeterminate={selected.length > 0 && selected.length < dataSugest.length}
                        checked={isAllSelected}
                        onChange={handleSelectAllClick}
                        inputProps={{ 'aria-label': 'select all items' }}
                      />
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Tipo</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Mapa</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Qtd Pessoas</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Cor
                      <FaChevronDown onClick={(event) => handleClick(event, 'terr_cor')} />
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Grau</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Região</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>End. Mapa</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Url. Mapa</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Melhor Dia</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Melhor Horário</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Dt. Última Visita</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Resp. Ultima Visita</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Detalhes</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  </TableRow>
                  {/* Menu suspenso para filtros */}
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                  >
                    {filterColumn === 'terr_regiao' && (
                      <>
                        <MenuItem onClick={() => handleFilterSelect('')}>Todos</MenuItem>
                        {/* Gerar dinamicamente os nome de publicador únicos */}
                        {getUniqueBairro().map((terr_regiao) => (
                          <MenuItem key={terr_regiao} onClick={() => handleFilterSelect(terr_regiao)}>
                            {terr_regiao}
                          </MenuItem>
                        ))}
                      </>
                    )}

                    {filterColumn === 'terr_desig' && (
                      <>
                        <MenuItem onClick={() => handleFilterSelect('')}>Todos</MenuItem>
                        <MenuItem onClick={() => handleFilterSelect('1')}>Não</MenuItem>
                        <MenuItem onClick={() => handleFilterSelect('2')}>Sim</MenuItem>
                      </>
                    )}
                    {filterColumn === 'terr_tp_local' && (
                      <>
                        <MenuItem onClick={() => handleFilterSelect('')}>Todos</MenuItem>
                        <MenuItem onClick={() => handleFilterSelect('1')}>Casa</MenuItem>
                        <MenuItem onClick={() => handleFilterSelect('2')}>Trabalho</MenuItem>
                        <MenuItem onClick={() => handleFilterSelect('3')}>Prédio</MenuItem>
                      </>
                    )}
                    {filterColumn === 'melhor_dia_hora' && (
                      <>
                        <MenuItem onClick={() => handleFilterSelect('')}>Todos</MenuItem>
                        <MenuItem onClick={() => handleFilterSelect('Livre')}>Livre</MenuItem>
                        <MenuItem onClick={() => handleFilterSelect('Segunda')}>Segunda</MenuItem>
                        <MenuItem onClick={() => handleFilterSelect('Terça')}>Terça</MenuItem>
                        <MenuItem onClick={() => handleFilterSelect('Quarta')}>Quarta</MenuItem>
                        <MenuItem onClick={() => handleFilterSelect('Quinta')}>Quinta</MenuItem>
                        <MenuItem onClick={() => handleFilterSelect('Sexta')}>Sexta</MenuItem>
                        <MenuItem onClick={() => handleFilterSelect('Sábado')}>Sábado</MenuItem>
                        <MenuItem onClick={() => handleFilterSelect('Domingo')}>Domingo</MenuItem>
                        <MenuItem onClick={() => handleFilterSelect('Sab-Dom')}>Sab-Dom</MenuItem>
                        <MenuItem onClick={() => handleFilterSelect('Feriados')}>Feriados</MenuItem>

                      </>
                    )}
                    {filterColumn === 'terr_classif' && (
                      <>
                        <MenuItem onClick={() => handleFilterSelect('')}>Todos</MenuItem>
                        <MenuItem onClick={() => handleFilterSelect('0')}>Surdo</MenuItem>
                        <MenuItem onClick={() => handleFilterSelect('1')}>D/A</MenuItem>
                        <MenuItem onClick={() => handleFilterSelect('2')}>Tradutor</MenuItem>
                        <MenuItem onClick={() => handleFilterSelect('3')}>Ouvinte</MenuItem>
                      </>
                    )}
                    {filterColumn === 'terr_cor' && (
                      <>
                        <MenuItem onClick={() => handleFilterSelect('')}>Todos</MenuItem>
                        <MenuItem onClick={() => handleFilterSelect('0')}>Azul</MenuItem>
                        <MenuItem onClick={() => handleFilterSelect('1')}>Vermelho</MenuItem>
                        <MenuItem onClick={() => handleFilterSelect('2')}>Verde</MenuItem>
                      </>
                    )}
                    {filterColumn === 'terr_status' && (
                      <>
                        <MenuItem onClick={() => handleFilterSelect('')}>Todos</MenuItem>
                        <MenuItem onClick={() => handleFilterSelect('0')}>Ativo</MenuItem>
                        <MenuItem onClick={() => handleFilterSelect('1')}>Revisita</MenuItem>
                        <MenuItem onClick={() => handleFilterSelect('2')}>Estudante</MenuItem>
                        <MenuItem onClick={() => handleFilterSelect('3')}>Doente</MenuItem>
                        <MenuItem onClick={() => handleFilterSelect('4')}>Mudou</MenuItem>
                        <MenuItem onClick={() => handleFilterSelect('5')}>Faleceu</MenuItem>
                        <MenuItem onClick={() => handleFilterSelect('6')}>Não Quer</MenuItem>
                      </>
                    )}
                  </Menu>
                </TableHead>

                <TableBody>
                  {currentDataSugest.map((row) => {
                    const statusmpcor = getStatusMapCor(row.terr_cor);
                    const statusSit = getStatusSit(row.terr_status);
                    const statusTploc = getStatusTpLocal(row.terr_tp_local);
                    const statusClassif = getStatusClassif(row.terr_classif);
                    return (
                      <TableRow key={row.id_padrao}>
                        {console.log(row)}
                        <TableCell TableCell align="center">
                          <Checkbox
                            checked={isSelected(row.id_padrao)}
                            onChange={() => handleSelect(row.id_padrao)}
                          />
                        </TableCell>

                        {/* Campo editável Tipo do território */}
                        <TableCell align="center">
                          <div
                            style={{
                              backgroundColor: getStatusColorTpLocal(statusTploc),
                              color: 'white',
                              padding: '2px',
                              borderRadius: '4px',
                              textAlign: 'center',
                              fontSize: '0.65rem',
                            }}
                          >
                            {statusTploc}
                          </div>
                        </TableCell>
                        <TableCell align="center">{row.terr_nome}</TableCell>
                        <TableCell align="center">{row.num_pessoas}</TableCell>

                        {/* Campo editável de status cor do mapa */}
                        <TableCell align="center" sx={TableCellBDStyle}>
                          <div
                            style={{
                              backgroundColor: getStatusColorMpCor(statusmpcor),
                              color: 'white',
                              padding: '2px',
                              borderRadius: '4px',
                              textAlign: 'center',
                              fontSize: '0.65rem',
                            }}
                          >
                            {statusmpcor}
                          </div>
                        </TableCell>

                        {/* Campo editável de status cor do mapa */}
                        <TableCell align="center" sx={TableCellBDStyle}>
                          <div
                            style={{
                              backgroundColor: getStatusColorClassif(statusClassif),
                              color: 'white',
                              padding: '2px',
                              borderRadius: '4px',
                              textAlign: 'center',
                              fontSize: '0.65rem',
                            }}
                          >
                            {statusClassif}
                          </div>
                        </TableCell>
                        <TableCell align="center">{row.terr_regiao}</TableCell>
                        <TableCell align="center">{row.terr_enderec}</TableCell>
                        <TableCell align="center">{row.terr_link}</TableCell>
                        <TableCell align="center">{row.melhor_dia_hora}</TableCell>
                        <TableCell align="center">{row.melhor_hora}</TableCell>
                        <TableCell align="center">{row.dt_ultvisit}</TableCell>
                        <TableCell align="center">{row.pub_ultvisi}</TableCell>
                        <TableCell align="center">{row.terr_obs}</TableCell>
                        {/* Campo editável de status situacao */}
                        <TableCell align="center" sx={TableCellBDStyle}>
                          <div
                            style={{
                              backgroundColor: getStatusSitColor(statusSit),
                              color: 'white',
                              padding: '2px',
                              borderRadius: '4px',
                              textAlign: 'center',
                              fontSize: '0.65rem',
                            }}
                          >
                            {statusSit}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[]}
              component="div"
              count={dataSugest.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePageSugest}
              sx={{
                '& .MuiTablePagination-toolbar': { fontSize: '0.65rem' },
                '& .MuiTablePagination-selectRoot': { fontSize: '0.65rem' },
                '& .MuiTablePagination-displayedRows': { fontSize: '0.65rem' },
              }}
            />
          </Box>

          <Box>
            <h4 style={{ fontSize: '1.2rem', marginBottom: '16px', color: "#42426F" }}>Designações Efetivadas</h4>
            <Box sx={{ marginTop: '20px' }}>
              <button
                type="button"
                style={{
                  ...buttonStyle,
                  backgroundColor: '#202038',
                  color: '#f1f1f1',
                  transition: 'background-color 0.2s ease',
                  align: 'right',
                  borderRadius: '4px',
                  marginTop: '10px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#67e7eb';
                  e.currentTarget.style.color = '#202038';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#202038';
                  e.currentTarget.style.color = '#f1f1f1';
                }}
                onClick={() => handleOpenImportCarrCampDlg()}
              >
                <FaShareSquare /> Importar Designações - Campo e Carrinho
              </button>

              <button
                type="button"
                style={{
                  ...buttonStyle,
                  backgroundColor: ' #8B4513',
                  color: '#f1f1f1',
                  transition: 'background-color 0.2s ease',
                  align: 'right',
                  borderRadius: '4px',
                  marginLeft: '20px',
                  marginTop: '10px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = ' #67e7eb';
                  e.currentTarget.style.color = ' #202038';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgb(158, 119, 61)';
                  e.currentTarget.style.color = ' #f1f1f1';
                }}
                onClick={() => handleOpenImportMecanicDlg()}
              >
                <FaShareSquare /> Importar Designações - Mecânicas
              </button>

            </Box>
            {message && <Typography variant="body1" sx={{ color: message.includes('Erro') ? 'red' : 'green', marginTop: '10px' }}>{message}</Typography>}

            <TableContainer component={Paper} sx={{ marginTop: '10px' }}>
              <Table>
                <TableHead>
                  <TableRow>

                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Data
                      <FaChevronDown onClick={(event) => handleClick(event, 'dsg_data')} />
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Publicador</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Nome Publicador
                      <FaChevronDown onClick={(event) => handleClick(event, 'pub_nome')} />
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Obs Publicador</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Tipo
                      <FaChevronDown onClick={(event) => handleClick(event, 'dsg_tipo')} />
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Detalhes
                      <FaChevronDown onClick={(event) => handleClick(event, 'dsg_detalhes')} />
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Conselho</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Cod. Mapa / Dia
                      <FaChevronDown onClick={(event) => handleClick(event, 'dsg_mapa_cod')} />
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Horário Ini</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>End. Mapa</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Url. Mapa</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Status
                      <FaChevronDown onClick={(event) => handleClick(event, 'dsg_status')} />
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Desig. OBS</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Ações</TableCell>
                  </TableRow>
                  {/* Menu suspenso para filtros */}
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                  >
                    {filterColumn === 'dsg_detalhes' && (
                      <>
                        <MenuItem onClick={() => handleFilterSelect('')}>Todos</MenuItem>
                        <MenuItem onClick={() => handleFilterSelect('1')}>Casa</MenuItem>
                        <MenuItem onClick={() => handleFilterSelect('2')}>Trabalho</MenuItem>
                        <MenuItem onClick={() => handleFilterSelect('3')}>Prédio</MenuItem>
                        <MenuItem onClick={() => handleFilterSelect('4')}>Atividades</MenuItem>
                      </>
                    )}

                    {filterColumn === 'dsg_status' && (
                      <>
                        <MenuItem onClick={() => handleFilterSelect('')}>Todos</MenuItem>
                        <MenuItem onClick={() => handleFilterSelect('0')}>NÃO DESIGNADA</MenuItem>
                        <MenuItem onClick={() => handleFilterSelect('1')}>PENDENTE</MenuItem>
                        <MenuItem onClick={() => handleFilterSelect('2')}>REALIZADA</MenuItem>
                        <MenuItem onClick={() => handleFilterSelect('3')}>VENCIDA</MenuItem>
                        <MenuItem onClick={() => handleFilterSelect('4')}>ENCERRADA</MenuItem>
                      </>
                    )}

                    {filterColumn === 'dsg_tipo' && (
                      <>
                        <MenuItem onClick={() => handleFilterSelect('')}>Todos</MenuItem>
                        <MenuItem onClick={() => handleFilterSelect('0')}>Mapa</MenuItem>
                        <MenuItem onClick={() => handleFilterSelect('1')}>Indicação</MenuItem>
                        <MenuItem onClick={() => handleFilterSelect('2')}>Dirigente Campo</MenuItem>
                        <MenuItem onClick={() => handleFilterSelect('3')}>Carrinho</MenuItem>
                        <MenuItem onClick={() => handleFilterSelect('4')}>Mídias / Zoom</MenuItem>
                        <MenuItem onClick={() => handleFilterSelect('5')}>Câmera</MenuItem>
                        <MenuItem onClick={() => handleFilterSelect('6')}>Indicador</MenuItem>
                        <MenuItem onClick={() => handleFilterSelect('7')}>Reunião RMWB</MenuItem>
                        <MenuItem onClick={() => handleFilterSelect('8')}>Reunião FDS</MenuItem>
                        <MenuItem onClick={() => handleFilterSelect('9')}>Discurso Público</MenuItem>


                      </>
                    )}

                    {filterColumn === 'dsg_data' && (
                      <>
                        <MenuItem onClick={() => handleFilterSelect('')}>Todos</MenuItem>
                        {/* Gerar dinamicamente as congregações únicos */}
                        {getUniqueDataDesig().map((dsg_data) => (
                          <MenuItem key={dsg_data} onClick={() => handleFilterSelect(dsg_data)}>
                            {dsg_data}
                          </MenuItem>
                        ))}
                      </>
                    )}


                    {filterColumn === 'pub_nome' && (
                      <>
                        <MenuItem onClick={() => handleFilterSelect('')}>Todos</MenuItem>
                        {/* Gerar dinamicamente as congregações únicos */}
                        {getUniquePubDesig().map((pub_nome) => (
                          <MenuItem key={pub_nome} onClick={() => handleFilterSelect(pub_nome)}>
                            {pub_nome}
                          </MenuItem>
                        ))}
                      </>
                    )}
                    {filterColumn === 'dsg_mapa_cod' && (
                      <>
                        <MenuItem onClick={() => handleFilterSelect('')}>Todos</MenuItem>
                        {/* Gerar dinamicamente as congregações únicos */}
                        {getUniqueCodDesig().map((dsg_mapa_cod) => (
                          <MenuItem key={dsg_mapa_cod} onClick={() => handleFilterSelect(dsg_mapa_cod)}>
                            {dsg_mapa_cod}
                          </MenuItem>
                        ))}
                      </>
                    )}

                  </Menu>
                </TableHead>
                <TableBody>
                  {paginatedData.map((row) => {
                    const isEditing = row.desig_id === editRowId;
                    const statusTipo = getStatusTipo(row.dsg_tipo);
                    const statusDesig = getStatusDesig(row.dsg_status);
                    const statusDesigDetalh = getStatusDesigDetalhes(row.dsg_detalhes);
                    return (

                      <TableRow key={row.desig_id}>
                        <TableCell align="center">{isEditing ? <TextField name="dsg_data" value={editedRowData.dsg_data || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.dsg_data}</TableCell>
                        <TableCell align="center">{isEditing ? <TextField name="pub_login" value={editedRowData.pub_login || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.pub_login}</TableCell>
                        <TableCell align="center">{isEditing ? <TextField name="pub_nome" value={editedRowData.pub_nome || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.pub_nome}</TableCell>
                        <TableCell align="center">{isEditing ? <TextField name="pub_obs" value={editedRowData.pub_obs || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.pub_obs}</TableCell>

                        {/* Campo editável de status */}
                        <TableCell align="center">
                          {isEditing ? (
                            <FormControl fullWidth>
                              <Select
                                name="dsg_tipo"
                                value={editedRowData.dsg_tipo || ' '}
                                onChange={handleInputChange}
                              >
                                <MenuItem value="0">Mapa</MenuItem>
                                <MenuItem value="1">Indicação</MenuItem>
                                <MenuItem value="2">Dirigente Campo</MenuItem>
                                <MenuItem value="3">Carrinho</MenuItem>
                                <MenuItem value="4">Mídias / Zoom</MenuItem>
                                <MenuItem value="5">Câmera</MenuItem>
                                <MenuItem value="6">Indicador</MenuItem>
                                <MenuItem value="7">Reunião RMWB</MenuItem>
                                <MenuItem value="8">Reunião FDS</MenuItem>
                                <MenuItem value="9">Discurso Público</MenuItem>
                                <MenuItem value="A">Outros</MenuItem>
                              </Select>
                            </FormControl>
                          ) : (
                            <div
                              style={{
                                backgroundColor: getStatusColorTipo(statusTipo),
                                color: 'white',
                                padding: '2px',
                                borderRadius: '4px',
                                textAlign: 'center',
                                fontSize: '0.65rem',
                              }}
                            >
                              {statusTipo}
                            </div>
                          )}
                        </TableCell>
                        {/* Campo editável de status */}
                        <TableCell align="center">
                          {isEditing ? (
                            <FormControl fullWidth>
                              <Select
                                name="dsg_detalhes"
                                value={editedRowData.dsg_detalhes || ' '}
                                onChange={handleInputChange}
                              >
                                <MenuItem value="1">Casa</MenuItem>
                                <MenuItem value="2">Trabalho</MenuItem>
                                <MenuItem value="3">Prédio Campo</MenuItem>
                                <MenuItem value="4">Atividades</MenuItem>
                              </Select>
                            </FormControl>
                          ) : (
                            <div
                              style={{
                                backgroundColor: getStatusColorDesigDetalhes(statusDesigDetalh),
                                color: 'white',
                                padding: '2px',
                                borderRadius: '4px',
                                textAlign: 'center',
                                fontSize: '0.65rem',
                              }}
                            >
                              {statusDesigDetalh}
                            </div>
                          )}
                        </TableCell>
                        <TableCell align="center">{isEditing ? <TextField name="dsg_conselh" value={editedRowData.dsg_conselh || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.dsg_conselh}</TableCell>
                        <TableCell align="center">{isEditing ? <TextField name="dsg_mapa_cod" value={editedRowData.dsg_mapa_cod || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.dsg_mapa_cod}</TableCell>
                        <TableCell align="center">{isEditing ? <TextField name="dsg_horaini" value={editedRowData.dsg_horaini || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.dsg_horaini}</TableCell>
                        <TableCell align="center">{isEditing ? <TextField name="dsg_mapa_end" value={editedRowData.dsg_mapa_end || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.dsg_mapa_end}</TableCell>
                        <TableCell align="center">{isEditing ? <TextField name="dsg_mapa_url" value={editedRowData.dsg_mapa_url || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.dsg_mapa_url}</TableCell>

                        {/* Campo editável de status */}
                        <TableCell align="center">
                          {isEditing ? (
                            <FormControl fullWidth>
                              <Select
                                name="dsg_status"
                                value={editedRowData.dsg_status || ' '}
                                onChange={handleInputChange}
                              >
                                <MenuItem value="0">Não Designada</MenuItem>
                                <MenuItem value="1">Pendente</MenuItem>
                                <MenuItem value="2">Realizada</MenuItem>
                                <MenuItem value="3">Vencida</MenuItem>
                                <MenuItem value="4">Encerrada</MenuItem>
                                <MenuItem value="5">Pendente</MenuItem>
                              </Select>
                            </FormControl>
                          ) : (
                            <div
                              style={{
                                backgroundColor: getStatusColorDesig(statusDesig),
                                color: 'white',
                                padding: '2px',
                                borderRadius: '4px',
                                textAlign: 'center',
                                fontSize: '0.65rem',
                              }}
                            >
                              {statusDesig}
                            </div>
                          )}
                        </TableCell>
                        <TableCell align="center">{isEditing ? <TextField name="dsg_obs" value={editedRowData.dsg_obs || ''} onChange={handleInputChange} size="small" sx={{ width: '100%' }} /> : row.cod_congreg}</TableCell>
                        <TableCell align="center">
                          {isEditing ? (
                            <Button variant="contained" color="primary" size="small" onClick={handleSave} sx={{ fontSize: '0.65rem', padding: '2px 5px' }}>Salvar</Button>
                          ) : (
                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                              <Button variant="contained" color="primary" size="small" onClick={() => handleEdit(row)} sx={{ fontSize: '0.65rem', padding: '2px 5px' }}>Editar</Button>
                              <Button variant="contained" color="error" size="small" onClick={() => handleDelete(row.desig_id)} sx={{ fontSize: '0.65rem', padding: '2px 5px' }}>Excluir</Button>
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
              rowsPerPageOptions={[]}
              component="div"
              count={FilterDataDesig.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              labelRowsPerPage="Linhas por página:" // Texto personalizado
              sx={{
                '& .MuiTablePagination-toolbar': { fontSize: '0.65rem' },
                '& .MuiTablePagination-selectRoot': { fontSize: '0.65rem' },
                '& .MuiTablePagination-displayedRows': { fontSize: '0.65rem' },
              }}
            />
          </Box>

          {/* Botão para abrir o formulário */}
          <button
            type="button"
            style={{
              ...buttonStyle,
              backgroundColor: showNewDesignCForm ? '#67e7eb' : '#202038',
              color: showNewDesignCForm ? '#202038' : '#f1f1f1',
            }}
            onMouseEnter={(e) => {
              if (!showNewDesignCForm) {
                e.currentTarget.style.backgroundColor = '#67e7eb'; // Cor ao passar o mouse
                e.currentTarget.style.color = '#202038'; // Cor do texto ao passar o mouse
              }
            }}
            onMouseLeave={(e) => {
              if (!showNewDesignCForm) {
                e.currentTarget.style.backgroundColor = '#202038'; // Cor original
                e.currentTarget.style.color = '#f1f1f1'; // Cor do texto original
              }
            }}
            onClick={handleNovoBotao}
          >
            <FaUserPlus /> Nova Designação
          </button>
        </Box>
      </Box>
      {/* Formulário de nova indicação */}
      <Box sx={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', display: showNewDesignCForm ? 'block' : 'none' }}>
        <form onSubmit={handleNewDesignCSubmit}>
          <Box sx={formBoxStyle}>
            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <TextField label="Public. Login *" variant="outlined" size="small" fullWidth value={newDesignC.pub_login} onChange={(e) => setNewDesignC({ ...newDesignC, pub_login: e.target.value })} sx={inputStyle} />
            </Box>
            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <TextField label="Public. Nome *" variant="outlined" size="small" fullWidth value={newDesignC.pub_nome} onChange={(e) => setNewDesignC({ ...newDesignC, pub_nome: e.target.value })} sx={inputStyle} />
            </Box>
            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <TextField label="Public. Obs *" variant="outlined" size="small" fullWidth value={newDesignC.pub_obs} onChange={(e) => setNewDesignC({ ...newDesignC, pub_obs: e.target.value })} sx={inputStyle} />
            </Box>
            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <TextField label="Tp. Designação *" variant="outlined" size="small" fullWidth value={newDesignC.dsg_tipo} onChange={(e) => setNewDesignC({ ...newDesignC, dsg_tipo: e.target.value })} sx={inputStyle} />
            </Box>
            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <TextField label="Detalhes Designação " variant="outlined" size="small" fullWidth value={newDesignC.dsg_detalhes} onChange={(e) => setNewDesignC({ ...newDesignC, dsg_detalhes: e.target.value })} sx={inputStyle} />
            </Box>
            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <TextField label="Conselho " variant="outlined" size="small" fullWidth value={newDesignC.dsg_conselh} onChange={(e) => setNewDesignC({ ...newDesignC, dsg_conselh: e.target.value })} sx={inputStyle} />
            </Box>
            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <TextField label="Cod. Mapa " variant="outlined" size="small" fullWidth value={newDesignC.dsg_mapa_cod} onChange={(e) => setNewDesignC({ ...newDesignC, dsg_mapa_cod: e.target.value })} sx={inputStyle} />
            </Box>
            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <TextField label="Horário Inicio: " variant="outlined" size="small" fullWidth value={newDesignC.dsg_horaini} onChange={(e) => setNewDesignC({ ...newDesignC, dsg_horaini: e.target.value })} sx={inputStyle} />
            </Box>
            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <TextField label="End. Mapa " variant="outlined" size="small" fullWidth value={newDesignC.dsg_mapa_end} onChange={(e) => setNewDesignC({ ...newDesignC, dsg_mapa_end: e.target.value })} sx={inputStyle} />
            </Box>
            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <TextField label="URL. Mapa " variant="outlined" size="small" fullWidth value={newDesignC.dsg_mapa_url} onChange={(e) => setNewDesignC({ ...newDesignC, dsg_mapa_url: e.target.value })} sx={inputStyle} />
            </Box>
            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <FormControl fullWidth>
                <InputLabel id="status-label">Status Designação</InputLabel>
                <Select
                  labelId="status-label"
                  id="dsg_status"
                  value={newDesignC.dsg_status}
                  label="Situação *"
                  onChange={(e) => setNewDesignC({ ...newDesignC, dsg_status: e.target.value })}
                >
                  <MenuItem value="0">Não Designada</MenuItem>
                  <MenuItem value="1">Pendente</MenuItem>
                  <MenuItem value="2">Realizada</MenuItem>
                  <MenuItem value="3">Vencida</MenuItem>
                  <MenuItem value="4">Realizada</MenuItem>
                  <MenuItem value="5">Encerrada</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <TextField label="OBS Desig. " variant="outlined" size="small" fullWidth value={newDesignC.obs} onChange={(e) => setNewDesignC({ ...newDesignC, obs: e.target.value })} sx={inputStyle} />
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
            > <FaShareSquare /> Enviar Designação</button>
          </Box>
        </form>
        {message && <Typography variant="body1" sx={{ color: message.includes('Erro') ? 'red' : 'green', marginTop: '10px' }}>{message}</Typography>}
      </Box>

      <Dialog
        open={openImportCarrDialog}
        onClose={() => setOpenImportCarrDialog(false)}
        maxWidth="sm"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            minHeight: '300px',
            maxHeight: '400px',
          },
        }}
      >
        <DialogTitle>Importar Designações de Carrinho e Dirigente</DialogTitle>
        <DialogContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="body2" sx={{ marginBottom: '16px' }}>
            Selecione um arquivo Excel para importar as designações:
          </Typography>
          {displayMessage && (
            <Typography
              variant="body2"
              sx={{
                color: messageColor,
                marginBottom: '16px',
                fontStyle: 'italic',
                fontSize: '12px',
                textAlign: 'center',
              }}
            >
              {displayMessage}
            </Typography>
          )}
          <Button
            variant="contained"
            component="label"
            style={{
              backgroundColor: '#202038',
              color: '#f1f1f1',
              marginBottom: '16px',
            }}
          >
            <FaUpload style={{ marginRight: '6px' }} />
            Selecione a Planilha
            <input
              type="file"
              accept=".xlsx, .xls"
              hidden
              onChange={handleUploadCarrinhCombined}
            />
          </Button>

        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleSubmitCombinedCarrinh}
            color="primary"
            disabled={isLoading}
          >
            {isLoading ? 'Processando...' : 'Importar'}
          </Button>
          <Button
            onClick={() => setOpenImportCarrDialog(false)}
            color="primary"
            disabled={isLoading}
          >
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openImportMecanicDialog}
        onClose={() => setOpenImportMecanicDialog(false)}
        maxWidth="sm"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            minHeight: '300px',
            maxHeight: '400px',
          },
        }}
      >
        <DialogTitle>Importar Designações Mecânicas - Reunião</DialogTitle>
        <DialogContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="body2" sx={{ marginBottom: '16px' }}>
            Selecione um arquivo Excel para importar as designações:
          </Typography>
          {displayMessage && (
            <Typography
              variant="body2"
              sx={{
                color: messageColor,
                marginBottom: '16px',
                fontStyle: 'italic',
                fontSize: '12px',
                textAlign: 'center',
              }}
            >
              {displayMessage}
            </Typography>
          )}
          <Button
            variant="contained"
            component="label"
            style={{
              backgroundColor: '#8B4513',
              color: '#f1f1f1',
              marginBottom: '16px',
            }}
          >
            <FaUpload style={{ marginRight: '6px' }} />
            Selecione a Planilha
            <input
              type="file"
              accept=".xlsx, .xls"
              hidden
              onChange={handleUploadMecanicType456}
            />
          </Button>

        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleSubmitMecanicType456}

            color="primary"
            disabled={isLoading}
          >
            {isLoading ? 'Processando...' : 'Importar'}
          </Button>
          <Button
            onClick={() => setOpenImportMecanicDialog(false)}
            color="primary"
            disabled={isLoading}
          >
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>

      <Backdrop
        sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
        open={isLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

    </Box>
  );
};

export default DesigForm;
