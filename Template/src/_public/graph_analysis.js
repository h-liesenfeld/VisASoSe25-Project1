import * as d3 from "d3";

export function draw_graph_analysis(graphData) {
    const nodes = graphData.nodes;
    const links = graphData.links;

    const svg = d3.select("#graph_analysis_svg");
    svg.selectAll("*").remove(); // clear previous render

    // const width = parseInt(svg.attr("width")) || 800;
    // const height = parseInt(svg.attr("height")) || 600;
    let width = parseInt(svg.style("width"))
    let height = parseInt(svg.style("height"))

    const color = d3.scaleOrdinal(d3.schemeTableau10);
    const prExtent = d3.extent(nodes, d => d.pagerank ?? 0);
    const radiusScale = d3.scaleSqrt().domain(prExtent).range([1, 20]);

    // Group for zoom/pan
    const g = svg.append("g");

    // Zoom behavior
    svg.call(d3.zoom()
        .scaleExtent([0.1, 4])
        .on("zoom", (event) => {
            g.attr("transform", event.transform);
        })
    );

    // Links
    const link = g.append("g")
        .attr("stroke", "#aaa")
        .attr("stroke-opacity", 0.6)
        .selectAll("line")
        .data(links)
        .enter().append("line")
        .attr("stroke-width", 1.2);

    // Nodes
    const node = g.append("g")
        .selectAll("circle")
        .data(nodes)
        .enter().append("circle")
        .attr("r", d => radiusScale(d.pagerank ?? 0))
        .attr("fill", d => color(d.category || "default"));

    // Tooltips
    node.append("title")
        .text(d => `${d.name}\nCategory: ${d.category || "N/A"}\nPageRank: ${(d.pagerank ?? 0).toFixed(4)}`);

    // Force simulation
    const maxPR = d3.max(nodes, d => d.pagerank ?? 0);

    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links)
            .id(d => d.id)
            .distance(50)
            .strength(0.8))
        .force("charge", d3.forceManyBody().strength(-60))
        .force("center", d3.forceCenter(width / 2, height / 2))
        // .force("pagerankGravity", d3.forceRadial(
        //     d => {
        //         const pr = d.pagerank ?? 0;
        //         return 70 + (1 - pr / maxPR) * 400;
        //     },
        //     width / 2,
        //     height / 2
        // ));

    // Tick updates
    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
    });
}
