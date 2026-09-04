/** Dev-only route to exercise the global error.tsx boundary. */
export default function ThrowPage(): never {
  throw new Error("Intentional error for testing error.tsx");
}
