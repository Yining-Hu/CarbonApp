import React from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom"

import MyMermaid from './components/Mermaid.js'
import EmissionTraceSequence from './components/EmissionTraceSequence.js'
import UserRegisterSequence from './components/UserRegisterSequence.js'
import CarbonToken from './components/CarbonToken.js'

function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/sequence/user" element={
                    <MyMermaid chart={UserRegisterSequence} />
                } />
                <Route path="/sequence/emission" element={
                    <MyMermaid chart={EmissionTraceSequence} />
                } />
                <Route path="/carbontoken" element={
                    <CarbonToken />
                } />
            </Routes>
        </BrowserRouter>
    )
}

export default AppRouter;