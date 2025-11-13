import React, { useState, useEffect, useReducer, createContext, useContext } from 'react';
import { CheckCircle2, Circle, Trash2, Edit2, Plus, LogOut, User, Calendar, Tag, Filter, GitBranch, Save, Download, Search, SortAsc, TrendingUp, AlertCircle, Star, Clock, BarChart3, Moon, Sun, FileText, Zap } from 'lucide-react';

// Redux-style reducer for todo management
const todoReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TODO':
      return {
        ...state,
        todos: [...state.todos, action.payload],
        history: [...state.history, { action: 'ADD', todo: action.payload, timestamp: new Date().toISOString() }]
      };
    case 'TOGGLE_TODO':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload ? { ...todo, completed: !todo.completed } : todo
        ),
        history: [...state.history, { action: 'TOGGLE', todoId: action.payload, timestamp: new Date().toISOString() }]
      };
    case 'DELETE_TODO':
      const deletedTodo = state.todos.find(t => t.id === action.payload);
      return {
        ...state,
        todos: state.todos.filter(todo => todo.id !== action.payload),
        history: [...state.history, { action: 'DELETE', todo: deletedTodo, timestamp: new Date().toISOString() }]
      };
    case 'UPDATE_TODO':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload.id ? { ...todo, ...action.payload.updates } : todo
        ),
        history: [...state.history, { action: 'UPDATE', todoId: action.payload.id, timestamp: new Date().toISOString() }]
      };
    case 'TOGGLE_STAR':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload ? { ...todo, starred: !todo.starred } : todo
        )
      };
    case 'LOAD_STATE':
      return action.payload;
    case 'CLEAR_COMPLETED':
      return {
        ...state,
        todos: state.todos.filter(todo => !todo.completed),
        history: [...state.history, { action: 'CLEAR_COMPLETED', timestamp: new Date().toISOString() }]
      };
    default:
      return state;
  }
};

// Context for global state management
const TodoContext = createContext();

const useTodoContext = () => {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodoContext must be used within TodoProvider');
  }
  return context;
};

