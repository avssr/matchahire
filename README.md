# MatchaHire v3

An AI-powered hiring platform where candidates interact with role-specific GPT personas instead of reading static job descriptions.

## Features

- 🤖 AI-powered job interviews
- 🎯 Role-specific GPT personas
- 📊 HR dashboard for managing candidates
- 🏢 Company configuration and settings
- 🔒 Secure authentication system

## Tech Stack

- Next.js 15
- TypeScript
- Tailwind CSS
- Supabase
- OpenAI GPT-4

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/avssr/matchahire.git
   cd matchahire
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file with the following variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   OPENAI_API_KEY=your_openai_api_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/              # Next.js app directory
│   ├── api/          # API routes
│   ├── auth/         # Authentication pages
│   ├── company/      # Company settings
│   ├── dashboard/    # HR dashboard
│   └── roles/        # Job listings
├── components/       # Reusable components
│   ├── ui/          # UI components
│   └── sections/    # Page sections
├── lib/             # Utility functions
└── types/           # TypeScript types
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
