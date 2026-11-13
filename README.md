# Resume

`resume.json` is the source for both the portfolio site and the single-column application resume.

```sh
npm ci --ignore-scripts
npm run build -- --theme helloquan
```

The theme ships compiled assets; `--ignore-scripts` avoids rebuilding its legacy development dependencies. The build produces `public/index.html` and `public/application.html`.

To export the application PDF using an installed Chrome or Chromium:

```sh
PUPPETEER_EXECUTABLE_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' npm run build:pdf
```

Without that environment variable, the exporter uses Puppeteer's bundled Chromium if installed. The output is `resume.pdf`. The application layout uses ordinary text in one column, standard section headings, and job titles and dates before their descriptions. It omits decorative images and icons, while retaining the visible career content and links from the JSON. Employment is sorted by most recent end date; roles without an end date remain current.

Pushing to `main` publishes the site and rebuilds the PDF in the `daily` GitHub release from `application.html`. Check extracted PDF text as well as the rendered pages after changing the layout. Text extraction is a useful compatibility check, not a guarantee for every applicant tracking system.
