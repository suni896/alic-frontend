# Etherpad Integration for Chat Room

This project integrates Etherpad collaborative editor with the chat room interface, allowing users to collaborate on documents while chatting.

## Features

- Slide-out drawer interface for Etherpad editor
- Room-specific document sharing (each chat room has its own document)
- Consistent UI styling with the main application
- Environment-aware configuration
- Responsive design

## Architecture

The integration consists of several key components:

### 1. Configuration (`etherpadConfig.ts`)

The configuration file manages environment-specific settings:

```typescript
// Environment configuration
const ENV = {
  development: {
    ETHERPAD_URL: 'http://localhost:9001',
  },
  production: {
    ETHERPAD_URL: 'https://etherpad.example.com',
  },
};
```

### 2. Etherpad Component (`EtherpadComponent.tsx`)

A React component that embeds the Etherpad editor in an iframe:

```typescript
const EtherpadComponent: React.FC<EtherpadProps> = ({
  roomId,
  width = '100%',
  height = '100%',
  showControls = true,
}) => {
  // Generates pad ID based on room ID
  const padId = roomId ? `${ETHERPAD_CONFIG.PAD_PREFIX}${roomId}` : 'shared-notes';
  
  // ...
}
```

### 3. Drawer Component (`EtherpadDrawer.tsx`)

A slide-out drawer that contains the Etherpad component:

```typescript
const EtherpadDrawer: React.FC<EtherpadDrawerProps> = ({
  roomId,
  isOpen,
  onClose
}) => {
  // ...
}
```

### 4. Button Component (`EtherpadDrawerWithButton`)

A floating button that triggers the drawer:

```typescript
export const EtherpadDrawerWithButton: React.FC<{ roomId?: number }> = ({ roomId }) => {
  const [isOpen, setIsOpen] = useState(false);
  // ...
}
```

## Setup Requirements

1. Etherpad Lite server running (default: `http://localhost:9001`)
2. React application with styled-components
3. React Icons library for UI elements

## Usage

To add the Etherpad integration to a chat room:

```tsx
import { EtherpadDrawerWithButton } from "./EtherpadDrawer";

const ChatRoom = ({ roomId }) => {
  return (
    <div>
      <EtherpadDrawerWithButton roomId={roomId} />
      {/* Other chat room components */}
    </div>
  );
};
```

## Configuration Options

The Etherpad integration can be configured through the `etherpadConfig.ts` file:

- `SERVER_URL`: URL of the Etherpad server
- `PAD_PREFIX`: Prefix for pad IDs (default: 'room-')
- Various display settings (controls, chat, line numbers, etc.)

## Styling

The components use styled-components and maintain the same visual language as the main application. The primary color (`#016532`) is used for the button, matching the application's color scheme.

## Browser Compatibility

The integration works in all modern browsers that support:
- CSS transitions
- Flexbox layout
- iframes with cross-origin communication

## Security Considerations

- Ensure the Etherpad server has proper authentication if needed
- Consider CORS settings when deploying to production
- Use HTTPS for both the main application and Etherpad server in production

## Future Improvements

- Add user authentication to Etherpad sessions
- Implement real-time user presence indicators
- Add document export functionality
- Support for mobile view with responsive drawer width