import Link from "next/link";
import { ThemeSwitch } from "./theme-switch";

export function Topbar() {
  return (
    <header className="topbar">
      <div className="topbar-in">
        <Link className="logo" href="/">
          Frontend Knowledge Handbook
        </Link>
        <ThemeSwitch />
      </div>
    </header>
  );
}
