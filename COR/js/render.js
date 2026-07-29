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

async function loadHours() {

    const response =
        await fetch("sections/hours.json");

    if (!response.ok) {
        throw new Error(
            "Unable to load hours.json"
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

function renderHours(data) {

    const container =
        document.getElementById("hours-total");

    // total hours
    container.innerHTML = `
        <p class="hours-line">
            <em>
                Lecture Contact Hours: ${data.lecture.contactHours};
                Homework Hours: ${data.lecture.homeworkHours};
                Total Student Learning Hours: ${data.lecture.totalHours}
            </em>
        </p>

        <p class="hours-line">
            <em>
                Laboratory Contact Hours: ${data.laboratory.contactHours};
                Homework Hours: ${data.laboratory.homeworkHours};
                Total Student Learning Hours: ${data.laboratory.totalHours}
            </em>
        </p>
    `;

    // weekly hours
    const weeklyContainer =
        document.getElementById("hours-weekly");

    weeklyContainer.innerHTML = `
        <p>
            ${data.weekly.lecture},
            ${data.weekly.laboratory},
            ${data.weekly.units}
        </p>
    `; 
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
        document.getElementById("course-content");

    try {

        const hoursData =
            await loadHours();
        renderHours(hoursData);

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