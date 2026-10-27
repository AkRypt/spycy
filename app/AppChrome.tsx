"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const GameBoot = dynamic(() => import("./GameBoot"), { ssr: true });

/**
 * /admin does not need the game Firebase client. Keeping that import out of
 * the admin bundle avoids downloading and evaluating it before the page paints.
 */
export default function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return <>{children}</>;
  return <GameBoot>{children}</GameBoot>;
}
