import { AuthButton } from "@/components/auth-button"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Zap, ArrowRight, Github, BookOpen, FileText, Server, Bot } from "lucide-react"
import Link from "next/link"

export default function MCPBuilderLanding() {
  return (
    <div className="flex flex-col min-h-screen bg-black mx-auto">
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b border-white/20 bg-black sticky top-0 z-50">
        <Link href="/" className="flex items-center justify-center">
          <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center">
            <Server className="h-4 w-4 text-black" />
          </div>
          <span className="ml-2 text-xl font-bold text-white tracking-wider">MCP BUILDER</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link
            href="#features"
            className="text-sm font-light text-white hover:text-gray-300 transition-colors uppercase tracking-widest"
          >
            Features
          </Link>
          <Link
            href="#how-it-works"
            className="text-sm font-light text-white hover:text-gray-300 transition-colors uppercase tracking-widest"
          >
            Process
          </Link>
          <Link
            href="#docs"
            className="text-sm font-light text-white hover:text-gray-300 transition-colors uppercase tracking-widest"
          >
            Docs
          </Link>
     
            <AuthButton />

        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-3">
                  <Badge
                    variant="secondary"
                    className="w-fit bg-white/10 text-white border-white/20 font-mono text-xs tracking-wider"
                  >
                    <Zap className="h-3 w-3 mr-1" />
                    NO_CODE_REQUIRED
                  </Badge>
                  <div className="space-y-2">
                    <h1 className="text-2xl font-light tracking-tight text-white uppercase">Turn Your</h1>
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white">POSTMAN</h1>
                    <h1 className="text-2xl font-light tracking-wide text-white">Collections into</h1>
                    <h1 className="text-4xl md:text-6xl font-mono text-white border-l-4 border-white pl-4">
                      MCP_SERVERS
                    </h1>
                  </div>
                  <p className="max-w-[600px] text-gray-300 md:text-lg font-light leading-relaxed italic">
                    "Upload your Postman collection and instantly get a production-ready Model Context Protocol server.
                    Connect your APIs to Claude, Cursor, and other AI tools in seconds."
                  </p>
                </div>

                <div className="flex items-center gap-6 text-xs text-gray-400 font-mono mt-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-white" />
                    no_credit_card_required
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-white" />
                    deploy_to_vercel_instantly
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative">
                  <div className="relative bg-black border border-white/20 rounded-none p-8 shadow-2xl">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <FileText className="h-12 w-12 text-white" />
                        <div className="text-center font-mono text-xs text-gray-400">
                          <div>TRANSFORM</div>
                          <div className="text-2xl">→</div>
                        </div>
                        <Server className="h-12 w-12 text-white" />
                      </div>
                      <div className="text-center space-y-1">
                        <p className="text-white font-bold text-lg tracking-widest">POSTMAN.JSON</p>
                        <p className="text-gray-400 text-xs font-mono">becomes</p>
                        <p className="text-white font-mono text-sm">mcp_server.zip</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32 border-t border-white/10">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-6 text-center">
              <div className="space-y-4">
                <Badge variant="secondary" className="bg-white/10 text-white border-white/20 font-mono text-xs">
                  PROCESS.MD
                </Badge>
                <div className="space-y-2">
                  <h2 className="text-sm font-light text-white uppercase tracking-[0.3em]">
                    From Postman to Production in
                  </h2>
                  <h2 className="text-7xl font-black text-white tracking-tighter">30</h2>
                  <h2 className="text-2xl font-light text-white italic">seconds</h2>
                </div>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-8 py-16 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="relative">
                  <div className="h-20 w-20 bg-white rounded-none flex items-center justify-center">
                    <span className="text-4xl font-black text-black">1</span>
                  </div>
                  <div className="absolute -top-2 -right-2 text-xs font-mono text-gray-400">STEP</div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-white tracking-wide">UPLOAD</h3>
                  <h3 className="text-lg font-light text-white">Collection</h3>
                </div>
                <p className="text-gray-300 font-light leading-relaxed max-w-xs">
                  Drop your Postman collection JSON file. We automatically parse your endpoints, parameters, and
                  authentication.
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="relative">
                  <div className="h-20 w-20 bg-white rounded-none flex items-center justify-center">
                    <span className="text-4xl font-black text-black">2</span>
                  </div>
                  <div className="absolute -top-2 -right-2 text-xs font-mono text-gray-400">STEP</div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-white tracking-wide">GENERATE</h3>
                  <h3 className="text-lg font-light text-white italic">MCP Server</h3>
                </div>
                <p className="text-gray-300 font-light leading-relaxed max-w-xs">
                  Our engine converts your API endpoints into MCP tools with proper schemas and validation
                  automatically.
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="relative">
                  <div className="h-20 w-20 bg-white rounded-none flex items-center justify-center">
                    <span className="text-4xl font-black text-black">3</span>
                  </div>
                  <div className="absolute -top-2 -right-2 text-xs font-mono text-gray-400">STEP</div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-white tracking-wide">DEPLOY</h3>
                  <h3 className="text-lg font-light text-white">& Connect</h3>
                </div>
                <p className="text-gray-300 font-light leading-relaxed max-w-xs">
                  One-click deploy to Vercel. Get your MCP server URL and connect it to Claude, Cursor, or any MCP host.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 border-t border-white/10">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-6 text-center">
              <div className="space-y-4">
                <Badge variant="secondary" className="bg-white/10 text-white border-white/20 font-mono">
                  FEATURES.JSON
                </Badge>
                <div className="space-y-2">
                  <h2 className="text-sm font-light text-white uppercase tracking-[0.4em]">Everything handled</h2>
                  <h2 className="text-6xl font-black text-white tracking-tighter">AUTOMATICALLY</h2>
                </div>
                <p className="max-w-[900px] text-gray-300 md:text-lg font-light leading-relaxed italic">
                  "No coding, no configuration. Just upload your Postman collection and get a fully functional MCP
                  server with authentication, validation, and documentation."
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-8 py-16 lg:grid-cols-3 lg:gap-12">
              <Card className="bg-black border-white/20 rounded-none">
                <CardHeader className="space-y-4">
                  <div className="h-16 w-16 bg-white/10 rounded-none flex items-center justify-center">
                    <FileText className="h-8 w-8 text-white" />
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-white text-2xl font-black tracking-wide">SMART</CardTitle>
                    <CardTitle className="text-white text-lg font-light italic">Parsing</CardTitle>
                  </div>
                  <CardDescription className="text-gray-300 font-light">
                    Automatically extracts endpoints, parameters, headers, and auth from your Postman collections.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm font-mono">
                    <li className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-white" />
                      <span className="text-gray-300">request_response_schemas</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-white" />
                      <span className="text-gray-300">authentication_handling</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-white" />
                      <span className="text-gray-300">environment_variables</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-black border-white/20 rounded-none">
                <CardHeader className="space-y-4">
                  <div className="h-16 w-16 bg-white/10 rounded-none flex items-center justify-center">
                    <Server className="h-8 w-8 text-white" />
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-white text-2xl font-black tracking-wide">MCP</CardTitle>
                    <CardTitle className="text-white text-lg font-light italic">Generation</CardTitle>
                  </div>
                  <CardDescription className="text-gray-300 font-light">
                    Converts your APIs into MCP tools with proper validation and error handling built-in.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm font-mono">
                    <li className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-white" />
                      <span className="text-gray-300">type_safe_schemas</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-white" />
                      <span className="text-gray-300">error_handling</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-white" />
                      <span className="text-gray-300">rate_limiting</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-black border-white/20 rounded-none">
                <CardHeader className="space-y-4">
                  <div className="h-16 w-16 bg-white/10 rounded-none flex items-center justify-center">
                    <Zap className="h-8 w-8 text-white" />
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-white text-2xl font-black tracking-wide">INSTANT</CardTitle>
                    <CardTitle className="text-white text-lg font-light italic">Deploy</CardTitle>
                  </div>
                  <CardDescription className="text-gray-300 font-light">
                    One-click deployment to Vercel with automatic scaling and global edge distribution.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm font-mono">
                    <li className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-white" />
                      <span className="text-gray-300">vercel_integration</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-white" />
                      <span className="text-gray-300">auto_scaling</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-white" />
                      <span className="text-gray-300">global_cdn</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Compatible Tools */}
        <section className="w-full py-12 md:py-24 lg:py-32 border-t border-white/10">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-6 text-center">
              <div className="space-y-4">
                <Badge variant="secondary" className="bg-white/10 text-white border-white/20 font-mono">
                  COMPATIBILITY.TS
                </Badge>
                <div className="space-y-2">
                  <h2 className="text-sm font-light text-white uppercase tracking-[0.3em]">Works with your favorite</h2>
                  <h2 className="text-5xl font-black text-white tracking-tighter">AI TOOLS</h2>
                </div>
                <p className="max-w-[900px] text-gray-300 md:text-lg font-light leading-relaxed italic">
                  "Your generated MCP servers work seamlessly with popular AI development tools and platforms."
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-8 py-16 lg:grid-cols-2 lg:gap-16">
              <div className="grid gap-6">
                <Card className="bg-black border-white/20 rounded-none">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg text-white flex items-center gap-3 font-mono">
                      <Bot className="h-6 w-6 text-white" />
                      AI_ASSISTANTS[]
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-3">
                      <Badge variant="outline" className="border-white/20 text-white font-mono text-xs">
                        Claude
                      </Badge>
                      <Badge variant="outline" className="border-white/20 text-white font-mono text-xs">
                        ChatGPT
                      </Badge>
                      <Badge variant="outline" className="border-white/20 text-white font-mono text-xs">
                        Cursor
                      </Badge>
                      <Badge variant="outline" className="border-white/20 text-white font-mono text-xs">
                        Continue
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-black border-white/20 rounded-none">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg text-white flex items-center gap-3 font-mono">
                      <FileText className="h-6 w-6 text-white" />
                      POSTMAN_FEATURES{}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-3">
                      <Badge variant="outline" className="border-white/20 text-white font-mono text-xs">
                        collections
                      </Badge>
                      <Badge variant="outline" className="border-white/20 text-white font-mono text-xs">
                        environments
                      </Badge>
                      <Badge variant="outline" className="border-white/20 text-white font-mono text-xs">
                        auth
                      </Badge>
                      <Badge variant="outline" className="border-white/20 text-white font-mono text-xs">
                        variables
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-black border-white/20 rounded-none">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg text-white flex items-center gap-3 font-mono">
                      <Server className="h-6 w-6 text-white" />
                      DEPLOYMENT_CONFIG
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-3">
                      <Badge variant="outline" className="border-white/20 text-white font-mono text-xs">
                        vercel
                      </Badge>
                      <Badge variant="outline" className="border-white/20 text-white font-mono text-xs">
                        edge_functions
                      </Badge>
                      <Badge variant="outline" className="border-white/20 text-white font-mono text-xs">
                        auto_scaling
                      </Badge>
                      <Badge variant="outline" className="border-white/20 text-white font-mono text-xs">
                        global_cdn
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative">
                  <div className="relative bg-black border border-white/20 rounded-none p-12 shadow-2xl">
                    <div className="space-y-8">
                      <div className="text-center space-y-2">
                        <h3 className="text-2xl font-black text-white tracking-wide">UPLOAD</h3>
                        <h3 className="text-lg font-light text-white">& Deploy</h3>
                        <p className="text-gray-300 text-sm font-mono">your_apis.become(ai_tools)</p>
                      </div>
                      <div className="flex flex-col items-center space-y-6">
                        <div className="w-20 h-20 bg-white/10 rounded-none flex items-center justify-center">
                          <FileText className="h-10 w-10 text-white" />
                        </div>
                        <div className="text-center font-mono text-xs text-gray-400">
                          <div>TRANSFORM</div>
                          <ArrowRight className="h-6 w-6 mx-auto rotate-90 my-2" />
                        </div>
                        <div className="w-20 h-20 bg-white/10 rounded-none flex items-center justify-center">
                          <Server className="h-10 w-10 text-white" />
                        </div>
                        <div className="text-center font-mono text-xs text-gray-400">
                          <div>CONNECT</div>
                          <ArrowRight className="h-6 w-6 mx-auto rotate-90 my-2" />
                        </div>
                        <div className="w-20 h-20 bg-white/10 rounded-none flex items-center justify-center">
                          <Bot className="h-10 w-10 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="w-full py-12 md:py-24 lg:py-32 border-t border-white/10">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-6 text-center">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h2 className="text-sm font-light text-white uppercase tracking-[0.4em]">Trusted by developers</h2>
                  <h2 className="text-6xl font-black text-white tracking-tighter">WORLDWIDE</h2>
                </div>
                <p className="mx-auto max-w-[700px] text-gray-300 md:text-lg font-light leading-relaxed italic">
                  "Join thousands of developers connecting their APIs to AI tools with MCP Builder."
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-8 py-16 lg:grid-cols-4 lg:gap-12">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="text-5xl font-black text-white">5K+</div>
                <div className="text-xs text-gray-400 font-mono uppercase tracking-wider">collections_converted</div>
              </div>
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="text-5xl font-black text-white">2K+</div>
                <div className="text-xs text-gray-400 font-mono uppercase tracking-wider">mcp_servers_deployed</div>
              </div>
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="text-5xl font-black text-white">99.9%</div>
                <div className="text-xs text-gray-400 font-mono uppercase tracking-wider">uptime_guarantee</div>
              </div>
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="text-5xl font-black text-white">30s</div>
                <div className="text-xs text-gray-400 font-mono uppercase tracking-wider">average_deploy_time</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-6 text-center">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h2 className="text-sm font-light text-black uppercase tracking-[0.3em]">Ready to connect your</h2>
                  <h2 className="text-6xl font-black text-black tracking-tighter">APIs</h2>
                  <h2 className="text-2xl font-light text-black italic">to AI?</h2>
                </div>
                <p className="mx-auto max-w-[600px] text-gray-600 md:text-lg font-light leading-relaxed italic">
                  "Upload your Postman collection and get your MCP server deployed in under a minute. No coding
                  required."
                </p>
              </div>
              <div className="w-full max-w-md space-y-3">
                <form className="flex gap-3">
                  <Input
                    type="email"
                    placeholder="your.email@domain.com"
                    className="max-w-lg flex-1 bg-white border-black text-black placeholder:text-gray-500 font-mono text-sm rounded-none"
                  />
                  <Button
                    type="submit"
                    className="bg-black text-white hover:bg-gray-800 font-bold tracking-wide rounded-none"
                  >
                    START_NOW
                  </Button>
                </form>
                <p className="text-xs text-gray-500 font-mono">
                  start_free() && upgrade_anytime() // Read our{" "}
                  <Link href="/privacy" className="underline underline-offset-2 text-black font-bold">
                    Privacy Policy
                  </Link>
                </p>
              </div>
              <div className="flex gap-4 pt-6">
                <Button
                  variant="outline"
                  className="bg-transparent border-black text-black hover:bg-black hover:text-white font-mono rounded-none"
                >
                  <Github className="mr-2 h-4 w-4" />
                  view_on_github()
                </Button>
                <Button
                  variant="outline"
                  className="bg-transparent border-black text-black hover:bg-black hover:text-white font-mono rounded-none"
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  read_docs()
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t border-white/20 bg-black">
        <p className="text-xs text-gray-400 font-mono">© 2024 MCP_BUILDER. all_rights_reserved()</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link
            href="/terms"
            className="text-xs text-gray-400 hover:text-white hover:underline underline-offset-4 font-mono"
          >
            terms_of_service
          </Link>
          <Link
            href="/privacy"
            className="text-xs text-gray-400 hover:text-white hover:underline underline-offset-4 font-mono"
          >
            privacy_policy
          </Link>
          <Link
            href="/docs"
            className="text-xs text-gray-400 hover:text-white hover:underline underline-offset-4 font-mono"
          >
            documentation
          </Link>
          <Link
            href="/support"
            className="text-xs text-gray-400 hover:text-white hover:underline underline-offset-4 font-mono"
          >
            support
          </Link>
        </nav>
      </footer>
    </div>
  )
}
