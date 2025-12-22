import Night from './pages/Night';
import Home from './pages/Home';
import Messages from './pages/Messages';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Night": Night,
    "Home": Home,
    "Messages": Messages,
}

export const pagesConfig = {
    mainPage: "Night",
    Pages: PAGES,
    Layout: __Layout,
};