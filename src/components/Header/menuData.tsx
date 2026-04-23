import { Menu } from "@/types/menu";

const menuData: Menu[] = [
  {
    id: 1,
    title: "Home",
    path: "/explore",
    newTab: false,
  },
  {
    id: 2,
    title: "About",
    path: "/about",
    newTab: false,
  },
  {
    id: 3,
    title: "Schedule",
    path: "/schedule",
    newTab: false,
  },
  {
    id: 4,
    title: "Classes",
    newTab: false,
    submenu: [
      {
        id: 41,
        title: "Regular Classes",
        path: "/classes",
        newTab: false,
      },
      {
        id: 42,
        title: "One Familia",
        path: "/zumfamilia",
        newTab: false,
      },
      {
        id: 43,
        title: "ZumFiesta",
        path: "/zt-fiesta",
        newTab: false,
      },
    ],
  },
  {
    id: 5,
    title: "Instructors",
    path: "/instructors",
    newTab: false,
  },
  {
    id: 6,
    title: "Pricing",
    path: "/pricing",
    newTab: false,
  },
  {
    id: 7,
    title: "FAQ",
    path: "/faq",
    newTab: false,
  },
  {
    id: 8,
    title: "Contact",
    path: "/contact",
    newTab: false,
  },
];
export default menuData;
