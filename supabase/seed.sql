-- ============================================================
-- MicroLearn Platform — Seed Data
-- ============================================================

-- 9 Insignias del sistema
INSERT INTO badges (name, description, icon, level, condition) VALUES
  ('Primer paso',    'Responde tu primera tarjeta correctamente',                    '🌱', 'basic',        '{"type":"first_correct"}'),
  ('En racha',       'Consigue 3 respuestas correctas consecutivas en una sesión',   '⚡', 'basic',        '{"type":"correct_streak","threshold":3}'),
  ('Estudioso',      'Repasa 50 tarjetas en total',                                  '📚', 'basic',        '{"type":"total_reviewed","threshold":50}'),
  ('Semana de fuego','Mantén una racha de 7 días consecutivos de estudio',           '🔥', 'intermediate', '{"type":"daily_streak","threshold":7}'),
  ('Experto JS',     'Repasa correctamente todas las tarjetas de JavaScript',        '🎯', 'intermediate', '{"type":"topic_mastery","topic":"JavaScript"}'),
  ('Centurión',      'Acumula 100 respuestas correctas en total',                    '🚀', 'intermediate', '{"type":"total_correct","threshold":100}'),
  ('Perfeccionista', 'Completa una sesión con 100% de aciertos (mínimo 5 tarjetas)','🏆', 'intermediate', '{"type":"perfect_session","min_cards":5}'),
  ('Maestro TS',     'Repasa correctamente todas las tarjetas de TypeScript',        '💎', 'advanced',     '{"type":"topic_mastery","topic":"TypeScript"}'),
  ('Maestro total',  'Repasa correctamente todas las tarjetas disponibles',          '👑', 'advanced',     '{"type":"all_cards_mastery"}')
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- 15 Tarjetas de JavaScript
-- ============================================================
INSERT INTO cards (title, content, topic, subtopic, difficulty, points) VALUES

('var, let y const',
'**var** tiene scope de función y se puede redeclarar. **let** y **const** tienen scope de bloque. **const** no permite reasignación (pero sí mutación de objetos/arrays). Prefiere siempre `const`, usa `let` solo cuando necesites reasignar, y evita `var`.

```js
const PI = 3.14
let count = 0
count = 1 // ✅
PI = 3    // ❌ TypeError
```',
'JavaScript', 'Variables', 'easy', 10),

('Arrow functions',
'Las arrow functions tienen sintaxis más corta y **no tienen su propio `this`** — heredan el `this` del contexto donde se definen. No pueden usarse como constructores.

```js
const add = (a, b) => a + b
const greet = name => `Hola, ${name}`
const getObj = () => ({ key: "value" })
```',
'JavaScript', 'Funciones', 'easy', 10),

('map, filter y reduce',
'Los tres métodos de array más importantes:
- **map**: transforma cada elemento, devuelve nuevo array del mismo tamaño
- **filter**: filtra elementos según condición, devuelve subarray
- **reduce**: acumula valores en un único resultado

```js
const nums = [1, 2, 3, 4, 5]
nums.map(n => n * 2)        // [2,4,6,8,10]
nums.filter(n => n % 2 === 0) // [2,4]
nums.reduce((acc, n) => acc + n, 0) // 15
```',
'JavaScript', 'Arrays', 'medium', 20),

('Destructuring de objetos y arrays',
'Extrae valores de objetos y arrays en variables de forma concisa.

```js
// Objetos
const { name, age = 25 } = user
const { address: { city } } = user

// Arrays
const [first, , third] = [1, 2, 3]
const [head, ...tail] = [1, 2, 3, 4]
```',
'JavaScript', 'Objetos', 'easy', 10),

('Promesas y async/await',
'Las **Promesas** representan un valor futuro. **async/await** es azúcar sintáctico sobre promesas que hace el código asíncrono más legible.

```js
// Promise
fetch(url).then(r => r.json()).catch(err => console.error(err))

// async/await
async function getData() {
  try {
    const res = await fetch(url)
    return await res.json()
  } catch (err) {
    console.error(err)
  }
}
```',
'JavaScript', 'Asincronía', 'medium', 20),

('Closures',
'Un closure es una función que recuerda las variables de su scope externo incluso después de que ese scope haya terminado de ejecutarse.

```js
function makeCounter() {
  let count = 0
  return () => ++count
}
const counter = makeCounter()
counter() // 1
counter() // 2
```',
'JavaScript', 'Funciones', 'hard', 30),

('Event Loop',
'JavaScript es single-threaded. El **Event Loop** gestiona la ejecución: primero vacía el **call stack**, luego procesa **microtasks** (Promises), luego **macrotasks** (setTimeout, setInterval).

```js
console.log("1")
setTimeout(() => console.log("3"), 0)
Promise.resolve().then(() => console.log("2"))
// Output: 1, 2, 3
```',
'JavaScript', 'Runtime', 'hard', 30),

