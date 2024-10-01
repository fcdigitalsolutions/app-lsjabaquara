// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Sidebar        from './components/Sidebar'; // Importe o componente que contém a Sidebar
import LoginForm      from './pages/LoginForm';
import RegionForm     from './pages/RegionForm'; // Importe os componentes das páginas
import CongregForm    from './pages/CongregForm';
import CongregDash    from './pages/CongregDash';
import IndicaDash     from './pages/IndicaDash';
import IndicaForm     from './pages/IndicaForm';
import IndicaFormOFF  from './pages/IndicaFormOFF';
import RegNCDash      from './pages/RegistroNCDash';
import RegistroNC     from './pages/RegistroNC';
import RegistroNCOff  from './pages/RegistroNCOff';
import RastreaDash    from './pages/RastreaDash';
import RastreaForm    from './pages/RastreaForm';
import EnderecForm    from './pages/EnderecForm';

import RelCampForm    from './pages/RelCampForm';

import './styles/App.css'; // Verifique se o caminho está correto

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/regist-ncoff" element={<RegistroNCOff />} />
        <Route path="/indic-formoff" element={<IndicaFormOFF />} />
        <Route path="/relatoriocampo"  element={<RelCampForm />} />
        <Route
          path="/home/*"
          element={
            <Sidebar>
              <Routes>
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
                <Route path="login" element={<LoginForm />} />
              </Routes>
            </Sidebar>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
