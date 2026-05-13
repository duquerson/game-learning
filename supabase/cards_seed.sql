-- TypeScript Cards with quiz questions (15 cards)
-- Each card has: title, content, question, 4 options, correct_answer

INSERT INTO cards (title, content, topic, subtopic, difficulty, points_value, question, options, correct_answer) VALUES

('Tipos basicos',
'En TypeScript, `unknown` es el tipo seguro de `any`. No se puede acceder a propiedades de un valor `unknown` sin antes realizar un type narrowing. Por ejemplo:

```ts
const mensaje: unknown = "Hola";
// Error: Object is of type unknown
const longitud: number = mensaje.length;

// Correcto:
if (typeof mensaje === "string") {
  const longitud = mensaje.length;
}
```

Esto fuerza al desarrollador a verificar el tipo antes de operar, a diferencia de `any` que permite cualquier operacion sin verificacion.',
'typescript', 'Tipos', 'easy', 10,
'Dado el siguiente codigo: `const mensaje: unknown = "Hola"; const longitud: number = mensaje.length;` Por que este codigo produce un error de compilacion?',
'[
  {"id": "A", "text": "Porque `unknown` no permite acceso a propiedades sin una verificacion de tipo primero"},
  {"id": "B", "text": "Porque `length` no es una propiedad de `string`"},
  {"id": "C", "text": "Porque `unknown` debe ser usado solo con tipos primitivos"},
  {"id": "D", "text": "Porque las variables declaradas con `const` no pueden tener tipo `unknown`"}
]'::jsonb,
'A'),

('Interfaces',
'Las interfaces en TypeScript soportan herencia mediante `extends`. `Perro` extiende `Animal`, por lo que hereda todas sus propiedades. La propiedad `nombre` esta definida como `string` en `Animal` y no es opcional (no tiene `?`), por lo que `mascota.nombre` es definitivamente `string`.

```ts
interface Animal { nombre: string; }
interface Perro extends Animal { ladrar(): void; }

const mascota: Perro = { nombre: "Rex", ladrar: () => console.log("Guau") };
mascota.nombre; // type: string (no puede ser undefined ni null)
```

Si `nombre` fuera opcional, se usaria `nombre?: string`, y el tipo seria `string | undefined`.',
'typescript', 'Interfaces', 'easy', 10,
'Dado el siguiente codigo:
```ts
interface Animal { nombre: string; }
interface Perro extends Animal { ladrar(): void; }
const mascota: Perro = { nombre: "Rex", ladrar: () => console.log("Guau") };
```
Que tipo tiene `mascota.nombre`?',
'[
  {"id": "A", "text": "`string`"},
  {"id": "B", "text": "`string | undefined`"},
  {"id": "C", "text": "`string | null`"},
  {"id": "D", "text": "`any`"}
]'::jsonb,
'A'),

('Type aliases',
'La diferencia clave es que `interface` soporta declaration merging: si declaras dos interfaces con el mismo nombre, TypeScript las fusiona automaticamente. `type` no puede reabrirse para agregar nuevas propiedades.

```ts
// Declaration merging con interface
interface User { name: string; }
interface User { age: number; }
// User tiene { name: string; age: number; } -- fusionado

// Esto NO funciona con type
type User = { name: string; };
type User = { age: number; }; // Error: Duplicate identifier
```

Ademas, `type` puede representar uniones (`type ID = string | number`), tuplas, y tipos condicionales, mientras que `interface` esta limitada a objetos y funciones.',
'typescript', 'Tipos', 'easy', 10,
'Cual es la diferencia fundamental entre `type` e `interface` en TypeScript?',
'[
  {"id": "A", "text": "`type` no puede describir objetos, solo uniones"},
  {"id": "B", "text": "`interface` puede ser extendida mediante declaracion merging, `type` no"},
  {"id": "C", "text": "`type` es mas lento en tiempo de compilacion que `interface`"},
  {"id": "D", "text": "`interface` solo funciona con objetos, `type` solo con primitivos"}
]'::jsonb,
'B'),

