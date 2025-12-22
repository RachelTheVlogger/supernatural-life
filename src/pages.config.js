import StyleComparison from './pages/StyleComparison';
import Night from './pages/Night';
import __Layout from './Layout.jsx';


export const PAGES = {
    "StyleComparison": StyleComparison,
    "Night": Night,
}

export const pagesConfig = {
    mainPage: "StyleComparison",
    Pages: PAGES,
    Layout: __Layout,
};