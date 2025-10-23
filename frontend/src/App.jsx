import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar/Nav.jsx";
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import Journal from "./pages/Journal.jsx";
import Achievement from "./pages/Achievement.jsx";
import Shop from "./pages/Shop.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";

function App() {
  return (
    <div>
    <BrowserRouter>
    <Navbar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/about' element={<About />} />
        <Route path='/journal' element ={<Journal />} />
        <Route path='/achievement' element={<Achievement />} />
        <Route path='/shop' element ={<Shop />} />
        <Route path='/login' element ={<Login />} />
        <Route path='/signup' element={<Signup />} />
      </Routes>
    </BrowserRouter>
    </div>
  );
}


export default App;