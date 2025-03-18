import logo from './logo.svg';
import './App.css';
import '@coreui/coreui/dist/css/coreui.min.css'
import Sidebar from './components/Sidebar';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Dashboard from './components/Dashboard';
import { CContainer, CRow, CCol } from '@coreui/react';
import Home from './components/Home';
import Customers from './components/Customers';

function App() {
  return (
    <>
      <BrowserRouter>
      <CContainer>
        <CRow>
          <CCol >
        <Sidebar/>
          </CCol>
          <CCol  xs={9} className='border m-5'>
        <Routes>
          <Route path='/dashboard' element={<Dashboard/>}/>
          <Route path='/home' element={<Home/>}/>
          <Route path='/customers' element={<Customers/>}/>
        </Routes>
          </CCol>
        </CRow>
      </CContainer>
      </BrowserRouter>
    </>
  );
}

export default App;
