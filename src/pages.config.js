import Codex from './pages/Codex';
import DoppelgangerHome from './pages/DoppelgangerHome';
import Home from './pages/Home';
import HumanHome from './pages/HumanHome';
import IncubusHome from './pages/IncubusHome';
import Index from './pages/Index';
import Messages from './pages/Messages';
import NateLilithHome from './pages/NateLilithHome';
import Night from './pages/Night';
import ServantHome from './pages/ServantHome';
import ServantSnake from './pages/ServantSnake';
import StandaloneManga from './pages/StandaloneManga';
import SuccubusHome from './pages/SuccubusHome';
import VampireHome from './pages/VampireHome';
import WitchHome from './pages/WitchHome';
import YandereCoupleHome from './pages/YandereCoupleHome';
import SirenHome from './pages/SirenHome';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Codex": Codex,
    "DoppelgangerHome": DoppelgangerHome,
    "Home": Home,
    "HumanHome": HumanHome,
    "IncubusHome": IncubusHome,
    "Index": Index,
    "Messages": Messages,
    "NateLilithHome": NateLilithHome,
    "Night": Night,
    "ServantHome": ServantHome,
    "ServantSnake": ServantSnake,
    "StandaloneManga": StandaloneManga,
    "SuccubusHome": SuccubusHome,
    "VampireHome": VampireHome,
    "WitchHome": WitchHome,
    "YandereCoupleHome": YandereCoupleHome,
    "SirenHome": SirenHome,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};