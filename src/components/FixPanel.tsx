"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Eye, Loader2, CheckCircle2, X, Copy, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

export interface Issue {
  id: string;
  title: string;
  severity: 'critical' | 'medium' | 'high' | 'low';
  description: string;
  log: string;
  fix: string;
}

interface FixPanelProps {
  targetUrl: string;
  issues?: Issue[];
}

// 10 different error sets
const ERROR_SETS = [
  [
    {
      id: "1",
      title: "Database Connection Pool Exhausted",
      severity: "critical",
      description: "Too many connections to database without proper cleanup.",
      log: "Error: ECONNREFUSED 127.0.0.1:5432\n  at TCPConnectWrap.afterConnect [as oncomplete]\nPool: 10 active, 0 idle connections",
      fix: "// Add connection pooling with proper cleanup\nconst pool = new Pool({\n  max: 20,\n  min: 5,\n  idleTimeoutMillis: 30000,\n  connectionTimeoutMillis: 2000,\n});\n\n// Always release connections\npool.on('error', (err) => {\n  console.error('Unexpected error', err);\n  process.exit(-1);\n});"
    },
    {
      id: "2",
      title: "Memory Leak in Event Listeners",
      severity: "critical",
      description: "Event listeners not being removed causing memory bloat.",
      log: "Warning: MaxListenersExceededWarning: Possible EventEmitter memory leak detected\n11 exit listeners added to [process]\n(Use `node --trace-warnings` to show where the warnings came from)",
      fix: "// Remove listeners after use\nfunction setupListener() {\n  const handler = () => console.log('Event fired');\n  emitter.on('event', handler);\n  \n  // Always cleanup\n  return () => {\n    emitter.removeListener('event', handler);\n  };\n}\n\nconst cleanup = setupListener();\n// Call cleanup when done\ncleanup();"
    },
    {
      id: "3",
      title: "Missing Error Boundaries",
      severity: "high",
      description: "Component errors crash entire app without error boundaries.",
      log: "Uncaught TypeError: Cannot read properties of undefined\n  at renderComponent (component.tsx:45)\n  at React.ReactDOM.render (index.tsx:12)",
      fix: "import { ReactNode } from 'react';\n\ninterface ErrorBoundaryProps {\n  children: ReactNode;\n}\n\ninterface State {\n  hasError: boolean;\n}\n\nclass ErrorBoundary extends React.Component<ErrorBoundaryProps, State> {\n  constructor(props: ErrorBoundaryProps) {\n    super(props);\n    this.state = { hasError: false };\n  }\n\n  static getDerivedStateFromError(error: Error) {\n    return { hasError: true };\n  }\n\n  render() {\n    if (this.state.hasError) {\n      return <h1>Something went wrong</h1>;\n    }\n    return this.props.children;\n  }\n}"
    }
  ],
  [
    {
      id: "1",
      title: "SQL Injection Vulnerability",
      severity: "critical",
      description: "User input not sanitized in database queries.",
      log: "Security Alert: Raw SQL query detected\nQuery: SELECT * FROM users WHERE id = ' + userId\nVulnerability: Potential SQL injection",
      fix: "// Use parameterized queries\nconst userId = req.params.id;\nconst query = 'SELECT * FROM users WHERE id = $1';\nconst result = await db.query(query, [userId]);\n\n// Or use ORM\nconst user = await User.findOne({ id: userId });"
    },
    {
      id: "2",
      title: "Race Condition in File Operations",
      severity: "high",
      description: "Multiple processes accessing same file simultaneously.",
      log: "Error: ENOENT: no such file or directory\n  at Object.readFileSync\nFile accessed by 3 processes concurrently",
      fix: "import { promises as fs } from 'fs';\nimport { Lock } from 'async-lock';\n\nconst lock = new Lock();\n\nasync function safeFileRead(filePath: string) {\n  return lock.acquire('file-lock', async () => {\n    const content = await fs.readFile(filePath, 'utf-8');\n    return content;\n  });\n}"
    },
    {
      id: "3",
      title: "Unhandled Promise Rejection",
      severity: "high",
      description: "Async operations not properly handling errors.",
      log: "UnhandledPromiseRejectionWarning: TypeError: Cannot set property\nPromise rejection was not handled with a .catch() or try/catch block",
      fix: "// Good: Handle promise rejection\nasync function fetchData() {\n  try {\n    const data = await fetch('/api/data');\n    if (!data.ok) throw new Error('API Error');\n    return await data.json();\n  } catch (error) {\n    console.error('Fetch failed:', error);\n    throw error;\n  }\n}\n\n// Or chain .catch()\nfetchData().catch(error => {\n  console.error('Error:', error);\n});"
    }
  ],
  [
    {
      id: "1",
      title: "Missing Dependency in package.json",
      severity: "high",
      description: "Module imported but not listed as dependency.",
      log: "Error: Cannot find module 'express'\nrequire.resolve.paths is null\n    at Function.Module._resolveFilename",
      fix: "// Install the missing dependency\n// npm install express\n// or\n// yarn add express\n\n// Update package.json\n{\n  \"dependencies\": {\n    \"express\": \"^4.18.0\",\n    \"react\": \"^18.2.0\"\n  }\n}"
    },
    {
      id: "2",
      title: "Circular Dependency",
      severity: "critical",
      description: "Modules importing each other creating a cycle.",
      log: "RangeError: Maximum call stack size exceeded\nCircular dependency: moduleA → moduleB → moduleA",
      fix: "// Instead of importing directly, use dependency injection\n// moduleA.ts\nexport function setupA(b: TypeB) {\n  return {\n    doSomething: () => b.doTask()\n  };\n}\n\n// moduleB.ts\nexport function setupB(a: TypeA) {\n  return {\n    doTask: () => a.doSomething()\n  };\n}\n\n// index.ts (entry point)\nconst a = setupA(b);\nconst b = setupB(a);"
    },
    {
      id: "3",
      title: "Performance: N+1 Query Problem",
      severity: "critical",
      description: "Fetching data in loop instead of batch query.",
      log: "Performance Warning: 100 queries executed in loop\nEstimated time: 5.2s vs 120ms with JOIN\nQuery: SELECT * FROM posts WHERE userId = ?",
      fix: "// Bad: N+1 query\nconst users = await User.find();\nfor (const user of users) {\n  user.posts = await Post.find({ userId: user.id });\n}\n\n// Good: Use join/populate\nconst users = await User.find().populate('posts');\n\n// Or batch query\nconst userIds = users.map(u => u.id);\nconst posts = await Post.find({ userId: { $in: userIds } });"
    }
  ],
  [
    {
      id: "1",
      title: "Missing CORS Headers",
      severity: "high",
      description: "Cross-origin requests blocked by browser.",
      log: "Access to XMLHttpRequest blocked by CORS policy\nOrigin: http://localhost:3000\nNo 'Access-Control-Allow-Origin' header",
      fix: "// Add CORS middleware\nimport cors from 'cors';\n\nconst corsOptions = {\n  origin: ['http://localhost:3000', 'https://yourdomain.com'],\n  credentials: true,\n  methods: ['GET', 'POST', 'PUT', 'DELETE'],\n  allowedHeaders: ['Content-Type', 'Authorization']\n};\n\napp.use(cors(corsOptions));"
    },
    {
      id: "2",
      title: "Timeout in API Request",
      severity: "critical",
      description: "Request takes too long, no timeout handling.",
      log: "Error: timeout of 30000ms exceeded\nRequest to /api/heavy-computation\nOperation took 45 seconds",
      fix: "// Add timeout handling\nimport axios from 'axios';\n\nconst client = axios.create({\n  timeout: 30000, // 30 seconds\n  timeoutErrorMessage: 'Request timeout'\n});\n\nclient.get('/api/data')\n  .catch(error => {\n    if (error.code === 'ECONNABORTED') {\n      console.error('Request timeout');\n    }\n  });"
    },
    {
      id: "3",
      title: "Unencrypted Sensitive Data",
      severity: "critical",
      description: "Passwords and tokens stored in plain text.",
      log: "Security Audit: Plain text password found in database\nUser 'admin' password: 'password123'\nAPI Token: 'abc123xyz'",
      fix: "import bcrypt from 'bcrypt';\nimport crypto from 'crypto';\n\n// Hash passwords\nconst hashedPassword = await bcrypt.hash(password, 10);\nawait user.update({ password: hashedPassword });\n\n// Verify password\nconst isValid = await bcrypt.compare(inputPassword, user.password);\n\n// Encrypt sensitive data\nconst encrypted = crypto.createCipher('aes-256-cbc', key).update(sensitiveData);"
    }
  ],
  [
    {
      id: "1",
      title: "Type Mismatch in Function Return",
      severity: "high",
      description: "Function returns wrong type causing runtime errors.",
      log: "TypeError: Cannot read properties of undefined\n  at processResult (service.ts:89)\nExpected: string, Got: undefined",
      fix: "// Properly type function returns\ninterface User {\n  id: string;\n  name: string;\n  email: string;\n}\n\n// Good: Explicit return type\nfunction getUser(id: string): User | null {\n  const user = database.find(id);\n  return user || null;\n}\n\n// Always check for null/undefined\nconst user = getUser('123');\nif (user) {\n  console.log(user.name);\n}"
    },
    {
      id: "2",
      title: "Memory Leak: Detached DOM Nodes",
      severity: "critical",
      description: "DOM elements removed but references still held.",
      log: "Memory Leak Detected: 500MB of detached DOM nodes\nHeap snapshot shows 1000+ orphaned elements",
      fix: "// Clean up references when removing DOM\nlet element = document.getElementById('myElement');\n\nfunction cleanup() {\n  // Remove from DOM\n  element?.parentNode?.removeChild(element);\n  \n  // Remove all references\n  element = null;\n  \n  // Remove event listeners\n  document.removeEventListener('click', handleClick);\n}\n\n// Use WeakMap to avoid memory leaks\nconst elementData = new WeakMap();\nelementData.set(element, { data: 'value' });"
    },
    {
      id: "3",
      title: "Regex DoS Vulnerability",
      severity: "critical",
      description: "Regular expression causes catastrophic backtracking.",
      log: "RegexDoS Attack Detected\nPattern: (a+)+b causes 100% CPU usage\nProcessing time: 30+ seconds for 30 character input",
      fix: "// Vulnerable regex - DON'T USE\nconst bad = /(a+)+b/;\n\n// Safe regex\nconst good = /a+b/;\n\n// Use regex with timeout protection\nimport { timeout } from 'promise-timeout';\n\nconst pattern = /^test/;\nconst result = await timeout(\n  pattern.test(input),\n  5000 // 5 second timeout\n);"
    }
  ],
  [
    {
      id: "1",
      title: "Authentication Token Expired",
      severity: "critical",
      description: "JWT token not refreshed, causing unauthorized errors.",
      log: "Error: Token expired\ntoken: eyJhbGc...\nExpiration: 2024-05-30 10:00:00\nCurrent: 2024-05-30 11:30:00",
      fix: "// Implement token refresh\nimport jwt from 'jsonwebtoken';\n\nconst refreshToken = (token: string) => {\n  try {\n    jwt.verify(token, SECRET);\n  } catch (error) {\n    if (error.name === 'TokenExpiredError') {\n      const decoded = jwt.decode(token);\n      return generateNewToken(decoded.userId);\n    }\n  }\n};\n\napp.use((req, res, next) => {\n  const token = req.headers.authorization?.split(' ')[1];\n  if (token && isExpired(token)) {\n    req.token = refreshToken(token);\n  }\n  next();\n});"
    },
    {
      id: "2",
      title: "Missing Input Validation",
      severity: "high",
      description: "User input not validated before processing.",
      log: "Error: Invalid input type\nExpected: number, Got: string\nInput: 'abc' for field 'age'",
      fix: "// Add input validation\nimport Joi from 'joi';\n\nconst schema = Joi.object({\n  name: Joi.string().min(3).max(30).required(),\n  age: Joi.number().integer().min(0).max(150).required(),\n  email: Joi.string().email().required()\n});\n\napp.post('/user', (req, res) => {\n  const { error, value } = schema.validate(req.body);\n  if (error) {\n    return res.status(400).json({ error: error.details });\n  }\n  // Process validated data\n});"
    },
    {
      id: "3",
      title: "Inefficient Algorithm: O(n²) Sort",
      severity: "critical",
      description: "Using slow sorting algorithm causing performance issues.",
      log: "Performance: Sorting 10,000 items took 8.5 seconds\nAlgorithm: Bubble Sort O(n²)\nRecommended: Quick Sort O(n log n) - 150ms",
      fix: "// Bad: Bubble sort\nfunction bubbleSort(arr) {\n  for (let i = 0; i < arr.length; i++) {\n    for (let j = 0; j < arr.length - 1; j++) {\n      if (arr[j] > arr[j + 1]) {\n        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];\n      }\n    }\n  }\n}\n\n// Good: Built-in sort\nconst sorted = arr.sort((a, b) => a - b);\n\n// Or merge sort for guaranteed O(n log n)\nfunction mergeSort(arr: number[]): number[] {\n  if (arr.length <= 1) return arr;\n  const mid = Math.floor(arr.length / 2);\n  return merge(mergeSort(arr.slice(0, mid)), mergeSort(arr.slice(mid)));\n}"
    }
  ],
  [
    {
      id: "1",
      title: "Hardcoded API Keys",
      severity: "critical",
      description: "Sensitive keys exposed in source code.",
      log: "Security Issue: API keys found in code\nKey: sk_live_51234567890\nLocation: src/config.ts:15",
      fix: "// Move keys to environment variables\nrequire('dotenv').config();\n\nconst apiKey = process.env.API_KEY;\nconst dbPassword = process.env.DB_PASSWORD;\n\n// .env file (NEVER commit this)\nAPI_KEY=sk_live_xyz\nDB_PASSWORD=secure_password_123\n\n// .gitignore\n.env\n.env.local"
    },
    {
      id: "2",
      title: "Blocking I/O Operations",
      severity: "high",
      description: "Synchronous I/O blocking event loop.",
      log: "Warning: Long-running synchronous operation\nOperation: fs.readFileSync() - 2.5s\nBlocked requests: 450",
      fix: "// Bad: Blocking I/O\nconst data = fs.readFileSync('./file.txt', 'utf-8');\nconst json = JSON.parse(data);\n\n// Good: Non-blocking I/O\nfs.readFile('./file.txt', 'utf-8', (err, data) => {\n  if (err) throw err;\n  const json = JSON.parse(data);\n  // Process data\n});\n\n// Or with promises\nconst data = await fs.promises.readFile('./file.txt', 'utf-8');"
    },
    {
      id: "3",
      title: "XSS Vulnerability",
      severity: "critical",
      description: "HTML injection through unsanitized user input.",
      log: "XSS Attack Detected\nPayload: <img src=x onerror='alert(1)'>\nVector: User comment field\nRisk: Session hijacking",
      fix: "// Use DOMPurify to sanitize HTML\nimport DOMPurify from 'dompurify';\n\nconst userInput = req.body.comment;\nconst clean = DOMPurify.sanitize(userInput);\ndocument.getElementById('comments').innerHTML = clean;\n\n// In React, use textContent instead of dangerouslySetInnerHTML\nfunction Comment({ text }) {\n  return <div>{text}</div>; // Safe\n}\n\n// Or escape HTML\nconst escaped = userInput\n  .replace(/&/g, '&amp;')\n  .replace(/</g, '&lt;')\n  .replace(/>/g, '&gt;');"
    }
  ],
  [
    {
      id: "1",
      title: "Missing Null Checks",
      severity: "high",
      description: "Accessing properties of potentially null objects.",
      log: "TypeError: Cannot read property 'name' of undefined\n  at formatUser (user.ts:45)\n  at renderProfile (profile.tsx:20)",
      fix: "// Add null/undefined checks\ninterface User {\n  id: string;\n  name?: string;\n  profile?: {\n    bio?: string;\n  };\n}\n\nfunction formatUser(user: User | null | undefined): string {\n  if (!user) return 'Unknown user';\n  \n  // Optional chaining\n  const bio = user?.profile?.bio ?? 'No bio';\n  const name = user.name ?? 'Anonymous';\n  \n  return `${name}: ${bio}`;\n}"
    },
    {
      id: "2",
      title: "Resource Not Released",
      severity: "critical",
      description: "Database connections and file handles not closed.",
      log: "Warning: Too many open files (1024 limit exceeded)\nOpen handles: 1247\nUnclosed connections: 45",
      fix: "// Properly close resources\nimport fs from 'fs';\n\nfunction readLargeFile(path: string) {\n  const stream = fs.createReadStream(path);\n  \n  stream.on('data', (chunk) => {\n    // Process chunk\n  });\n  \n  stream.on('end', () => {\n    stream.close(); // Release resource\n  });\n  \n  stream.on('error', (error) => {\n    stream.close();\n    console.error(error);\n  });\n}\n\n// Or use with try/finally\nlet file = fs.openSync('./data.txt', 'r');\ntry {\n  // Read file\n} finally {\n  fs.closeSync(file);\n}"
    },
    {
      id: "3",
      title: "Deprecated API Usage",
      severity: "critical",
      description: "Using outdated API methods that will be removed.",
      log: "DeprecationWarning: Buffer() is deprecated\n  Use Buffer.alloc(), Buffer.allocUnsafe(), or Buffer.from()\n  at Object.<anonymous> (app.ts:12)",
      fix: "// Update deprecated APIs\n// Old (Deprecated)\nconst buf = Buffer(10);\nconst data = Buffer.from('text', 'utf-8');\n\n// New (Current)\nconst buf = Buffer.alloc(10);\nconst data = Buffer.from('text', 'utf-8');\n\n// Check Node.js docs for migration\n// npm outdated - shows deprecated packages\n// npm audit - shows security issues"
    }
  ],
  [
    {
      id: "1",
      title: "Bad Error Handling Chain",
      severity: "critical",
      description: "Error messages lost in promise chains.",
      log: "Error: Something went wrong\nOriginal error lost in translation\nStack trace: undefined",
      fix: "// Preserve error context\nasync function fetchAndProcess(url: string) {\n  try {\n    const response = await fetch(url);\n    if (!response.ok) {\n      throw new Error(`HTTP ${response.status}: ${response.statusText}`);\n    }\n    return await response.json();\n  } catch (error) {\n    if (error instanceof TypeError) {\n      throw new Error(`Network error: ${error.message}`);\n    }\n    throw error;\n  }\n}\n\n// Use error context\ntry {\n  await fetchAndProcess('/api/data');\n} catch (error) {\n  logger.error('Failed to fetch data', { error, url: '/api/data' });\n  res.status(500).json({ error: 'Internal error' });\n}"
    },
    {
      id: "2",
      title: "Race Condition in Auth State",
      severity: "high",
      description: "Auth check and action not atomic causing security issues.",
      log: "Security: User action executed without auth check\nUser deleted data before permission verification\nState: isAuthenticated changed between check and action",
      fix: "// Use atomic auth checks\nasync function deleteData(id: string, userId: string) {\n  // Use transaction to ensure atomicity\n  const transaction = await db.transaction();\n  \n  try {\n    // Verify permission\n    const data = await transaction.query(\n      'SELECT owner_id FROM data WHERE id = $1 FOR UPDATE',\n      [id]\n    );\n    \n    if (!data.rows[0] || data.rows[0].owner_id !== userId) {\n      throw new Error('Unauthorized');\n    }\n    \n    // Delete\n    await transaction.query('DELETE FROM data WHERE id = $1', [id]);\n    await transaction.commit();\n  } catch (error) {\n    await transaction.rollback();\n    throw error;\n  }\n}"
    },
    {
      id: "3",
      title: "Missing Content Security Policy",
      severity: "critical",
      description: "No CSP headers allowing injection attacks.",
      log: "CSP Violation: Inline script blocked\nPolicy: default-src 'self'\nViolation: Inline <script> detected",
      fix: "// Add CSP headers\napp.use((req, res, next) => {\n  res.setHeader(\n    'Content-Security-Policy',\n    \"default-src 'self'; \" +\n    \"script-src 'self' 'unsafe-inline' https://trusted.com; \" +\n    \"style-src 'self' 'unsafe-inline'; \" +\n    \"img-src 'self' data: https:; \" +\n    \"font-src 'self'\"\n  );\n  next();\n});\n\n// In Next.js\nexport const metadata = {\n  headers: {\n    'Content-Security-Policy': \"default-src 'self'\"\n  }\n};"
    }
  ]
];

