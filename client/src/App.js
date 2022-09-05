import {BrowserRouter, Routes, Route} from "react-router-dom";
import { HalloweenPosterPage, PurchasePage, LoginPg, WaiverPg, Dashboard} from "./components";
import {RequireAuth} from "./components/Auth";

const App = () => {
    return (
        <div className='spooky-bg w-full'>
            <BrowserRouter>
                <Routes>
                    <Route path='/' exact element={<HalloweenPosterPage/>}/>
                    <Route path='/ticket-purchase' exact element={<PurchasePage/>}/>
                    <Route path='/admin' exact element={<LoginPg />}/>
                    <Route path='/admin/dashboard' exact element={
                        <RequireAuth>
                            <Dashboard />
                        </RequireAuth>}
                    />
                </Routes>
            </BrowserRouter>
        </div>
    )
}

export default App
