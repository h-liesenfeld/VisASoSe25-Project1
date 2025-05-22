/**
 * Helper function to preprocess the data
 */

import * as d3 from "d3";
import * as druid from "@saehrimnir/druidjs";

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

export function calc_scatterplot_data(games) {
    // Get unique categories
    let uniqueCategoriesArr = getUniqueGameCategories(games);

    // Count how many games are in these categories and sort descending
    let categoriesWithNumberOfGames = countGamesOfAllCategories(games);
    //TODO: make this interactive, k as input
    let k = 10;
    let kMostFeaturedIds = categoriesWithNumberOfGames.slice(0, k).map(cat => cat.id);

    // Create a dataset where each category is featured with each of its games and the parameters relevant for LDA
    let allData = [];
    uniqueCategoriesArr.forEach(cat => {
        if (kMostFeaturedIds.includes(cat.id)) {
            let dataIndividualCategory = createDataSetForCategory(cat, games);
            allData = allData.concat(dataIndividualCategory);
        }
    });
    return calcLDAData(allData);
}

export function calcLDAData(allData) {
    let labels = allData.map(d => d.categoryName);
    let numberData = [];
    numberData.push(allData.map(d => d.minplayers));
    numberData.push(allData.map(d => d.maxplayers));
    numberData.push(allData.map(d => d.minplaytime));
    numberData.push(allData.map(d => d.maxplaytime));
    numberData.push(allData.map(d => d.minage));

    const X = druid.Matrix.from(numberData).T;
    const reductionLDA = new druid.LDA(X, { labels: labels, d: 2 }).transform().to2dArray;
    
    let scatterplotdata = [];
    for (let i = 0; i < allData.length; i++) {
        scatterplotdata.push({category: labels[i], gameTitle: allData[i].gameTitle, x: Math.abs(reductionLDA[i][0]), y: Math.abs(reductionLDA[i][1])});
    }
    return scatterplotdata;
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
    return row.weight < parameters.max_weight;
}
/**
 * Calculates the bmi for a specific person
 * @param {age, height, name, weight} person
 * @returns {age, bmi, height, name, weight}
 */
export function calc_bmi(person) {
    person.bmi = person.weight / ((person.height / 100) * (person.height / 100));
    return person;
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
                obj[key] = parseFloat(obj[key]);
            }
        }
    }
    return obj;
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
    return a + b;
}

export function createDataSetForCategory(category, games) {
    let dataset = []
    games.forEach(game => {
        if (game.types.categories.some(cat => cat.id == category.id)) {
            dataset.push({
                categoryName: category.name,
                gameID: game.id,
                gameTitle: game.title,
                minplayers: game.minplayers,
                maxplayers: game.maxplayers,
                minplaytime: game.minplaytime,
                maxplaytime: game.maxplaytime,
                minage: game.minage
            });
        }
    });
    return dataset;
}

export function getUniqueGameCategories(games) {
    let categoriesPerGame = games.map(g => g.types).map(t => t.categories);
    return [...new Set(categoriesPerGame.flat().map(JSON.stringify))].map(JSON.parse).sort((a, b) => (a.id - b.id));
}

export function countGamesOfAllCategories(games) {
    let uniqueCategoriesArr = getUniqueGameCategories(games);
    let categoriesWithNumberOfGames = [];
    uniqueCategoriesArr.forEach(cat => {
        let numberOfGames = numberOfGamesPerCategory(cat, games);
        categoriesWithNumberOfGames.push({id: cat.id, name: cat.name, numberOfGames: numberOfGames});
    });
    return categoriesWithNumberOfGames.sort((a, b) => (b.numberOfGames - a.numberOfGames));
}

export function numberOfGamesPerCategory(category, games) {
    let categoriesPerGame = games.map(g => g.types).map(t => t.categories);
    let result = 0;
    categoriesPerGame.forEach(game => {
        if (game.some(cat => cat.id == category.id)) {
            result++;
        }
    });
    return result;
}