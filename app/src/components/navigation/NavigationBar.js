
import { Link } from 'react-router-dom'
import style from './NavigationBar.module.scss'


export default function NavigationBar() {
    return (
        <div className={style.navigation_bar}>
            <Link to="/" className={style.navigation_bar__button}>
                <span className={style.navigation_bar__button_label}>Home</span>
            </Link>
            <Link to="/rankings" className={style.navigation_bar__button}>
                <span className={style.navigation_bar__button_label}>Rankings</span>
            </Link>
        </div>
    )
}