('Union types',
'Con tipos union, TypeScript solo permite acceder a propiedades y metodos que existen en **todos** los miembros de la union. `toUpperCase()` existe en `string` pero no en `number`, por lo que TypeScript muestra un error de compilacion.

```ts
type Resultado = string | number;

function procesar(valor: Resultado) {
  return valor.toUpperCase(); // Error
}

// Solucion con narrowing:
function procesarCorrecto(valor: Resultado) {
  if (typeof valor === "string") {
    return valor.toUpperCase(); // Ok: aqui valor es string
  }
  return valor.toFixed(2); // Ok: aqui valor es number
}
```

TypeScript estrecha el tipo dentro del bloque condicional usando el type guard `typeof`.',
'typescript', 'Tipos', 'medium', 20,
'Dado `type Resultado = string | number; function procesar(valor: Resultado) { return valor.toUpperCase(); }`, que ocurre al compilar?',
'[
  {"id": "A", "text": "Compila correctamente porque `string` tiene `toUpperCase`"},
  {"id": "B", "text": "Error porque `number` no tiene `toUpperCase` y la union requiere metodos comunes a todos los miembros"},
  {"id": "C", "text": "Error porque `Resultado` no puede contener `string` y `number` simultaneamente"},
  {"id": "D", "text": "Compila solo si se usa `as string` en la llamada a la funcion"}
]'::jsonb,
'B'),

('Intersection types',
'Al intersectar tipos con `A & B`, las propiedades deben satisfacer ambos tipos simultaneamente. `C.valor` tendria que ser `string` Y `number` a la vez. Como ningun valor puede cumplir ambas condiciones, el tipo resultante es `never`.

```ts
interface A { valor: string; }
interface B { valor: number; }
type C = A & B;
// C = { valor: string & number } = { valor: never }

// No existe valor posible para C:
const x: C = { valor: "texto" }; // Error
const y: C = { valor: 42 };      // Error

// Sin conflicto:
interface D { nombre: string; }
type E = A & D; // { valor: string; nombre: string }
```

Este es un caso clasico de como las intersecciones con propiedades conflictivas producen `never`.',
'typescript', 'Tipos', 'medium', 20,
'Dado:
```ts
interface A { valor: string; }
interface B { valor: number; }
type C = A & B;
```
Que tipo tiene la propiedad `valor` en `C`?',
'[
  {"id": "A", "text": "`string`"},
  {"id": "B", "text": "`number`"},
  {"id": "C", "text": "`never`"},
  {"id": "D", "text": "`string | number`"}
]'::jsonb,
'C'),

('Generics basicos',
'TypeScript infiere el parametro de tipo `T` basado en el argumento. `numeros` es de tipo `number[]`, por lo que `T = number`. El tipo de retorno es `T | undefined = number | undefined`. El tipo `undefined` es importante porque arrays vacios retornarian `undefined`.

```ts
function obtenerPrimero<T>(arr: T[]): T | undefined {
  return arr[0];
}

const numeros = [1, 2, 3];
// T se infiere como number (no como el literal 1|2|3)
const primero = obtenerPrimero(numeros);
// primero: number | undefined

const palabras = ["a", "b"];
const p = obtenerPrimero(palabras);
// p: string | undefined

const vacio: number[] = [];
const nada = obtenerPrimero(vacio);
// nada: number | undefined (runtime: undefined)
```',
'typescript', 'Generics', 'medium', 20,
'Dado:
```ts
function obtenerPrimero<T>(arr: T[]): T | undefined {
  return arr[0];
}
const numeros = [1, 2, 3];
const primero = obtenerPrimero(numeros);
```
Cual es el tipo de `primero`?',
'[
  {"id": "A", "text": "`number | undefined`"},
  {"id": "B", "text": "`number`"},
  {"id": "C", "text": "`1 | undefined`"},
  {"id": "D", "text": "`any`"}
]'::jsonb,
'A'),

('Enums',
'Los enums numericos en TypeScript generan reverse mapping automaticamente. El compilador crea un objeto que mapea tanto de clave a valor como de valor a clave. Por defecto `Rojo = 0`, `Verde = 1`, `Azul = 2`.

```ts
enum Color { Rojo, Verde, Azul }

Color[1];        // "Verde" (reverse mapping: valor -> clave)
Color.Verde;     // 1 (forward mapping: clave -> valor)
Color["Rojo"];   // 0
Color[0];        // "Rojo"

// Los enums de string NO tienen reverse mapping:
enum Direccion { Arriba = "ARRIBA", Abajo = "ABAJO" }
Direccion.Arriba;    // "ARRIBA"
Direccion["ARRIBA"]; // Error: no hay reverse mapping
```',
'typescript', 'Enums', 'easy', 10,
'Dado `enum Color { Rojo, Verde, Azul }`, cual es el valor de `Color[1]`?',
'[
  {"id": "A", "text": "`\"Rojo\"`"},
  {"id": "B", "text": "`\"Verde\"`"},
  {"id": "C", "text": "`1`"},
  {"id": "D", "text": "`undefined`"}
]'::jsonb,
'B'),

