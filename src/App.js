// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import SidebarUser from './components/SidebarUser';
import PrivateRoute from './components/PrivateRoute';
import SelectTpUser from './components/SelectTpUser';
import LoginForm from './pages/LoginForm';
import FormUserView from './pages/FormUserView';
import RegionForm from './pages/RegionForm';
import CongregForm from './pages/CongregForm';
import IndicaForm from './pages/IndicaForm';
import IndicaFormOFF from './pages/IndicaFormOFF';
import RegistroNCOff from './pages/RegistroNCOff';
import EnderecForm from './pages/EnderecForm';
import RelCampForm from './pages/RelCampForm';
import PubcForm from './pages/PubcForm';
import DesigForm from './pages/DesigForm';
import UsersForm from './pages/UsersForm';
import RelVisitForm from './pages/RelVisitForm';
import FormUserViewEnsino from './pages/FormUserViewEnsino';
import FormUserViewDesig from './pages/FormUserViewDesig';
import FormUserViewOutras from './pages/FormUserViewOutras';
import ConfigCampoForm from './pages/ConfigCampoForm';
import FormUserViewAnota from './pages/FormUserViewAnota';

import { ThemeProvider } from './components/ThemeContext';

import './styles/App.css';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/regist-ncoff" element={<RegistroNCOff />} />
        <Route path="/indic-formoff" element={<IndicaFormOFF />} />

        {/* Rota para a página de seleção de modo, apenas para administradores */}
        <Route
          path="/ls"
          element={
            <PrivateRoute
              adminOnly={true}
              adminComponent={() => <SelectTpUser />} // Passa SelectTpUser como função anônima
            />
          }
        />

        {/* Rotas para usuários simples usando SidebarUser */}
        <Route
          path="/huser/*"
          element={
            <PrivateRoute
              userComponent={() => (
                <ThemeProvider>
                <SidebarUser>
                  <Routes> 
                    <Route path="formuseroutras" element={<FormUserViewOutras />} />
                    <Route path="form-userview" element={<FormUserView />} />
                    <Route path="formuserensino" element={<FormUserViewEnsino />} />
                    <Route path="formuseranota" element={<FormUserViewAnota />} />
                    <Route path="formuserdesig" element={<FormUserViewDesig />} />
                    <Route path="relatoriocampo" element={<RelCampForm />} />
                    <Route path="/ls" element={<SelectTpUser />} />
                  </Routes>
                </SidebarUser>
                </ThemeProvider>
              )}
            />
          }
        />

        {/* Rotas para administradores usando Sidebar */}
        <Route
          path="/home/*"
          element={
            <PrivateRoute
              adminOnly={true}
              adminComponent={() => (
                <Sidebar>
                  <Routes>
                    <Route path="form-region" element={<RegionForm />} />
                    <Route path="form-congreg" element={<CongregForm />} />
                    <Route path="form-indicac" element={<IndicaForm />} />
                    <Route path="form-enderec" element={<EnderecForm />} />
                    <Route path="form-pubc" element={<PubcForm />} />
                    <Route path="form-cfgcamp" element={<ConfigCampoForm />} />
                    <Route path="form-desig" element={<DesigForm />} />
                    <Route path="form-visit" element={<RelVisitForm />} />
                    <Route path="form-users" element={<UsersForm />} />
                    <Route path="/ls" element={<SelectTpUser />} />
                  </Routes>
                </Sidebar>
              )}
            />
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
