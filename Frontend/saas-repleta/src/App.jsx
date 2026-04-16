import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Kit from './pages/Kit';
import Planilhas from './pages/Planilhas';
import Clonagem from './pages/Clonagem';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="kit" element={<Kit />} />
          <Route path="planilhas" element={<Planilhas />} />
          <Route path="clonagem" element={<Clonagem />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}