('Utility types: Partial, Required, Pick, Omit',
'`Partial<T>` hace que todas las propiedades de `T` sean opcionales agregando `?` a cada una. `Actualizable` equivale a `{ id?: number; nombre?: string; email?: string }`.

```ts
interface Usuario {
  id: number;
  nombre: string;
  email: string;
}

type Actualizable = Partial<Usuario>;
// Equivale a: { id?: number; nombre?: string; email?: string }

function actualizarUsuario(id: number, cambios: Partial<Usuario>): void {
  // cambios puede tener solo algunas propiedades
}
actualizarUsuario(1, { nombre: "Nuevo nombre" }); // Ok
actualizarUsuario(1, {}); // Ok -- todas son opcionales

// Otros utility types:
type UsuarioRequerido = Required<Actualizable>; // Todas requeridas
type SoloNombre = Pick<Usuario, "nombre">;        // { nombre: string }
type SinEmail = Omit<Usuario, "email">;           // { id: number; nombre: string }
```',
'typescript', 'Utility Types', 'medium', 20,
'Dado:
```ts
interface Usuario { id: number; nombre: string; email: string; }
type Actualizable = Partial<Usuario>;
```
Cual es la descripcion correcta del tipo `Actualizable`?',
'[
  {"id": "A", "text": "`id` sigue siendo requerido, `nombre` y `email` son opcionales"},
  {"id": "B", "text": "`id`, `nombre` y `email` son todas opcionales"},
  {"id": "C", "text": "`id` se omite, solo quedan `nombre` y `email` como requeridos"},
  {"id": "D", "text": "`id` se omite, `nombre` y `email` son opcionales"}
]'::jsonb,
'B'),

('Type assertions',
'Las type assertions (`as`) son solo una herramienta de tiempo de compilacion. NO realizan ninguna conversion o transformacion en tiempo de ejecucion. Solo le dicen a TypeScript "confia en mi, yo se el tipo real".

```ts
const valor: unknown = "123";
const num = valor as number;

console.log(typeof num); // "string" -- en runtime sigue siendo string
console.log(num);        // "123" -- el valor original intacto
console.log(num === 123); // false (no se convierte)

// Si la asercion es incorrecta, no hay warning de TS pero falla en runtime:
const texto: unknown = "hola";
const numeros = texto as number;
numeros.toFixed(2); // Lanza error en runtime: toFixed no existe en string
```

Para convertir realmente:
```ts
const numReal = Number("123");       // 123 (number)
const numReal2 = parseInt("123", 10); // 123 (number)
```',
'typescript', 'Tipos', 'medium', 20,
'Dado `const valor: unknown = "123"; const num = valor as number;`, que valor tiene `num` en tiempo de ejecucion?',
'[
  {"id": "A", "text": "El numero `123`"},
  {"id": "B", "text": "El string `\"123\"`"},
  {"id": "C", "text": "Lanza un error en tiempo de compilacion"},
  {"id": "D", "text": "`NaN`"}
]'::jsonb,
'B'),

('Funciones tipadas',
'El parametro `b` es opcional (`?`). Al no pasarlo, su valor en runtime es `undefined`. El operador `??` (nullish coalescing) retorna `0` solo cuando el valor izquierdo es `null` o `undefined`. `b ?? 0` evalua a `0`, entonces `5 + 0 = 5`.

```ts
function sumar(a: number, b?: number): number {
  return a + (b ?? 0);
}

sumar(5);     // 5 (b es undefined, ?? devuelve 0)
sumar(5, 3);  // 8 (b es 3)
sumar(5, 0);  // 5 (b es 0, ?? NO se activa porque 0 no es null/undefined)

// Diferencia entre ?? y ||:
const x = 0 ?? 42; // 0 (?? solo reacciona a null/undefined)
const y = 0 || 42; // 42 (|| reacciona a cualquier falsy)
```

Para un valor por defecto real se usa sintaxis de default: `b: number = 0`.',
'typescript', 'Funciones', 'easy', 10,
'Dado `function sumar(a: number, b?: number): number { return a + (b ?? 0); }`, que retorna `sumar(5)`?',
'[
  {"id": "A", "text": "Error porque falta el parametro `b`"},
  {"id": "B", "text": "Retorna `5` porque `b` es opcional y vale `undefined`, entonces `??` devuelve `0`"},
  {"id": "C", "text": "Retorna `NaN`"},
  {"id": "D", "text": "Retorna `5` porque `b` tiene valor por defecto `0`"}
]'::jsonb,
'B'),

