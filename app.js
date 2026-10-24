/* PROTO.DEV — lógica de la página
   Está dividida en 5 partes: 1) datos, 2) ayudas, 3) operaciones, 4) práctica, 5) Python. */

const $ = id => document.getElementById(id);

/* ---------- 1) DATOS ---------- */

// Botones de operaciones: [identificador, texto del botón]
const ACCIONES = [
  ['solve', 'Resolver ecuación'], ['factor', 'Factorizar'], ['derive', 'Derivar'],
  ['integrate', 'Integrar'], ['limit', 'Límite x → 0'], ['simplify', 'Simplificar'],
  ['graph', 'Graficar'], ['domain', 'Dominio'], ['range', 'Rango estimado'],
  ['compose', 'Composición f;g'], ['application', 'Máximos y mínimos'], ['practice', 'Generar práctica'],
];

// Diez ejemplos: título, texto que se muestra, ejercicio y operación a aplicar
const EJEMPLOS = [
  ['Ecuación lineal', '2x + 5 = 17', '2*x + 5 = 17', 'solve'],
  ['Factorización', 'x² − 5x + 6', 'x^2 - 5*x + 6', 'factor'],
  ['Derivada de una cúbica', 'x³ − 6x² + 9x + 1', 'x^3 - 6*x^2 + 9*x + 1', 'derive'],
  ['Integral indefinida', '3x² + 2x', '3*x^2 + 2*x', 'integrate'],
  ['Límite notable', 'sin(x)/x cuando x → 0', 'sin(x)/x', 'limit'],
  ['Simplificación', '(x² − 9)/(x − 3)', '(x^2 - 9)/(x - 3)', 'simplify'],
  ['Ecuación cuadrática', 'x² − 5x + 6 = 0', 'x^2 - 5*x + 6 = 0', 'solve'],
  ['Gráfica de parábola', 'f(x) = x² − 4', 'x^2 - 4', 'graph'],
  ['Funciones trigonométricas', 'sin(x) + cos(x)', 'cos(x) + sin(x)', 'derive'],
  ['Función con raíz', '√(x + 4), dominio', 'sqrt(x + 4)', 'domain'],
];

// Ejercicios de práctica: pregunta, respuesta correcta y pista
const PRACTICAS = [
  { q: 'Deriva: x^3 - 4*x', a: '3*x^2-4', pista: 'Regla de la potencia: d(x^n)/dx = n*x^(n-1).' },
  { q: 'Factoriza: x^2 - 5*x + 6', a: '(x-2)*(x-3)', pista: 'Busca dos números que multipliquen 6 y sumen -5.' },
  { q: 'Resuelve: 2*x + 6 = 14', a: '4', pista: 'Resta 6 en ambos lados y divide entre 2.' },
  { q: 'Integra: 2*x (sin la constante C)', a: 'x^2', pista: 'La antiderivada de 2x es x².' },
  { q: 'Simplifica: (x^2 - 4)/(x - 2)', a: 'x+2', pista: 'Factoriza x² − 4 como (x − 2)(x + 2).' },
];

let practicaActual = null;

/* ---------- 2) AYUDAS ---------- */

function mostrar(texto) { $('result').textContent = texto; }

// Lee lo que escribió el estudiante y lo deja listo para las librerías
function leerExpresion() {
  const s = $('expr').value.trim().replace(/π/g, 'pi').replace(/\*\*/g, '^').replace(/\bsen\b/g, 'sin');
  if (!s) throw Error('Escribe una expresión matemática primero.');
  return s;
}

// Calcula con Nerdamer (matemática simbólica)
function simbolico(s) {
  if (typeof nerdamer === 'undefined') throw Error('No cargó la librería de matemáticas. Revisa tu conexión a Internet.');
  return nerdamer(s).toString();
}

function resolverEcuacion(texto) {
  const partes = texto.split('=');
  if (partes.length !== 2 || !partes[0].trim() || !partes[1].trim())
    throw Error('Escribe una ecuación como 2*x + 5 = 17.');
  const diferencia = `(${partes[0]})-(${partes[1]})`;

  // Primer intento: Nerdamer
  try {
    const raices = nerdamer.solve(diferencia, 'x').toString();
    if (raices && raices !== '[]') return `x = ${raices}`;
  } catch (e) { /* si falla, probamos el plan B */ }

  // Plan B: ecuación lineal con math.js (ax + b = 0)
  try {
    const b = math.evaluate(diferencia, { x: 0 });
    const a = math.evaluate(diferencia, { x: 1 }) - b;
    if (Math.abs(a) > 1e-10) return `x = ${math.format(-b / a, { precision: 12 })}`;
    if (Math.abs(b) < 1e-10) return 'La igualdad se cumple para todos los valores de x.';
    return 'La ecuación no tiene solución.';
  } catch (e) {
    throw Error('No pude interpretar esta ecuación. Usa * para multiplicar, por ejemplo 2*x + 5 = 17.');
  }
}

