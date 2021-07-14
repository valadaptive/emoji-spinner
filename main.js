import htm from 'https://unpkg.com/htm?module';

const svg = htm.bind((type, props, ...children) => {
    const elem = document.createElementNS("http://www.w3.org/2000/svg", type);
    if (props) for (const [prop, val] of Object.entries(props)) {
        elem.setAttribute(prop, val);
    }
    elem.append(...children.flat().filter(a=>a));
    return elem;
});

const updateSpinner = () => {
    const radius = 50;
    const inset = 8;
    const arrowHeight = 25;

    const {value} = emojiTextbox;
    const shim = document.createElement('span');
    shim.append(value);
    twemoji.parse(shim, {
        folder: 'svg',
        ext: '.svg'
    });
    const emojiElems = shim.querySelectorAll('img');
    const numEmojis = emojiElems.length;
    const halfSectorAngle = Math.PI / numEmojis;
    const inscribedRadius = (radius - inset) * (Math.sin(halfSectorAngle) / (1 + Math.sin(halfSectorAngle)));
    const imageSize = inscribedRadius * 1.5;
    const interp = ((radius - inset) - inscribedRadius) / (radius - inset);
    const emojis = Array.from(emojiElems)
        .map((img, i) => {
            const angle = ((i + 0.5) / numEmojis) * Math.PI * 2;
            return svg`<image
                href=${img.src}
                width=${imageSize}
                height=${imageSize}
                x=${(Math.sin(angle) + 1) * ((radius - inset) * interp) - (imageSize / 2) + (((radius * (1 - interp)) + (inset * interp)))}
                y=${(Math.cos(angle) + 1) * ((radius - inset) * interp) - (imageSize / 2) + (((radius * (1 - interp)) + (inset * interp)))}
            />`;
        });
    const spinnerSvg = svg`
        <svg id="spinner" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <defs>
            <!-- arrowhead marker definition -->
            <marker id="arrowhead" viewBox="0 0 10 10" refX="5" refY="5"
                markerWidth="4" markerHeight="4"
                orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" />
            </marker>
        </defs>

            <circle cx=${radius} cy=${radius} r=${radius-inset} fill="white" stroke="black" />
            ${
                emojis.map((_, i) => {
                    const angle = (i / numEmojis) * Math.PI * 2;
                    return svg`<line x1=${(Math.sin(angle) + 1) * (radius-inset) + inset} x2=${radius} y1=${(Math.cos(angle) + 1) * (radius-inset) + inset} y2=${radius} stroke-width="1" stroke="black" stroke-linecap="round" />`;
                })
            }
            ${emojis}
            <line id="arrow" x1=${radius} x2=${radius} y1=${(arrowHeight / 2) + radius} y2=${(arrowHeight / -2) + radius} stroke="black" stroke-width="2" marker-end="url(#arrowhead)" />
        </svg>
    `;
    const wrapper = document.querySelector('#spinner-wrapper');
    if (wrapper.firstChild) wrapper.removeChild(wrapper.firstChild);
    wrapper.append(spinnerSvg);
};


const emojiTextbox = document.getElementById('emojis');
emojiTextbox.addEventListener('change', updateSpinner);
updateSpinner();

const spinButton = document.getElementById('spin');
spinButton.addEventListener('click', () => {
    const arrow = document.getElementById('arrow');

    let velocity = (Math.random() * 25) + 25;
    let rotation = Math.random(0, 360);
    let time = performance.now();
    const animStep = () => {
        const now = performance.now();
        const frametime = now - time;
        time = now;
        rotation += velocity * (frametime / 16);
        velocity *= 0.95 ** (frametime / 16);
        arrow.style.transform = `rotate(${rotation}deg)`;
        if (velocity > 0.25) requestAnimationFrame(animStep);
    }
    requestAnimationFrame(animStep);
})