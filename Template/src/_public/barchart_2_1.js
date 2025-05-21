import * as d3 from "d3"

export function draw_barchart_2_1(data) {
  console.log("Drawing Bar Chart for Task 2.1")
  console.log(data)

  /**
   * Margins of the visualization.
   */
  const margin = {
    top: 50,
    bottom: 50,
    left: 50,
    right: 50,
  }

  /**
   * Selection of svg and groups to be drawn on.
   */
  let svg = d3.select("#barchart_2_1_svg")
  let g_barchart_2_1 = d3.select("#g_barchart_2_1")
  let g_x_axis_barchart_2_1 = d3.select("#g_x_axis_barchart_2_1")
  let g_y_axis_barchart_2_1 = d3.select("#g_y_axis_barchart_2_1")

  /**
   * Getting the current width/height of the whole drawing pane.
   */
  let width = parseInt(svg.style("width"))
  let height = parseInt(svg.style("height"))


  /**
   * Scale function for the x-axis
   */
  const xScale_labels = data.map(d => Object.keys(d)[0])

  const xScale = d3
    .scaleBand()
    .domain(data.map((d, i) => xScale_labels[i]))
    .range([0, width - margin.left - margin.right])
    .padding(0.1)

  /**
   * Scale unction for the y-axis
   */
  const all_stats = data.map(d => Object.values(d)[0])
  const counts = data.map(d => Object.values(d)[0].count)

  const minY = 0
  const maxY = d3.max(counts)

  const yScale = d3
    .scaleLinear()
    .domain([minY, maxY])
    .range([height - margin.top - margin.bottom, 0])

  /**
   * Draw bars
   */

  let barchart_rect = g_barchart_2_1
    .selectAll(".barchart_rect")
    .data(data)

  barchart_rect.enter()
    .append("rect")
    .attr("class", "barchart_rect")
    .merge(barchart_rect)
    .attr("x", (d, i) => margin.left + xScale(xScale_labels[i]))
    .attr("y", d => margin.top + yScale(Object.values(d)[0].count))
    .attr("width", xScale.bandwidth())
    .attr("height", d => height - margin.top - margin.bottom - yScale(Object.values(d)[0].count))
    .attr("fill", "steelblue")

  barchart_rect.exit().remove()


  /**
   * Drawing the x-axis for the visualized data
   */
  let x_axis = d3.axisBottom(xScale)

  g_x_axis_barchart_2_1
    .attr(
      "transform",
      "translate(" + margin.left + "," + (height - margin.bottom) + ")"
    )
    .call(x_axis)

  /**
   * Drawing the y-axis for the visualized data
   */
  let y_axis = d3.axisLeft(yScale).ticks(5)

  g_y_axis_barchart_2_1
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .call(y_axis)

  /**
   * Drawing the x-axis label
   */
  let x_label = g_barchart_2_1.selectAll(".x_label").data(["Max. Players"])

  x_label
    .enter()
    .append("text")
    .attr("class", "x_label")
    .merge(x_label)
    .attr("x", width / 2)
    .attr("y", height - margin.bottom / 4)
    .attr("text-anchor", "middle")
    .text((d) => d)

  x_label.exit().remove()

  /**
   * Drawing the y-axis label
   */
  let y_label = g_barchart_2_1.selectAll(".y_label").data(["Number of Games"])

  y_label
    .enter()
    .append("text")
    .attr("class", "y_label")
    .merge(y_label)
    .attr("x", -height / 2)
    .attr("y", margin.left / 4)
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text((d) => d)

  y_label.exit().remove()

}