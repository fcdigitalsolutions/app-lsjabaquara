import React, { useState, useEffect } from "react";
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

  // Carregar dados das rotas
  useEffect(() => {
    api_service.get("/rvisitall").then((response) => setVisitData(response.data));
    api_service.get("/territall").then((response) => setTerritoryData(response.data));
  }, []);

  // Processamento dos gráficos principais
  useEffect(() => {
    if (visitData.length > 0 && territoryData.length > 0) {
      processTerritoryData(visitData);
      processRegionData(visitData, territoryData);
      processStatusData(territoryData);
      processVisitStatusData(visitData);
    }
  }, [visitData, territoryData, selectedYear, selectedPeriod]);

  // Funções de processamento para cada gráfico
  const processTerritoryData = (data) => {
    const now = new Date();
    const filteredData = data.filter((visit) => {
      const [day, month, year] = visit.visit_data.split("/");
      const visitDate = new Date(`${year}-${month}-${day}`);
      const diffInMonths =
        (now.getFullYear() - visitDate.getFullYear()) * 12 +
        (now.getMonth() - visitDate.getMonth());
      return diffInMonths <= selectedPeriod && year === selectedYear;
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

    const totalVisits = filteredData.length;
    const mostVisited = chartData.sort((a, b) => b.visitas - a.visitas)[0] || {};
    setTerritorySummary({
      totalVisits,
      mostVisited: mostVisited.territory || "N/A",
      mostVisitedCount: mostVisited.visitas || 0,
    });
  };

  const processRegionData = (visitas, territories) => {
    const now = new Date();
    const filteredVisits = visitas.filter((visit) => {
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

    const regionCounts = filteredVisits.reduce((acc, visit) => {
      const region = territoryMap[visit.visit_cod] || "Região Desconhecida";
      acc[region] = (acc[region] || 0) + 1;
      return acc;
    }, {});

    const chartData = Object.entries(regionCounts).map(([key, value]) => ({
      região: key,
      visitas: value,
    }));

    setRegionChartData(chartData);

    const totalVisits = filteredVisits.length;
    const mostVisited = chartData.sort((a, b) => b.visitas - a.visiats)[0] || {};
    setRegionSummary({
      totalVisits,
      mostVisited: mostVisited.region || "N/A",
      mostVisitedCount: mostVisited.visitas || 0,
    });
  };

  const processStatusData = (territories) => {
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
  };

  const processVisitStatusData = (data) => {
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
  };

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

  return (
    <Box sx={{ padding: "16px", backgroundColor: "#f5f5f5" }}>
      <Typography variant="h4" sx={{ marginBottom: "20px" }}>
        Painel de Gestão - Visões
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
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
            <Typography variant="body1">Total de Visitas: {territorySummary.totalVisits}</Typography>
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
                    <Typography variant="body1">Total de Visitas: {regionSummary.totalVisits}</Typography>
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
