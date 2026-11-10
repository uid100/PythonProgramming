const DEBUG =
    new URLSearchParams(window.location.search).get("debug") === "true";

const COR_CONFIG = 
    new URLSearchParams(window.location.search).get("draft") === "true";

if (DEBUG) {
    console.log(`DEBUG mode: ${DEBUG}`);
}
if (COR_CONFIG) {
    console.log(`DRAFT mode: ${COR_CONFIG}`);
}

function getDraftTimestamp() {
    const d = new Date();

    // const months = [
    //     "JAN","FEB","MAR","APR","MAY","JUN",
    //     "JUL","AUG","SEP","OCT","NOV","DEC"
    // ];
    // return `DRAFT: ${String(d.getDate()).padStart(2, "0")}-${months[d.getMonth()]}-${d.getFullYear()}-${String(d.getHours()).padStart(2, "0")}${String(d.getMinutes()).padStart(2, "0")}`;

    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");

    return `${yyyy}${mm}${dd}${hh}${min}`;
}

async function loadManifest() {
    const response = await fetch(
        "manifest.json"
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
        await fetch("00-hours/hours.json");

    if (!response.ok) {
        throw new Error(
            "Unable to load hours.json"
        );
    }

    return response.json();
}

async function loadSection(path) {
    const response = await fetch(
        `${path}/data.json`
    );

    if (!response.ok) {
        throw new Error(
            `Unable to load ${path}`
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

            li.innerHTML = item;

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

    // handle 'text' format
    if (data.text && typeof data.text === "string") {
        const p = document.createElement("p");
        p.innerHTML = data.text;
        section.appendChild(p);
    }

    // handle multi-line blocks with 'paragraphs' format
    if (data.paragraphs && Array.isArray(data.paragraphs)) {
        const p = document.createElement("p");
        p.className = "multiline-text";
        p.innerHTML = data.paragraphs.join("<br>");
        section.appendChild(p);
    }

    // handle ordered list format with 'items' array
    if (data.items?.length) {
        section.appendChild(
            buildList(data.items)
        );
    }

    if (data.subsections?.length) {
        data.subsections.forEach(sub => {

            const subheading =
                document.createElement("h4");

            subheading.className =
                "section-subtitle";

            subheading.textContent =
                sub.title;

            section.appendChild(
                subheading
            );

            if (sub.text) {
                const p =
                    document.createElement("p");
                p.innerHTML = sub.text;
                section.appendChild(p);
            }

            if (sub.items?.length) {
                section.appendChild(
                    buildList(sub.items)
                );
            }
        });
    }

    return section;
}

async function initialize() {

    document.title = COR_CONFIG.draft
        ? `COR: ${getDraftTimestamp()}`
        : "COR";


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

        // if (COR_CONFIG.draft) {
        //     const footer = document.createElement("footer");
        //     footer.className = "draft-footer";
        //     footer.textContent = getDraftTimestamp();
        //     document.body.appendChild(footer);
        // }

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