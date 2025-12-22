import Home from './pages/Home';
import Messages from './pages/Messages';
import Night from './pages/Night';
import VampireHome from './pages/VampireHome';
import ServantHome from './pages/ServantHome';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Messages": Messages,
    "Night": Night,
    "VampireHome": VampireHome,
    "ServantHome": ServantHome,
}

export const pagesConfig = {
    mainPage: "Night",
    Pages: PAGES,
    Layout: __Layout,
};