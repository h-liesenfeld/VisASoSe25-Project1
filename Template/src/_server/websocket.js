import { parse } from "csv-parse";
import * as fs from "fs"
import { print_clientConnected, print_clientDisconnected } from "./static/utils.js"
// const preprocessing = require("./preprocessing.js")
import { calc_box_plot_data, calc_scatterplot_data, calc_barchart_data, calc_graph_analysis_data } from "./preprocessing.js"
import { calc_scatterplot_data_kmeans } from "./preprocessing.js";
import { kMeans } from "./kmeans.js";

const file_path = "data/";
const file_name = "bgg_Gameitems_clean.csv";

/**
 * Does some console.logs when a client connected.
 * Also sets up the listener, if the client disconnects.
 * @param {*} socket 
 */
export function setupConnection(socket) {
    print_clientConnected(socket.id);

    /**
     * Listener that is called, if client disconnects.
     */
    socket.on("disconnect", () => print_clientDisconnected(socket.id));

    /**
     * # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
     * 
     * !!!!! Here an below, you can/should edit the code  !!!!!
     * - you can modify the getData listener
     * - you can add other listeners for other functionalities
     * 
     * # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
     */


    /**
     * Listener that is called, if a message was sent with the topic "getData"
     * 
     * In this case, the following is done:
     * - Read in the data (.csv in this case) a a stream
     *      (Stream -> data is read in line by line)
     * - Do data preprocessing while reading in:
     *      - Convert values, that can be represented as numbers to numbers
     *      - Calculate the BMI for every data row (person)
     *      - Filtering: if the row has a value, that contradicts the filtering parameters, data row will be excluded
     *          (in this case: weight should not be larger than the max_weight filter-parameter)
     */
    socket.on('getData', (dataSelection) => {
        let dataArray = [];
        fs.createReadStream(file_path + file_name)
            .pipe(parse({ delimiter: ',', columns: true }))
            .on('data', row => {
                if (dataSelection == -1 || dataArray.length < dataSelection) {
                    dataArray.push(row);
                }
            })
            .on("end", () => { //when all data is ready and processed, send it to the frontend of the socket
                socket.emit("freshData", {
                    timestamp: new Date().getTime(),
                    data: dataArray,
                })
            });
        console.log(`freshData emitted`);
    });

    socket.on('get_box_plot_2_1_data', (currentData) => {
        console.log('Request Box Plot Data for Task 2.1');
        const data_array = calc_box_plot_data(currentData);
        socket.emit('box_plot_2_1_data', {
            timestamp: new Date().getTime(),
            data: data_array
        });
    });

    socket.on('get_scatterplot_2_2_data', (currentData) => {
        console.log('Request Scatterplot Data for Task 2.2');
        const data_array = calc_scatterplot_data(currentData);
        socket.emit('scatterplot_2_2_data', {
            timestamp: new Date().getTime(),
            data: data_array
        });
    });

    socket.on('get_barchart_2_1_data', (currentData) => {
        console.log('Request Bar Chart Data for Task 2.1')
        const data_array = calc_barchart_data(currentData)
        socket.emit('barchart_2_1_data', {
            timestamp: new Date().getTime(),
            data: data_array
        })
    })

    socket.on('get_graph_analysis_data', (currentData) => {
            console.log('Request Graph Analysis Data for Task 3');
            const data_array = calc_graph_analysis_data(currentData);
            socket.emit('graph_analysis_data', {
                timestamp: new Date().getTime(),
                data: data_array
            });
    });

    socket.on('get_kmeans_clusters', ({ currentData, k, weights }) => {
        const { data, minTime, maxTime, minComplexity, maxComplexity } = calc_scatterplot_data_kmeans(currentData, weights);
        const featureVectors = data.map(d => d.features);

        const contributionPerVariable = [
            weights.max_time ?? 1,
            weights.complexity ?? 1
        ];

        const clustered = kMeans(featureVectors, k, contributionPerVariable);

        // Centroids berechnen
        function computeCentroids(clustered, k) {
            const centroids = [];
            for (let i = 0; i < k; i++) {
                const points = clustered.filter(d => d.centroidIndex === i).map(d => d.dataPoint);
                if (points.length === 0) {
                    centroids.push([0, 0]);
                } else {
                    const mean = [
                        points.reduce((sum, p) => sum + p[0], 0) / points.length,
                        points.reduce((sum, p) => sum + p[1], 0) / points.length
                    ];
                    centroids.push(mean);
                }
            }
            return centroids;
        }
        const centroids = computeCentroids(clustered, k);

        const clusteredGames = data.map((d, i) => ({
            ...d,
            cluster: clustered[i].centroidIndex
        }));

        socket.emit("kmeans_clusters_result", {
            clusteredGames,
            centroids,
            minTime,
            maxTime,
            minComplexity,
            maxComplexity
        });
    });
}