# ɪreːn 🌊: Interdisciplinary Research on Ethical & Equitable NLP for under-resourced Languages

Website for the ɪreːn research collaboration.

A static GitHub Pages site for a research collaboration. It is adapted from
[senli1073/academic-homepage-template](https://github.com/senli1073/academic-homepage-template)
(MIT licence, see `LICENSE`).

No build step: the page reads `contents/config.yml` and one Markdown file per section when it loads.

## Publish on GitHub Pages

1. Create a repository, e.g. `your-org/project-name`, and push these files to the `main` branch.
2. In the repository, open **Settings → Pages**, set **Source** to *Deploy from a branch*, choose `main` and `/ (root)`.
3. The site appears at `https://your-org.github.io/project-name/` after a minute or two.

For a custom domain, add a `CNAME` file and set it under Settings → Pages.

## Edit content

| File | Section |
|---|---|
| `contents/config.yml` | Site title, banner text and tagline, logo, footer links, section order |
| `contents/home.md` | About the project, contact |
| `contents/objectives.md` | Aim and objectives |
| `contents/collaborators.md` | Partner institutions and people (copy a `person` block per collaborator) |
| `contents/publications.md` | Publications, grouped by year |
| `contents/tools.md` | Tools people can use directly (platforms, released models, datasets) |
| `contents/news.md` | News and events |
| `contents/gallery.md` | Get-together photos (images in `static/assets/img/gallery/`) |
| `contents/contact.md` | Contact text; the form below it is set by `contact-form-email` in `config.yml` |
| `contents/funding.md` | Funding and acknowledgements |

To hide a section, delete its entry under `sections:` in `config.yml`. To add one, add an entry
with a new `id` and create `contents/<id>.md`.

**Images.** Replace `static/assets/img/logo.svg` with the project logo (or set `logo: ''` to hide it),
and swap the banner photo in `static/assets/background/`
(update `backgrounds` and `background-credit` in `config.yml` to match). Collaborator photos go in
`static/assets/img/people/`; use `<img src="static/assets/img/people/name.jpg" alt="Name">`
in place of the `initials` span.

LaTeX math works in any section with `$...$` or `$$...$$`.

## Contact form

The form sends messages through [FormSubmit](https://formsubmit.co), so no server is needed.

1. After the site is live, send a test message through the form.
2. FormSubmit emails an activation link to the `contact-form-email` address. Click it once; later messages arrive normally.
3. Optional: the activation email also gives a random alias. Put that alias in `contact-form-email` so the address is not visible in the page source.

To remove the form, delete `contact-form-email` from `config.yml`.

## Preview locally

The page fetches its Markdown files, so it needs a local server rather than opening the file directly:

```
python3 -m http.server
```

Then visit http://localhost:8000.

## Credits

Banner photo: Hoomexsun Pangsatabam, Bondi Beach, Australia.
Group name font: [Inter](https://github.com/rsms/inter) (SIL Open Font License 1.1), reduced to the letters of ɪreːn in `static/assets/fonts/`. The site's other fonts lack the IPA letters ɪ and ː; `static/js/scripts.js` wraps each mention of the name so it uses this font.
