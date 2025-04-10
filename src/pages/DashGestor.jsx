import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import api_service from "../services/api_service";

const DashGestor = () => {
  const [visitCelebraData, setVisitCelebrData] = useState([]);
  const [visitComercData, setVisitComercData] = useState([]);
  const [visitData, setVisitData] = useState([]);
  const [territoryData, setTerritoryData] = useState([]);

  // Filtros globais
  const [selectedYear, setSelectedYear] = useState("2024");
  const [selectedPeriod, setSelectedPeriod] = useState(3);

  // Filtros e dados de gráficos individuais
  const [territoryChartData, setTerritoryChartData] = useState([]);
  const [territorySummary, setTerritorySummary] = useState({});
  const [regionChartData, setRegionChartData] = useState([]);
  const [regionSummary, setRegionSummary] = useState({});
  const [statusChartData, setStatusChartData] = useState([]);
  const [statusSummary, setStatusSummary] = useState({});
  const [visitStatusChartData, setVisitStatusChartData] = useState([]);
  const [visitStatusSummary, setVisitStatusSummary] = useState({});

  const [chartData, setChartData] = useState([]);
  const [summary, setSummary] = useState({
    totalVisits: 0,
    totalTerritorios: 0,
    totalSurdos: 0,
    familyVisits: 0,
    foundVisits: 0,
    otherVisits: 0,
  });
  const [experienceText, setExperienceText] = useState("");

  // Carregar dados das rotas
  useEffect(() => {
    api_service.get("/rvisitall").then((response) => setVisitData(response.data));
    api_service.get("/rvisicelebr").then((response) => setVisitCelebrData(response.data));
     api_service.get("/rvisicomerc").then((response) => setVisitComercData(response.data));
    api_service.get("/territall").then((response) => setTerritoryData(response.data));
  }, []);

  // Funções de processamento com `useCallback`
  const processTerritoryData = useCallback((data) => {
    const now = new Date();
    const filteredData = data.filter((visit) => {
      if (!visit.visit_data) return false; // Ignorar visitas sem data
      const [day, month, year] = visit.visit_data.split("/");
      const visitDate = new Date(`${year}-${month}-${day}`);
      const diffInMonths =
        (now.getFullYear() - visitDate.getFullYear()) * 12 +
        (now.getMonth() - visitDate.getMonth());
      return (
        diffInMonths <= selectedPeriod &&
        year === selectedYear &&
        visit.terr_tp_local === "2" // Filtra apenas território comercial
      );
    });

    const territoryCounts = filteredData.reduce((acc, visit) => {
      acc[visit.visit_cod] = (acc[visit.visit_cod] || 0) + 1;
      return acc;
    }, {});

    const chartData = Object.entries(territoryCounts).map(([key, value]) => ({
      territorios: key,
      visitas: value,
    }));

    setTerritoryChartData(chartData);

    const totalVisitas = filteredData.length;
    const mostVisited = chartData.sort((a, b) => b.visitas - a.visitas)[0] || {};
    setTerritorySummary({
      totalVisitas,
      mostVisited: mostVisited.territorios || "N/A",
      mostVisitedCount: mostVisited.visitas || 0,
    });
  }, [selectedYear, selectedPeriod]);

  const processRegionData = useCallback((visitas, territories) => {
    const now = new Date();
    const filteredVisitas = visitas.filter((visit) => {
      if (!visit.visit_data) return false; // Ignorar visitas sem data
      const [day, month, year] = visit.visit_data.split("/");
      const visitDate = new Date(`${year}-${month}-${day}`);
      const diffInMonths =
        (now.getFullYear() - visitDate.getFullYear()) * 12 +
        (now.getMonth() - visitDate.getMonth());
      return diffInMonths <= selectedPeriod && year === selectedYear;
    });

    const territoryMap = territories.reduce((acc, territory) => {
      acc[territory.terr_nome] = territory.terr_regiao;
      return acc;
    }, {});

    const regionCounts = filteredVisitas.reduce((acc, visit) => {
      const region = territoryMap[visit.visit_cod] || "Região Desconhecida";
      acc[region] = (acc[region] || 0) + 1;
      return acc;
    }, {});

    const chartData = Object.entries(regionCounts).map(([key, value]) => ({
      region: key,
      visitas: value,
    }));

    setRegionChartData(chartData);

    const totalVisitas = filteredVisitas.length;
    const mostVisited = chartData.sort((a, b) => b.visitas - a.visitas)[0] || {};
    setRegionSummary({
      totalVisitas,
      mostVisited: mostVisited.region || "N/A",
      mostVisitedCount: mostVisited.visitas || 0,
    });
  }, [selectedYear, selectedPeriod]);

  const processStatusData = useCallback((territories) => {
    if (!territories || territories.length === 0) return;

    const statusCounts = territories.reduce((acc, territory) => {
      const color = getStatusMapCor(territory.terr_cor);
      acc[color] = (acc[color] || 0) + 1;
      return acc;
    }, {});

    const chartData = Object.entries(statusCounts).map(([key, value]) => ({
      color: key,
      quantidade: value,
    }));

    setStatusChartData(chartData);

    const mostFrequentColor = chartData.sort((a, b) => b.quantidade - a.quantidade)[0] || {};
    setStatusSummary({
      totalColors: chartData.reduce((sum, item) => sum + item.quantidade, 0),
      mostFrequentColor: mostFrequentColor.color || "N/A",
      mostFrequentCount: mostFrequentColor.quantidade || 0,
    });
  }, []);

  const processVisitStatusData = useCallback((data) => {
    if (!data || data.length === 0) return;

    const statusCounts = data.reduce((acc, visit) => {
      if (visit.visit_status === "Não") {
        acc[visit.visit_cod] = (acc[visit.visit_cod] || 0) + 1;
      }
      return acc;
    }, {});

    const chartData = Object.entries(statusCounts).map(([key, value]) => ({
      territory: key,
      quantidade: value,
    }));

    setVisitStatusChartData(chartData);

    const mostFrequent = chartData.sort((a, b) => b.quantidade - a.quantidade)[0] || {};
    setVisitStatusSummary({
      total: chartData.reduce((sum, item) => sum + item.quantidade, 0),
      mostFrequentTerritory: mostFrequent.territory || "N/A",
      mostFrequentCount: mostFrequent.quantidade || 0,
    });
  }, []);

  const getStatusMapCor = (terr_cor) => {
    switch (terr_cor) {
      case "0":
        return "Masculino";
      case "1":
        return "Feminino";
      case "2":
        return "Casal ou Família";
      default:
        return "Outros";
    }
  };


  // Função para determinar o status da visita
  const getStatusVisit = (visit_status) => {
    switch (visit_status) {
      case "Não":
        return "Não";
      case "Sim":
        return "Sim";
      case "Carta":
        return "Carta";
      case "Família":
        return "Família";
      case "Outros":
        return "Outros";
      default:
        return "Desconhecido";
    }
  };

  // Processar dados para o gráfico
  const processChartData = useCallback(() => {
    const startDate = new Date(`${selectedYear}-03-08`);
    const endDate = new Date(`${selectedYear}-04-12`);

    // Filtrar dados por período e tipo de local (excluindo Trabalho)
    const filteredCelebrData = visitCelebraData.filter((visit) => {
      if (!visit.visit_data) return false;
      const [day, month, year] = visit.visit_data.split("/");
      const visitDate = new Date(`${year}-${month}-${day}`);

      return (
        visitDate >= startDate &&
        visitDate <= endDate &&
        year === selectedYear
      );
    });

     // Filtrar dados por período e tipo de local (excluindo Trabalho)
     const filteredComercData = visitComercData.filter((visit) => {
      if (!visit.visit_data) return false;
      const [day, month, year] = visit.visit_data.split("/");
      const visitDate = new Date(`${year}-${month}-${day}`);

      return (
        visitDate >= startDate &&
        visitDate <= endDate &&
        year === selectedYear
      );
    });

    let familyCount = 0;
    let foundCount = 0;
    let otherCount = 0;
    let totalVisits = 0;
    let totalTerritorios = 0;
    let totalSurdos = 0;
    let experienceText = "";

    filteredCelebrData.forEach((visit) => {
      const type = getStatusVisit(visit.visit_status);
      totalVisits++;
      totalTerritorios = visit.terr_total; 
      totalSurdos = visit.terr_totsurdos; 

      if (type === "Família") {
        familyCount++;
      } else if (type === "Sim") {
        foundCount++;
      } else {
        otherCount++;
      }

      // Buscar experiência nas observações
      if (visit.terr_obs && visit.terr_obs.includes("Experiência:")) {
        experienceText = visit.terr_obs.split("Experiência:")[1].trim();
      }
    });

    filteredComercData.forEach((visit) => {
      const type = getStatusVisit(visit.visit_status);
      totalVisits++;
      totalTerritorios = visit.terr_total; 
      totalSurdos = visit.terr_totsurdos; 

      if (type === "Família") {
        familyCount++;
      } else if (type === "Sim") {
        foundCount++;
      } else {
        otherCount++;
      }

      // Buscar experiência nas observações
      if (visit.terr_obs && visit.terr_obs.includes("Experiência:")) {
        experienceText = visit.terr_obs.split("Experiência:")[1].trim();
      }
    });

    setChartData([
      { name: "Família", visitas: familyCount },
      { name: "Sim", visitas: foundCount },
      { name: "Outros", visitas: otherCount },
    ]);

    setSummary({
      totalVisits,
      totalTerritorios,
      totalSurdos,
      familyVisits: familyCount,
      foundVisits: foundCount,
      otherVisits: otherCount,
    });

    setExperienceText(experienceText);
  }, [visitCelebraData, selectedYear]);

  useEffect(() => {
    if (visitCelebraData.length > 0) {
      processChartData();
    }
  }, [visitCelebraData, selectedYear, processChartData]);

  // Atualizar gráficos quando dados ou filtros mudam
  useEffect(() => {
    if (visitCelebraData.length > 0 && territoryData.length > 0) {
      processTerritoryData(visitCelebraData);
      processRegionData(visitCelebraData, territoryData);
      processStatusData(territoryData);
      processVisitStatusData(visitCelebraData);
    }
  }, [visitCelebraData, territoryData, processTerritoryData, processRegionData, processStatusData, processVisitStatusData]);

 
  return (
    <Box sx={{ padding: "16px", backgroundColor: "#f5f5f5" }}>
      <Typography variant="h4" sx={{ marginBottom: "20px" }}>
        Painel de Gestão - Visões
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 4 }}>

        {/* Gráfico e Painel - Trabalho Território Comercios */}
        <Box
          sx={{
            flex: "1 1 45%",
            minWidth: "250px",
            backgroundColor: "#f9f9f9",
            padding: "16px",
            borderRadius: "8px"
          }}
        >
          {/* Filtro por ano */}
          <Box sx={{ display: "flex", gap: 2, marginBottom: "20px" }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Ano</InputLabel>
              <Select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                {[2023, 2024, 2025, 2026].map((year) => (
                  <MenuItem key={year} value={year.toString()}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Título */}
          <Typography variant="h6" sx={{ marginBottom: "10px" }}>
            Trabalho Território Comércios ({selectedYear})
          </Typography>

          {/* Gráfico */}
          <Box sx={{ height: "200px" }}>
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="visitas" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Box>

          {/* Resumo */}
          <Box sx={{ marginTop: "20px" }}>
            <Typography variant="body1">
              Total de Endereços: <strong>{summary.totalTerritorios} </strong> (<strong>{summary.totalSurdos} </strong> Surdos) 
            </Typography> 
            <Typography variant="body1">
              Total de Visitas: <strong>{summary.totalVisits}</strong>
            </Typography>
            <Typography variant="body1">
              Convites entregues <strong>para a Família: {summary.familyVisits} / ({(summary.familyVisits / summary.totalVisits * 100).toFixed(2)}%)</strong>
            </Typography>
            <Typography variant="body1">
              Convites entregues direto <strong>para os Surdos: {summary.foundVisits} / ({(summary.foundVisits / summary.totalVisits * 100).toFixed(2)}%)</strong>
            </Typography>
            <Typography variant="body1">
              Outros: <strong>{summary.otherVisits}</strong>
            </Typography>
          </Box>

          {/* Rodapé com Experiência */}
          {experienceText && (
            <Box sx={{ marginTop: "10px", padding: "8px", backgroundColor: "#e0f7fa", borderRadius: "4px" }}>
              <Typography variant="body2">
                <strong>Experiência:</strong> {experienceText}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Gráfico e Painel - Campanha de Celebração */}
        <Box
          sx={{
            flex: "1 1 45%",
            minWidth: "250px",
            backgroundColor: "#f9f9f9",
            padding: "16px",
            borderRadius: "8px"
          }}
        >
          {/* Filtro por ano */}
          <Box sx={{ display: "flex", gap: 2, marginBottom: "20px" }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Ano</InputLabel>
              <Select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                {[2023, 2024, 2025, 2026].map((year) => (
                  <MenuItem key={year} value={year.toString()}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Título */}
          <Typography variant="h6" sx={{ marginBottom: "10px" }}>
            Campanha de Celebração ({selectedYear})
          </Typography>

          {/* Gráfico */}
          <Box sx={{ height: "200px" }}>
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="visitas" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Box>

          {/* Resumo */}
          <Box sx={{ marginTop: "20px" }}>
            <Typography variant="body1">
              Total de Endereços: <strong>{summary.totalTerritorios} </strong> (<strong>{summary.totalSurdos} </strong> Surdos) 
            </Typography> 
            <Typography variant="body1">
              Total de Visitas: <strong>{summary.totalVisits}</strong>
            </Typography>
            <Typography variant="body1">
              Convites entregues <strong>para a Família: {summary.familyVisits} / ({(summary.familyVisits / summary.totalVisits * 100).toFixed(2)}%)</strong>
            </Typography>
            <Typography variant="body1">
              Convites entregues direto <strong>para os Surdos: {summary.foundVisits} / ({(summary.foundVisits / summary.totalVisits * 100).toFixed(2)}%)</strong>
            </Typography>
            <Typography variant="body1">
              Outros: <strong>{summary.otherVisits}</strong>
            </Typography>
          </Box>

          {/* Rodapé com Experiência */}
          {experienceText && (
            <Box sx={{ marginTop: "10px", padding: "8px", backgroundColor: "#e0f7fa", borderRadius: "4px" }}>
              <Typography variant="body2">
                <strong>Experiência:</strong> {experienceText}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Gráfico e Painel - Territórios */}
        <Box sx={{ flex: "1 1 45%", minWidth: "250px", backgroundColor: "#f9f9f9", padding: "16px", borderRadius: "8px" }}>
          <Box sx={{ display: "flex", gap: 2, marginBottom: "20px" }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Ano</InputLabel>
              <Select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                {[2023, 2024, 2025, 2026].map((year) => (
                  <MenuItem key={year} value={year.toString()}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Período</InputLabel>
              <Select value={selectedPeriod} onChange={(e) => setSelectedPeriod(Number(e.target.value))}>
                <MenuItem value={3}>Últimos 3 Meses</MenuItem>
                <MenuItem value={6}>Últimos 6 Meses</MenuItem>
                <MenuItem value={12}>Últimos 12 Meses</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Typography variant="h6" sx={{ marginBottom: "10px" }}>Visitas por Território</Typography>
          <Box sx={{ height: "200px" }}>
            <ResponsiveContainer>
              <BarChart data={territoryChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="territory" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="visitas" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
          <Box sx={{ marginTop: "20px" }}>
            <Typography variant="body1">Total de Visitas: {territorySummary.totalVisitas}</Typography>
            <Typography variant="body1">Território Mais Visitado: {territorySummary.mostVisited} ({territorySummary.mostVisitedCount} Visitas)</Typography>
          </Box>
        </Box>


        {/* Gráfico e Painel - Regiões */}
        <Box sx={{ flex: "1 1 45%", minWidth: "250px", backgroundColor: "#f9f9f9", padding: "16px", borderRadius: "8px" }}>
          <Typography variant="h6" sx={{ marginBottom: "10px" }}>Visitas por Região</Typography>
          <Box sx={{ height: "200px" }}>
            <ResponsiveContainer>
              <BarChart data={regionChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="region" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="visitas" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
          <Box sx={{ marginTop: "20px" }}>
            <Typography variant="body1">Total de Visitas: {regionSummary.totalVisitas}</Typography>
            <Typography variant="body1">Região Mais Visitada: {regionSummary.mostVisited} ({regionSummary.mostVisitedCount} Visitas)</Typography>
          </Box>
        </Box>
        {/* Gráfico e Painel - Cores */}
        <Box sx={{ flex: "1 1 45%", minWidth: "250px", backgroundColor: "#f9f9f9", padding: "16px", borderRadius: "8px" }}>
          <Typography variant="h6" sx={{ marginBottom: "10px" }}>Distribuição por Tipo/Gênero</Typography>
          <Box sx={{ height: "200px" }}>
            <ResponsiveContainer>
              <BarChart data={statusChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="color" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="quantidade" fill="#FF6F61" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
          <Box sx={{ marginTop: "20px" }}>
            <Typography variant="body1">Total Geral: {statusSummary.totalColors}</Typography>
            <Typography variant="body1">Tipo Mais Frequente: {statusSummary.mostFrequentColor} ({statusSummary.mostFrequentCount} vezes)</Typography>
          </Box>
        </Box>


        {/* Gráfico e Painel - Status de Visitas */}
        <Box sx={{ flex: "1 1 45%", minWidth: "250px", backgroundColor: "#f9f9f9", padding: "16px", borderRadius: "8px" }}>
          <Typography variant="h6" sx={{ marginBottom: "10px" }}>Territórios com Status "Não Encontrado"</Typography>
          <Box sx={{ height: "200px" }}>
            <ResponsiveContainer>
              <BarChart data={visitStatusChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="territory" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="quantidade" fill="#FFA726" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
          <Box sx={{ marginTop: "20px" }}>
            <Typography variant="body1">Total de "Não": {visitStatusSummary.total}</Typography>
            <Typography variant="body1">Mais Frequente: {visitStatusSummary.mostFrequentTerritory} ({visitStatusSummary.mostFrequentCount} vezes)</Typography>
          </Box>
        </Box>

      </Box>
    </Box>
  );
};

export default DashGestor;
