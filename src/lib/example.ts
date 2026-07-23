/**
 * Built-in example texts for the "Load Example" action.
 * Chosen to exercise additions, removals, modifications, and unchanged blocks,
 * plus indentation and blank lines — a realistic small code refactor.
 */

export interface ExamplePair {
  original: string
  modified: string
}

export const EXAMPLE: ExamplePair = {
  original: `import { useState } from 'react'

function Greeting({ name }) {
  const [count, setCount] = useState(0)

  return (
    <div>
      <h1>Hello, {name}</h1>
      <button onClick={() => setCount(count + 1)}>
        Clicked {count} times
      </button>
    </div>
  )
}

export default Greeting
`,
  modified: `import { useState, useCallback } from 'react'

function Greeting({ name, greeting = 'Hello' }) {
  const [count, setCount] = useState(0)

  const increment = useCallback(() => {
    setCount((c) => c + 1)
  }, [])

  return (
    <section className="greeting">
      <h1>{greeting}, {name}!</h1>
      <button type="button" onClick={increment}>
        Clicked {count} times
      </button>
    </section>
  )
}

export default Greeting
`,
}
