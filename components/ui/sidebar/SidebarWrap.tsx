"use client";

import { Icon } from "@iconify/react";
import { Button, ScrollShadow, Spacer, Tooltip } from "@nextui-org/react";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import React, { useCallback } from "react";
import { useMediaQuery } from "usehooks-ts";

import { logOut } from "@/actions";
import { useUIStore } from "@/store";

import {
  ProwlerExtended,
  ProwlerShort,
} from "../../icons/prowler/ProwlerIcons";
import { ThemeSwitch } from "../../ThemeSwitch";
import Sidebar from "./Sidebar";
import { sectionItems, sectionItemsWithTeams } from "./SidebarItems";
import { UserAvatar } from "./UserAvatar";

export const SidebarWrap = () => {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isCollapsed = useUIStore((state) => state.isSideMenuOpen);
  const openSideMenu = useUIStore((state) => state.openSideMenu);
  const closeSideMenu = useUIStore((state) => state.closeSideMenu);

  const isMobile = useMediaQuery("(max-width: 768px)");
  const isCompact = isCollapsed || isMobile;

  const onToggle = useCallback(() => {
    if (!isCollapsed) openSideMenu();
    if (isCollapsed) closeSideMenu();
  }, [isCollapsed]);

  const currentPath = pathname === "/" ? "overview" : pathname.split("/")?.[1];

  return (
    <div
      className={clsx(
        "relative flex h-screen flex-col !border-r-small border-divider transition-width",
        {
          "w-72 p-6": !isCompact,
          "w-16 items-center px-2 py-6": isCompact,
        },
      )}
    >
      <div
        className={clsx("flex items-center gap-3 px-3 justify-center", {
          "gap-0": isCompact,
        })}
      >
        <div
          className={clsx({
            hidden: !isCompact,
          })}
        >
          <ProwlerShort />
        </div>
        <div
          className={clsx({
            hidden: isCompact,
          })}
        >
          <ProwlerExtended />
        </div>
      </div>
      <Spacer y={8} />

      <Link href={"/profile"}>
        <UserAvatar
          userName={session?.user?.name ?? "Guest"}
          position={session?.user?.companyName ?? "Company Name"}
          isCompact={isCompact}
        />{" "}
      </Link>

      <ScrollShadow className="-mr-6 h-full max-h-full py-6 pr-6">
        <Sidebar
          defaultSelectedKey="overview"
          isCompact={isCompact}
          items={
            session?.user?.role === "admin"
              ? sectionItemsWithTeams
              : sectionItems
          }
          selectedKeys={[currentPath]}
        />
      </ScrollShadow>
      <Spacer y={2} />
      <div
        className={clsx("mt-auto flex flex-col", {
          "items-center": isCompact,
        })}
      >
        <Tooltip
          content="Help & Feedback"
          isDisabled={!isCompact}
          placement="right"
        >
          <Button
            aria-label="Help & Feedback"
            fullWidth
            className={clsx(
              "justify-start truncate text-default-500 data-[hover=true]:text-foreground",
              {
                "justify-center": isCompact,
              },
            )}
            isIconOnly={isCompact}
            startContent={
              isCompact ? null : (
                <Icon
                  className="flex-none text-default-500"
                  icon="solar:info-circle-line-duotone"
                  width={24}
                  aria-hidden="true"
                />
              )
            }
            variant="light"
          >
            {isCompact ? (
              <Icon
                className="text-default-500"
                icon="solar:info-circle-line-duotone"
                width={24}
                aria-hidden="true"
              />
            ) : (
              "Help & Information"
            )}
          </Button>
        </Tooltip>

        <Tooltip content="Log Out" isDisabled={!isCompact} placement="right">
          <Button
            aria-label="Log Out"
            onClick={() => logOut()}
            className={clsx(
              "justify-start text-default-500 data-[hover=true]:text-foreground",
              {
                "justify-center": isCompact,
              },
            )}
            isIconOnly={isCompact}
            startContent={
              isCompact ? null : (
                <Icon
                  className="flex-none rotate-180 text-default-500"
                  icon="solar:minus-circle-line-duotone"
                  width={24}
                  aria-hidden="true"
                />
              )
            }
            variant="light"
          >
            {isCompact ? (
              <Icon
                className="rotate-180 text-default-500"
                icon="solar:minus-circle-line-duotone"
                width={24}
                aria-hidden="true"
              />
            ) : (
              "Log Out"
            )}
          </Button>
        </Tooltip>
      </div>
      <div
        className={clsx("mt-auto flex justify-end gap-3", {
          "flex-col items-center": isCompact,
          "items-baseline": !isCompact,
        })}
      >
        <Tooltip
          content="Light | Dark mode"
          placement={isCompact ? "right" : "top"}
        >
          <div
            className={clsx(
              "text-default-500 data-[hover=true]:text-foreground px-0",
              {
                "justify-center mt-3": isCompact,
              },
            )}
          >
            <ThemeSwitch aria-label="Toggle theme" />
          </div>
        </Tooltip>
        <Tooltip
          content="Open | Close sidebar"
          placement={isCompact ? "right" : "top"}
        >
          <Button
            aria-label={isCompact ? "Open sidebar" : "Close sidebar"}
            className={clsx(
              "text-default-500 data-[hover=true]:text-foreground px-0",
              {
                "justify-center": isCompact,
              },
            )}
            isIconOnly
            size="sm"
            variant="light"
            onPress={onToggle}
          >
            <Icon
              className="text-default-500"
              height={24}
              icon="solar:sidebar-minimalistic-outline"
              width={24}
              aria-hidden="true"
            />
          </Button>
        </Tooltip>
      </div>
    </div>
  );
};
