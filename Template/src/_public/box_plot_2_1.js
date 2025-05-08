import * as d3 from "d3"

/**
 * 
 * @param {[[max_players]: {min, q1, median, q3, max}]} data 
 */
export function draw_box_plot_2_1(data) {
  console.log("Drawing Box Plot for Task 2.1")
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
  let svg = d3.select("#box_plot_2_1_svg")
  let g_box_plot_2_1 = d3.select("#g_box_plot_2_1")
  let g_x_axis_box_plot_2_1 = d3.select("#g_x_axis_box_plot_2_1")
  let g_y_axis_box_plot_2_1 = d3.select("#g_y_axis_box_plot_2_1")

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

  const minY = d3.min(all_stats, d => d.min)
  const maxY = d3.max(all_stats, d => d.max)

  const yScale = d3
    .scaleLinear()
    .domain([minY, maxY])
    .range([height - margin.top - margin.bottom, 0])

  /**
   * Drawing the x-axis for the visualized data
   */
  let x_axis = d3.axisBottom(xScale)

  g_x_axis_box_plot_2_1
    .attr(
      "transform",
      "translate(" + margin.left + "," + (height - margin.bottom) + ")"
    )
    .call(x_axis)

  /**
   * Drawing the y-axis for the visualized data
   */
  let y_axis = d3.axisLeft(yScale).ticks(5)

  g_y_axis_box_plot_2_1
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .call(y_axis)

  /**
   * Drawing the x-axis label
   */
  let x_label = g_box_plot_2_1.selectAll(".x_label").data(["Max. Players"])

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
  let y_label = g_box_plot_2_1.selectAll(".y_label").data(["Rating"])

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

  /**
   * Draw box plots
   */
  let boxGroups = g_box_plot_2_1
    .selectAll(".box_group")
    .data(data, (d, i) => Object.keys(d)[0])

  boxGroups = boxGroups
    .enter()
    .append("g")
    .attr("class", "box_group")
    .merge(boxGroups)
    .attr("transform", (d, i) => `translate(${margin.left + xScale(xScale_labels[i])}, ${margin.top})`)

  const box_width = xScale.bandwidth()

  boxGroups.each(function (d) {
    const group = d3.select(this)
    const stats = Object.values(d)[0]

    // Whisker
    let whisker = group.selectAll(".whisker").data([stats])

    whisker.enter()
      .append("line")
      .attr("class", "whisker")
      .merge(whisker)
      .attr("x1", box_width / 2)
      .attr("x2", box_width / 2)
      .attr("y1", d => yScale(d.min))
      .attr("y2", d => yScale(d.max))
      .attr("stroke", "black")

    whisker.exit().remove()

    // Box
    let box = group.selectAll(".box").data([stats])

    box.enter()
      .append("rect")
      .attr("class", "box")
      .merge(box)
      .attr("x", 0)
      .attr("width", box_width)
      .attr("y", d => yScale(d.q3))
      .attr("height", d => yScale(d.q1) - yScale(d.q3))
      .attr("fill", "#69b3a2")
      .attr("stroke", "black")

    box.exit().remove()

    // Median
    let median = group.selectAll(".median").data([stats])

    median.enter()
      .append("line")
      .attr("class", "median")
      .merge(median)
      .attr("x1", 0)
      .attr("x2", box_width)
      .attr("y1", d => yScale(d.median))
      .attr("y2", d => yScale(d.median))
      .attr("stroke", "black")

    median.exit().remove()
  })

  boxGroups.exit().remove()

}