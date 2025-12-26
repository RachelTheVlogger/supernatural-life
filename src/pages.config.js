import Codex from './pages/Codex';
import Home from './pages/Home';
import HybridHome from './pages/HybridHome';
import IncubusHome from './pages/IncubusHome';
import Index from './pages/Index';
import Messages from './pages/Messages';
import NateLilithHome from './pages/NateLilithHome';
import Night from './pages/Night';
import ServantHome from './pages/ServantHome';
import SuccubusHome from './pages/SuccubusHome';
import VampireHome from './pages/VampireHome';
import WerewolfHome from './pages/WerewolfHome';
import WitchHome from './pages/WitchHome';
import YandereCoupleHome from './pages/YandereCoupleHome';
import Stories from './pages/Stories';
import SerialKillerHome from './pages/SerialKillerHome';
import ObsessedLoverHome from './pages/ObsessedLoverHome';
import KillerCouple from './pages/KillerCouple';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Codex": Codex,
    "Home": Home,
    "HybridHome": HybridHome,
    "IncubusHome": IncubusHome,
    "Index": Index,
    "Messages": Messages,
    "NateLilithHome": NateLilithHome,
    "Night": Night,
    "ServantHome": ServantHome,
    "SuccubusHome": SuccubusHome,
    "VampireHome": VampireHome,
    "WerewolfHome": WerewolfHome,
    "WitchHome": WitchHome,
    "YandereCoupleHome": YandereCoupleHome,
    "Stories": Stories,
    "SerialKillerHome": SerialKillerHome,
    "ObsessedLoverHome": ObsessedLoverHome,
    "KillerCouple": KillerCouple,
}

export const pagesConfig = {
    mainPage: "VampireHome",
    Pages: PAGES,
    Layout: __Layout,
};