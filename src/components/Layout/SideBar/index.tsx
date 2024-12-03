import { useState } from "react";
import {
  Sidebar,
  Menu,
  MenuItem,
  SubMenu,
  sidebarClasses,
  menuClasses,
} from "react-pro-sidebar";
import BurgerIcon from "../Icons/Burger";


const SideBar = ({
  handleOnClick,
}: {
  handleOnClick: (id: string) => void;
}) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="relative h-view left-0 top-0 bottom-0 z-10">
      <Sidebar
        collapsed={collapsed}
        onBackdropClick={() => setCollapsed(!collapsed)}
        breakPoint="all"
        backgroundColor="#111"
        rootStyles={{
          border: 0,
          [`.${sidebarClasses.backdrop}`]: {
            zIndex: "-1",
          },
          [`.${sidebarClasses.container}`]: {
            position: "static",
            [`.${menuClasses.button}`]: {
              color: "white",
              "&:hover": {
                backgroundColor: "#333",
              },
            },
            [`& > .${menuClasses.button}`]: {
              color: "white",
              "&:hover": {
                backgroundColor: "#333",
              },
            },
            [`.${menuClasses.subMenuContent}`]: {
              color: "white",
              backgroundColor: "#0f282f",
            },
          },
        }}
      >
        <Menu>
          <MenuItem
            onClick={() => {
              handleOnClick("globe");
              setCollapsed(!collapsed);
            }}
            className="pt-8"
          >
            Globe
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleOnClick("saudi-arabia");
              setCollapsed(!collapsed);
            }}
          >
            Saudi Arabia
          </MenuItem>
          <SubMenu label="Projects">
            <MenuItem
              onClick={() => {
                handleOnClick("alfursan");
                setCollapsed(!collapsed);
              }}
            >
              Project 1
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleOnClick("sadayem");
                setCollapsed(!collapsed);
              }}
            >
              Project 2
            </MenuItem>
          </SubMenu>
        </Menu>
        <div
          className={`absolute top-0 z-30 transition ease-in-out delay-150 duration-300 transform translate-x-72  translate-y-10   ${
            collapsed ? "delay-0  hover:rotate-180" : ""
          }`}
        >
          <BurgerIcon isOpened={collapsed} setMenuOpened={setCollapsed} />
        </div>
      </Sidebar>
    </div>
  );
};

export default SideBar;
