import React from "react";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import route_map from "@/config/route_map";
import ConnectButton from "@/components/connectButton";

const NavigationMenuDemo = () => {
  const menuList = [
    {
      show: true,
      key: "home",
      icon: "",
      title: "Home",
      path: route_map.home,
      disabled: false
    },
  ];

  return (
    <div className="flex w-full px-[80px] py-[16px] fixed z-50 items-center justify-between bg-[#000000]">
      <div className="flex flex-row gap-[40px] items-center">
        <div className="flex flex-row items-center">
          <NavigationMenu.Root>
            <NavigationMenu.List className="flex items-center">
              {menuList.map((item) => {
                return (
                  <NavigationMenu.Item key={item.key}>
                    <NavigationMenu.Link
                      className={`text-base mx-[12px] font-medium ${
                        item.disabled ? "cursor-not-allowed opacity-40" : ""
                      }`}
                      href={item.disabled ? '/' : item.path}
                    >
                      {item.title}
                    </NavigationMenu.Link>
                  </NavigationMenu.Item>
                );
              })}
            </NavigationMenu.List>
          </NavigationMenu.Root>
        </div>
        <div></div>
      </div>
      <div className="flex flex-row items-center gap-[12px]">
        <div className="min-w-[150px] min-h-[42px] w-max">
          <ConnectButton />
        </div>
      </div>
    </div>
  );
};

export default NavigationMenuDemo;
