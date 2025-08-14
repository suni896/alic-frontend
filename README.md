# ALIC Frontend

A collaborative learning platform frontend built with React and TypeScript.

## Features

### 🌟 Main Features
- **Real-time Chat**: Interactive messaging with AI bots and other users
- **Room Management**: Create, join, and manage learning rooms
- **User Authentication**: Secure login and registration system
- **Responsive Design**: Works on desktop and mobile devices

### 📄 Shared Document Feature
The platform includes a powerful shared document feature powered by Etherpad:

#### Basic Usage
1. **Open Document**: Click the "Document" (Shared Document) button on the right side of the screen
2. **Switch Modes**: 
   - **Docked Mode**: Document panel is attached to the right side
   - **Floating Mode**: Document becomes a movable window

#### Advanced Features
- **Drag & Drop**: In floating mode, drag the document window by its header
- **Resize**: 
  - **Docked Mode**: Drag the left edge to resize horizontally
  - **Floating Mode**: Drag any edge or corner to resize in all directions
- **Smart Boundaries**: Window stays within screen bounds with safety margins
- **Auto-sizing**: Optimized default sizes for different modes

#### Keyboard & Mouse Controls
- **Header Drag Handle**: Visual indicator shows draggable area
- **Resize Handles**: Corner indicators appear on hover
- **Mode Toggle**: Click the maximize/minimize button to switch between modes
- **Auto-close**: Document closes when switching rooms

#### Technical Details
- Built with Etherpad for real-time collaboration
- Responsive design adapts to different screen sizes
- Persistent state across room visits
- Optimized performance with React hooks

## Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone [repository-url]

# Navigate to project directory
cd alic-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Setup
Create a `.env` file in the root directory with the following variables:
```env
VITE_API_BASE_URL=your_api_url
VITE_ETHERPAD_URL=your_etherpad_url
```

## Project Structure
```
src/
├── components/           # Reusable UI components
│   ├── loggedIn/        # Components for authenticated users
│   │   ├── EtherpadDrawer.tsx    # Shared document component
│   │   ├── EtherpadComponent.tsx # Etherpad integration
│   │   └── ...
│   └── loggedOut/       # Components for guest users
├── pages/               # Page components
├── utils/               # Utility functions and configurations
└── types/               # TypeScript type definitions
```

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Technologies Used
- **React 18** - Frontend framework
- **TypeScript** - Type safety
- **Styled Components** - CSS-in-JS styling
- **Vite** - Build tool and dev server
- **Etherpad** - Collaborative document editing
- **React Router** - Client-side routing
- **React Markdown** - Markdown rendering

## License
This project is licensed under the MIT License - see the LICENSE file for details.