// Auth Context
const AuthContext = createContext();

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('todo_current_user');
    return stored ? JSON.parse(stored) : null;
  });
  
  const [users, setUsers] = useState(() => {
    const stored = localStorage.getItem('todo_users');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('todo_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('todo_current_user');
    }
  }, [user]);

  const login = (username, password) => {
    const existingUser = users.find(u => u.username === username && u.password === password);
    if (existingUser) {
      setUser(existingUser);
      return { success: true };
    }
    return { success: false, message: 'Invalid credentials' };
  };

  const register = (username, password, email) => {
    if (users.find(u => u.username === username)) {
      return { success: false, message: 'Username already exists' };
    }
    const newUser = { id: Date.now(), username, password, email, createdAt: new Date().toISOString() };
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('todo_users', JSON.stringify(updatedUsers));
    setUser(newUser);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('todo_current_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Login Component
const LoginScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const { login, register } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      const result = login(username, password);
      if (!result.success) {
        setError(result.message);
      }
    } else {
      if (!email) {
        setError('Email is required');
        return;
      }
      const result = register(username, password, email);
      if (!result.success) {
        setError(result.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 -top-48 -left-48 bg-white opacity-10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute w-96 h-96 -bottom-48 -right-48 bg-white opacity-10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 w-full max-w-md transform transition-all hover:shadow-purple-500/20 hover:shadow-3xl relative z-10 border border-purple-100">
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-2xl mb-4 shadow-lg animate-bounce" style={{ animationDuration: '3s' }}>
            <CheckCircle2 className="w-14 h-14 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            TaskMaster Pro
          </h1>
          <p className="text-gray-600 font-medium">✨ Organize your life with style ✨</p>
        </div>

        <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2.5 rounded-lg font-semibold transition-all duration-300 ${
              isLogin
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md transform scale-105'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            🔐 Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2.5 rounded-lg font-semibold transition-all duration-300 ${
              !isLogin
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md transform scale-105'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            ✍️ Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-2">👤 Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-gray-50 focus:bg-white"
              placeholder="Enter your username"
              required
            />
          </div>

          {!isLogin && (
            <div className="relative animate-fadeIn">
              <label className="block text-sm font-semibold text-gray-700 mb-2">📧 Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-gray-50 focus:bg-white"
                placeholder="your@email.com"
                required
              />
            </div>
          )}

          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-2">🔒 Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-gray-50 focus:bg-white"
              placeholder="Enter your password"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium animate-shake">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white py-3.5 rounded-xl font-bold text-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 hover:from-purple-600 hover:via-pink-600 hover:to-red-600"
          >
            {isLogin ? ' Login Now' : ' Create Account'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-center text-sm text-gray-500">
            💡 <span className="font-semibold">Demo Mode:</span> Use any username/password to register
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-shake {
          animation: shake 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

// Todo Item Component
const TodoItem = ({ todo, onToggle, onDelete, onUpdate, onToggleStar }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState(todo.notes || '');

  const handleUpdate = () => {
    if (editText.trim()) {
      onUpdate(todo.id, { text: editText });
      setIsEditing(false);
    }
  };

  const handleNotesUpdate = () => {
    onUpdate(todo.id, { notes });
    setShowNotes(false);
  };

  const priorityColors = {
    low: 'border-l-green-400 bg-green-50/30',
    medium: 'border-l-yellow-400 bg-yellow-50/30',
    high: 'border-l-red-400 bg-red-50/30'
  };

  const priorityBadges = {
    low: { emoji: '🟢', text: 'Low', color: 'bg-green-100 text-green-700' },
    medium: { emoji: '🟡', text: 'Medium', color: 'bg-yellow-100 text-yellow-700' },
    high: { emoji: '🔴', text: 'High', color: 'bg-red-100 text-red-700' }
  };

  const isOverdue = todo.dueDate && new Date(todo.dueDate) < new Date() && !todo.completed;

  return (
    <div className={`bg-white rounded-xl shadow-sm border-l-4 ${priorityColors[todo.priority]} ${todo.completed ? 'opacity-60' : ''} p-5 mb-4 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group ${isOverdue ? 'ring-2 ring-red-400' : ''}`}>
      <div className="flex items-start gap-4">
        <button
          onClick={() => onToggle(todo.id)}
          className="mt-1 flex-shrink-0 hover:scale-125 transition-transform duration-200"
        >
          {todo.completed ? (
            <CheckCircle2 className="w-7 h-7 text-green-500 drop-shadow-md" />
          ) : (
            <Circle className="w-7 h-7 text-gray-300 hover:text-purple-500 group-hover:scale-110 transition-all" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-3 animate-fadeIn">
              <input
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full px-4 py-2 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg"
                onKeyPress={(e) => e.key === 'Enter' && handleUpdate()}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleUpdate}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
                >
                  💾 Save
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditText(todo.text);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-300 transition-all"
                >
                  ✖️ Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start gap-2">
                <button
                  onClick={() => onToggleStar(todo.id)}
                  className="mt-1"
                >
                  <Star className={`w-5 h-5 ${todo.starred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-yellow-400'} transition-all`} />
                </button>
                <p className={`text-lg font-medium mb-2 flex-1 ${todo.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                  {todo.text}
                </p>
              </div>
              
              {isOverdue && (
                <div className="mb-2 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded inline-block">
                  ⚠️ OVERDUE!
                </div>
              )}
              
              <div className="flex flex-wrap items-center gap-2 text-xs mb-2">
                <span className={`flex items-center gap-1 ${priorityBadges[todo.priority].color} px-3 py-1 rounded-full font-semibold`}>
                  {priorityBadges[todo.priority].emoji} {priorityBadges[todo.priority].text}
                </span>
                {todo.category && (
                  <span className="flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-semibold">
                    <Tag className="w-3 h-3" />
                    {todo.category}
                  </span>
                )}
                {todo.dueDate && (
                  <span className={`flex items-center gap-1 px-3 py-1 rounded-full font-semibold ${isOverdue ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                    <Calendar className="w-3 h-3" />
                    {new Date(todo.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>

              {showNotes && (
                <div className="mt-3 animate-fadeIn">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes..."
                    className="w-full px-3 py-2 border-2 border-purple-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 min-h-20"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={handleNotesUpdate}
                      className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded text-sm font-semibold hover:shadow-lg"
                    >
                      Save Notes
                    </button>
                    <button
                      onClick={() => setShowNotes(false)}
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              
              {todo.notes && !showNotes && (
                <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded italic">
                  📝 {todo.notes}
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => setShowNotes(!showNotes)}
            className="p-2.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all transform hover:scale-110"
            title="Add notes"
          >
            <FileText className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-2.5 text-gray-400 hover:text-purple-500 hover:bg-purple-50 rounded-lg transition-all transform hover:scale-110"
            title="Edit task"
          >
            <Edit2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => onDelete(todo.id)}
            className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all transform hover:scale-110"
            title="Delete task"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Todo App Component
const TodoApp = () => {
  const { user, logout } = useAuth();
  const [state, dispatch] = useReducer(todoReducer, {
    todos: [],
    history: []
  });

  const [newTodo, setNewTodo] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [filter, setFilter] = useState('all');
  const [showGitPanel, setShowGitPanel] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [showStats, setShowStats] = useState(true);

  // Load user's todos from localStorage
  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem(`todos_${user.id}`);
      if (stored) {
        dispatch({ type: 'LOAD_STATE', payload: JSON.parse(stored) });
      }
    }
  }, [user]);

  // Save to localStorage
  useEffect(() => {
    if (user && state.todos.length >= 0) {
      localStorage.setItem(`todos_${user.id}`, JSON.stringify(state));
    }
  }, [state, user]);

  const addTodo = (e) => {
    e.preventDefault();
    if (newTodo.trim()) {
      const todo = {
        id: Date.now(),
        text: newTodo,
        completed: false,
        starred: false,
        category,
        priority,
        dueDate,
        notes: '',
        createdAt: new Date().toISOString()
      };
      dispatch({ type: 'ADD_TODO', payload: todo });
      setNewTodo('');
      setCategory('');
      setDueDate('');
    }
  };

  const exportData = () => {
    const dataStr = JSON.stringify(state, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `todos_${user.username}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target.result);
          dispatch({ type: 'LOAD_STATE', payload: imported });
        } catch (error) {
          alert('Invalid file format');
        }
      };
      reader.readAsText(file);
    }
  };

  // Filter and sort todos
  const filteredTodos = state.todos.filter(todo => {
    let matchesFilter = true;
    if (filter === 'active') matchesFilter = !todo.completed;
    if (filter === 'completed') matchesFilter = todo.completed;
    if (filter === 'starred') matchesFilter = todo.starred;
    
    const matchesSearch = searchQuery === '' || 
      todo.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (todo.category && todo.category.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesFilter && matchesSearch;
  });

  const sortedTodos = [...filteredTodos].sort((a, b) => {
    if (sortBy === 'priority') {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    } else if (sortBy === 'name') {
      return a.text.localeCompare(b.text);
    } else if (sortBy === 'dueDate') {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    } else {
      return b.id - a.id;
    }
  });

  const stats = {
    total: state.todos.length,
    completed: state.todos.filter(t => t.completed).length,
    active: state.todos.filter(t => !t.completed).length,
    progress: state.todos.length > 0 ? Math.round((state.todos.filter(t => t.completed).length / state.todos.length) * 100) : 0,
    highPriority: state.todos.filter(t => !t.completed && t.priority === 'high').length,
    overdue: state.todos.filter(t => !t.completed && t.dueDate && new Date(t.dueDate) < new Date()).length,
    starred: state.todos.filter(t => t.starred).length
  };

  return (
    <TodoContext.Provider value={{ state, dispatch }}>
      <div className="min-h-screen bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 relative overflow-hidden">
        {/* Animated decorative background shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-96 h-96 -top-48 -left-48 bg-yellow-300 opacity-30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute w-96 h-96 top-1/4 right-0 bg-blue-400 opacity-30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
          <div className="absolute w-96 h-96 bottom-0 left-1/4 bg-green-400 opacity-30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s', animationDuration: '5s' }}></div>
          <div className="absolute w-96 h-96 -bottom-48 -right-48 bg-orange-300 opacity-30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s', animationDuration: '3s' }}></div>
        </div>

        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600/90 via-pink-600/90 to-red-600/90 backdrop-blur-md shadow-2xl border-b border-white/20 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-2xl shadow-2xl transform hover:scale-110 hover:rotate-12 transition-all duration-300">
                <CheckCircle2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-white drop-shadow-lg">
                  TaskMaster Pro
                </h1>
                <p className="text-sm text-white/90 font-medium"> Welcome back, <span className="text-yellow-300 font-bold">{user.username}</span>!</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowStats(!showStats)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-110 font-semibold border-2 border-white/30"
              >
                <BarChart3 className="w-5 h-5" />
                <span className="text-sm">{showStats ? 'Hide' : 'Show'} Stats</span>
              </button>
              <button
                onClick={() => setShowGitPanel(!showGitPanel)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-110 font-semibold border-2 border-white/30"
              >
                <GitBranch className="w-5 h-5" />
                <span className="text-sm">Version Control</span>
              </button>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-110 font-semibold border-2 border-white/30"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8 relative z-10">
          {/* Enhanced Stats Dashboard */}
          {showStats && (
            <div className="mb-8 space-y-5">
              {/* Progress Bar */}
              <div className="bg-gradient-to-br from-white/95 via-purple-50/95 to-pink-50/95 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border-2 border-purple-300/50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    🎯 Overall Progress
                  </h3>
                  <span className="text-2xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {stats.progress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden shadow-inner">
                  <div 
                    className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 h-full rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-2"
                    style={{ width: `${stats.progress}%` }}
                  >
                    {stats.progress > 10 && (
                      <span className="text-white text-xs font-bold drop-shadow">
                        {stats.completed}/{stats.total}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-6 gap-4">
                <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 rounded-2xl shadow-2xl p-5 text-white transform hover:scale-105 transition-all border-2 border-white/20">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold opacity-90">Total</p>
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <p className="text-4xl font-black drop-shadow-lg">{stats.total}</p>
                  <p className="text-xs opacity-90 mt-1">📊 Tasks</p>
                </div>
                
                <div className="bg-gradient-to-br from-emerald-500 via-green-600 to-teal-700 rounded-2xl shadow-2xl p-5 text-white transform hover:scale-105 transition-all border-2 border-white/20">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold opacity-90">Done</p>
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <p className="text-4xl font-black drop-shadow-lg">{stats.completed}</p>
                  <p className="text-xs opacity-90 mt-1">✅ Complete</p>
                </div>
                
                <div className="bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 rounded-2xl shadow-2xl p-5 text-white transform hover:scale-105 transition-all border-2 border-white/20">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold opacity-90">Active</p>
                    <Circle className="w-4 h-4" />
                  </div>
                  <p className="text-4xl font-black drop-shadow-lg">{stats.active}</p>
                  <p className="text-xs opacity-90 mt-1">🎯 Pending</p>
                </div>

                <div className="bg-gradient-to-br from-red-500 via-pink-600 to-rose-700 rounded-2xl shadow-2xl p-5 text-white transform hover:scale-105 transition-all border-2 border-white/20">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold opacity-90">Urgent</p>
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <p className="text-4xl font-black drop-shadow-lg">{stats.highPriority}</p>
                  <p className="text-xs opacity-90 mt-1">🔴 High</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500 via-violet-600 to-indigo-700 rounded-2xl shadow-2xl p-5 text-white transform hover:scale-105 transition-all border-2 border-white/20">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold opacity-90">Overdue</p>
                    <Clock className="w-4 h-4" />
                  </div>
                  <p className="text-4xl font-black drop-shadow-lg">{stats.overdue}</p>
                  <p className="text-xs opacity-90 mt-1">⏰ Late</p>
                </div>

                <div className="bg-gradient-to-br from-yellow-500 via-amber-600 to-orange-700 rounded-2xl shadow-2xl p-5 text-white transform hover:scale-105 transition-all border-2 border-white/20">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold opacity-90">Starred</p>
                    <Star className="w-4 h-4" />
                  </div>
                  <p className="text-4xl font-black drop-shadow-lg">{stats.starred}</p>
                  <p className="text-xs opacity-90 mt-1">⭐ Favorite</p>
                </div>
              </div>
            </div>
          )}

          {/* Git Panel */}
          {showGitPanel && (
            <div className="bg-gradient-to-br from-white/95 via-purple-50/95 to-pink-50/95 backdrop-blur-lg rounded-2xl shadow-2xl p-6 mb-8 border-2 border-purple-300/50 animate-fadeIn">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg">
                    <GitBranch className="w-6 h-6 text-white" />
                  </div>
                  Version Control & History
                </h2>
              </div>
              
              <div className="flex gap-3 mb-5">
                <button
                  onClick={exportData}
                  className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-2xl transition-all transform hover:scale-105 font-semibold border-2 border-white/30"
                >
                  <Download className="w-5 h-5" />
                  Export (Commit)
                </button>
                <label className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:shadow-2xl transition-all transform hover:scale-105 cursor-pointer font-semibold border-2 border-white/30">
                  <Save className="w-5 h-5" />
                  Import (Restore)
                  <input type="file" accept=".json" onChange={importData} className="hidden" />
                </label>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-purple-50 rounded-xl p-5 max-h-56 overflow-y-auto border-2 border-purple-200/50">
                <p className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  📜 Recent History ({state.history.length} total actions)
                </p>
                {state.history.slice(-10).reverse().map((entry, idx) => (
                  <div key={idx} className="text-xs text-gray-600 mb-2 flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm border border-purple-100">
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full font-bold text-xs">
                      {entry.action}
                    </span>
                    <span className="flex-1">{new Date(entry.timestamp).toLocaleString()}</span>
                    <span className="text-gray-400">#{state.history.length - idx}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Todo Form */}
          <div className="bg-gradient-to-br from-white/95 via-purple-50/95 to-pink-50/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8 mb-8 border-2 border-purple-300/50">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-lg shadow-lg">
                <Plus className="w-6 h-6 text-white" />
              </div>
              Create New Task
            </h2>
            <form onSubmit={addTodo} className="space-y-5">
              <div>
                <label className="block text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">✏️ Task Description</label>
                <input
                  type="text"
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  placeholder="What needs to be done? "
                  className="w-full px-5 py-4 border-2 border-purple-300 rounded-xl focus:ring-4 focus:ring-purple-500/50 focus:border-purple-500 text-lg transition-all bg-white hover:border-purple-400 shadow-md"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">🏷️ Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g., Work, Personal"
                    className="w-full px-4 py-3 border-2 border-purple-300 rounded-xl focus:ring-4 focus:ring-purple-500/50 focus:border-purple-500 transition-all bg-white shadow-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">⚡ Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-purple-300 rounded-xl focus:ring-4 focus:ring-purple-500/50 focus:border-purple-500 transition-all bg-white cursor-pointer shadow-md"
                  >
                    <option value="low">🟢 Low</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="high">🔴 High</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">📅 Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-purple-300 rounded-xl focus:ring-4 focus:ring-purple-500/50 focus:border-purple-500 transition-all bg-white cursor-pointer shadow-md"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 border-2 border-white/30"
              >
                <Plus className="w-6 h-6" />
                Add Task to List
              </button>
            </form>
          </div>

          {/* Search and Sort Bar */}
          <div className="bg-gradient-to-r from-white/90 to-purple-50/90 backdrop-blur-lg rounded-2xl shadow-xl p-5 mb-6 border-2 border-purple-200 flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks by name or category..."
                className="w-full pl-12 pr-4 py-3 border-2 border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white shadow-md"
              />
            </div>
            <div className="relative">
              <SortAsc className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="pl-12 pr-8 py-3 border-2 border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white shadow-md cursor-pointer font-semibold text-gray-700"
              >
                <option value="date">Sort by Date</option>
                <option value="priority">Sort by Priority</option>
                <option value="name">Sort by Name</option>
                <option value="dueDate">Sort by Due Date</option>
              </select>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex gap-3">
              {['all', 'active', 'completed', 'starred'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg ${
                    filter === f
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-2xl border-2 border-white/30'
                      : 'bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white border-2 border-purple-200'
                  }`}
                >
                  {f === 'starred' && <Star className="w-4 h-4 inline mr-2" />}
                  {f !== 'starred' && <Filter className="w-4 h-4 inline mr-2" />}
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            
            {stats.completed > 0 && (
              <button
                onClick={() => dispatch({ type: 'CLEAR_COMPLETED' })}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:shadow-2xl transition-all transform hover:scale-105 font-bold border-2 border-white/30"
              >
                🗑️ Clear Completed
              </button>
            )}
          </div>

          {/* Todo List */}
          <div>
            {sortedTodos.length === 0 ? (
              <div className="text-center py-16 bg-gradient-to-br from-white/90 via-purple-50/90 to-pink-50/90 backdrop-blur-lg rounded-2xl shadow-2xl border-2 border-purple-200">
                <div className="inline-block p-6 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full mb-4 shadow-lg">
                  <CheckCircle2 className="w-20 h-20 text-white" />
                </div>
                <p className="text-gray-700 text-2xl font-bold mb-2">
                  {filter === 'completed' ? ' No completed tasks yet' : 
                   filter === 'starred' ? ' No starred tasks yet' :
                   searchQuery ? '🔍 No tasks match your search' :
                   ' Your task list is empty'}
                </p>
                <p className="text-gray-500 font-semibold">
                  {filter === 'completed' ? 'Complete some tasks to see them here!' : 
                   filter === 'starred' ? 'Star important tasks to find them quickly!' :
                   searchQuery ? 'Try a different search term' :
                   'Add a new task to get started on your journey!'}
                </p>
              </div>
            ) : (
              <div>
                <div className="mb-4 flex items-center justify-between bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-xl border-2 border-purple-200">
                  <h3 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    📋 {sortedTodos.length} {sortedTodos.length === 1 ? 'Task' : 'Tasks'}
                  </h3>
                </div>
                {sortedTodos.map((todo) => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    onToggle={(id) => dispatch({ type: 'TOGGLE_TODO', payload: id })}
                    onDelete={(id) => dispatch({ type: 'DELETE_TODO', payload: id })}
                    onUpdate={(id, updates) => dispatch({ type: 'UPDATE_TODO', payload: { id, updates } })}
                    onToggleStar={(id) => dispatch({ type: 'TOGGLE_STAR', payload: id })}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </TodoContext.Provider>
  );
};

// Main App with Auth
export default function App() {
  return (
    <AuthProvider>
      <AuthContext.Consumer>
        {({ user }) => (
          user ? <TodoApp /> : <LoginScreen />
        )}
      </AuthContext.Consumer>
    </AuthProvider>
  );
}