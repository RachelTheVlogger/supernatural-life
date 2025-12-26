import Codex from './pages/Codex';
import Home from './pages/Home';
import Index from './pages/Index';
import Messages from './pages/Messages';
import Night from './pages/Night';
import ServantHome from './pages/ServantHome';
import VampireHome from './pages/VampireHome';
import WitchHome from './pages/WitchHome';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Codex": Codex,
    "Home": Home,
    "Index": Index,
    "Messages": Messages,
    "Night": Night,
    "ServantHome": ServantHome,
    "VampireHome": VampireHome,
    "WitchHome": WitchHome,
}

export const pagesConfig = {
    mainPage: "VampireHome",
    Pages: PAGES,
    Layout: __Layout,
};