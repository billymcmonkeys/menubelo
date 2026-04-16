<div align="center">

# 🍽️ Menubelo

### Smart Meal Planning & Grocery List Generator

**Plan meals. Generate groceries. Simplify your week.**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

[Live Demo](#) • [Report Bug](https://github.com/yourusername/menubelo/issues) • [Request Feature](https://github.com/yourusername/menubelo/issues)

</div>

---

## 📖 About This Project

**Menubelo** is a meal-planning and grocery-list web application designed to eliminate weekly cooking decision fatigue. Organize your recipes, schedule meals by day and time slot, and automatically generate consolidated shopping lists with printable supermarket checklists.

Built for practical weekly cooking workflows, Menubelo helps you plan ahead, reduce food waste, and streamline your grocery shopping experience.

### 🎨 Created by MC Monkeys

This project was built by **[MC Monkeys](https://mcmonkeys.up.railway.app/)** — where humans and AI agents collaborate to build real-world digital solutions. MC Monkeys is the team behind **Mission Control for Claude Code**, a system that makes AI agent work visible in real time.

**Menubelo** was developed using this human-AI collaborative approach, combining strategic planning, modern development practices, and operational visibility to deliver a production-ready application.

**Learn more:** [https://mcmonkeys.up.railway.app/](https://mcmonkeys.up.railway.app/)

---

## ✨ Features

- 📚 **Recipe Library** — Create and manage your collection of favorite recipes
- 🔗 **Smart Recipe Import** — Parse recipes from URLs or paste raw text with AI-powered extraction
- 📅 **Weekly Meal Planner** — Visual week-at-a-glance layout with customizable meal slots (breakfast, lunch, snack, dinner)
- 🛒 **Auto-Generated Grocery Lists** — Automatically consolidate ingredients from your weekly plan
- ✅ **Interactive Shopping** — Check off items as you shop with category-organized lists
- 🖨️ **Printable Checklists** — Export clean, printer-friendly grocery lists for the supermarket
- 🔢 **Serving Adjustments** — Scale recipe quantities up or down based on servings needed
- 🏷️ **Ingredient Categories** — Organize shopping by aisle (dairy, produce, pantry, etc.)
- 🌐 **Spanish UI** — Interface optimized for Spanish-speaking users
- 📱 **Responsive Design** — Works seamlessly on desktop, tablet, and mobile devices

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **[Next.js 14](https://nextjs.org/)** | React framework with App Router for optimal performance and server-side rendering |
| **[TypeScript](https://www.typescriptlang.org/)** | Type-safe development and enhanced developer experience |
| **[Prisma](https://www.prisma.io/)** | Type-safe ORM with auto-generated client and migration system |
| **[SQLite](https://www.sqlite.org/)** | Zero-configuration local database (easily swappable for PostgreSQL) |
| **[Tailwind CSS](https://tailwindcss.com/)** | Utility-first styling with custom design tokens |
| **[Anthropic Claude](https://www.anthropic.com/)** | AI-powered recipe parsing and ingredient extraction (optional) |
| **[Lucide React](https://lucide.dev/)** | Beautiful, consistent icon library |

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.17 or higher)
- **npm** (v9 or higher) or **yarn** / **pnpm**
- **Git** for version control

---

## 🚀 Installation

Follow these steps to get Menubelo running on your local machine:

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/menubelo.git
cd menubelo
```

### 2. Install Dependencies

```bash
npm install
```

Or if you prefer yarn:

```bash
yarn install
```

### 3. Set Environment Variables

Create `.env` file in the root directory:

```bash
DATABASE_URL="file:./prisma/dev.db"
ANTHROPIC_API_KEY=your_key_here
```

**Notes:**
- AI parsing is **optional** — the app includes fallback parsing when no API key is provided
- Database is SQLite by default (no additional setup required)
- `.env` is gitignored and will never be committed

### 4. Set Up Database and Seed Demo Data

```bash
npm run db:setup
```

This command will:
- Run Prisma migrations to create the database schema
- Seed the database with demo recipes and meal plans

### 5. Run the Development Server

```bash
npm run dev
```

If port `3000` is busy, use a custom port:

```bash
npm run dev -- -p 3010
```

### 6. Open in Browser

Navigate to [http://localhost:3000](http://localhost:3000) to see the application running.

The page will automatically reload when you make changes to the code.

---

## 📱 How to Use

### Recipe Management

1. **Browse Recipes** (`/recetas`)
   - View your complete recipe collection
   - Search recipes by name
   - Click any recipe to view full details

2. **Add New Recipe** (`/agregar`)
   - **Option A: Paste URL** — Import from YouTube, TikTok, or recipe websites
   - **Option B: Paste Text** — Copy/paste recipe text for AI extraction
   - Review parsed ingredients before saving
   - Edit details (servings, prep time, cook time)
   - Add optional recipe image URL

3. **Edit Recipes**
   - Open recipe details
   - Modify name, description, or ingredients
   - Update serving sizes
   - Delete recipes you no longer need

### Weekly Meal Planning

1. **Navigate to Planner** (`/planificador`)
   - See the current week at a glance
   - Use arrow navigation to browse previous/next weeks
   - Visual week strip shows days with planned meals

2. **Add Meals to Your Week**
   - Click "Add a meal" under any day
   - Select meal slot (breakfast, lunch, snack, dinner)
   - Choose a recipe from your library
   - Adjust servings for that meal

3. **Manage Planned Meals**
   - View all meals organized by day
   - Edit servings without changing the recipe
   - Remove meals from your plan
   - Rearrange meals across different days

4. **Generate Grocery List**
   - Click "Generate Shopping List" button
   - Automatically aggregates all ingredients from your week
   - Scales quantities based on servings
   - Organizes by ingredient category

### Grocery Shopping

1. **View Your List** (`/compras`)
   - See all ingredients grouped by category
   - Categories appear in shopping-friendly order
   - Total quantities calculated automatically

2. **Shop Interactively**
   - Check off items as you add them to your cart
   - Checked items move to the bottom
   - Progress indicator shows completion percentage

3. **Regenerate List**
   - Make changes to your meal plan
   - Click "Regenerate" to update your grocery list
   - All changes reflected instantly

4. **Print Your List** (`/compras/imprimir`)
   - Export a clean, printer-friendly checklist
   - Organized by category for efficient shopping
   - Checkbox format for manual marking
   - Perfect for taking to the supermarket

---

## 📂 Project Structure

```
menubelo/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout with navigation
│   ├── page.tsx                  # Home page
│   ├── globals.css               # Global styles + design tokens
│   ├── recetas/                  # Recipe library page
│   │   └── page.tsx              # Browse and search recipes
│   ├── agregar/                  # Add recipe flow
│   │   └── page.tsx              # Import from URL or text
│   ├── planificador/             # Weekly meal planner
│   │   └── page.tsx              # Week view with meal slots
│   ├── compras/                  # Grocery list management
│   │   ├── page.tsx              # Interactive grocery list
│   │   └── imprimir/             # Printable checklist
│   │       └── page.tsx
│   └── api/                      # API route handlers
│       ├── recipes/              # Recipe CRUD operations
│       │   ├── route.ts          # GET (list/search) + POST (create)
│       │   └── [id]/             # GET, PATCH, DELETE by ID
│       ├── parse/                # AI recipe parsing
│       │   └── route.ts          # Parse from URL or text
│       ├── planner/              # Week plan management
│       │   ├── route.ts          # GET (list) + POST (create plan)
│       │   └── [id]/             # Plan details and entries
│       └── grocery/              # Grocery list generation
│           ├── route.ts          # GET all + POST generate
│           └── [weekPlanId]/     # Week-specific grocery lists
├── components/                   # Reusable React components
│   ├── Navbar.tsx                # Main navigation bar
│   ├── Footer.tsx                # Site footer
│   ├── recipe/                   # Recipe-related components
│   ├── planner/                  # Planner-specific components
│   ├── grocery/                  # Grocery list components
│   └── ui/                       # Shared UI primitives
├── lib/                          # Utility functions and helpers
│   ├── db.ts                     # Prisma client singleton
│   ├── grocery.ts                # Grocery list generation logic
│   └── utils.ts                  # Shared utility functions
├── prisma/                       # Database schema and migrations
│   ├── schema.prisma             # Prisma schema definition
│   ├── seed.ts                   # Database seed script
│   ├── migrations/               # Migration history
│   └── dev.db                    # SQLite database file (gitignored)
├── docs/                         # Documentation
│   ├── architecture.md           # Technical architecture decisions
│   ├── api-spec.md               # API endpoint documentation
│   ├── design-tokens.md          # Design system tokens
│   ├── wireframe-*.md            # UI wireframes and flows
│   └── test-plan.md              # Testing strategy
├── public/                       # Static assets
│   └── images/                   # Image files
├── .env                          # Environment variables (gitignored)
├── .env.example                  # Example environment file
├── .gitignore                    # Git exclusions
├── next.config.mjs               # Next.js configuration
├── tailwind.config.ts            # Tailwind + design tokens
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies and scripts
```

---

## 🎯 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server at `localhost:3000` |
| `npm run build` | Create optimized production build |
| `npm run start` | Start production server (requires build first) |
| `npm run lint` | Run ESLint to check code quality |
| `npm run db:migrate` | Create and apply new Prisma migration |
| `npm run db:generate` | Generate Prisma client from schema |
| `npm run db:seed` | Populate database with demo data |
| `npm run db:setup` | **Run migrations + seed in one command** (recommended for setup) |

---

## 🗺️ Roadmap

### Phase 0 (Current) — Local-First Prototype ✅
- ✅ Complete recipe library management
- ✅ AI-powered recipe parsing (URL and text)
- ✅ Visual weekly meal planner
- ✅ Automatic grocery list generation
- ✅ Printable shopping checklists
- ✅ SQLite database with seed data
- ✅ Responsive UI/UX
- ✅ Spanish language support

### Phase 1 — Multi-User & Cloud Database
- ⏳ User authentication (email/password + social login)
- ⏳ PostgreSQL database migration
- ⏳ User-specific recipe collections
- ⏳ Privacy controls (private/public recipes)
- ⏳ Cloud deployment (Vercel + Supabase or Neon)

### Phase 2 — Collaboration & Sharing
- ⏳ Share recipes with friends and family
- ⏳ Community recipe marketplace
- ⏳ Meal plan templates
- ⏳ Recipe ratings and reviews
- ⏳ Recipe forking and remixing

### Phase 3 — Advanced Features
- ⏳ Nutritional information tracking
- ⏳ Dietary restrictions and preferences
- ⏳ Budget tracking for grocery lists
- ⏳ Recipe scaling calculator
- ⏳ Leftover management system
- ⏳ Integration with grocery delivery APIs

### Phase 4 — Mobile & Smart Home
- ⏳ Native mobile apps (iOS + Android)
- ⏳ Progressive Web App (PWA)
- ⏳ Voice assistant integration (Alexa, Google Assistant)
- ⏳ Smart fridge integration
- ⏳ Push notifications for meal reminders

---

## 🌟 Key Features in Detail

### AI-Powered Recipe Parsing

Upload a recipe URL or paste recipe text, and Menubelo uses Claude AI to intelligently extract:
- Recipe title and description
- Ingredient list with quantities and units
- Preparation and cooking times
- Serving sizes

Supports popular platforms:
- YouTube cooking videos (extracts from description)
- TikTok recipe videos
- Recipe blogs with structured data (JSON-LD)
- Plain text recipes

**Fallback mode:** When no API key is provided, basic pattern matching extracts ingredients without AI.

### Visual Weekly Planner

Day-first layout optimized for how people actually plan meals:
- Vertical day-based rows (Mon–Sun)
- Horizontal meal slots (breakfast, lunch, snack, dinner)
- Flexible meal counts (not every day needs all slots)
- Quick recipe assignment (2 taps max)
- Per-meal serving adjustments
- Week navigation to plan multiple weeks ahead

### Smart Grocery List Generation

Automatically aggregates ingredients from your entire week:
- Combines duplicate ingredients across meals
- Scales quantities based on servings
- Groups by category (dairy, produce, meat, pantry, etc.)
- Maintains units (grams, cups, tablespoons, etc.)
- Interactive checkbox system for shopping
- Live progress tracking

### Printable Supermarket Checklist

Clean, printer-friendly export designed for real-world shopping:
- Category-organized layout
- Checkbox format for manual marking
- Optimized spacing for easy scanning
- No unnecessary UI elements
- Single-page format when possible

---

## 🐛 Known Issues & Limitations

### Current Limitations (Phase 0 Prototype)

**⚠️ IMPORTANT: This is a Phase 0 prototype designed for local, single-user use. It is NOT production-ready for multi-user or public deployment.**

#### Security Limitations
- **No Authentication:** All data is publicly accessible to anyone who can access the app
- **Single-User Only:** No user accounts, ownership, or privacy controls
- **No Rate Limiting:** API endpoints can be called unlimited times (abuse vector)
- **Local Database Only:** SQLite is not designed for concurrent multi-user access
- **No CORS Protection:** API routes accept requests from any origin
- **No Input Validation:** Request payloads are not strictly validated

#### Technical Limitations
- **No Backend Persistence:** Refreshing after database reset loses all data
- **No File Uploads:** Recipe images must be provided as URLs
- **Limited Recipe Parsing:** AI parsing requires Anthropic API key (optional)
- **No Offline Support:** Requires active internet connection
- **SQLite Only:** Database file stored locally (not portable across deployments)

#### Data Limitations
- **No Audit Trail:** Cannot track who created/modified recipes
- **No Undo/Restore:** Deleted recipes are permanently removed
- **No Data Export:** No built-in backup or export functionality
- **Seed Data Only:** Demo recipes provided for testing, not production content

#### Planned Improvements (Future Phases)
These limitations are intentional for Phase 0 and will be addressed in:
- **Phase 1:** Authentication, PostgreSQL, cloud deployment, input validation
- **Phase 2:** Rate limiting, CORS, security headers, audit logging
- **Phase 3:** Data export, backup, recovery systems

**Use Case:** Menubelo Phase 0 is perfect for:
- Personal meal planning on a local development machine
- Testing and exploring the feature set
- Demonstrations and prototypes
- Learning Next.js + Prisma architecture

**Not Suitable For:**
- Production deployment with real users
- Shared hosting or public internet access
- Sensitive or proprietary recipe data
- Commercial or business use

---

## 🤝 Contributing

We welcome contributions! If you'd like to contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please ensure your code:
- Follows the existing TypeScript and code style
- Passes all linting checks (`npm run lint`)
- Includes appropriate comments and documentation
- Works across all major browsers

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 📞 Contact & Support

### Project Creator: MC Monkeys

**MC Monkeys** is a human-AI collaborative system building real-world digital solutions. The team uses Claude Code agents with full operational visibility through Mission Control.

- 🌐 **Website:** [https://mcmonkeys.up.railway.app/](https://mcmonkeys.up.railway.app/)
- 🎯 **Mission Control:** [Live Demo](https://mcmonkeys.up.railway.app/app)
- 📖 **Our Story:** [Read the Story](https://mcmonkeys.up.railway.app/web/story)
- 💼 **GitHub:** [@billymcmonkeys](https://github.com/billymcmonkeys)
- 📧 **Email:** billy.mcmonkeys@gmail.com

### Need Help?

- 🐛 [Report a Bug](https://github.com/yourusername/menubelo/issues)
- 💡 [Request a Feature](https://github.com/yourusername/menubelo/issues)
- 💬 [Ask a Question](https://github.com/yourusername/menubelo/discussions)

---

## 🙏 Acknowledgments

- Built using **human-AI collaborative workflows** with Claude Code agents
- Developed with full operational visibility through **[MC Monkeys Mission Control](https://mcmonkeys.up.railway.app/)**
- Recipe parsing powered by [Anthropic Claude](https://www.anthropic.com/)
- Icons by [Lucide](https://lucide.dev/)
- Built on the amazing [Next.js](https://nextjs.org/) framework
- Database magic by [Prisma](https://www.prisma.io/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)
- Inspired by real-world meal planning challenges
- Built with ❤️ for home cooks everywhere

---

<div align="center">

### 🍽️ Simplify your weekly cooking! 🍽️

**[Visit MC Monkeys](https://mcmonkeys.up.railway.app/)** | **[Star this repo ⭐](https://github.com/yourusername/menubelo)**

Built with human-AI collaboration by [MC Monkeys](https://mcmonkeys.up.railway.app/) 🐵

*Making AI agent work visible. One project at a time.*

</div>