export default function FixPanel({ targetUrl, issues = [] }: FixPanelProps) {
  const [isApplying, setIsApplying] = useState(false);
  const [isReviewingFixes, setIsReviewingFixes] = useState(false);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [loadingStep, setLoadingStep] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);
  const router = useRouter();

  const steps = [
    "Analyzing fixes...",
    "Applying patches...",
    "Deploying updated version..."
  ];

  const loadingSteps = [
    "📂 Fetching project structure...",
    "🔍 Scanning error logs...",
    "🔎 Parsing stack traces...",
    "📊 Analyzing error patterns...",
    "🤖 Running AI analysis...",
    "🛠️ Generating fixes...",
    "✓ Complete"
  ];

  // Generate deterministic error set based on URL hash
  const generatedIssues = useMemo(() => {
    const hash = Array.from(targetUrl).reduce((acc, char) => {
      return ((acc << 5) - acc) + char.charCodeAt(0);
    }, 0);
    const index = Math.abs(hash) % ERROR_SETS.length;
    return ERROR_SETS[index];
  }, [targetUrl]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'high': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      case 'low': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const handleReviewFixes = () => {
    setIsLoadingLogs(true);
    setLoadingStep(0);

    // 30-40 seconds total loading time
    const totalTime = 35000; // 35 seconds
    const stepTime = totalTime / loadingSteps.length;

    const logInterval = setInterval(() => {
      setLoadingStep(prev => {
        if (prev + 1 >= loadingSteps.length) {
          clearInterval(logInterval);
          setTimeout(() => {
            setIsLoadingLogs(false);
            setIsReviewingFixes(true);
          }, 500);
          return prev;
        }
        return prev + 1;
      });
    }, stepTime);
  };

  const handleCopyFix = (fix: string, issueId: string) => {
    navigator.clipboard.writeText(fix);
    setCopied(issueId);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleApplyFix = () => {
    setIsApplying(true);
    setCurrentStep(0);
    
    // Simulate pipeline steps
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < steps.length) {
        setCurrentStep(step);
      } else {
        clearInterval(interval);
        setTimeout(() => {
          router.push('/fixed?url=' + encodeURIComponent(targetUrl));
        }, 800);
      }
    }, 1200);
  };

  return (
    <>
      {/* Loading Modal */}
      <AnimatePresence>
        {isLoadingLogs && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#11161C] border border-[#4F9CF9]/30 rounded-2xl p-8 max-w-md w-full mx-4 shadow-[0_0_40px_rgba(79,156,249,0.2)]"
            >
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <FileText size={20} className="text-[#4F9CF9]" />
                Reading Logs & Analyzing Errors
              </h3>

              <div className="space-y-3">
                {loadingSteps.map((step, index) => {
                  const isPast = index < loadingStep;
                  const isCurrent = index === loadingStep;

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                        isCurrent ? 'bg-[#4F9CF9]/10 border border-[#4F9CF9]/30' : 'bg-transparent'
                      }`}
                    >
                      {isPast ? (
                        <CheckCircle2 size={16} className="text-green-400 flex-shrink-0" />
                      ) : isCurrent ? (
                        <Loader2 size={16} className="text-[#4F9CF9] animate-spin flex-shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-white/20 flex-shrink-0" />
                      )}
                      <span className={`text-sm ${isCurrent ? 'text-white font-medium' : 'text-[#9DA7B3]'}`}>
                        {step}
                      </span>
                    </motion.div>
                  );
                })}
              </div>

              <div className="mt-6 pt-4 border-t border-white/10">
                <p className="text-[#9DA7B3] text-xs">
                  Found {generatedIssues.length} issue{generatedIssues.length !== 1 ? 's' : ''} to fix...
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Review Fixes Modal */}
      <AnimatePresence>
        {isReviewingFixes && !isLoadingLogs && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0B0F14] border border-white/10 rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-y-auto shadow-[0_0_40px_rgba(79,156,249,0.15)]"
            >
              {/* Header */}
              <div className="sticky top-0 bg-[#0B0F14] border-b border-white/10 p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Review All Fixes</h2>
                <button
                  onClick={() => setIsReviewingFixes(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={20} className="text-[#9DA7B3]" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {generatedIssues.length > 0 ? (
                  generatedIssues.map((issue, index) => (
                    <motion.div
                      key={issue.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-[#11161C] border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors"
                    >
                      {/* Issue Title and Severity */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-bold text-white">{issue.title}</h3>
                            <span className={`text-[9px] uppercase tracking-wider font-bold px-2 py-1 rounded-full border ${getSeverityColor(issue.severity)}`}>
                              {issue.severity}
                            </span>
                          </div>
                          <p className="text-[#9DA7B3] text-sm">{issue.description}</p>
                        </div>
                      </div>

                      {/* Log Section */}
                      <div className="mb-4">
                        <p className="text-xs uppercase tracking-widest text-[#4F9CF9] font-bold mb-2">
                          📋 Error Log
                        </p>
                        <div className="bg-black/40 border border-white/5 rounded-lg p-3 font-mono text-xs text-[#9DA7B3] max-h-32 overflow-y-auto">
                          {issue.log.split('\n').map((line, i) => (
                            <div key={i}>{line}</div>
                          ))}
                        </div>
                      </div>

                      {/* Fix Section */}
                      <div>
                        <p className="text-xs uppercase tracking-widest text-green-400 font-bold mb-2">
                          🔧 Suggested Fix
                        </p>
                        <div className="relative bg-black/40 border border-white/5 rounded-lg p-3">
                          <pre className="font-mono text-xs text-green-300 max-h-40 overflow-y-auto whitespace-pre-wrap break-words">
                            {issue.fix}
                          </pre>
                          <button
                            onClick={() => handleCopyFix(issue.fix, issue.id)}
                            className={`absolute top-2 right-2 p-1.5 rounded transition-colors ${
                              copied === issue.id
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-white/5 text-[#9DA7B3] hover:bg-white/10'
                            }`}
                          >
                            <Copy size={14} />
                          </button>
                        </div>
                        {copied === issue.id && (
                          <p className="text-xs text-green-400 mt-1">✓ Copied to clipboard</p>
                        )}
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-[#9DA7B3]">No issues found. Your code looks great!</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-[#0B0F14] border-t border-white/10 p-6 flex gap-3">
                <button
                  onClick={() => setIsReviewingFixes(false)}
                  className="flex-1 px-4 py-2 text-[#9DA7B3] hover:text-white hover:bg-white/5 rounded-lg transition-colors font-medium"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setIsReviewingFixes(false);
                    handleApplyFix();
                  }}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-[#4F9CF9] to-purple-500 text-white font-medium rounded-lg hover:shadow-[0_0_20px_rgba(79,156,249,0.4)] transition-all hover:scale-105"
                >
                  Apply All Fixes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Bottom Panel */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0B0F14] via-[#0B0F14] to-transparent pointer-events-none z-40">
        <div className="max-w-3xl mx-auto flex justify-center pointer-events-auto">
          <AnimatePresence mode="wait">
            {!isApplying && !isReviewingFixes && !isLoadingLogs ? (
              <motion.div
                key="buttons"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="flex gap-4 p-2 bg-[#11161C]/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl"
              >
                <button
                  onClick={handleReviewFixes}
                  className="flex items-center gap-2 px-6 py-3 text-[#9DA7B3] hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                >
                  <Eye size={18} />
                  Review Fixes
                </button>
                <button
                  onClick={handleApplyFix}
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#4F9CF9] to-purple-500 text-white font-medium rounded-xl hover:shadow-[0_0_20px_rgba(79,156,249,0.4)] transition-all hover:scale-105"
                >
                  <Play size={18} className="fill-white" />
                  Apply Fixes
                </button>
              </motion.div>
            ) : isApplying && !isLoadingLogs && !isReviewingFixes ? (
              <motion.div
                key="progress"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-[#11161C] border border-[#4F9CF9]/30 rounded-2xl p-6 shadow-[0_0_30px_rgba(79,156,249,0.15)]"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-medium text-white flex items-center gap-2">
                    <Loader2 size={18} className="animate-spin text-[#4F9CF9]" />
                    Pipeline Executing
                  </h3>
                  <span className="text-sm font-mono text-[#4F9CF9]">
                    {Math.round(((currentStep) / steps.length) * 100)}%
                  </span>
                </div>

                <div className="space-y-4">
                  {steps.map((step, index) => {
                    const isPast = index < currentStep;
                    const isCurrent = index === currentStep;

                    return (
                      <div key={index} className={`flex items-center gap-3 ${isPast ? 'opacity-50' : isCurrent ? 'opacity-100' : 'opacity-30'}`}>
                        {isPast ? (
                          <CheckCircle2 size={16} className="text-green-400" />
                        ) : isCurrent ? (
                          <Loader2 size={16} className="text-[#4F9CF9] animate-spin" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-white/20" />
                        )}
                        <span className={`text-sm ${isCurrent ? 'text-white' : 'text-[#9DA7B3]'}`}>
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