('Spread y Rest operator',
'El operador `...` tiene dos usos: **spread** expande un iterable, **rest** agrupa argumentos restantes.

```js
// Spread
const arr = [...[1,2], ...[3,4]]  // [1,2,3,4]
const obj = { ...a, ...b }

// Rest
function sum(...nums) {
  return nums.reduce((a, b) => a + b, 0)
}
```',
'JavaScript', 'Sintaxis', 'easy', 10),

('Template literals',
'Los template literals usan backticks y permiten interpolación con `${}`, strings multilínea y tagged templates.

```js
const name = "mundo"
const msg = `Hola, ${name}!`
const multi = `línea 1
línea 2`
const result = `${2 + 2}` // "4"
```',
'JavaScript', 'Sintaxis', 'easy', 10),

('Optional chaining (?.) y Nullish coalescing (??)',
'**?.** accede a propiedades sin lanzar error si el valor es null/undefined. **??** devuelve el lado derecho solo si el izquierdo es null o undefined (no falsy).

```js
const city = user?.address?.city  // undefined si no existe
const name = user?.name ?? "Anónimo"
const zero = 0 ?? 42  // 0 (no es null/undefined)
const zero2 = 0 || 42 // 42 (0 es falsy)
```',
'JavaScript', 'Sintaxis', 'medium', 20),

('Clases y herencia',
'Las clases en JS son azúcar sintáctico sobre prototipos. Soportan herencia con `extends`, métodos estáticos y getters/setters.

```js
class Animal {
  constructor(name) { this.name = name }
  speak() { return `${this.name} hace un sonido` }
}
class Dog extends Animal {
  speak() { return `${this.name} ladra` }
}
```',
'JavaScript', 'POO', 'medium', 20),

('Módulos ES6 (import/export)',
'Los módulos ES6 permiten dividir el código en archivos. **export** expone valores, **import** los consume. Hay exports nombrados y un export default por módulo.

```js
// math.js
export const PI = 3.14
export function add(a, b) { return a + b }
export default class Calculator {}

// main.js
import Calculator, { PI, add } from "./math.js"
```',
'JavaScript', 'Módulos', 'medium', 20),

('Error handling con try/catch',
'`try/catch/finally` captura errores síncronos. Para async/await, el try/catch también captura rechazos de promesas. Puedes crear errores personalizados extendiendo `Error`.

```js
try {
  JSON.parse("invalid")
} catch (err) {
  console.error(err.message)
} finally {
  console.log("siempre se ejecuta")
}
```',
'JavaScript', 'Errores', 'medium', 20),

('DOM Manipulation',
'El DOM es la representación del HTML como árbol de objetos. Puedes seleccionar, crear, modificar y eliminar elementos.

```js
const el = document.querySelector(".card")
el.textContent = "Nuevo texto"
el.classList.add("active")
el.addEventListener("click", handler)
const div = document.createElement("div")
document.body.appendChild(div)
```',
'JavaScript', 'DOM', 'medium', 20),

('Prototype chain',
'Cada objeto en JS tiene un prototipo interno. Cuando accedes a una propiedad, JS la busca en el objeto y luego sube por la cadena de prototipos hasta `null`.

```js
const arr = [1, 2, 3]
// arr → Array.prototype → Object.prototype → null
arr.hasOwnProperty("length") // true (propio)
arr.toString() // heredado de Object.prototype
```',
'JavaScript', 'Prototipos', 'hard', 30);

-- ============================================================
-- 15 Tarjetas de TypeScript
-- ============================================================
INSERT INTO cards (title, content, topic, subtopic, difficulty, points) VALUES

('Tipos básicos',
'TypeScript añade tipos estáticos a JavaScript. Los tipos básicos son: `string`, `number`, `boolean`, `null`, `undefined`, `symbol`, `bigint`, `any`, `unknown`, `never`, `void`.

```ts
let name: string = "Ana"
let age: number = 25
let active: boolean = true
let nothing: null = null
let undef: undefined = undefined
```',
'TypeScript', 'Tipos', 'easy', 10),

('Interfaces',
'Las interfaces definen la forma de un objeto. Son puramente de tipo (no generan código JS). Pueden extenderse y ser implementadas por clases.

```ts
interface User {
  id: number
  name: string
  email?: string  // opcional
  readonly createdAt: Date
}

interface Admin extends User {
  role: "admin"
}
```',
'TypeScript', 'Interfaces', 'easy', 10),

('Type aliases',
'Los type aliases crean nombres para tipos. A diferencia de las interfaces, pueden representar cualquier tipo (primitivos, uniones, tuplas, etc.).

```ts
type ID = string | number
type Point = { x: number; y: number }
type Callback = (err: Error | null, data: string) => void
type Pair<T> = [T, T]
```',
'TypeScript', 'Tipos', 'easy', 10),

('Union types',
'Un union type permite que un valor sea de uno de varios tipos. Se usa `|` para separar los tipos. TypeScript infiere el tipo correcto en cada rama.

```ts
type Status = "active" | "inactive" | "pending"
type ID = string | number

function format(id: ID): string {
  if (typeof id === "string") return id.toUpperCase()
  return id.toString()
}
```',
'TypeScript', 'Tipos', 'medium', 20),

