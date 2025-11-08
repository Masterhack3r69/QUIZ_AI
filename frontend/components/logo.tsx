import Link from "next/link";
import { GraduationCap } from "lucide-react";

export const Logo = () => (
  <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
    <GraduationCap className="h-8 w-8 text-primary" />
    <span className="text-xl font-bold">AI Quiz Generator</span>
  </Link>
);
