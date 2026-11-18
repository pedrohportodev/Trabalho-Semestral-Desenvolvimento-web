import { FACULDADES } from "./FACULDADES.js";

const container = document.getElementById("map-container");

function esperarApi() {
    return new Promise((resolve, reject) => {
        if (window.mapApiLoaded) return resolve();
        if (window.mapApiFailed) return reject(new Error("Falha ao carregar a API"));

        window.addEventListener("map-api-loaded", resolve, { once: true });
        window.addEventListener(
            "map-api-error",
            () => reject(new Error("Falha ao carregar a API")),
            { once: true }
        );
    });
}

function linkGoogle(faculdade) {
    const consulta = `${faculdade.nome}, ${faculdade.endereco}`;
    return (
        faculdade.linkGoogle ??
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(consulta)}`
    );
}

function criarPopup(faculdade) {
    const div = document.createElement("div");
    div.className = "info-popup";

    const link = document.createElement("a");
    link.href = linkGoogle(faculdade);
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", `Ver ${faculdade.nome} no Google (abre em nova aba)`);

    const img = document.createElement("img");
    img.src = faculdade.foto.src;
    img.alt = faculdade.foto.alt;
    link.append(img);

    const titulo = document.createElement("h2");
    titulo.textContent = faculdade.nome;

    const endereco = document.createElement("p");
    endereco.textContent = faculdade.endereco;

    div.append(link, titulo, endereco);
    return div;
}

function iniciarMapa() {
    container.replaceChildren();

    const mapa = document.createElement("div");
    mapa.id = "map";
    container.append(mapa);

    const map = new google.maps.Map(mapa, {
        center: { lat: -23.96, lng: -46.36 },
        zoom: 11,
    });

    const infoWindow = new google.maps.InfoWindow();
    const limites = new google.maps.LatLngBounds();

    FACULDADES.filter((f) => f.localizacao.lat !== 0).forEach((faculdade) => {
        const marker = new google.maps.Marker({
            map,
            position: faculdade.localizacao,
            title: faculdade.nome,
        });

        marker.addListener("click", () => {
            infoWindow.setContent(criarPopup(faculdade));
            infoWindow.open({ map, anchor: marker });
        });

        limites.extend(faculdade.localizacao);
    });

    map.fitBounds(limites);
}

function mostrarErro() {
    const erro = document.createElement("p");
    erro.className = "map-error";
    erro.textContent = "Não foi possível carregar o mapa. Tente novamente mais tarde.";
    container.replaceChildren(erro);
}

esperarApi().then(iniciarMapa).catch(mostrarErro);