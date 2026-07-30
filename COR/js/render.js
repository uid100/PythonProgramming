const DEBUG =
    new URLSearchParams(window.location.search).get("debug") === "true";

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

async function loadCourse() {

   const response =
        await fetch("course.json");

    if (DEBUG) {
        console.log(
            "Loading course title and ID"
        );
    }

    if (!response.ok) {
        throw new Error(
            "Unable to load course.json"
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

function renderCourseHeader(data) {

    const container =
        document.getElementById(
            "course-header"
        );

    container.innerHTML = `
        <header class="document-header">
            <h1 class="college-name">
                ${data.college}
            </h1>

            <h2 class="document-title">
                ${data.document_title}
            </h2>

            <h3 class="course-title">
                ${data.course_id} &mdash; ${data.course_title}
            </h3>
        </header>
    `;
}

function buildList(items, numType = "1") {

    const ol = document.createElement("ol");
    ol.setAttribute("type", numType);

    items.forEach(item => {

        const li =
            document.createElement("li");

        if (typeof item === "string") {

            li.textContent = item;

        } else {

            li.textContent = item.title;

            if (item.children?.length) {
                li.appendChild(
                    buildList(item.children, "a")
                );
            }
        }

        ol.appendChild(li);
    });

    return ol;
}

function renderHours(data) {

    const container =
        document.getElementById("hours-total");

    // total hours
    container.innerHTML = `
        <p class="hours-line">
            <em>
                Lecture Contact Hours: ${data.total.lecture.contactHours};
                Homework Hours: ${data.total.lecture.homeworkHours};
                Total Student Learning Hours: ${data.total.lecture.totalHours}
            </em>
            <br>
            <em>
                Laboratory Contact Hours: ${data.total.laboratory.contactHours};
                Homework Hours: ${data.total.laboratory.homeworkHours};
                Total Student Learning Hours: ${data.total.laboratory.totalHours}
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

    const section = document.createElement("section");

    section.className = "section";

    const heading = document.createElement("h4");

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
        const courseData =
            await loadCourse();
        renderCourseHeader(courseData);

        const hoursData =
            await loadHours();
        renderHours(hoursData);

        const manifest =
            await loadManifest();

        for (const sectionName of manifest.sections) {

            if (DEBUG) {
                console.log(`Loading section: ${sectionName}`);
            }
            
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