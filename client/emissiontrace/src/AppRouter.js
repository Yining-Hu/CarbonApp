import React from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom"

import MyMermaid from './components/SequenceDiagrams/Mermaid.js'
import EmissionTraceSequence from './components/SequenceDiagrams/EmissionTraceSequence.js'
import UserRegisterSequence from './components/SequenceDiagrams/UserRegisterSequence.js'
import CarbonToken from './components/CarbonToken/CarbonToken.js'
import Project from './components/Project/Project.js'
import Farm from './components/Farm/Farm.js'
import Herd from './components/Herd/Herd.js'
import Seafeed from './components/Seafeed/Seafeed.js'
import Feed from './components/Feed/Feed.js'
import Emission from './components/Emission/Emission.js'
import FarmDetail from './components/Farm/FarmDetail.js'
import HerdDetail from './components/Herd/HerdDetail.js'
import ProjectDetail from './components/Project/ProjectDetail.js'
import OrderDetail from './components/Seafeed/SeafeedDetail.js'
import FeedDetail from './components/Feed/FeedDetail.js'
import EmissionDetail from './components/Emission/EmissionDetail.js'
import CbtokenDetail from './components/CarbonToken/CarbonTokenDetail.js'
import DistributionDetail from './components/CarbonToken/DistributionDetail.js'

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
                <Route path="/herddetail/:herdid" element={
                    <HerdDetail />
                } />
                <Route path="/seafeed" element={
                    <Seafeed />
                } />
                <Route path="/orderdetail/:orderid" element={
                    <OrderDetail />
                } />
                <Route path="/feed" element={
                    <Feed />
                } />
                <Route path="/feeddetail/:feedid" element={
                    <FeedDetail />
                } />
                <Route path="/emission" element={
                    <Emission />
                } />
                <Route path="/emissiondetail/:emissionid" element={
                    <EmissionDetail />
                } />
                <Route path="/project" element={
                    <Project />
                } />
                <Route path="/projectdetail/:projectid" element={
                    <ProjectDetail />
                } />
                <Route path="/carbontoken" element={
                    <CarbonToken />
                } />
                <Route path="/cbtokendetail/:cbtokenid" element={
                    <CbtokenDetail />
                } />
                <Route path="/distributiondetail/:distributionid" element={
                    <DistributionDetail />
                } />
            </Routes>
        </BrowserRouter>
    )
}

export default AppRouter;