import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Menu } from "lucide-react";
import { Logo } from "@/components/logo";
import { NavMenu } from "@/components/nav-menu";
import Link from "next/link";

export const NavigationSheet = () => {
  return (
    <Sheet>
      <VisuallyHidden>
        <SheetTitle>Navigation Menu</SheetTitle>
      </VisuallyHidden>

      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent className="px-6 py-3">
        <Logo />
        <NavMenu orientation="vertical" className="mt-6 [&>div]:h-full" />
        <div className="mt-6 flex flex-col gap-3">
          <Button variant="outline" asChild>
            <Link href="/login">Teacher Login</Link>
          </Button>
          <Button asChild>
            <Link href="/join">Join Quiz</Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
