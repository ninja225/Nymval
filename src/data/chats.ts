
import { ChatSession } from '../types/models';
import { v4 as uuidv4 } from 'uuid';

export const sampleChats: ChatSession[] = [
  {
    id: "1",
    title: "Research on quantum computing",
    messages: [
      {
        id: uuidv4(),
        role: "user",
        content: "Explain quantum computing in simple terms",
        createdAt: Date.now() - 86400000
      },
      {
        id: uuidv4(),
        role: "assistant",
        content: "Quantum computing uses quantum bits or 'qubits' instead of traditional binary bits. Unlike regular bits that are either 0 or 1, qubits can exist in multiple states simultaneously due to a quantum property called superposition. This allows quantum computers to process vast amounts of possibilities simultaneously, making them potentially much faster for certain problems like cryptography, molecular modeling, and complex optimization tasks.",
        model: "gemini-pro-2.5",
        createdAt: Date.now() - 86390000
      }
    ],
    lastMessageDate: Date.now() - 86390000,
    models: ["gemini-pro-2.5"]
  },
  {
    id: "2",
    title: "JavaScript async functions",
    messages: [
      {
        id: uuidv4(),
        role: "user",
        content: "How do I use async/await in JavaScript?",
        createdAt: Date.now() - 172800000
      },
      {
        id: uuidv4(),
        role: "assistant",
        content: "Async/await is a way to handle asynchronous operations in JavaScript more cleanly than using callbacks or plain Promises.\n\n```javascript\n// Example of async/await\nasync function fetchData() {\n  try {\n    // The await keyword makes JavaScript wait until the promise resolves\n    const response = await fetch('https://api.example.com/data');\n    const data = await response.json();\n    return data;\n  } catch (error) {\n    console.error('Error fetching data:', error);\n  }\n}\n\n// Using the async function\nfetchData().then(data => {\n  console.log(data);\n});\n```\n\nKey points:\n1. Add the `async` keyword to a function to make it return a promise\n2. Use `await` inside async functions to pause execution until a promise settles\n3. Error handling can be done with try/catch blocks\n4. Async functions always return promises, even if you return a non-promise value",
        model: "deepseek-coder",
        createdAt: Date.now() - 172790000
      }
    ],
    lastMessageDate: Date.now() - 172790000,
    models: ["deepseek-coder"]
  },
  {
    id: "3",
    title: "Comparing ML frameworks",
    messages: [
      {
        id: uuidv4(),
        role: "user",
        content: "Compare PyTorch and TensorFlow",
        createdAt: Date.now() - 259200000
      },
      {
        id: uuidv4(),
        role: "assistant",
        model: "llama3-70b",
        content: "# PyTorch vs TensorFlow\n\n## PyTorch\n- **Dynamic computation graph**: Defines the graph on-the-fly during execution\n- **Python-first approach**: More Pythonic, easier debugging\n- **Research-friendly**: More flexible, easier to experiment with\n- **Deployment**: Historically weaker but improved with TorchScript and TorchServe\n- **Community**: Growing rapidly, especially in research\n\n## TensorFlow\n- **Static computation graph** (TF 1.x) with eager execution added in TF 2.x\n- **Production-ready**: Better deployment options with TensorFlow Serving\n- **Keras integration**: High-level API for easier model building\n- **TensorBoard**: Built-in visualization tools\n- **Industry adoption**: Widely used in production environments\n\nBoth frameworks offer comprehensive ML capabilities, with PyTorch generally preferred for research and TensorFlow often chosen for production deployments, though this gap has narrowed significantly in recent versions.",
        createdAt: Date.now() - 259190000
      }
    ],
    lastMessageDate: Date.now() - 259190000,
    models: ["llama3-70b"]
  },
];
