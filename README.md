# Hierarchy Visualizer

A full-stack application built for the **Bajaj Finserv Health Dev Challenge**. This project accepts an array of directed graph edges, evaluates the hierarchical structures to identify trees, multi-parent conflicts, and circular dependencies (cycles), and visualizes the results on a modern, dark-mode dashboard.

## 🚀 Features

- **Robust REST API (`POST /bfhl`)**: Formats raw edge arrays and translates them into structured hierarchies. Features include:
  - Strict input format validation (e.g., `A->B`).
  - First-parent-wins conflict resolution for multi-parent nodes.
  - Cycle detection using weakly connected components finding algorithms.
  - Tree-depth calculation.
  - Generates analytical summaries (total valid trees, total cyclic groups, largest tree root).
- **Interactive UI Dashboard**:
  - Premium custom dark-mode interface built purely with CSS.
  - Formatted text-area input field for raw edges.
  - Real-time log filtering for invalid data formatting and duplicate edges.
  - Dynamic visual structures parsing cyclic groups distinctively from valid nested trees.
- **Performance**: Resolves recursive graphing layouts across massive datasets under `80ms` locally, solidly beating the strict `3s` constraint.
- **CORS Compliant**: Fully accepts Cross-Origin Resource Sharing protocols natively.

## 💻 Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: JavaScript (ES6+)
- **Styling**: Vanilla CSS (Tailwind-free)
- **Fonts**: Plus Jakarta Sans, JetBrains Mono

## ⚙️. Getting Started

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm or yarn

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/somesh-mikey/hierarchy_visualizer.git
   cd hierarchy_visualizer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`.

## 📡 API Specification

**Endpoint:** `/bfhl`  
**Method:** `POST`  
**Content-Type:** `application/json`  

### Request Body
```json
{
  "data": ["A->B", "A->C", "B->D", "B->E", "M->N", "N->M"]
}
```

### Example Response Schema
```json
{
  "user_id": "someshdas_17122004",
  "email_id": "sd7790@srmist.edu.in",
  "college_roll_number": "RA2311003010467",
  "hierarchies": [
    {
      "root": "A",
      "tree": {
        "A": {
          "B": {
            "D": {},
            "E": {}
          },
          "C": {}
        }
      },
      "depth": 3
    },
    {
      "root": "M",
      "tree": {},
      "has_cycle": true
    }
  ],
  "invalid_entries": [],
  "duplicate_edges": [],
  "summary": {
    "total_trees": 1,
    "total_cycles": 1,
    "largest_tree_root": "A"
  }
}
```

## 📌 Algorithmic Handling
- **Node Validation:** Restricts inputs exclusively to capital alphabetic edge nodes (`[A-Z]->[A-Z]`). Anything outside string formats is appended securely into `invalid_entries`.
- **Multi-parent resolution:** Collisions are handled gracefully based on first occurrence parent mappings. Consequent parent assignments to the same node are ignored natively without failure.
- **Cycle Omissions:** Effectively omits circular loops internally to avoid maximum call stack sizes and returns them systematically natively.

## 📝 License
Developed explicitly for the Bajaj Finserv evaluation assessment.
