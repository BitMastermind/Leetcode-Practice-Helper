# Leetcode-Practice-Helper

A beautifully designed Next.js application to help you practice LeetCode problems efficiently. Filter and sort through problems by difficulty, tags, likes, acceptance rate, and more to find the perfect problems for your learning journey.

## ✨ Features

- 🎯 **Advanced Filtering**: Filter by difficulty, topic tags, and search queries
- 📊 **Smart Sorting**: Sort by likes, acceptance rate, difficulty, total solves, title, access (Free/Premium), or solved status
- 🎨 **Beautiful UI**: Modern, motivating design with smooth animations and dark mode support
- 🔍 **Search**: Quickly find problems by title, ID, or tags
- 📱 **Responsive**: Works perfectly on desktop, tablet, and mobile devices
- 🌙 **Dark Mode**: Toggle between light and dark themes for comfortable coding at any time
- 👤 **User Profiles**: Login with your LeetCode username to track solved problems and view statistics
- 📈 **Statistics Dashboard**: View submission heatmap, topic statistics, and contest rankings
- 💾 **Local Storage**: Your solved problems and preferences are saved locally

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/BitMastermind/Leetcode-Practice-Helper-.git
cd Leetcode-Practice-Helper-
```

2. Install dependencies:
```bash
npm install
```

3. Make sure `data.json` is in the `public` folder (it should already be there)

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📁 Project Structure

```
leetcode-practice/
├── app/
│   ├── api/
│   │   └── leetcode/
│   │       └── route.ts          # LeetCode API routes
│   ├── layout.tsx                # Root layout with metadata
│   ├── page.tsx                  # Main page with filtering and problem list
│   ├── globals.css               # Global styles
│   └── favicon.ico
├── components/
│   ├── FilterBar.tsx             # Filter and sort controls
│   ├── ProblemCard.tsx           # Individual problem card component
│   ├── Login.tsx                 # User login component
│   ├── UserProfile.tsx           # User profile display
│   ├── SubmissionHeatmap.tsx     # Submission calendar heatmap
│   ├── TopicStats.tsx            # Topic statistics component
│   └── ThemeToggle.tsx           # Dark mode toggle
├── lib/
│   └── leetcode-api.ts           # LeetCode API client functions
├── types/
│   └── index.ts                  # TypeScript type definitions
├── public/
│   └── data.json                 # LeetCode problems data
└── package.json
```

## 🎮 How to Use

### Filtering Problems

1. **By Difficulty**: Select Easy, Medium, Hard, or All
2. **By Tags**: Add multiple topic tags to find problems on specific topics
3. **Search**: Type in the search bar to find problems by title, ID, or tags

### Sorting Problems

Choose from multiple sorting options:
- **Most Liked**: Problems with the highest number of likes
- **Acceptance Rate**: Problems by their acceptance percentage
- **Difficulty**: Easy → Medium → Hard
- **Most Solved**: Problems solved by the most users
- **Title (A-Z)**: Alphabetical order
- **Access (Free First)**: Free problems first, then Premium
- **Solved Status**: Your solved problems first (requires login)

### User Features

1. **Login**: Enter your LeetCode username to track your progress
2. **Track Solved Problems**: Mark problems as solved/un solved
3. **View Statistics**: See your submission heatmap, topic statistics, and contest rankings
4. **Auto-sync**: Automatically sync solved problems from your LeetCode profile

### Using Problem Cards

Each problem card shows:
- Problem number and title
- Difficulty level (color-coded)
- Like count and acceptance rate
- Topic tags (toggle visibility)
- Premium status
- Total solves count

Click on any card to open the problem on LeetCode!

## 🛠️ Built With

- [Next.js 16](https://nextjs.org/) - React framework with App Router
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS 4](https://tailwindcss.com/) - Utility-first CSS framework
- [Framer Motion](https://www.framer.com/motion/) - Animation library
- [React 19](https://react.dev/) - UI library

## 📝 Data Format

The `data.json` file should contain an array of LeetCode problems with the following structure:

```typescript
{
  questionId: string;
  title: string;
  titleSlug: string;
  isPaidOnly: boolean;
  difficulty: "Easy" | "Medium" | "Hard";
  likes: number;
  dislikes: number;
  categoryTitle: string;
  acRate: string;
  frontendQuestionId: string;
  paidOnly: boolean;
  topicTags: string; // Semicolon-separated tags
  hasSolution: boolean;
  hasVideoSolution: boolean;
  acRateRaw: number;
  totalAccepted: number;
  totalSubmission: number;
}
```

## 🎯 Tips for Effective Practice

1. **Start with Liked Problems**: Sort by "Most Liked" to find well-received problems
2. **Filter by Acceptance Rate**: Find problems with moderate acceptance rates (30-60%) for balanced practice
3. **Use Tags Strategically**: Combine multiple tags to focus on specific patterns (e.g., Binary Search + Two Pointers)
4. **Mix Difficulties**: Practice across all difficulty levels to build comprehensive skills
5. **Track Your Progress**: Login and mark problems as solved to track your journey

## 🚧 Troubleshooting

### Build Errors

If you encounter build errors, try:
```bash
rm -rf .next node_modules
npm install
npm run dev
```

### Data Not Loading

Make sure `data.json` is in the `public` folder and is a valid JSON array.

### API Issues

If LeetCode API calls fail, check your internet connection. The app uses LeetCode's public GraphQL API.

## 📄 License

This project is for personal practice use. LeetCode is a trademark of LeetCode.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

---

**Happy Coding! 🚀 Keep practicing and level up your skills!**
