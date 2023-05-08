import React from 'react'
import {BrowserRouter, Routes, Route } from "react-router-dom"

import MyMermaid from './components/Mermaid.js'
import EscrowSequence from './components/EscrowSequence.js'
import TokenMint from './components/TokenMint.js'
import Tokens from './components/Tokens.js'
import ProductList from './components/ProductList.js'
import Products from './components/Products.js'
import BTK from './components/BTK.js'

function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="" element={
                    <MyMermaid chart={EscrowSequence} />
                } />
                <Route path="/mint" element={
                    <TokenMint />
                } />
                <Route path="/tokens" element={
                    <Tokens />
                } />
                <Route path="/list" element={
                    <ProductList />
                } />
                <Route path="/products" element={
                    <Products />
                } />
                <Route path="/btk" element={
                    <BTK />
                } />
            </Routes>
        </BrowserRouter>
    )
}

export default AppRouter;