// Dibuja la gráfica de la expresión entre x = -10 y x = 10
function graficar(s) {
  const e = s.includes('=') ? s.split('=').slice(1).join('=').trim() : s;
  const f = math.compile(e);
  const xs = [], ys = [];
  for (let i = 0; i <= 400; i++) {
    const x = -10 + i * 0.05;
    xs.push(x);
    try {
      const y = f.evaluate({ x });
      ys.push(typeof y === 'number' && Number.isFinite(y) && Math.abs(y) < 1e6 ? y : null);
    } catch (err) { ys.push(null); }
  }
  Plotly.newPlot('plot',
    [{ x: xs, y: ys, type: 'scatter', mode: 'lines', name: e, line: { color: '#d9b25a', width: 3 } }],
    {
      title: { text: `f(x) = ${e}`, font: { color: '#e8f0f8' } },
      paper_bgcolor: '#091a2f', plot_bgcolor: '#091a2f', font: { color: '#9db2c9' },
      xaxis: { title: 'x', zeroline: true, gridcolor: '#1d3a5f', zerolinecolor: '#4aa3e0' },
      yaxis: { title: 'f(x)', zeroline: true, gridcolor: '#1d3a5f', zerolinecolor: '#4aa3e0' },
      margin: { t: 50, l: 50, r: 15, b: 45 },
    }, { responsive: true });
  return e;
}

/* ---------- 3) OPERACIONES ---------- */

