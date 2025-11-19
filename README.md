# Molecular Assay Explorer

An interactive web application for visualizing and analyzing molecular structures and compound assay data. Built with React and Mol*, this tool enables researchers to explore protein-ligand interactions, toxicity profiles, and IC50 values in an intuitive interface.

![Molecular Assay Explorer](https://img.shields.io/badge/Built%20with-Lovable-ff69b4)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

- **Interactive 3D Molecular Visualization**: Powered by Mol* for high-quality protein structure rendering
- **Multiple Protein Support**: Explore different protein structures (6LU7, 1HSG, 1VRT, 4YTH, 5Y6H)
- **Toxicity-Based Coloring**: Visual representation of compound toxicity levels (Low, Moderate, High)
- **Comprehensive Data Analysis**: 
  - Sortable assay data table with compound IDs and IC50 values
  - Statistical summary panel
  - Toxicity distribution pie chart
- **Responsive Design**: Split-panel interface with resizable sections
- **Real-time Ligand Focusing**: Click on compounds to focus on their molecular structure

## 🚀 Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Molecular Visualization**: Mol* (Molstar)
- **Data Parsing**: PapaParse for CSV processing
- **Charts**: Recharts for data visualization
- **State Management**: React Hooks
- **Routing**: React Router v6

## 📦 Installation

### Prerequisites

- Node.js 18+ and npm installed
- Git

### Setup

```bash
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project directory
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

## 🏗️ Project Structure

```
molecular-assay-explorer/
├── public/
│   └── data/              # CSV assay data files
│       ├── 6LU7_assay.csv
│       ├── 1HSG_assay.csv
│       ├── 1VRT_assay.csv
│       ├── 4YTH_assay.csv
│       └── 5Y6H_assay.csv
├── src/
│   ├── components/
│   │   ├── AssayTable.tsx        # Compound data table
│   │   ├── MolstarViewer.tsx     # 3D molecular viewer
│   │   ├── StatsPanel.tsx        # Statistics panel
│   │   ├── ToxicityPieChart.tsx  # Toxicity distribution chart
│   │   └── ui/                   # shadcn/ui components
│   ├── pages/
│   │   ├── Index.tsx             # Main application page
│   │   └── NotFound.tsx          # 404 page
│   ├── App.tsx                   # Root component
│   ├── main.tsx                  # Entry point
│   └── index.css                 # Global styles
├── tailwind.config.ts
├── vite.config.ts
└── package.json
```

## 📊 Data Format

The application reads CSV files with the following format:

```csv
Compound ID,IC50 (nM),Toxicity
CHEMBL123456,45.2,Low
CHEMBL789012,150.8,Moderate
CHEMBL345678,890.5,High
```

### Adding New Proteins

1. Add your CSV file to `public/data/` following the naming convention: `{PROTEIN_ID}_assay.csv`
2. Update the protein selector in `MolstarViewer.tsx` to include your new protein
3. Ensure the PDB structure is available (fetched from RCSB PDB)

## 🎨 Features in Detail

### Molecular Viewer
- Load protein structures from PDB
- Color ligands by toxicity level
- Toggle binding pocket surface visualization
- Toggle hydrogen bond display
- Camera controls for rotation and zoom

### Data Analysis
- **IC50 Values**: Half-maximal inhibitory concentration in nanomolar units
- **Toxicity Levels**: Categorized as Low, Moderate, or High
- **Interactive Table**: Click rows to focus on specific compounds in 3D viewer
- **Statistics**: Real-time calculation of mean, median, min, and max IC50 values

## 🛠️ Development

### Available Scripts

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Building for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

## 🚀 Deployment

This project can be deployed to:
- **Lovable Platform**: Click "Publish" in the Lovable editor
- **Vercel/Netlify**: Connect your GitHub repository for automatic deployments
- **GitHub Pages**: Use the build output from `dist/`

## 📝 License

Copyright © 2025 Dev Shah. All rights reserved.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 👨‍💻 Author

**Dev Shah**

- Built with [Lovable](https://lovable.dev)

## 🙏 Acknowledgments

- [Mol*](https://molstar.org/) for the molecular visualization library
- [RCSB PDB](https://www.rcsb.org/) for protein structure data
- [shadcn/ui](https://ui.shadcn.com/) for UI components

## 📞 Support

For support, please open an issue in the GitHub repository.

---

Made with ❤️ using [Lovable](https://lovable.dev)
