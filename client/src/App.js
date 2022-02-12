import {BrowserRouter, Routes, Route} from "react-router-dom";
import { PosterPage, PurchasePage, LoginPg, Dashboard} from "./components";
import {RequireAuth} from "./components/Auth";

const App = () => {
    return (
        <div className='gradient-bg-welcome w-full'>
            <BrowserRouter>
                <Routes>
                    <Route path='/' exact element={<PosterPage/>}/>
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
