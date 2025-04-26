import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import TrialDivision from "./components/TrialDivision.tsx";
import PolardP1 from "./components/PolardP1.tsx";
import PolardRho from "./components/PolardRho.tsx";

function App() {
  return (
    <div className='min-w-screen min-h-full'>
        <div className='min-h-full flex items-center justify-center'>
            <Router>
                <div className="w-full min-h-screen" style={{ backgroundColor: '#181818' }}>
                    <nav className="shadow-md">
                        <div className="flex items-center justify-between px-[20px] py-[12px]">
                            <NavLink to="/" style={{ color: 'white' }} end className="text-[20px] no-underline font-bold">
                                Factorization
                            </NavLink>

                            <div className="flex items-center">
                                <NavLink
                                    to="/trial"
                                    style={{ color: 'white' }}
                                    className={({ isActive }) =>
                                        `${isActive ? 'underline text-yellow-300' : 'text-white'} no-underline px-[12px] py-[8px] mr-[10px] transition`
                                    }
                                >
                                    Trial Division
                                </NavLink>
                                <NavLink
                                     to="/polard-p-1"
                                    style={{ color: 'white' }}
                                     className={({ isActive }) =>
                                         `${isActive ? 'underline text-yellow-300' : 'text-white'} no-underline px-[12px] py-[8px] mr-[10px] transition`
                                     }
                                >
                                    Pollard’s P-1
                                </NavLink>
                                <NavLink
                                     to="/polard-rho"
                                    style={{ color: 'white' }}
                                     className={({ isActive }) =>
                                         `${isActive ? 'underline text-yellow-300' : 'text-white'} no-underline px-[12px] py-[8px] mr-[10px] transition`
                                     }
                                >
                                    Pollard’s Rho
                                </NavLink>
                                <NavLink
                                    to="/quadratic-sieve"
                                    style={{ color: 'white' }}
                                    className={({ isActive }) =>
                                        `${isActive ? 'underline text-yellow-300' : 'text-white'} no-underline px-[12px] py-[8px] mr-[10px] transition`
                                    }
                                >
                                    Quadratic Sieve
                                </NavLink>
                                <NavLink
                                    to="/gnfs"
                                    style={{ color: 'white' }}
                                    className={({ isActive }) =>
                                        `${isActive ? 'underline text-yellow-300' : 'text-white'} no-underline px-[12px] py-[8px] mr-[10px] transition`
                                    }
                                >
                                    GNFS
                                </NavLink>
                            </div>
                        </div>
                    </nav>

                    <div className="h-full flex items-center justify-center">
                        <Routes>
                            <Route path="/trial" element={<TrialDivision/>}/>
                            <Route path="/polard-p-1" element={<PolardP1 />} />
                            <Route path="/polard-rho" element={<PolardRho />}/>
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
