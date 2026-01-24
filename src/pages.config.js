import AdminCleanup from './pages/AdminCleanup';
import Codex from './pages/Codex';
import DoppelgangerHome from './pages/DoppelgangerHome';
import Home from './pages/Home';
import HumanHome from './pages/HumanHome';
import HunterHome from './pages/HunterHome';
import IncubusHome from './pages/IncubusHome';
import Index from './pages/Index';
import Messages from './pages/Messages';
import NateLilithHome from './pages/NateLilithHome';
import Night from './pages/Night';
import ServantHome from './pages/ServantHome';
import ServantSnake from './pages/ServantSnake';
import SirenHome from './pages/SirenHome';
import StandaloneManga from './pages/StandaloneManga';
import SuccubusHome from './pages/SuccubusHome';
import VampireHome from './pages/VampireHome';
import WaterNymphHome from './pages/WaterNymphHome';
import WitchHome from './pages/WitchHome';
import YandereCoupleHome from './pages/YandereCoupleHome';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AdminCleanup": AdminCleanup,
    "Codex": Codex,
    "DoppelgangerHome": DoppelgangerHome,
    "Home": Home,
    "HumanHome": HumanHome,
    "HunterHome": HunterHome,
    "IncubusHome": IncubusHome,
    "Index": Index,
    "Messages": Messages,
    "NateLilithHome": NateLilithHome,
    "Night": Night,
    "ServantHome": ServantHome,
    "ServantSnake": ServantSnake,
    "SirenHome": SirenHome,
    "StandaloneManga": StandaloneManga,
    "SuccubusHome": SuccubusHome,
    "VampireHome": VampireHome,
    "WaterNymphHome": WaterNymphHome,
    "WitchHome": WitchHome,
    "YandereCoupleHome": YandereCoupleHome,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};