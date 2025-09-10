# Problem Solving Interface Components

This directory contains the refactored components for the research problem-solving interface. The original 1113-line monolithic `SolvingPage.tsx` has been split into focused, maintainable components with clear separation of concerns.

## 📋 Architecture Overview

```
SolvingPage (Coordinator)
├── ProblemSidebar (Problem List & Navigation)
├── ProblemDetails (Tab Coordinator)
│   ├── StatusPanel (Run Controls & Status)
│   ├── ConversationsPanel (AI Research Conversations)
│   └── FilesPanel (Document Management)
└── DeleteModals (Confirmation Dialogs)
```

## 🗂️ Component Documentation

### Core Infrastructure

#### `types.ts`
Comprehensive TypeScript interfaces and type definitions for the entire solving interface.
- **RoundData**: Research conversation round structure
- **ProblemStatus**: Backend status data format  
- **ProblemInfo**: UI-friendly problem information
- **RunParameters**: Research execution configuration
- **AppMessage**: User feedback message structure
- **FileInfo**: Problem file metadata

#### `utils.ts`
Pure utility functions for data transformation and business logic.
- **Status Calculation**: `getProblemInfo()`, `isProblemRunning()`
- **Time Formatting**: `formatDuration()`, `formatRelativeTime()`
- **Validation**: `validateRunParameters()`, `isValidProblemName()`
- **Data Processing**: `organizeTimings()`, `sortRoundsDescending()`

### UI Components

#### `ProblemSidebar.tsx`
**Purpose**: Displays problem list with status indicators and navigation
**Features**:
- Visual status indicators (running/stopped/error)
- Summary statistics (total, running, rounds)
- Click-to-select navigation
- Responsive scrolling for large problem lists
- Empty state handling

**Props**:
```typescript
interface ProblemSidebarProps {
  problems: string[]
  selectedProblem: string | null
  statusMap: Record<string, ProblemStatus>
  onProblemSelect: (problemName: string | null) => void
  loading?: boolean
  onProblemDelete?: (problemName: string) => void
}
```

#### `ProblemDetails.tsx`
**Purpose**: Main content coordinator with tabbed interface
**Features**:
- Tab navigation (Status, Conversations, Files)
- Empty state when no problem selected
- Tab state persistence per problem
- Global message handling
- Cross-tab coordination

**Architecture**:
```
ProblemDetails
├── Tab Navigation
├── StatusPanel (status === 'status')
├── ConversationsPanel (status === 'conversations')  
└── FilesPanel (status === 'files')
```

#### `StatusPanel.tsx`
**Purpose**: Problem status display and research run controls
**Features**:
- Real-time status monitoring
- Run configuration (rounds, provers, model preset)
- Parameter validation
- Start/stop controls
- Progress indicators
- Model-specific handling (GPT-5 temperature exclusion)

**Key Functions**:
- `handleStartRun()`: Validates and starts research
- `handleStop()`: Stops current execution
- `updateRunConfig()`: Real-time parameter validation

#### `ConversationsPanel.tsx`
**Purpose**: AI research conversation history display
**Features**:
- Round-by-round conversation display
- Three-column layout (Prover ↔ Verifier ↔ Summarizer)
- Multiple prover selection
- Verdict indicators with emoji
- Performance timing display
- Reverse chronological ordering

**Data Flow**:
```
loadRounds() → getRounds(API) → RoundDisplay[] → Three-column UI
```

#### `FilesPanel.tsx`
**Purpose**: Problem file browser and document management
**Features**:
- File listing with metadata (size, type, modified date)
- Version control for `notes.md` and `output.md`
- Content viewer with markdown rendering
- Paper writing and download functionality
- File type icons and appropriate handling

**Version Control**:
- Automatic version detection for versioned files
- Dropdown selector for historical versions
- Current vs versioned content loading

#### `DeleteModals.tsx`
**Purpose**: Confirmation dialogs for destructive operations
**Features**:
- Delete Rounds Modal with count selector
- Delete Problem Modal with critical warnings
- Keyboard shortcuts (Enter/Escape)
- Loading states during operations
- Clear warning messages and confirmation flow

**Modals**:
1. **Delete Rounds**: Remove old conversation rounds
2. **Delete Problem**: Complete problem removal with data warning

## 🔄 Data Flow & State Management

### State Architecture
```
SolvingPage (Global Coordinator)
├── problems: string[]                    # Problem list
├── selectedProblem: string | null        # Current selection  
├── statusMap: Record<string, Status>     # Real-time status
├── loading: boolean                      # Global loading
├── message: AppMessage | null            # User feedback
└── Modal State (delete confirmation)

ProblemDetails (Tab Coordinator) 
├── activeTab: string                     # Current tab
├── tabHistory: Record<string, string>    # Per-problem tab memory
└── Child Component Props

Individual Components (Focused State)
├── Local UI state (selections, inputs)
├── API loading states
└── Component-specific data
```

