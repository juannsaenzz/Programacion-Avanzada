import Header from '../templates/Header';
import Home from '../pages/Home';
import Character from '../pages/Character';
import Error404 from '../pages/Error404';


const routes = {
    '/': Home,
    '/:id': Character,

}

const router = async () => {
    const header = document.getElementById('header');
    const content = document.getElementById('content');

    header.innerHTML = await Header();

    const hash = location.hash.slice(1).toLowerCase() || '/';
    let render = routes[hash] ? routes[hash] : Error404;
    content.innerHTML = await render();
}

export default router;
