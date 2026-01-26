import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';
import Admin from "./sub/Admin";
import Member from './sub/Member';
import Forgot from './sub/Forgot';
import Reset from './sub/Reset';
import Login from './sub/Login';
import ProtectedRoute from './routes/ProtectedRoute';
import SalesManagement from './sub/SalesManagement';
import ProductionManagement from './sub/ProductionManagement';
import PurchaseMaterial from './sub/PurchaseMaterial';
import InventoryManagement from './sub/InventoryManagement';
import KpiManagement from './sub/KpiManagement';
import StandardManagement from './sub/StandardManagement';
import SystemManagement from './sub/SystemManagement';

const App = () => {
return (
<>
<BrowserRouter>

<Routes>
<Route path="/" element={<Login/>}/>

<Route path="/admin" element={<ProtectedRoute><Admin/></ProtectedRoute>}/>
<Route path="/sales" element={<ProtectedRoute><SalesManagement/></ProtectedRoute>}/>
<Route path="/pmanagement" element={<ProtectedRoute><ProductionManagement/></ProtectedRoute>}/>
<Route path="/pm" element={<PurchaseMaterial/>}/>
<Route path="/im" element={<InventoryManagement/>}/>
<Route path="/kpi" element={<KpiManagement/>}/>
<Route path="/standard" element={<StandardManagement/>}/>
<Route path="/system" element={<SystemManagement/>}/>
<Route path="/member" element={<Member/>}/>
<Route path="/" element={<Navigate to="/login" replace/>}/>
<Route path="/forgot" element={<Forgot/>}/>
<Route path="/reset" element={<Reset/>}/>
</Routes>
</BrowserRouter>
</>
  );
};

export default App;