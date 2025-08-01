# PlusVans Admin Dashboard

Next.js admin dashboard for PlusVans management system.

## Prerequisites

- Node.js 18+
- pnpm
- Docker (for local backend)

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd admin-master
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   Copy `.env.local.example` to `.env.local` and update the values:
   ```bash
   cp .env.local.example .env.local
   ```
   
   Update the following variables in `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
   ```

4. **Start the development server**
   ```bash
   pnpm dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)** in your browser

## Available Scripts

- `pnpm dev` - Start the development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm test` - Run tests

## Deployment

### Cloudflare Pages

1. Push your code to a GitHub repository
2. Log in to Cloudflare Dashboard
3. Go to Pages > Create a project
4. Connect your GitHub repository
5. Configure build settings:
   - Framework preset: Next.js
   - Build command: `pnpm build`
   - Build output directory: `.next`
   - Root directory: `/`
6. Add environment variables in the Cloudflare Pages settings
7. Deploy!

## Health Check

You can check the health of the application at `/healthz`

## Contributing

1. Create a new branch for your feature
2. Commit your changes
3. Push to the branch
4. Create a new Pull Request
