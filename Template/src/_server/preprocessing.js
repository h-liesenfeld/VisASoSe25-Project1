/**
 * Helper function to preprocess the data
 */

import * as d3 from "d3"

/**
 * # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
 *
 * !!!!! Here an below, you can/should edit the code  !!!!!
 * - you can modify the data preprocessing functions
 * - you can add other data preprocessing functions for other functionalities
 *
 * # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
 */

export function calc_box_plot_data(games) {
  // Group by maxplayers
  const groups = d3.group(games, d => d.maxplayers);

  let box_plot_data = [];

  for (const [max_players, games_list] of groups.entries()) {
    const ratings = games_list
      .map(g => g.rating.rating)
      .sort(d3.ascending);

    const min = d3.min(ratings);
    const max = d3.max(ratings);
    const q1 = d3.quantile(ratings, 0.25);
    const median = d3.quantile(ratings, 0.5);
    const q3 = d3.quantile(ratings, 0.75);

    box_plot_data.push({
      [max_players]: {
        min,
        q1,
        median,
        q3,
        max,
      }
    });
  }

  // Sort by max_players
  box_plot_data = box_plot_data.sort((a, b) => {
    const a_ = Object.keys(a)[0];
    const b_ = Object.keys(b)[0];
    return a_ - b_;
  });

  return box_plot_data;
}

/**
 * Bar Chart for Task 2.1 pre-processing
 */
export function calc_barchart_data(games) {
  // Group by maxplayers
  const groups = d3.group(games, d => d.maxplayers);

  const countData = [];

  for (const [max_players, games_list] of groups.entries()) {
    countData.push({
      [max_players]: {
        count: games_list.length
      }
    });
  }

  countData.sort((a, b) => {
    const aKey = parseInt(Object.keys(a)[0]);
    const bKey = parseInt(Object.keys(b)[0]);
    return aKey - bKey;
  });

  return countData;
}

/**
 * Returns boolean value, whether given row meets parameter conditions
 * @param {*} parameters
 * @param {*} row
 * @returns boolean
 */
export function is_below_max_weight(parameters, row) {
  return row.weight < parameters.max_weight
}
/**
 * Calculates the bmi for a specific person
 * @param {age, height, name, weight} person
 * @returns {age, bmi, height, name, weight}
 */
export function calc_bmi(person) {
  person.bmi = person.weight / ((person.height / 100) * (person.height / 100))
  return person
}
/**
 * Converts all attribute values to float, than can be converted
 * @param {*} obj
 * @returns {*}
 */
export function parse_numbers(obj) {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (!isNaN(obj[key])) {
        obj[key] = parseFloat(obj[key])
      }
    }
  }
  return obj
}
/**
 * Test add function to demonstrate testing with jest in file preprocessing.test.js
 *
 * Adds the input numbers
 * @param {number} a 
 * @param {number} b
 * @returns number
 */
export function test_func_add(a, b) {
  return a + b
}