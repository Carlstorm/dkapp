import {Outlet} from 'react-router-dom';
import NavigationBar from "./navigation/NavigationBar";
import style from './PageLayout.module.scss'

export default function PageLayout() {
  return (
    <div className={style.page_layout}>
      <NavigationBar />
      <div className={style.page_layout__content}>
        <Outlet />
      </div>
    </div>
  );
}