# DSA Visualization Setup Instructions


## Prerequisites

Before you begin, you need to install the following software on your laptop:

1. **Node.js and npm** - The project runs on Node.js and uses npm for package management.
   - Download and install from [nodejs.org](https://nodejs.org/) (Choose the LTS version)
   - Verify installation by opening a terminal/command prompt and typing:
     ```
     node --version
     npm --version
     ```

2. **Git** - Required to clone the repository.
   - Download and install from [git-scm.com](https://git-scm.com/downloads)
   - Verify installation by opening a terminal/command prompt and typing:
     ```
     git --version
     ```

## Step-by-Step Setup Instructions

1. **Clone the repository**
   - Open a terminal/command prompt
   - Navigate to the directory where you want to store the project
   - Run the following command:
     ```
     git clone https://github.com/tnguy19/dsa-visualization.git
     ```

2. **Navigate to the project directory**
   ```
   cd dsa-visualization
   ```

3. **Install project dependencies**
   ```
   npm install
   ```

4. **Start the development server**
   ```
   npm start
   ```
   This will start the development server and automatically open the application in your default web browser at port 3000


## Fixing Common Issues

1. **Dependency issues**: If you encounter errors during `npm install`, try:
   ```
   npm clean-cache --force
   ```
   Then run `npm install` again.

2. **Outdated Node.js**: If you get errors related to Node.js versions, make sure you're using a version compatible with the project

## Development Commands

- `npm start`: Runs the app in development mode
- `npm test`: Launches the test runner
- `npm run build`: Builds the app for production in the 'build' folder
