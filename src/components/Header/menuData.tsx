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
    title: "Classes",
    newTab: false,
    isNew: true,
    submenu: [
      {
        id: 31,
        title: "Adult",
        path: "/classes",
        newTab: false,
      },
      {
        id: 32,
        title: "Kids & Family (Lil Steppers & One Familia)",
        path: "/zumfamilia",
        newTab: false,
      },
      {
        id: 33,
        title: "Outdoor",
        path: "/zt-fiesta",
        newTab: false,
      },
      {
        id: 34,
        title: "What's New",
        path: "/promos",
        newTab: false,
        isNew: true,
      },
    ],
  },
  {
    id: 4,
    title: "Pricing",
    newTab: false,
    submenu: [
      {
        id: 41,
        title: "Packages",
        path: "/pricing",
        newTab: false,
      },
      {
        id: 42,
        title: "What's New",
        path: "/promos",
        newTab: false,
        isNew: true,
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
    title: "Schedule",
    path: "/schedule",
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
