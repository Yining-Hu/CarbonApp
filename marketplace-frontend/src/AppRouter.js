import React from 'react'
import {BrowserRouter, Routes, Route } from "react-router-dom"

import TokenMint from './components/TokenMint.js'
import TokenList from './components/TokenList.js'

function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/mint" element={
                    <TokenMint />
                } />
                <Route path="/list" element={
                    <TokenList />
                } />
            </Routes>
        </BrowserRouter>
    )
}

export default AppRouter;