function ejecutar(accion) {
  $('practice').hidden = true;
  if (accion !== 'graph' && accion !== 'range') $('plot').innerHTML = '';

  try {
    const s = leerExpresion();

    if (accion === 'solve') {
      const r = resolverEcuacion(s);
      const p = s.split('=');
      mostrar(`RESOLVER ECUACIÓN\n\n1. Ecuación original: ${s}\n2. Pasamos todo a un lado: (${p[0]}) - (${p[1]}) = 0\n3. Despejamos x.\n\nRESPUESTA: ${r}\n\nPrueba: sustituye cada solución en la ecuación original.`);

    } else if (accion === 'factor') {
      mostrar(`FACTORIZACIÓN\n\n1. Expresión: ${s}\n2. Buscamos factores cuyo producto sea la expresión.\n\nRESPUESTA: ${simbolico(`factor(${s})`)}\n\nPrueba: multiplica los factores y comprueba que obtienes la original.`);

    } else if (accion === 'derive') {
      mostrar(`DERIVADA\n\n1. Función: f(x) = ${s}\n2. Derivamos término por término con las reglas de derivación.\n\nRESPUESTA: f'(x) = ${simbolico(`diff(${s},x)`)}`);

    } else if (accion === 'integrate') {
      mostrar(`INTEGRAL INDEFINIDA\n\n1. Función: f(x) = ${s}\n2. Buscamos una función cuya derivada sea f(x).\n\nRESPUESTA: ∫ f(x) dx = ${simbolico(`integrate(${s},x)`)} + C\n(C es la constante de integración)`);

    } else if (accion === 'limit') {
      mostrar(`LÍMITE CUANDO x TIENDE A 0\n\n1. Función: f(x) = ${s}\n2. Vemos a qué valor se acerca f(x) cuando x se acerca a cero.\n\nRESPUESTA: lim(x→0) f(x) = ${simbolico(`limit(${s},x,0)`)}`);

    } else if (accion === 'simplify') {
      mostrar(`SIMPLIFICACIÓN\n\n1. Expresión: ${s}\n2. Reducimos la expresión al máximo.\n\nRESPUESTA: ${simbolico(`simplify(${s})`)}\n\nSi se cancelaron factores, recuerda las restricciones del dominio original.`);

    } else if (accion === 'graph') {
      const e = graficar(s);
      mostrar(`GRÁFICA\n\nf(x) = ${e}\n\nLa gráfica muestra -10 ≤ x ≤ 10. Observa dónde cruza los ejes y dónde sube o baja.`);

    } else if (accion === 'domain') {
      const notas = [];
      if (s.includes('/')) notas.push('El denominador no puede ser cero.');
      if (/sqrt\s*\(/.test(s)) notas.push('Con números reales, lo que está dentro de la raíz debe ser ≥ 0.');
      if (/log\s*\(/.test(s)) notas.push('Lo que está dentro de un logaritmo debe ser > 0.');
      if (!notas.length) notas.push('Si es un polinomio, el dominio son todos los números reales.');
      mostrar(`DOMINIO\n\nf(x) = ${s}\n\nReglas:\n• Se excluyen los valores que vuelven cero un denominador.\n• Dentro de una raíz cuadrada: ≥ 0.\n• Dentro de un logaritmo: > 0.\n\nPara esta función: ${notas.join(' ')}\n\nEscribe la restricción como desigualdad y resuélvela para dar el dominio en intervalos.`);

    } else if (accion === 'range') {
      graficar(s);
      mostrar(`RANGO ESTIMADO\n\nf(x) = ${s}\n\nMira la gráfica: ¿entre qué valores de y se mueve la función? Es una aproximación visual; el rango exacto necesita análisis algebraico.`);

    } else if (accion === 'compose') {
      const p = s.split(';');
      if (p.length !== 2) throw Error('Escribe f(x);g(x) separadas por punto y coma. Ejemplo: x^2;2*x+1');
      const f = p[0].trim(), g = p[1].trim();
      const r = simbolico(f.replace(/x/g, `(${g})`));
      mostrar(`COMPOSICIÓN DE FUNCIONES\n\nf(x) = ${f}\ng(x) = ${g}\n\n(f∘g)(x) = f(g(x)): reemplazamos cada x de f por g(x).\n\nRESPUESTA: (f∘g)(x) = ${r}`);

    } else if (accion === 'application') {
      const d1 = simbolico(`diff(${s},x)`);
      const d2 = simbolico(`diff(diff(${s},x),x)`);
      mostrar(`MÁXIMOS Y MÍNIMOS\n\nf(x) = ${s}\n\nPasos:\n1. Calcula f'(x).\n2. Resuelve f'(x) = 0 para hallar los puntos críticos.\n3. Con f''(x): si es positiva hay mínimo, si es negativa hay máximo.\n4. Sustituye los puntos críticos en f(x) para obtener la altura.\n\nf'(x)  = ${d1}\nf''(x) = ${d2}`);

    } else if (accion === 'practice') {
      generarPractica();
    }
  } catch (e) {
    mostrar(`No se pudo resolver el ejercicio.\n\n${e.message || e}\n\nEjemplos válidos: x^2 - 4  o  2*x + 5 = 17`);
  }
}

/* ---------- 4) PRÁCTICA ---------- */

function generarPractica() {
  practicaActual = PRACTICAS[Math.floor(Math.random() * PRACTICAS.length)];
  $('question').textContent = practicaActual.q;
  $('answer').value = '';
  $('feedback').textContent = '';
  $('practice').hidden = false;
  mostrar('Se generó un ejercicio. Escribe tu respuesta y pulsa Comprobar.');
}

function comprobar() {
  if (!practicaActual) return;
  const fb = $('feedback');
  try {
    const respuesta = $('answer').value.trim();
    if (!respuesta) throw Error('vacío');
    // Si (tu respuesta) − (la correcta) se simplifica a 0, son iguales
    const ok = simbolico(`simplify((${respuesta})-(${practicaActual.a}))`) === '0';
    fb.textContent = ok ? 'Correcto. Muy bien.' : `Todavía no. Pista: ${practicaActual.pista}`;
    fb.style.color = ok ? 'var(--ok)' : 'var(--rojo)';
  } catch (e) {
    fb.textContent = `No pude leer tu respuesta. Pista: ${practicaActual.pista}`;
    fb.style.color = 'var(--rojo)';
  }
}

/* ---------- 5) LABORATORIO PYTHON (Pyodide) ---------- */

const CODIGO_PYTHON = {
  cuadratica: `# Ecuación cuadrática: ax² + bx + c = 0
import math

a, b, c = 1, -5, 6   # cambia estos números

d = b**2 - 4*a*c     # discriminante
print(f"Ecuación: {a}x² + {b}x + {c} = 0")
print(f"Discriminante = {d}")

if a == 0:
    print("No es cuadrática: a no puede ser 0.")
elif d > 0:
    x1 = (-b + math.sqrt(d)) / (2*a)
    x2 = (-b - math.sqrt(d)) / (2*a)
    print(f"Dos soluciones reales: x1 = {x1}, x2 = {x2}")
elif d == 0:
    print(f"Una solución real: x = {-b / (2*a)}")
else:
    print("No tiene soluciones reales (d < 0).")

if a != 0:
    h = -b / (2*a)
    k = a*h**2 + b*h + c
    print(f"Vértice de la parábola: ({h}, {k})")
`,
  tabla: `# Tabla de valores de una función
def f(x):
    return x**2 - 4   # cambia la función

print("  x |  f(x)")
print("----+------")
for x in range(-5, 6):
    print(f"{x:3} | {f(x):5}")
`,
};

CODIGO_PYTHON.trigo = `# Razones trigonométricas de un ángulo
import math

grados = 210                     # cambia el ángulo (en grados)
g = grados % 360
rad = math.radians(grados)

# Cuadrante y ángulo de referencia
if g % 90 == 0:
    cuadrante = "sobre un eje"
elif g < 90:
    cuadrante = "I"
elif g < 180:
    cuadrante = "II"
elif g < 270:
    cuadrante = "III"
else:
    cuadrante = "IV"

if g <= 90:
    ref = g
elif g <= 180:
    ref = 180 - g
elif g <= 270:
    ref = g - 180
else:
    ref = 360 - g

print(f"Ángulo: {grados}° = {rad:.4f} rad")
print(f"Cuadrante: {cuadrante}")
print(f"Ángulo de referencia: {ref}°")
print(f"sen = {math.sin(rad):.4f}")
print(f"cos = {math.cos(rad):.4f}")
if abs(math.cos(rad)) < 1e-12:
    print("tan = indefinida")
else:
    print(f"tan = {math.tan(rad):.4f}")
`;

CODIGO_PYTHON.doble = `# Ángulo doble: sen θ = 3/5 con θ en el cuadrante II
import math
from fractions import Fraction

s = Fraction(3, 5)      # valor de sen θ
cuadrante = 2           # 1, 2, 3 o 4

c = math.sqrt(1 - s**2)             # cos θ sin signo (cos² = 1 − sen²)
if cuadrante in (2, 3):             # el coseno es negativo en II y III
    c = -c
c = Fraction(c).limit_denominator(1000)

sen2 = 2 * s * c                    # sen 2θ = 2 sen θ cos θ
cos2 = c**2 - s**2                  # cos 2θ = cos²θ − sen²θ

print(f"cos θ = {c}")
print(f"tan θ = {s / c}")
print(f"sen 2θ = {sen2}")
print(f"cos 2θ = {cos2}")
print(f"tan 2θ = {sen2 / cos2}")
`;

let pyodide = null;

// Carga Pyodide solo cuando se necesita (pesa varios MB)
async function cargarPython() {
  if (pyodide) return pyodide;
  $('salida-py').textContent = 'Cargando Python por primera vez...';
  await new Promise((ok, fallo) => {
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js';
    s.onload = ok;
    s.onerror = () => fallo(Error('No se pudo descargar Python. Revisa tu conexión a Internet.'));
    document.head.appendChild(s);
  });
  pyodide = await loadPyodide();
  return pyodide;
}

async function ejecutarPython() {
  const salida = $('salida-py');
  const boton = $('run-py');
  boton.disabled = true;
  try {
    const py = await cargarPython();
    let texto = '';
    py.setStdout({ batched: linea => { texto += linea + '\n'; } });
    salida.textContent = 'Ejecutando...';
    await py.runPythonAsync($('codigo').value);
    salida.textContent = texto || '(El programa terminó sin imprimir nada. Usa print() para ver resultados.)';
  } catch (e) {
    salida.textContent = `Error:\n${e.message || e}`;
  } finally {
    boton.disabled = false;
  }
}

/* ---------- ARRANQUE: conectar botones y pestañas ---------- */

function abrirTab(nombre) {
  document.querySelectorAll('.tab').forEach(t => {
    const activa = t.dataset.tab === nombre;
    t.classList.toggle('activa', activa);
    t.setAttribute('aria-selected', activa);
  });
  document.querySelectorAll('.panel').forEach(p => { p.hidden = p.id !== `tab-${nombre}`; });
}

// Botones de operaciones
$('acciones').innerHTML = ACCIONES
  .map(([id, texto]) => `<button class="chip" data-act="${id}">${texto}</button>`).join('');
document.querySelectorAll('[data-act]').forEach(b => b.onclick = () => ejecutar(b.dataset.act));

// Tarjetas de ejemplos
$('ejemplos').innerHTML = EJEMPLOS
  .map(([titulo, vista, , ], i) => `<button class="ejemplo" data-i="${i}"><b>${i + 1}. ${titulo}</b><span>${vista}</span></button>`).join('');
document.querySelectorAll('.ejemplo').forEach(b => b.onclick = () => {
  const [, , ejercicio, accion] = EJEMPLOS[b.dataset.i];
  $('expr').value = ejercicio;
  abrirTab('resolver');
  ejecutar(accion);
});

// Resolver con el botón o con Enter
$('solve').onclick = () => ejecutar($('expr').value.includes('=') ? 'solve' : 'simplify');
$('expr').addEventListener('keydown', e => { if (e.key === 'Enter') $('solve').click(); });
$('check').onclick = comprobar;
$('answer').addEventListener('keydown', e => { if (e.key === 'Enter') comprobar(); });

// Pestañas y Python
document.querySelectorAll('.tab').forEach(t => t.onclick = () => abrirTab(t.dataset.tab));
document.querySelectorAll('[data-preset]').forEach(b => b.onclick = () => { $('codigo').value = CODIGO_PYTHON[b.dataset.preset]; });
$('codigo').value = CODIGO_PYTHON.cuadratica;
$('run-py').onclick = ejecutarPython;
