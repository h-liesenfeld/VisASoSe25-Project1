import io from "socket.io-client"
import "./app.css"
import { configs } from "../_server/static/configs.js"
import { draw_box_plot_2_1 } from "./box_plot_2_1.js"
import { draw_scatterplot_2_2 } from "./scatterplot_2_2.js"
import { draw_barchart_2_1 } from "./barchart_2_1.js"
import { draw_scatterplot_kmeans } from "./scatterplot_kmeans.js";
import { draw_graph_analysis } from "./graph_analysis.js"


let hostname = window.location.hostname;
let protocol = window.location.protocol;
const socketUrl = protocol + "//" + hostname + ":" + configs.port;

let dataSelection = 0;
let currentData = [];
let box_plot_2_1_data = undefined;
let scatterplot_2_2_data = undefined;
let barchart_2_1_data = undefined;
let graph_analysis_data = undefined;

export const socket = io(socketUrl)
socket.on("connect", () => {
    console.log("Connected to " + socketUrl + ".");
})
socket.on("disconnect", () => {
    console.log("Disconnected from " + socketUrl + ".");
})


document.getElementById('data_filter_select').addEventListener('change', (event) => {
    const selectedValue = event.target.value;
    console.log('Selected value:', selectedValue);
    switch (selectedValue) {
        case 'empty':
            dataSelection = 0;
            break;
        case 'top-100':
            dataSelection = 100;
            break;
        case 'top-200':
            dataSelection = 200;
            break;
        case 'top-500':
            dataSelection = 500;
            break;
        case 'top-1000':
            dataSelection = 1000;
            break;
        case 'all':
            dataSelection = -1;
            break;
        default:
            dataSelection = 100;
            break;
    }
    socket.emit('getData', dataSelection);
});

document.getElementById('load_box_plot_2_1_data_button').onclick = () => {
    if (currentData.length == 0) {
        showSnackbar();
    } else {
        socket.emit('get_box_plot_2_1_data', currentData);
        // socket.emit('get_graph_analysis_data', currentData);
        // socket.emit('get_barchart_2_1_data', currentData);
    }
}

document.getElementById('load_scatterplot_2_2_data_button').onclick = () => {
    if (currentData.length == 0) {
        showSnackbar();
    } else {
        socket.emit('get_scatterplot_2_2_data', currentData);
    }
}

document.getElementById('load_graph_analysis_data_button').onclick = () => {
    if (currentData.length == 0) {
        showSnackbar();
    } else {
        socket.emit('get_graph_analysis_data', currentData);
    }
}

let handleNewData = (payload) => {
    console.log('Fresh data from Webserver');
    currentData = payload.data;
    redrawPlots();
}
socket.on('freshData', handleNewData);

let handle_box_plot_2_1_data = (payload) => {
    box_plot_2_1_data = payload.data;
    draw_box_plot_2_1(box_plot_2_1_data);
}
socket.on('box_plot_2_1_data', handle_box_plot_2_1_data);

let handle_scatterplot_2_2_data = (payload) => {
    scatterplot_2_2_data = payload.data;
    window.scatterplot_2_2_fullData = payload.data;
    draw_scatterplot_2_2(scatterplot_2_2_data); 
    setupLDADropdownOptions(scatterplot_2_2_data);
}
socket.on('scatterplot_2_2_data', handle_scatterplot_2_2_data);

let handle_barchart_2_1_data = (payload) => {
    barchart_2_1_data = payload.data
    draw_barchart_2_1(barchart_2_1_data)
}
socket.on('barchart_2_1_data', handle_barchart_2_1_data);

function redrawPlots() {
    //redraw all charts
}

let handle_graph_analysis_data = (payload) => {
    graph_analysis_data = payload.data;
    draw_graph_analysis(graph_analysis_data);
}
socket.on('graph_analysis_data', handle_graph_analysis_data);

function setupLDADropdownOptions(data) {
    const select = document.getElementById("lda_filter_select");
    const uniqueGroups = [...new Set(data.map(d => d.category))].sort();


    select.setAttribute("multiple", "multiple");
    select.setAttribute("size", Math.min(uniqueGroups.length, 12));


    select.innerHTML = "";

    const allOpt = document.createElement("option");
        allOpt.value = "all";
        allOpt.textContent = "All";
        select.appendChild(allOpt);

    uniqueGroups.forEach(group => {
        const opt = document.createElement("option");
        opt.value = group;
        opt.textContent = group;
        select.appendChild(opt);
    });

    for (const option of select.options) {
        option.selected = true;
    }

    select.addEventListener("change", () => {
    const selectedOptions = Array.from(select.selectedOptions).map(opt => opt.value);

    //Selects all 
    if (selectedOptions.includes("all")) {
        for (const option of select.options) {
            option.selected = true;
        }
        draw_scatterplot_2_2(data);
        return;
    }

    const filtered = data.filter(d => selectedOptions.includes(d.category));
    draw_scatterplot_2_2(filtered);
    });
}

function showSnackbar() {
    document.getElementById('snackbar').classList.add('show');
    setTimeout(() => {
        snackbar.classList.remove('show');
    }, 2000);
}

document.getElementById("run_kmeans_button").addEventListener("click", () => {
    const k = parseInt(document.getElementById("k_input").value);
    const maxTimeWeight = parseFloat(document.getElementById("max_time_weight").value);
    const complexityWeight = parseFloat(document.getElementById("complexity_weight").value);

    socket.emit('get_kmeans_clusters', {
        currentData,
        k,
        weights: {
            max_time: maxTimeWeight,
            complexity: complexityWeight
        }
    });
});

socket.on("kmeans_clusters_result", (result) => {
    draw_scatterplot_kmeans(result.clusteredGames, result.centroids);
});
