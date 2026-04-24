-- Seed Data: 30 JavaScript + TypeScript Cards

-- JavaScript Cards (15)
INSERT INTO cards (title, content, topic, subtopic, difficulty, points_value) VALUES
('Variables: var vs let vs const', 'var: function-scoped, can be redeclared. let: block-scoped, can be reassigned but not redeclared. const: block-scoped, cannot be reassigned. Use const by default, let for reassignment, avoid var.', 'javascript', 'variables', 'easy', 10),
('Arrow Functions', 'Arrow functions provide concise syntax and lexical this binding. (x) => x*2. They dont have their own this, arguments, or super. Use them for callbacks but avoid as object methods.', 'javascript', 'functions', 'easy', 10),
('Array map()', 'map() creates a new array by transforming each element. [1,2,3].map(x => x*2) returns [2,4,6]. Use for transformations, not for side effects. Returns new array, original unchanged.', 'javascript', 'arrays', 'easy', 10),
('Array filter()', 'filter() creates new array with elements passing a test. [1,2,3,4].filter(x => x>2) returns [3,4]. Keep original array. Use for selecting subsets.', 'javascript', 'arrays', 'easy', 10),
('Array reduce()', 'reduce() reduces array to single value. [1,2,3].reduce((acc,x) => acc+x, 0) returns 6. First param is accumulator, second is initial value. Very powerful.', 'javascript', 'arrays', 'medium', 20),
('Destructuring Objects', 'Extract values with pattern matching. const {name, age} = person. Can rename: const {name: userName} = person. Default values: const {country = "US"} = person.', 'javascript', 'objects', 'easy', 10),
('Destructuring Arrays', 'Extract by position. const [first, second] = [1,2,3]. Rest pattern: const [head, ...tail] = array. Skip elements: const [, , third] = array.', 'javascript', 'objects', 'medium', 20),
('Promises', 'Promises represent future value. new Promise((resolve, reject) => {}). States: pending, fulfilled, rejected. Use .then() for success, .catch() for errors.', 'javascript', 'async', 'medium', 20),
('async/await', 'async makes function return Promise. await pauses until Promise resolves. Cleaner than .then() chains. Always wrap in try/catch for error handling.', 'javascript', 'async', 'medium', 20),
('Template Literals', 'Backticks for string interpolation. `Hello ${name}!`. Supports multiline. Can embed expressions: `Total: ${price * 1.1}`.', 'javascript', 'string', 'easy', 10),
('Spread Operator', 'Spread expands iterables. [...arr1, ...arr2] merges arrays. {...obj} creates copy. Use to clone, merge, or pass array as arguments with apply().', 'javascript', 'operators', 'medium', 20),
('Optional Chaining', '?. safely accesses nested properties. user?.address?.city returns undefined if any part is null, no error. Short-circuits on null/undefined.', 'javascript', 'operators', 'medium', 20),
('Nullish Coalescing', '?? returns right operand only if left is null/undefined. Unlike ||, it does not use falsy values. Useful for defaults when 0 or "" are valid values.', 'javascript', 'operators', 'medium', 20),
('Closures', 'Function that remembers scope where it was created. Function returning function that accesses outer variable. Powerful for factories and data privacy.', 'javascript', 'advanced', 'hard', 30),
('Event Loop', 'JavaScript is single-threaded. Call stack handles execution. Web APIs handle async. Callback queue waits for stack to empty. Microtasks (.then) run before macrotasks.', 'javascript', 'advanced', 'hard', 30);

-- TypeScript Cards (15)
('Type Annotations', 'Add types after colon. let age: number = 25. Function: function greet(name: string): string. Types are compile-time only, removed in build.', 'typescript', 'basics', 'easy', 10),
('Interfaces', 'Define object shape. interface User { name: string; age: number; email?: string }. ? makes optional. Can extend other interfaces.', 'typescript', 'types', 'easy', 10),
('Type Aliases', 'Create custom type names. type ID = string | number. Combine types: type Status = "active" | "inactive". More readable than inline types.', 'typescript', 'types', 'easy', 10),
('Union Types', 'Variable can be multiple types. let id: string | number. Use type guards to narrow. typeof checks primitive type. Custom guard: function isString(s): s is string.', 'typescript', 'types', 'medium', 20),
('Intersection Types', 'Combine multiple types. type Admin = User & { role: string }. Gets all properties. Use for mixins and composition.', 'typescript', 'types', 'medium', 20),
('Generics', 'Generic functions work with any type. function identity<T>(arg: T): T. Specify on call: identity<string>("hi"). Constraints: <T extends Serializable>.', 'typescript', 'generics', 'medium', 20),
('Enums', 'Group related constants. enum Direction { Up, Down, Left, Right }. Default: 0,1,2,3. String enums: enum Direction { Up = "UP" }.', 'typescript', 'types', 'medium', 20),
('Utility Types - Partial/Required', 'Partial makes all props optional: Partial<User>. Required makes all required: Required<User>. Handy for update/update functions.', 'typescript', 'utilities', 'medium', 20),
('Utility Types - Pick/Omit', 'Pick selects properties: Pick<User, "name" | "age">. Omit removes: Omit<User, "password">. Create view types.', 'typescript', 'utilities', 'medium', 20),
('Type Assertions', 'Tell TS the type. As: const num = someValue as number. Angle bracket: const num = <number>someValue. Use when you know better than TS.', 'typescript', 'advanced', 'hard', 30),
('Typed Arrays', 'Declare array contents: let nums: number[] = [1,2,3]. Or Array<number>. Generic: Array<string>. Read-only: readonly number[].', 'typescript', 'advanced', 'hard', 30),
('Typed Objects', 'Object types: { name: string; age: number }. Optional: { name?: string }. Index signatures: { [key: string]: number }.', 'typescript', 'advanced', 'hard', 30),
('Readonly & Const Assertions', 'readonly prevents modification: readonly arr = [1,2]. as const makes literal immutable: [1,2] as const. narrows type to tuple.', 'typescript', 'advanced', 'hard', 30),
('Type Guards', 'Custom checks narrow types. function isUser(x: any): x is User { return "name" in x; }. typeof for primitives. instanceof for classes.', 'typescript', 'advanced', 'hard', 30),
('Modules & Namespaces', 'ES modules: export/import. Namespaces (deprecated): namespace Utils { export function... }. Prefer ES modules. Use triple-slash for legacy.', 'typescript', 'advanced', 'hard', 30);

-- Badges (9)
INSERT INTO badges (name, description, level, condition, icon) VALUES
('Primer Paso', 'Completar tu primera tarjeta', 'basic', 'first_card', '🌱'),
('En Racha', '3 respuestas correctas seguidas', 'basic', 'streak_3', '⚡'),
('Estudioso', 'Repasar 50 tarjetas en total', 'basic', 'cards_50', '📚'),
('Semana de Fuego', '7 días de racha', 'intermediate', 'streak_7', '🔥'),
('Experto JS', 'Completar todas las tarjetas de JavaScript', 'intermediate', 'js_complete', '🎯'),
('Centurión', '100 respuestas correctas', 'intermediate', 'correct_100', '🚀'),
('Perfeccionista', 'Sesión con 100% de aciertos', 'intermediate', 'perfect_session', '🏆'),
('Maestro TS', 'Completar todas las tarjetas de TypeScript', 'advanced', 'ts_complete', '💎'),
('Maestro Total', 'Completar todo el contenido', 'advanced', 'all_complete', '👑');