import io from "socket.io-client"
import "./app.css"
import { configs } from "../_server/static/configs.js"
import { draw_barchart } from "./barchart.js"
import { draw_scatterplot } from "./scatterplot.js"
import { draw_box_plot_2_1 } from "./box_plot_2_1.js"
import { draw_scatterplot_2_2 } from "./scatterplot_2_2.js"
import { draw_barchart_2_1 } from "./barchart_2_1.js"
import * as d3 from "d3"

let hostname = window.location.hostname;
let protocol = window.location.protocol;
const socketUrl = protocol + "//" + hostname + ":" + configs.port;
let dataSelection = 100;

export const socket = io(socketUrl)
socket.on("connect", () => {
    console.log("Connected to " + socketUrl + ".");
})
socket.on("disconnect", () => {
    console.log("Disconnected from " + socketUrl + ".");
})

/**
 * Callback, when the button is pressed to request the data from the server.
 * @param {*} parameters
 */
// let requestData = (parameters) => {
//     console.log(`requesting data from webserver (every 2sec)`)

//     socket.emit("getData", {
//         parameters,
//     })
// }

/**
 * Assigning the callback to request the data on click.
 */
// document.getElementById("load_data_button").onclick = () => {
//   let max_weight = document.getElementById("max_weight").value
//   if (!isNaN(max_weight)) {
//     max_weight = parseFloat(max_weight)
//   } else {
//     max_weight = Infinity
//   }
//   requestData({ max_weight })
// }

const dataSelectElem = document.getElementById('data_filter_select');
dataSelectElem.addEventListener('change', (event) => {
    const selectedValue = event.target.value;
    console.log('Selected value:', selectedValue);
    switch(selectedValue) {
        case 'all':
            dataSelection = -1;
            break;
        case 'top-1000':
            dataSelection = 1000;
            break;
        case 'top-200':
            dataSelection = 200;
            break;
        case 'top-100':
            dataSelection = 100;
            break;
        default:
            dataSelection = 100;
            break;
    }
    socket.emit("getData");
  });

document.getElementById("load_box_plot_2_1_data_button").onclick = () => {
  socket.emit("get_box_plot_2_1_data", {
            dataSelection: dataSelection
        })
  socket.emit("get_barchart_2_1_data", {
            dataSelection: dataSelection
        })
}

let box_plot_2_1_data = undefined;

let handle_box_plot_2_1_data = (payload) => {
    box_plot_2_1_data = payload.data;
    draw_box_plot_2_1(box_plot_2_1_data);
}

socket.on("box_plot_2_1_data", handle_box_plot_2_1_data);


document.getElementById("load_scatterplot_2_2_data_button").onclick = () => socket.emit("get_scatterplot_2_2_data", {
            dataSelection: dataSelection
        });

let scatterplot_2_2_data = undefined;



let handle_scatterplot_2_2_data = (payload) => {
    scatterplot_2_2_data = payload.data;
    draw_scatterplot_2_2(scatterplot_2_2_data);
    setupLDADropdownOptions(scatterplot_2_2_data);
}
function setupLDADropdownOptions(data) {
    const select = document.getElementById("lda_filter_select");
    const uniqueGroups = [...new Set(data.map(d => d.category))];

    select.innerHTML = `<option value="all">All</option>`;
    uniqueGroups.forEach(group => {
    const opt = document.createElement("option");
    opt.value = group;
    opt.textContent = group;
    select.appendChild(opt);
});

  // Filters category data
select.addEventListener("change", () => {
    const selected = select.value;
    const filtered = selected === "all" ? data : data.filter(d => d.category === selected);
    draw_scatterplot_2_2(filtered);
});
}


socket.on("scatterplot_2_2_data", handle_scatterplot_2_2_data);

/**
 * On-Click behaviour for Task 2.1 Bar Chart
 */
// document.getElementById("load_barchart_2_1_data_button").onclick = () => {
//   socket.emit("get_barchart_2_1_data")
// }

let barchart_2_1_data = undefined

let handle_barchart_2_1_data = (payload) => {
  barchart_2_1_data = payload.data
  draw_barchart_2_1(barchart_2_1_data)
}

socket.on("barchart_2_1_data", handle_barchart_2_1_data)

/**
 * Object, that will store the loaded data.
 */
let data = {
    barchart: undefined,
    scatterplot: undefined,
}

/**
 * Callback that is called, when the requested data was sent from the server and is received in the frontend (here).
 * @param {*} payload
 */
let handleData = (payload) => {
    console.log(`Fresh data from Webserver:`);
    console.log(payload);

    //TODO: Filter First-k rows
    //redraw all of the plots
}

socket.on("freshData", handleData);

let width = 0;
let height = 0;

/**
 * This is an example for visualizations, that are not automatically scaled with the viewBox attribute.
 *
 * IMPORTANT:
 * The called function to draw the data must not do any data preprocessing!
 * To much computational load will result in stuttering and reduced responsiveness!
 */
let checkSize = setInterval(() => {
    let container = d3.select(".visualizations");
    let newWidth = parseInt(container.style("width"));
    let newHeight = parseInt(container.style("height"));
    if (newWidth !== width || newHeight !== height) {
        width = newWidth;
        height = newHeight;
        if (data.scatterplot) draw_scatterplot(data.scatterplot);
    }
}, 100)
