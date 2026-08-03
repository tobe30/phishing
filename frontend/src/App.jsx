import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/admin/Login";
import Layout from "./pages/Layout";
import Dashboard from "./pages/admin/Dashboard";
import Campaigns from "./pages/admin/Campaigns";
import CampaignResult from "./pages/admin/CampaignResult";
import NewCampaign from "./pages/admin/NewCampaign";
import Templates from "./pages/admin/Templates";
import Employees from "./pages/admin/Employees";
import Training from "./pages/admin/Training";
import SimulatedLanding from "./pages/SimulatedLanding";
import SimulationReport from "./pages/SimulationReport";
import Reports from "./pages/admin/Reports";
import Settings from "./pages/admin/Settings";
import ThemeToggle from "./components/ThemeToggle";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

const App = () => {
  return (
    <>
    <ThemeToggle />
      <Routes>
      <Route path="/" element={<Home />} />
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
      </Route>
      <Route path="/simulation/:token" element={<SimulatedLanding />} />
      <Route path="/simulation/:token/report" element={<SimulationReport />} />

<Route element={<ProtectedRoute />}>
       <Route path='/' element={<Layout/>}>
                  {/* <Route index element={<Navigate to='/login' />} /> */}
                   <Route path='dashboard' element={<Dashboard/>}/>
                   <Route path='campaigns' element={<Campaigns/>}/>
                   <Route path='campaigns/new' element={<NewCampaign/>}/>
                   <Route path='templates' element={<Templates/>}/>
                   <Route path='campaign-result' element={<CampaignResult/>}/>
                   <Route path='employees' element={<Employees/>}/>
                   <Route path='training' element={<Training/>}/>
                   <Route path='reports' element={<Reports/>}/>
                   <Route path='settings' element={<Settings/>}/>

              </Route>
              </Route>


    </Routes>
    </>
  )
}

export default App
