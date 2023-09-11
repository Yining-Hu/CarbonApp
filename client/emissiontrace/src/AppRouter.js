import React from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom"

import MyMermaid from './components/Mermaid.js'
import EmissionTraceSequence from './components/EmissionTraceSequence.js'
import UserRegisterSequence from './components/UserRegisterSequence.js'
import CarbonToken from './components/CarbonToken.js'
import Project from './components/Project.js'
import Farm from './components/Farm.js'
import Herd from './components/Herd.js'
import Seafeed from './components/Seafeed.js'
import Feed from './components/Feed.js'
import Emission from './components/Emission.js'
import FarmDetail from './components/FarmDetail.js'

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
                <Route path="/farm" element={
                    <Farm />
                } />
                <Route path="/farmdetail/:farmid" element={
                    <FarmDetail />
                } />
                <Route path="/herd" element={
                    <Herd />
                } />
                <Route path="/seafeed" element={
                    <Seafeed />
                } />
                <Route path="/feed" element={
                    <Feed />
                } />
                <Route path="/emission" element={
                    <Emission />
                } />
                <Route path="/project" element={
                    <Project />
                } />
                <Route path="/carbontoken" element={
                    <CarbonToken />
                } />
            </Routes>
        </BrowserRouter>
    )
}

export default AppRouter;