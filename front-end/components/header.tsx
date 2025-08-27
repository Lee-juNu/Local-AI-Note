import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">C</span>
          </div>
          <span className="font-montserrat font-black text-xl text-foreground">ChatAI</span>
        </div>

        <nav className="hidden md:flex items-center space-x-6">
          <Link href="#features" className="text-muted-foreground hover:text-primary transition-colors">
            Features
          </Link>
          <Link href="#about" className="text-muted-foreground hover:text-primary transition-colors">
            About
          </Link>
          <Link href="#contact" className="text-muted-foreground hover:text-primary transition-colors">
            Contact
          </Link>
        </nav>

        <Button variant="outline" size="sm">
          Sign In
        </Button>
      </div>
    </header>
  )
}
