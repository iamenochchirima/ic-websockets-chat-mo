import React from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from './Components/Layout';
import PingPong from './Components/PingPong';
import Chat from './Components/Chat';

const App = () => {
  return (
    <BrowserRouter>
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<PingPong />} />
        <Route path="/chat" element={<Chat />} />
      </Route>
    </Routes>
  </BrowserRouter>
  )
}

export default App