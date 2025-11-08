import { Separator } from "@/components/ui/separator";
import { GraduationCap, Mail, Github, Linkedin } from "lucide-react";
import Link from "next/link";

const footerLinks = [
  {
    title: "Home",
    href: "/",
  },
  {
    title: "Join Quiz",
    href: "/join",
  },
  {
    title: "Teacher Login",
    href: "/login",
  },
  {
    title: "Register",
    href: "/register",
  },
];

const Footer = () => {
  return (
    <footer className="border-t bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="py-12 flex flex-col sm:flex-row items-start justify-between gap-x-8 gap-y-10 px-4 sm:px-6 lg:px-8">
          <div>
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">AI Quiz Generator</span>
            </Link>

            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              Create engaging quizzes in minutes with our AI-powered platform.
              Save time, promote academic integrity, and get instant results.
            </p>

            <ul className="mt-6 flex items-center gap-4 flex-wrap">
              {footerLinks.map(({ title, href }) => (
                <li key={title}>
                  <Link
                    href={href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="max-w-xs w-full">
            <h6 className="font-semibold text-sm">Contact Us</h6>
            <p className="mt-4 text-sm text-muted-foreground">
              Have questions or need support? We're here to help teachers and
              students make the most of AI-powered assessments.
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>support@aiquizgen.com</span>
            </div>
          </div>
        </div>
        <Separator />
        <div className="py-6 flex flex-col-reverse sm:flex-row items-center justify-between gap-x-2 gap-y-5 px-4 sm:px-6 lg:px-8">
          {/* Copyright */}
          <span className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} AI Quiz Generator. All rights
            reserved.
          </span>

          <div className="flex items-center gap-5 text-muted-foreground">
            <Link
              href="#"
              className="hover:text-foreground transition-colors"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5" />
            </Link>
            <Link
              href="#"
              className="hover:text-foreground transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-5 w-5" />
            </Link>
            <Link
              href="#"
              className="hover:text-foreground transition-colors"
              aria-label="Email"
            >
              <Mail className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