('Arrays y tuplas tipados',
'Las tuplas en TypeScript compilan a arrays de JavaScript. El metodo `push` existe en los arrays y TypeScript no lo restringe para tuplas. Aunque el tipo de la tupla solo define dos posiciones, `push` es permitido y modifica el array en runtime.

```ts
type Tupla = [string, number];
const t: Tupla = ["edad", 25];

t.push(true); // Valido para TypeScript, aunque boolean no esta en la tupla
// t ahora es ["edad", 25, true] en runtime

// TypeScript protege el acceso por indice:
t[0]; // Ok: string
t[1]; // Ok: number
t[2]; // Error: la tupla solo tiene indices 0 y 1
```

Esto es una limitacion conocida: TypeScript no sobreescribe los metodos de Array para las tuplas. La proteccion solo aplica a indices definidos, no a metodos como `push` o `pop`.',
'typescript', 'Arrays', 'easy', 10,
'Dado `type Tupla = [string, number]; const t: Tupla = ["edad", 25];`, que ocurre al hacer `t.push(true)`?',
'[
  {"id": "A", "text": "Error de compilacion: `boolean` no es asignable a `string | number`"},
  {"id": "B", "text": "Error de compilacion: no se puede hacer push en una tupla"},
  {"id": "C", "text": "Es valido para TypeScript, aunque rompe la longitud esperada de la tupla en runtime"},
  {"id": "D", "text": "Lanza una excepcion en tiempo de ejecucion"}
]'::jsonb,
'C'),

('Readonly y const assertions',
'`as const` hace que TypeScript infiera el tipo mas especifico posible. Para arrays, infiere una **readonly tuple** con los valores literales exactos en cada posicion. Esto hace el array inmutable: no se puede hacer push, pop, ni reasignar elementos.

```ts
const frutas = ["manzana", "pera"] as const;
// Tipo: readonly ["manzana", "pera"]

// No es string[] (pierde los literales exactos)
// No es readonly string[] (no captura la longitud exacta)
// No es ["manzana", "pera"] mutable (as const agrega readonly)

frutas.push("naranja");  // Error: Property push does not exist
frutas[0] = "uva";       // Error: cannot assign to readonly

// Sin as const:
const frutas2 = ["manzana", "pera"];
// Tipo: string[] -- inferido como mutable

// Uso comun:
const CONFIG = {
  apiUrl: "https://api.example.com",
  timeout: 5000,
} as const;
// Tipo: { readonly apiUrl: "https://api.example.com"; readonly timeout: 5000 }
```',
'typescript', 'Tipos', 'medium', 20,
'Dado `const frutas = ["manzana", "pera"] as const;`, cual es el tipo inferido de `frutas`?',
'[
  {"id": "A", "text": "`string[]`"},
  {"id": "B", "text": "`readonly [\"manzana\", \"pera\"]`"},
  {"id": "C", "text": "`readonly string[]`"},
  {"id": "D", "text": "`[\"manzana\", \"pera\"]` (tupla mutable)"}
]'::jsonb,
'B'),

