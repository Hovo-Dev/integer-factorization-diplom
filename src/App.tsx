import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import TrialDivision from "./components/TrialDivision.tsx";

function App() {
  return (
    <div className='min-w-screen min-h-full'>
        <div className='min-h-screen flex items-center justify-center'>
            <Router>
                <div className="min-w-screen min-h-full">
                    <nav className="bg-gradient-to-r from-blue-500 to-indigo-600 shadow-md">
                        <div className="flex items-center justify-between px-[20px] py-[12px]">
                            <NavLink to="/" end className="text-[20px] no-underline font-bold">
                                Factorization
                            </NavLink>

                            <div className="flex items-center">
                                <NavLink
                                    to="/trial"
                                    className={({ isActive }) =>
                                        `${isActive ? 'underline text-yellow-300' : 'text-white'} no-underline px-[12px] py-[8px] mr-[10px] transition`
                                    }
                                >
                                    Trial Division
                                </NavLink>
                                <NavLink
                                     to="/polard-p-1"
                                     className={({ isActive }) =>
                                         `${isActive ? 'underline text-yellow-300' : 'text-white'} no-underline px-[12px] py-[8px] mr-[10px] transition`
                                     }
                                >
                                    Pollard’s P-1
                                </NavLink>
                                <NavLink
                                     to="/polard-rho"
                                     className={({ isActive }) =>
                                         `${isActive ? 'underline text-yellow-300' : 'text-white'} no-underline px-[12px] py-[8px] mr-[10px] transition`
                                     }
                                >
                                    Pollard’s Rho
                                </NavLink>
                                <NavLink
                                    to="/quadratic-sieve"
                                    className={({ isActive }) =>
                                        `${isActive ? 'underline text-yellow-300' : 'text-white'} no-underline px-[12px] py-[8px] mr-[10px] transition`
                                    }
                                >
                                    Quadratic Sieve
                                </NavLink>
                                <NavLink
                                    to="/gnfs"
                                    className={({ isActive }) =>
                                        `${isActive ? 'underline text-yellow-300' : 'text-white'} no-underline px-[12px] py-[8px] mr-[10px] transition`
                                    }
                                >
                                    GNFS
                                </NavLink>
                            </div>
                        </div>
                    </nav>

                    <div className="min-h-screen flex items-center justify-center">
                        <Routes>
                            <Route path="/trial" element={<TrialDivision/>}/>
                            <Route path="/polard-p-1" element={<div>Polard p-1 Yok</div>}/>
                            <Route path="/polard-rho" element={<div>Polard Rho Yok</div>}/>
                            <Route path="/quadratic-sieve" element={<div>Quadratic Sieve Yok</div>}/>
                            <Route path="/gnfs" element={<div>GNFS Yok</div>}/>
                        </Routes>
                    </div>
                </div>
            </Router>
        </div>
    </div>
  )
}

export default App
