import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30 mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">C</span>
            </div>
            <span className="font-montserrat font-bold text-foreground">ChatAI</span>
          </div>

          <nav className="flex space-x-6 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <Link href="/support" className="hover:text-primary transition-colors">
              Support
            </Link>
          </nav>
        </div>

        <div className="text-center mt-6 pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground">© 2024 ChatAI. Experience intelligent conversations.</p>
        </div>
      </div>
    </footer>
  )
}