### API Integration
All components use centralized API functions from `../../api`:
- `getProblems()`: Load problem list
- `getStatus(problem)`: Get problem status  
- `runRound(problem, params)`: Start research
- `stopProblem(problem)`: Stop execution
- `getRounds(problem)`: Load conversations
- `listFiles(problem)`: Load file list
- `getFileContent(problem, file)`: Load file content

### Auto-Refresh Strategy
- **Global**: 2-second interval for all problem statuses
- **Component**: Individual components handle their own data refresh
- **Event-Driven**: Immediate refresh after operations (start/stop)

## 🎯 Key Improvements

### Code Quality
- **Reduced Complexity**: 1113 lines → 8 focused components (~200 lines each)
- **Clear Separation**: Each component has single responsibility
- **Type Safety**: Comprehensive TypeScript interfaces
- **Documentation**: Extensive JSDoc comments throughout
- **Error Handling**: Robust error boundaries and user feedback

### Maintainability  
- **Modular Design**: Easy to modify individual features
- **Testable**: Each component can be tested in isolation
- **Reusable**: Components follow consistent patterns
- **Debuggable**: Clear data flow and state management

### User Experience
- **Responsive**: Proper overflow handling and scrolling
- **Accessible**: Keyboard navigation and screen reader support
- **Performant**: Optimized re-rendering and API calls
- **Intuitive**: Consistent UI patterns and clear feedback

## 🚀 Usage Examples

### Basic Problem Selection
```typescript
<ProblemSidebar
  problems={problems}
  selectedProblem={selectedProblem}
  statusMap={statusMap}
  onProblemSelect={selectProblem}
  loading={loading}
/>
```

### Status Panel with Controls
```typescript
<StatusPanel
  problemName={problemName}
  status={status}
  loading={loading}
  message={message}
  setMessage={setMessage}
  onRunStart={handleRunStart}
  onStop={handleStop}
  onDeleteRounds={openDeleteModal}
  onDeleteProblem={openDeleteModal}
/>
```

### File Browser with Versions
```typescript
<FilesPanel
  problemName={problemName}
  onFileSelect={(fileName) => console.log('Selected:', fileName)}
/>
```

## 🔧 Development Guidelines

### Adding New Features
1. **Identify Component**: Determine which component owns the feature
2. **Update Types**: Add necessary TypeScript interfaces
3. **Implement Logic**: Add to appropriate utils if reusable
4. **Update Documentation**: Maintain JSDoc comments
5. **Test Integration**: Verify with parent coordinator

### Component Communication
- **Props Down**: Parent components pass data and callbacks
- **Events Up**: Child components notify parents via callbacks
- **Shared State**: Managed by nearest common ancestor
- **No Direct Communication**: Components don't communicate directly

### State Management Rules
- **Local State**: UI-only state stays in component
- **Shared State**: Business logic state moves up to coordinator
- **API State**: Centralized in main coordinator with refresh strategies
- **Form State**: Controlled components with validation

## 📈 Performance Considerations

### Re-rendering Optimization
- **Memoization**: Use React.memo for expensive components
- **Callback Stability**: Use useCallback for event handlers
- **State Structure**: Minimize unnecessary re-renders

### API Call Strategy  
- **Batching**: Group related API calls
- **Caching**: Avoid redundant requests
- **Error Recovery**: Graceful degradation for failed calls
- **Loading States**: Clear user feedback during operations

## 🐛 Troubleshooting

### Common Issues
1. **Navigation Problems**: Check URL parameter handling in SolvingPage
2. **Status Not Updating**: Verify auto-refresh interval and API calls  
3. **Modal Issues**: Ensure proper z-index and event handling
4. **File Loading**: Check file path encoding and version parameters

### Debug Tools
- **React DevTools**: Component hierarchy and props
- **Console Logs**: API responses and state changes  
- **Network Tab**: API call timing and responses
- **Component State**: Individual component internal state

## 🔮 Future Enhancements

### Planned Features
- **Real-time Updates**: WebSocket integration for live status
- **Bulk Operations**: Multi-select and batch actions
- **Advanced Filtering**: Problem search and category filters
- **Export Features**: Conversation and file export options
- **Collaboration**: Multi-user problem sharing

### Architecture Evolution
- **State Management**: Consider Redux for complex state
- **Component Library**: Extract reusable UI components
- **Testing**: Add comprehensive test coverage
- **Documentation**: Interactive component documentation