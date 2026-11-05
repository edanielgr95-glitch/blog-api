## Uso de inteligencia artificial en Blog API

- **Proyecto:** Blog API
- **Herramienta:** Claude, de Anthropic (<https://claude.ai>)
- **Para qué la usé:** aprender los conceptos, organizar el proyecto, escribir y corregir código, preparar pruebas, documentar y desplegar.

---

## Antes de empezar

Este documento registra cómo usé Claude mientras desarrollaba Blog API. Cuando empecé el proyecto mi experiencia en backend era bastante básica, así que lo usé en casi todas las etapas, no solo para resolver dudas puntuales.

Quiero ser claro en algo: Claude escribió y modificó buena parte del código del proyecto. Yo le daba los requerimientos y el contexto, revisaba lo que proponía, decidía qué se incorporaba y comprobaba que funcionara. Las decisiones sobre el alcance, las funcionalidades extra y los cambios fueron mías.


---

## Cómo fue avanzando el proyecto

### 1. Primero, entender lo básico

Antes de escribir una sola ruta necesitaba entender con qué estaba trabajando: cómo funciona un servidor web, qué pasa en una petición HTTP, cómo moverme en la terminal y cómo usar Git. Le pedí a Claude que me lo explicara paso a paso, con ejemplos, y que me dijera no solo *cómo* se usaba cada cosa sino *para qué* servía en un proyecto real.

> Quiero estudiar esta clase de forma práctica y paso a paso. Explícame los conceptos y por qué se usa cada elemento. Necesito apuntes que me sirvan para los siguientes módulos, con ejemplos y con los términos técnicos que todavía no conozco explicados.

Con esas explicaciones fui armando mis propios apuntes, que después me sirvieron de referencia durante todo el proyecto.

### 2. Leer el enunciado y organizarme

Cuando ya tenía una base, compartí el enunciado y los criterios de evaluación. Le pedí que me ayudara a entender qué había que construir y a dividirlo en etapas, porque al principio no tenía claro por dónde empezar.

> Analiza el enunciado de Blog API y explícame qué tenemos que desarrollar para cumplir todos los requerimientos. Organiza el trabajo en etapas y dime qué componentes necesitamos.

También le pedí diez ideas de funcionalidades adicionales con una breve explicación de cada una. De esas propuestas elegí las que me parecieron útiles sin alejarme de lo que se iba a evaluar; la principal fue la gestión de comentarios.

Con esa guía preparé el entorno: inicialicé el repositorio con Git, creé el proyecto con npm, instalé Express, `pg` y `dotenv` y agregué el `.gitignore`.

### 3. Construir la API

Esta fue la etapa en la que más usé Claude. Fuimos avanzando por partes, y en cada una le pedía el código junto con una explicación de qué hacía cada archivo y cómo se conectaba con el resto.

> Con base en los requerimientos, ayúdame a armar la estructura inicial con Node.js y Express: servidor, rutas y conexión a la base de datos. Explícame cómo se relacionan los archivos.

> Necesito el CRUD de autores y publicaciones con PostgreSQL. Ten en cuenta las respuestas HTTP y el manejo de errores, y explícame la lógica de cada operación.

En este orden fuimos construyendo:

- El esquema SQL con las tablas, relaciones y restricciones, más los datos iniciales.
- La conexión a PostgreSQL con `Pool`.
- La estructura del servidor Express y las rutas.
- El CRUD de autores y publicaciones, con sus validaciones.
- El middleware de manejo de errores.
- Los comentarios, como funcionalidad adicional.

Cuando algo no encajaba entre archivos, le compartía la estructura que tenía y le pedía la versión corregida con una explicación de qué había cambiado y por qué. Más adelante, con la API ya funcionando, sumamos las pruebas automatizadas, la documentación con OpenAPI y Swagger, y el README.


### 4. Publicar y desplegar

Para publicar no tenía experiencia, así que le pedí que me guiara. Primero con GitHub: qué comandos usar, cómo revisar el estado del repositorio y qué comprobar antes de subir la rama.

> Explícame cómo preparar y publicar la rama en GitHub, qué comandos necesito y qué debo revisar antes.

Después pasé al despliegue en Railway, que fue la parte que más me costó entender: configurar el servicio, conectarlo con PostgreSQL, definir las variables de entorno e inicializar la base de datos en producción.

> Guíame para desplegar Blog API en Railway: configurar el servicio, conectar PostgreSQL, las variables de entorno y la inicialización de la base de datos. ¿Qué archivos y configuraciones tengo que revisar?

Las cuentas, las autorizaciones y la publicación las manejé yo. Cuando obtuve la URL pública, le pedí ayuda para probar los endpoints y detectar posibles errores de configuración o de conexión.


### 5. Mejoras

Mientras probaba la API encontré casos que no estaban bien resueltos. Por ejemplo, se podían enviar textos de cualquier longitud. Decidí agregar:

- Validaciones de longitud en los campos de texto, con un comportamiento correcto cuando los datos superan el límite.
- El endpoint `GET /comments/:id`, que faltaba para consultar un comentario individual.

> Ayúdame a agregar validaciones de longitud, a manejar los datos que superen los límites y a incorporar `GET /comments/:id`, manteniendo la estructura actual. Explícame cómo comprobar que funciona.

Claude generó los cambios y yo agregué las pruebas y la documentación correspondientes al nuevo endpoint.

### 6. Pruebas y revisión final

Al final usé Claude para hacer una revisión general con los criterios de evaluación como referencia: requerimientos, estructura del código, validaciones, manejo de errores y documentación. También le pedí que me explicara qué comprobaba cada prueba, porque quería entender qué partes del proyecto quedaban cubiertas y no solo ver que pasaran.

> Analiza los resultados de las pruebas, dime si hay errores o comportamientos inesperados y explícame qué comprueba cada una.

Ejecuté las pruebas unitarias y las de integración con PostgreSQL, verifiqué las restricciones de integridad y las relaciones entre entidades, y revisé la paginación y la eliminación. Luego probé manualmente los endpoints en producción.

```bash
npm test
npm run test:integration
```

| Tipo de prueba | Resultado |
|---|---|
| Pruebas unitarias | 54 aprobadas |
| Pruebas de integración | 7 aprobadas |
| Pruebas manuales en producción | 40 respuestas con el estado esperado |

---

## Lo que aprendí y lo que me queda pendiente

Con este proyecto trabajé por primera vez con un backend completo: un servidor Express, la comunicación por HTTP, la conexión entre JavaScript y PostgreSQL, las operaciones CRUD, las validaciones y el manejo de errores, Git, las pruebas automatizadas, la documentación de una API y el despliegue.

Trabajar con Claude me permitió avanzar en cosas que todavía no sabía hacer solo y entender el código a medida que se construía. Pero también sé que buena parte de ese código no lo escribí yo desde cero. Lo que me queda es seguir estudiándolo, entender por qué se resolvió de cada manera y ganar la autonomía para hacer un proyecto así por mi cuenta.

## Cierre

Usé Claude en todas las etapas de Blog API, desde aprender los conceptos hasta desplegar la aplicación. Su aporte más fuerte fue en la programación: generó y corrigió gran parte del código. Yo definí qué se construía, elegí las funcionalidades, revisé las propuestas, decidí los cambios y verifiqué los resultados, siempre tomando como referencia el enunciado y lo visto en el Módulo II.
