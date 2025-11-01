# 🤝 Contributing to AlgoVisualizer

Thank you for your interest in contributing to **AlgoVisualizer** — an open-source initiative to make **Data Structures & Algorithms** more interactive and engaging.  
We welcome contributions of all experience levels — from first-time contributors to seasoned developers. 🚀

---

## 🌐 About the Project

**AlgoVisualizer** is a modern, browser-based platform built with **React**, **Vite**, and **Tailwind CSS**.  
It helps users understand algorithms through **real-time visualizations**, including:

- Sorting algorithms (Bubble, Merge, Quick, etc.)
- Graph traversals (BFS, DFS, Dijkstra)
- Pathfinding simulations
- Data structure demonstrations

---

## ⚙️ Local Development Setup

### 1. Fork the Repository

Click **Fork** on the top-right of the [main repository](https://github.com/mahaveergurjar/AlgoVisualizer) to create your own copy.

### 2. Clone Your Fork

```bash
git clone https://github.com/<your-username>/AlgoVisualizer.git
cd AlgoVisualizer
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Development Server

```bash
npm run dev
```

Now, open your browser and visit **http://localhost:5173**.  
You should see the AlgoVisualizer homepage up and running!

---

## 🌿 Branch Naming Convention

Each new feature or fix should be developed in a separate branch.  
Use the following naming convention:

```
feature/add-heap-sort
fix/animation-delay
docs/update-readme
refactor/optimize-graph-component
```

---

## 🧠 Code Style Guidelines

To maintain consistency and readability across the project:

- Use **Tailwind CSS** for styling (avoid inline styles).
- Follow **ESLint** rules defined in the project.
- Use **React functional components** with **Hooks**.
- Keep components modular, clean, and reusable.
- Prefer **descriptive variable and function names**.
- Maintain a clear file structure under `/src/components`.

---

## 📝 Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) standard for clarity and automation.

**Format:**

```
<type>: <short description>
```

**Examples:**

```
feat: add merge sort visualization
fix: resolve incorrect array indexing
docs: improve setup instructions in README
refactor: optimize sorting animation loop
```

**Common Types:**

| Type       | Description                                |
| ---------- | ------------------------------------------ |
| `feat`     | Adds a new feature                         |
| `fix`      | Bug fix                                    |
| `docs`     | Documentation change                       |
| `style`    | UI, CSS, or formatting updates             |
| `refactor` | Code restructuring without behavior change |
| `chore`    | Maintenance or dependency update           |

---

## 🧪 Testing Your Changes

Before submitting a pull request, ensure that:

- The app runs locally without errors (`npm run dev`)
- No warnings or errors appear in the browser console
- Existing features remain functional
- New features work smoothly across devices

If possible, attach **screenshots or GIFs** showcasing your change.

---

## 🔄 Submitting a Pull Request (PR)

1. **Push your branch** to your fork:

   ```bash
   git push origin <branch-name>
   ```

2. Open your fork on GitHub and click **“Compare & pull request”**.

3. In your PR description:

   - Explain **what you changed and why**
   - Mention related issue numbers (e.g., `Fixes #12`)
   - Include screenshots or GIFs for UI updates

4. **Wait for review** from maintainers.
   - We may suggest improvements — don’t worry, it’s part of the process!
   - Once approved, your PR will be merged.

---

## 🏆 Contribution Tips

- Check **existing issues** before opening a new one.
- Keep PRs **focused** and **concise**.
- Be respectful and constructive in discussions.
- Add comments for complex logic — clarity helps reviewers.
- Don’t forget to **star ⭐ the repo** if you like the project!

---

## 💬 Need Help?

If you encounter issues or have questions:

- Browse [existing issues](https://github.com/mahaveergurjar/AlgoVisualizer/issues)
- Open a new one if necessary
- Tag maintainers politely for guidance

---

## 🎉 Thank You!

Your contributions help make **AlgoVisualizer** a better learning tool for developers worldwide.  
We appreciate your time, creativity, and effort — keep coding and keep visualizing! 💙
