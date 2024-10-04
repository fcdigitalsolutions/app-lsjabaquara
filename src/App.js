// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import PrivateRoute from './components/PrivateRoute'; // O componente que verifica a autenticação
import LoginForm from './pages/LoginForm';
import RegionForm from './pages/RegionForm';
import CongregForm from './pages/CongregForm';
import CongregDash from './pages/CongregDash';
import IndicaForm from './pages/IndicaForm';
import IndicaDash from './pages/IndicaDash';
import IndicaFormOFF from './pages/IndicaFormOFF';
import RegNCDash from './pages/RegistroNCDash';
import RegistroNC from './pages/RegistroNC';
import RegistroNCOff from './pages/RegistroNCOff';
import RastreaDash from './pages/RastreaDash';
import RastreaForm from './pages/RastreaForm';
import EnderecForm from './pages/EnderecForm';
import RelCampForm from './pages/RelCampForm';

import './styles/App.css'; // Certifique-se de que o caminho está correto

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Rota pública para login */}
        <Route path="/" element={<LoginForm />} />
        <Route path="/regist-ncoff" element={<RegistroNCOff />} />
        <Route path="/indic-formoff" element={<IndicaFormOFF />} />
        <Route path="/relatoriocampo" element={<RelCampForm />} />

        {/* Proteger a rota base /home com PrivateRoute */}
        <Route
          path="/home/*"
          element={
            <PrivateRoute component={() => (
              <Sidebar>
                <Routes>
                  {/* Rotas protegidas */}
                  <Route path="form-region" element={<RegionForm />} />
                  <Route path="form-congreg" element={<CongregForm />} />
                  <Route path="dash-congreg" element={<CongregDash />} />
                  <Route path="form-indicac" element={<IndicaForm />} />
                  <Route path="dash-indicac" element={<IndicaDash />} />
                  <Route path="form-registnc" element={<RegistroNC />} />
                  <Route path="dash-registnc" element={<RegNCDash />} />
                  <Route path="form-rastrea" element={<RastreaForm />} />
                  <Route path="dash-rastrea" element={<RastreaDash />} />
                  <Route path="form-enderec" element={<EnderecForm />} />
                </Routes>
              </Sidebar>
            )} />
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
