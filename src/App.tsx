"use client";

import {
  Authenticated,
  Unauthenticated,
  useConvexAuth,
  useMutation,
  useQuery,
} from "convex/react";
import { api } from "../convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";


export default function App() {

  return (
    <>
      <header className="sticky top-0 z-10 bg-light dark:bg-dark p-4 border-b-2 border-slate-200 dark:border-slate-800 flex justify-between items-center">
        <span className="text-lg font-semibold">Convex + React Auth</span>
        <SignOutButton />
      </header>

      <main className="p-8 flex flex-col gap-16">
        <h1 className="text-4xl font-bold text-center">
          Convex + React + Convex Auth
        </h1>
        <Authenticated>
          <Content />
        </Authenticated>
        <Unauthenticated>
          <SignInForm />
        </Unauthenticated>
      </main>
    </>
  );
}

function SignOutButton() {
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();

  return isAuthenticated ? (
    <button
      className="ml-auto bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
      onClick={() => void signOut()}
    >
      Sign out
    </button>
  ) : null;
}


function SignInForm() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-6 w-96 mx-auto p-6 border rounded-lg bg-slate-50 dark:bg-slate-900 shadow-md">
      <h2 className="text-xl font-bold text-center">Sign in to your account</h2>

      {/* <button
        onClick={() => void signIn("github")}
        className="bg-black text-white rounded-md py-2 px-4 hover:bg-gray-800 transition"
      >
        Sign in with GitHub
      </button> */}

      {/* <div className="text-center text-sm text-gray-500 dark:text-gray-400">or</div> */}

      <form
        className="flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target as HTMLFormElement);
          formData.set("flow", flow);
          void signIn("password", formData).catch((error) => {
            setError(error.message);
          });
        }}
      >
        <input
          type="email"
          name="email"
          placeholder="Email"
          required
          className="p-2 rounded border bg-white dark:bg-slate-800"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          required
          className="p-2 rounded border bg-white dark:bg-slate-800"
        />

        <button
          type="submit"
          className="bg-blue-600 text-white rounded py-2 hover:bg-blue-700 transition"
        >
          {flow === "signIn" ? "Sign in" : "Sign up"}
        </button>

        <div className="text-sm text-center">
          {flow === "signIn"
            ? "Don't have an account?"
            : "Already have an account?"}{" "}
          <span
            onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
            className="text-blue-600 dark:text-blue-400 cursor-pointer underline"
          >
            {flow === "signIn" ? "Sign up" : "Sign in"}
          </span>
        </div>
        {error && (
          <div className="text-red-500 text-sm text-center">{error}</div>
        )}
      </form>
    </div>
  );
}


function Content() {
  const [newTask, setNewTask] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const tasks = useQuery(api.tasks.getTasks, {}) || [];
  const addTask = useMutation(api.tasks.addTask);
  const toggleTask = useMutation(api.tasks.toggleTask);
  const deleteTask = useMutation(api.tasks.deleteTask);
  const editTask = useMutation(api.tasks.editTask);

  interface Task {
    _id: string;
    text: string;
    completed: boolean;
  }

  const handleAdd = async () => {
    if (newTask.trim()) {
      await addTask({ text: newTask });
      setNewTask("");
    }
  };

  const handleEdit = async (id: string) => {
    if (editText.trim()) {
      await editTask({ id, newText: editText });
      setEditingId(null);
      setEditText("");
    }
  };
  const { viewer, numbers } =
    useQuery(api.myFunctions.listNumbers, {
      count: 10,
    }) ?? {};
  const addNumber = useMutation(api.myFunctions.addNumber);

  if (viewer === undefined || numbers === undefined) {
    return (
      <div className="mx-auto">
        <p>loading... (consider a loading skeleton)</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-lg mx-auto">
      <p>Welcome {viewer ?? "Anonymous"}!</p>
      <p>
        Click the button below and open this page in another window - this data
        is persisted in the Convex cloud database!
      </p>
      <p>
        <button
          className="bg-dark dark:bg-light text-light dark:text-dark text-sm px-4 py-2 rounded-md border-2"
          onClick={() => {
            void addNumber({ value: Math.floor(Math.random() * 10) });
          }}
        >
          Add a random number
        </button>
      </p>
      <p>
        Numbers:{" "}
        {numbers?.length === 0
          ? "Click the button!"
          : (numbers?.join(", ") ?? "...")}
      </p>



      <form onSubmit={(e) => {
        e.preventDefault();
        void handleAdd();
      }}
        style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="New task"
          style={{ flex: 1, padding: 10 }}
        />
        <button type="submit" className="bg-dark dark:bg-light text-light dark:text-dark text-sm px-4 py-2 rounded-md border-2">Add</button>
      </form>

      <ul className="task-list">
        {tasks?.map((task: Task) => (
          <li key={task._id} className="task-item">
            <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => void toggleTask({ id: task._id })}
              />
              {editingId === task._id ? (
                <input
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="edit-input"
                  autoFocus
                />
              ) : (
                <span className={task.completed ? "completed" : ""} style={{ color: "black" }}>
                  {task.text}
                </span>
              )}
            </div>

            <div className="task-actions">
              {editingId === task._id ? (
                <>
                  <button onClick={() => void handleEdit(task._id)}>Save</button>
                  <button onClick={() => setEditingId(null)}>Cancel</button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setEditingId(task._id);
                      setEditText(task.text);
                    }}
                  >
                    Edit
                  </button>
                  <button onClick={() => void deleteTask({ id: task._id })}>
                    Delete
                  </button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