('Intersection types',
'Los intersection types combinan múltiples tipos en uno. El valor debe satisfacer todos los tipos a la vez. Se usa `&`.

```ts
type Serializable = { serialize(): string }
type Loggable = { log(): void }
type Entity = Serializable & Loggable

// Entity debe tener tanto serialize() como log()
```',
'TypeScript', 'Tipos', 'medium', 20),

('Generics básicos',
'Los generics permiten crear componentes reutilizables que funcionan con múltiples tipos manteniendo la seguridad de tipos.

```ts
function identity<T>(arg: T): T { return arg }
function first<T>(arr: T[]): T | undefined { return arr[0] }

interface Box<T> { value: T }
const box: Box<number> = { value: 42 }
```',
'TypeScript', 'Generics', 'medium', 20),

('Enums',
'Los enums definen un conjunto de constantes nombradas. Pueden ser numéricos (por defecto) o de string.

```ts
enum Direction { Up, Down, Left, Right }
enum Status { Active = "ACTIVE", Inactive = "INACTIVE" }

const dir: Direction = Direction.Up  // 0
const s: Status = Status.Active      // "ACTIVE"
```',
'TypeScript', 'Enums', 'easy', 10),

('Utility types: Partial, Required, Pick, Omit',
'TypeScript incluye utility types para transformar tipos existentes:
- **Partial<T>**: hace todas las propiedades opcionales
- **Required<T>**: hace todas las propiedades requeridas
- **Pick<T, K>**: selecciona un subconjunto de propiedades
- **Omit<T, K>**: excluye propiedades

```ts
type PartialUser = Partial<User>
type RequiredUser = Required<User>
type UserName = Pick<User, "id" | "name">
type NoEmail = Omit<User, "email">
```',
'TypeScript', 'Utility Types', 'medium', 20),

('Type assertions',
'Las type assertions le dicen a TypeScript que trates un valor como un tipo específico. No hacen conversión en runtime.

```ts
const input = document.getElementById("name") as HTMLInputElement
const value = (input as HTMLInputElement).value

// Non-null assertion
const el = document.querySelector(".btn")!  // asegura que no es null
```',
'TypeScript', 'Tipos', 'medium', 20),

('Funciones tipadas',
'TypeScript permite tipar parámetros, valores de retorno y funciones completas. Los parámetros opcionales usan `?`, los con valor por defecto usan `=`.

```ts
function greet(name: string, greeting?: string): string {
  return `${greeting ?? "Hola"}, ${name}`
}

type Formatter = (value: number, decimals?: number) => string
const format: Formatter = (v, d = 2) => v.toFixed(d)
```',
'TypeScript', 'Funciones', 'easy', 10),

('Arrays y tuplas tipados',
'Los arrays tipados garantizan que todos los elementos son del mismo tipo. Las tuplas tienen longitud fija con tipos específicos por posición.

```ts
const nums: number[] = [1, 2, 3]
const strs: Array<string> = ["a", "b"]

// Tupla: [string, number]
const pair: [string, number] = ["edad", 25]
const [label, value] = pair
```',
'TypeScript', 'Arrays', 'easy', 10),

('Readonly y const assertions',
'`readonly` previene la mutación de propiedades. `as const` convierte un valor en un tipo literal inmutable.

```ts
interface Config {
  readonly apiUrl: string
  readonly timeout: number
}

const COLORS = ["red", "green", "blue"] as const
// type: readonly ["red", "green", "blue"]
type Color = typeof COLORS[number]  // "red" | "green" | "blue"
```',
'TypeScript', 'Tipos', 'medium', 20),

('Narrowing y type guards',
'TypeScript estrecha el tipo dentro de bloques condicionales. Puedes usar `typeof`, `instanceof`, `in`, o type guards personalizados.

```ts
function process(val: string | number) {
  if (typeof val === "string") {
    return val.toUpperCase()  // TypeScript sabe que es string
  }
  return val.toFixed(2)  // TypeScript sabe que es number
}

function isUser(obj: any): obj is User {
  return "id" in obj && "name" in obj
}
```',
'TypeScript', 'Narrowing', 'hard', 30),

('Módulos y namespaces',
'TypeScript soporta módulos ES6 con tipado completo. Los namespaces agrupan código relacionado (menos usados en código moderno).

```ts
// types.ts
export interface ApiResponse<T> {
  data: T
  status: number
  message: string
}

// api.ts
import type { ApiResponse } from "./types"
export async function get<T>(url: string): Promise<ApiResponse<T>> {
  const res = await fetch(url)
  return res.json()
}
```',
'TypeScript', 'Módulos', 'medium', 20),

('Mapped types y conditional types',
'Los mapped types crean nuevos tipos transformando las propiedades de uno existente. Los conditional types permiten lógica de tipos.

```ts
// Mapped type: hace todas las props opcionales y nullable
type Nullable<T> = { [K in keyof T]: T[K] | null }

// Conditional type
type IsString<T> = T extends string ? true : false
type NonNullable<T> = T extends null | undefined ? never : T
```',
'TypeScript', 'Tipos Avanzados', 'hard', 30);
