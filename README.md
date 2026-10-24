# PROTO.DEV | Asistente de Precálculo

Proyecto de **Precálculo, sección B** — Universidad Mariano Gálvez de Guatemala.

- **Catedrático:** Ing. Reyes Baltazar Maza Guerra
- **Integrantes:** Jhónatan Emanuel Cúnay Quiñonez y Christian José Daniel Santos Cua

## Archivos
| Archivo | Para qué sirve |
|---|---|
| `index.html` | Estructura de la página |
| `style.css` | Diseño (colores, letras, cuadrícula) |
| `app.js` | Resolver, graficar, ejemplos, práctica y laboratorio Python |
| `trig.js` | Herramientas de trigonometría (Temas 5 y 6) |
| `logo_umg.webp` | Escudo de la UMG |

## Qué hace
- **resolver.js:** ecuaciones, factorización, derivadas, integrales, límites en x → 0, simplificación, gráficas, dominio, rango, composición, máximos/mínimos y práctica.
- **trigonometria.js:** círculo unitario y ángulo de referencia, valores exactos, gráficas de seno y coseno (amplitud, período, desfase), modelación, verificación de identidades, suma y diferencia de ángulos, ángulo doble, funciones inversas y ecuaciones trigonométricas.
- **ejemplos.js:** 10 ejemplos generales y los 10 ejercicios de la hoja de trabajo.
- **laboratorio.py:** código Python real en el navegador (Pyodide).

## Cómo publicarlo en GitHub Pages
1. Crea un repositorio y sube los 5 archivos a la raíz (no la carpeta, los archivos).
2. Entra a **Settings → Pages**.
3. En **Build and deployment** elige **Deploy from a branch**, rama `main`, carpeta `/(root)` y pulsa **Save**.
4. Espera 1 o 2 minutos y copia la URL pública.

> Necesita Internet: usa Nerdamer, Math.js, Plotly y Pyodide desde CDN. Las soluciones de ecuaciones trigonométricas se buscan numéricamente y la verificación de identidades es numérica: sirven para comprobar tu trabajo, pero los pasos algebraicos los escribes tú.