('Narrowing y type guards',
'TypeScript realiza discriminated union narrowing. Al usar una propiedad discriminante (`tipo`) dentro de un condicional, TypeScript estrecha automaticamente la union al miembro que coincide con el valor comparado. Cuando la condicion es falsa, elimina ese miembro de la union.

```ts
type Figura =
  | { tipo: "circulo"; radio: number }
  | { tipo: "rectangulo"; base: number; altura: number };

function area(figura: Figura) {
  // Aqui figura: Figura (union completa)

  if (figura.tipo === "circulo") {
    // Dentro: figura es { tipo: "circulo"; radio: number }
    return Math.PI * figura.radio ** 2;
  }

  // Fuera del if (else implicito):
  // figura es { tipo: "rectangulo"; base: number; altura: number }
  // TypeScript elimino "circulo" porque la condicion fue falsa
  return figura.base * figura.altura;
}
```

Esto funciona porque `tipo` es un string literal (`"circulo" | "rectangulo"`) que actua como discriminante. TypeScript sabe que si no es `"circulo"`, forzosamente es `"rectangulo"`.',
'typescript', 'Narrowing', 'hard', 30,
'Dado:
```ts
type Figura =
  | { tipo: "circulo"; radio: number }
  | { tipo: "rectangulo"; base: number; altura: number };
function area(figura: Figura) {
  if (figura.tipo === "circulo") {
    return Math.PI * figura.radio ** 2;
  }
  return figura.base * figura.altura;
}
```
Al llegar a `return figura.base * figura.altura`, que tipo tiene `figura`?',
'[
  {"id": "A", "text": "`Figura` (la union completa)"},
  {"id": "B", "text": "`never`"},
  {"id": "C", "text": "`{ tipo: \"rectangulo\"; base: number; altura: number }`"},
  {"id": "D", "text": "`{ tipo: \"circulo\"; radio: number }`"}
]'::jsonb,
'C'),

('Modulos y namespaces',
'Las exportaciones `default` se importan sin llaves. `import Usuario from "./usuario"` es la sintaxis correcta. Las exportaciones nombradas requieren llaves: `import { algo } from "./modulo"`.

```ts
// usuario.ts
export default class Usuario {
  constructor(public nombre: string) {}
}

// main.ts -- correcto
import Usuario from "./usuario";

// main.ts -- incorrecto
import { Usuario } from "./usuario"; // Error: no hay exportacion nombrada

// main.ts -- tambien correcto (forma alternativa)
import * as ModuloUsuario from "./usuario";
// Se usa: new ModuloUsuario.default()

// Combinando default y nombradas:
// archivo.ts
export default class Logger {}
export function format(msg: string): string { return msg; }

// import.ts
import Logger, { format } from "./archivo";
```

Los `default exports` son utiles para una sola entidad principal por modulo. Los `named exports` se usan para multiples entidades.',
'typescript', 'Modulos', 'medium', 20,
'Dado `export default class Usuario {}` en `usuario.ts`, cual es la sintaxis correcta para importar esta clase en otro archivo?',
'[
  {"id": "A", "text": "`import Usuario from \"./usuario\";`"},
  {"id": "B", "text": "`import { Usuario } from \"./usuario\";`"},
  {"id": "C", "text": "`import * as Usuario from \"./usuario\";`"},
  {"id": "D", "text": "`import default Usuario from \"./usuario\";`"}
]'::jsonb,
'A'),

('Mapped types y conditional types',
'Los conditional types evaluan una condicion en tiempo de compilacion. Con un tipo literal como `"hola"`, la evaluacion es directa: `"hola" extends string` es verdadero porque `"hola"` es un subtipo de `string`, por lo que `Resultado` es `"si"`.

```ts
type EsString<T> = T extends string ? "si" : "no";

type A = EsString<"hola">;   // "si"
type B = EsString<string>;   // "si"
type C = EsString<number>;   // "no"
type D = EsString<boolean>;  // "no"

// Distribucion sobre uniones:
type E = EsString<"a" | 1>;  // "si" | "no"

// Ejemplo practico: extraer tipo interno de array
type ElementoArray<T> = T extends (infer U)[] ? U : never;
type F = ElementoArray<number[]>; // number

// Mapped type con conditional:
type NullableProps<T> = {
  [K in keyof T]: T[K] extends object ? T[K] | null : T[K];
};
```

Los conditional types y mapped types son la base de todos los utility types de TypeScript como `Exclude`, `Extract`, `NonNullable`.',
'typescript', 'Tipos Avanzados', 'hard', 30,
'Dado:
```ts
type EsString<T> = T extends string ? "si" : "no";
type Resultado = EsString<"hola">;
```
Cual es el tipo de `Resultado`?',
'[
  {"id": "A", "text": "`\"si\"`"},
  {"id": "B", "text": "`boolean`"},
  {"id": "C", "text": "`\"si\" | \"no\"`"},
  {"id": "D", "text": "`string`"}
]'::jsonb,
'A');
