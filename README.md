# MCP Builder 🔧

A visual, drag-and-drop flow builder for creating **Model Context Protocol (MCP) servers**. Transform your API endpoints into AI-ready tools with an intuitive interface.

## 🎥 Demo Video

[![MCP Builder Demo](https://img.youtube.com/vi/UFSgwpAaSEk/maxresdefault.jpg)](https://youtu.be/UFSgwpAaSEk)

## What is MCP Builder?

MCP Builder is a Next.js application that allows you to visually design and generate MCP (Model Context Protocol) servers. MCP is a protocol that enables AI models to interact with external tools and resources in a standardized way. With MCP Builder, you can:

- **Visually design API workflows** using a drag-and-drop interface
- **Import Postman collections** to automatically generate tool nodes
- **Generate ready-to-deploy MCP servers** with complete TypeScript/JavaScript code
- **Manage authentication** with secure user accounts
- **Save and share flows** with persistent storage

## ✨ Features

### 🎨 Visual Flow Builder
- Drag-and-drop interface powered by React Flow
- Tool nodes for API endpoints with full configuration
- JSON input nodes for data processing
- Real-time connection validation
- Auto-layout for imported collections

### 🚀 Postman Integration
- Import entire Postman collections with one click
- Automatic parameter extraction from query strings and request bodies
- Header and authentication configuration preservation
- Support for nested folder structures

### 🔧 MCP Server Generation
- Complete TypeScript/JavaScript server code generation
- Automatic tool registration and parameter handling
- Built-in error handling and response formatting
- Ready-to-deploy Node.js packages with dependencies

### 🔐 User Management
- Secure authentication with Supabase Auth
- Personal flow storage and management
- Multi-tenant architecture with row-level security
- Email confirmation and password recovery

### 🎯 Developer Experience
- Modern React 19 with TypeScript
- shadcn/ui components for consistent design
- Dark/light theme support
- Real-time validation and error handling
- Responsive design for all screen sizes

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Modern component library
- **React Flow** - Interactive node-based editor
- **Framer Motion** - Smooth animations

### Backend & Database
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Relational database with JSON support
- **Row Level Security** - Multi-tenant data isolation
- **Real-time subscriptions** - Live data updates

### Development Tools
- **ESLint** - Code linting and formatting
- **Autoprefixer** - CSS vendor prefixes
- **PostCSS** - CSS processing
- **Turbopack** - Fast development bundler

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm/yarn/pnpm
- Supabase account (free tier available)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/with-supabase-app.git
cd with-supabase-app
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your_supabase_publishable_or_anon_key


```

### 4. Database Setup
Run the Supabase migrations to set up the database schema:

```bash
# Install Supabase CLI if you haven't already
npm install -g @supabase/cli

# Initialize Supabase (if not already done)
supabase init

# Start local Supabase (optional for local development)
supabase start

# Push migrations to your Supabase project
supabase db push
```

### 5. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Usage

### Creating Your First Flow

1. **Sign up** for an account or **sign in** to an existing one
2. **Navigate to the dashboard** where you'll see the flow builder
3. **Add tool nodes** by dragging them from the sidebar or importing a Postman collection
4. **Configure each tool** with API endpoints, parameters, and descriptions
5. **Connect nodes** by dragging from output handles to input handles
6. **Save your flow** and **generate the MCP server** code
7. **Download** the generated server as a ZIP file

### Importing Postman Collections

1. Open any **JSON Input Node**
2. Paste your **Postman collection JSON**
3. Click **"Analyze Tools"**
4. Watch as tool nodes are **automatically generated** with proper connections
5. **Customize** the generated tools as needed

### Generated MCP Server

The generated server includes:
- Complete Node.js project with `package.json`
- TypeScript/JavaScript server code using `@modelcontextprotocol/sdk`
- Automatic tool registration and parameter handling
- Error handling and response formatting
- Ready to deploy to any Node.js hosting platform

## 🗂️ Project Structure

```
with-supabase-app/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Protected dashboard
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── mcp-flow/         # Flow builder components
│   └── auth-button.tsx   # Authentication components
├── lib/                   # Utility libraries
│   ├── mcp/              # MCP generation logic
│   └── supabase/         # Supabase client configuration
├── hooks/                 # Custom React hooks
├── supabase/             # Database migrations and config
└── public/               # Static assets
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm run test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Model Context Protocol](https://modelcontextprotocol.io/) for the MCP specification
- [Supabase](https://supabase.com/) for the amazing backend platform
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [React Flow](https://reactflow.dev/) for the powerful flow builder
- [Vercel](https://vercel.com/) for the deployment platform

## 📧 Support

If you have any questions or need help, please:
- Open an [issue](https://github.com/your-username/with-supabase-app/issues)
- Join our [Discord community](https://discord.gg/your-discord)
- Email us at support@mcpbuilder.com

---

**Built with ❤️ for the AI community**

<img src="https://img.shields.io/badge/Built%20at-TinkerSpace-blueviolet?style=for-the-badge&label=%F0%9F%92%BBBuilt%20at&labelColor=turquoise&color=white" alt="💻 Built at TinkerSpace" />
