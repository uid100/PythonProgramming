async function loadManifest() {
    const response = await fetch(
        "sections/manifest.json"
    );

    if (!response.ok) {
        throw new Error(
            "Unable to load manifest."
        );
    }

    return response.json();
}

async function loadSection(sectionName) {
    const response = await fetch(
        `sections/${sectionName}.json`
    );

    if (!response.ok) {
        throw new Error(
            `Unable to load ${sectionName}`
        );
    }

    return response.json();
}

function buildList(items) {

    const ul = document.createElement("ul");

    items.forEach(item => {

        const li =
            document.createElement("li");

        if (typeof item === "string") {

            li.textContent = item;

        } else {

            li.textContent = item.title;

            if (item.children?.length) {
                li.appendChild(
                    buildList(item.children)
                );
            }
        }

        ul.appendChild(li);
    });

    return ul;
}

function renderSection(data) {

    const section =
        document.createElement("section");

    section.className = "section";

    const heading =
        document.createElement("h4");

    heading.className = "section-title";
    heading.textContent = data.title;

    section.appendChild(heading);

    if (data.text) {

        const p =
            document.createElement("p");

        p.textContent = data.text;

        section.appendChild(p);
    }

    if (data.items?.length) {
        section.appendChild(
            buildList(data.items)
        );
    }

    return section;
}

async function initialize() {

    const container =
        document.getElementById(
            "course-content"
        );

    try {

        const manifest =
            await loadManifest();

        for (const sectionName of manifest.sections) {

            const data =
                await loadSection(sectionName);

            container.appendChild(
                renderSection(data)
            );
        }

    } catch (error) {

        console.error(error);

        container.innerHTML =
            "<p>Error loading course outline.</p>";
    }
}

document.addEventListener(
    "DOMContentLoaded",
    initialize
);