# 🖥️ Portafolio Web Interactivo (GitHub Pages)

Este subdirectorio contiene el código fuente para tu **portafolio web personal**, diseñado para ser alojado de forma estática en **GitHub Pages**. 

El portafolio se alimenta dinámicamente de los mismos archivos de datos YAML en la carpeta raíz `datos/` de este repositorio. Esto significa que cuando actualices tu perfil en los YAMLs para generar CVs en PDF, también podrás actualizar tu portafolio web con un solo comando.

---

## 📂 Estructura del Portafolio

* **`index.html`**: Estructura semántica HTML5 con tags SEO optimizados para posicionamiento.
* **`css/style.css`**: Sistema de diseño responsive con temática oscura cyber-industrial (inspirado en electrónica y hardware: placas de circuito impreso, terminales y microchips). Incluye micro-interacciones, efectos de cristal difuminado (glassmorphism) y ventanas modales adaptables.
* **`js/main.js`**: Lógica de interacción cliente, filtros de proyectos dinámicos y un **sistema interactivo de fondo en Canvas** que renderiza un circuito de nodos electrónicos interactivo con el puntero del mouse.
* **`js/data.js`**: Archivo de base de datos compilado a partir de los YAML de `datos/`. **(No editar directamente)**.
* **`build_data.py`**: Script en Python para sincronizar y compilar automáticamente los archivos YAML en `js/data.js`.

---

## ⚙️ Flujo de Trabajo

### 1. Sincronizar Datos (YAML -> JS)
Cada vez que realices cambios en los archivos YAML de la carpeta `datos/` de la raíz del proyecto, debes regenerar la base de datos de tu portafolio ejecutando:

```bash
python3 build_data.py
```

Este script leerá todos tus YAMLs y actualizará el archivo `js/data.js` de forma instantánea.

### 2. Probar Localmente
Para evitar problemas de CORS del navegador al abrir el archivo HTML directamente (doble clic), inicia un servidor web local liviano.

Desde la carpeta `portfolio/`, ejecuta:
```bash
python3 -m http.server 8000
```
Luego abre tu navegador y visita: `http://localhost:8000`

---

## 🚀 Despliegue en GitHub Pages

Dado que el portafolio está contenido en una subcarpeta (`portfolio/`), tienes dos métodos principales para publicarlo en GitHub Pages:

### Método A: Desplegar la subcarpeta en la rama `gh-pages` (Recomendado)
Puedes usar herramientas como `git subtree` para enviar solo el contenido de esta carpeta a una rama dedicada al hosting.

1. Asegúrate de estar en la rama principal (`main`) y tener todo comprometido en git.
2. Ejecuta el siguiente comando para subir solo la carpeta `portfolio` a la rama `gh-pages` de tu repositorio remoto:
   ```bash
   git subtree push --prefix portfolio origin gh-pages
   ```
3. En la configuración de tu repositorio en GitHub (**Settings -> Pages**):
   * En **Build and deployment -> Branch**, selecciona la rama `gh-pages` y la carpeta `/ (root)`.
   * Presiona **Save**. ¡Listo! Tu página estará en `https://<tu_usuario>.github.io/<nombre_repositorio>/`.

### Método B: Utilizar una GitHub Action personalizada
Si quieres que cada `git push` a `main` actualice tu portafolio de manera 100% automática, puedes crear un archivo `.github/workflows/deploy.yml` con el siguiente flujo de despliegue de subcarpeta.

```yaml
name: Deploy Portfolio to GitHub Pages

on:
  push:
    branches:
      - main
    paths:
      - 'portfolio/**'

permissions:
  contents: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Deploy to GitHub Pages
        uses: JamesIves/github-pages-deploy-action@v4
        with:
          folder: portfolio # Especifica la subcarpeta a desplegar
          branch: gh-pages
```

---

## 🎨 Personalización Estética

El tema visual está configurado a través de variables CSS en `css/style.css` bajo la pseudoclase `:root`. Puedes modificar los colores neón para cambiar el aspecto general del sitio:

* **Cyan de fondo y enlaces** (Modo digital): `hsl(186, 100%, 50%)`
* **Verde de hardware y éxitos**: `hsl(150, 100%, 45%)`
* **Fondo general oscuro**: `hsl(222, 47%, 7%)`
