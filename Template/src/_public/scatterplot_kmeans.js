import * as d3 from "d3";
const tooltip = d3.select("#tooltip");

export function draw_scatterplot_kmeans(clusteredGames, centroids) {
    const margin = { top: 50, bottom: 50, left: 50, right: 50 };

    let svg = d3.select("#scatterplot_kmeans_svg");
    let g_scatterplot = d3.select("#g_scatterplot_kmeans");
    let g_x_axis = d3.select("#g_x_axis_scatterplot_kmeans");
    let g_y_axis = d3.select("#g_y_axis_scatterplot_kmeans");

    let bbox = svg.node().getBoundingClientRect();
    let width = bbox.width;
    let height = bbox.height;

    // Skalen (normiert [0,1])
    const xScale = d3.scaleLinear()
        .domain([0, 1])
        .range([0, width - margin.left - margin.right]);
    const yScale = d3.scaleLinear()
        .domain([0, 1])
        .range([height - margin.top - margin.bottom, 0]);

    // Farbskala für Cluster
    const clusterCount = d3.max(clusteredGames, d => d.cluster) + 1;
    const color = d3.scaleOrdinal(d3.schemeCategory10).domain(d3.range(clusterCount));

    // Punkte zeichnen (mit Outlines)
    let scatterplot_circle = g_scatterplot
        .selectAll(".scatterplot_kmeans_circle")
        .data(clusteredGames);

    scatterplot_circle.enter()
    .append("circle")
    .attr("class", "scatterplot_kmeans_circle")
    .merge(scatterplot_circle)
    .attr("fill", d => color(d.cluster))
    .attr("stroke", "#222")
    .attr("stroke-width", 1)
    .attr("r", 4)
    .attr("cx", d => margin.left + xScale(d.features[0]))
    .attr("cy", d => margin.top + yScale(d.features[1]))
    .on("mouseover", function (event, d) {
        d3.select(this)
            .attr("stroke", "black")
            .attr("stroke-width", 3);

        tooltip
            .style("visibility", "visible")
            .html(`Name: ${d.name || "Unknown"}<br/>Cluster: ${d.cluster}<br/>x: ${d.features[0].toFixed(2)}<br/>y: ${d.features[1].toFixed(2)}`);
    })
    .on("mousemove", function (event) {
        tooltip
            .style("top", (event.pageY + 10) + "px")
            .style("left", (event.pageX + 10) + "px");
    })
    .on("mouseout", function () {
        d3.select(this)
            .attr("stroke", "#222")
            .attr("stroke-width", 1);
        tooltip.style("visibility", "hidden");
    });

    scatterplot_circle.exit().remove();

    // Zentren als dicke, bunte Kreise mit Outlines
    let centroids_circle = g_scatterplot
        .selectAll(".scatterplot_kmeans_centroid")
        .data(centroids);

    centroids_circle.enter()
        .append("circle")
        .attr("class", "scatterplot_kmeans_centroid")
        .merge(centroids_circle)
        .attr("cx", (d) => margin.left + xScale(d[0]))
        .attr("cy", (d) => margin.top + yScale(d[1]))
        .attr("r", 14)
        .attr("fill", (d, i) => color(i))
        .attr("stroke", "#000")
        .attr("stroke-width", 3)
        .attr("opacity", 0.7);

    centroids_circle.exit().remove();

    // Achsen
    let x_axis = d3.axisBottom(xScale);
    g_x_axis
        .attr("transform", "translate(" + margin.left + "," + (height - margin.bottom) + ")")
        .call(x_axis);

    let y_axis = d3.axisLeft(yScale);
    g_y_axis
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(y_axis);

    // Achsenbeschriftung
    g_scatterplot.selectAll(".x_label").data([1]).join("text")
        .attr("class", "x_label")
        .attr("x", (width - margin.left - margin.right) / 2 + margin.left)
        .attr("y", height - margin.bottom / 4)
        .attr("text-anchor", "middle")
        .text("Max. Play Time (normiert)");

    g_scatterplot.selectAll(".y_label").data([1]).join("text")
        .attr("class", "y_label")
        .attr("x", -((height - margin.top - margin.bottom) / 2) - margin.top)
        .attr("y", margin.left / 4)
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .text("Complexity (normiert)");
}