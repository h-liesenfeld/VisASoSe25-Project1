/**
 * Helper function to preprocess the data
 */

import * as d3 from "d3";
import * as druid from "@saehrimnir/druidjs";
import fs from "fs";
import { parse } from "csv-parse/sync";
import pagerank from "pagerank.js";

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
    const groups = d3.group(games, d => d.max_players);

    let box_plot_data = [];

    for (const [max_players, games_list] of groups.entries()) {
        const ratings = games_list
            .map(g => parseFloat(g.avg_rating))
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
    const groups = d3.group(games, d => d.max_players);

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

export function calc_graph_analysis_data(subsetNodes) {
  const subsetIds = new Set(subsetNodes.map(d => d.bgg_id));
  const graph = pagerank;

  const rawCSV = fs.readFileSync("./data/recommendations-2021-12-31_FULL.csv", "utf-8");
  const allRecs = parse(rawCSV, { columns: true });

  const nodes = subsetNodes.map(d => ({
    id: d.bgg_id,
    name: d.name,
    category: d.category ? d.category.split(',')[0].trim() : "Unknown",
    pagerank: 0
  }));

  const links = [];
  for (const row of allRecs) {
    const sourceId = row.ID;
    if (!subsetIds.has(sourceId)) continue;

    for (let i = 1; i <= 28; i++) {
      const targetId = row[`recommendation${i}`];
      if (targetId && subsetIds.has(targetId)) {
        links.push({ source: sourceId, target: targetId });
        graph.link(sourceId, targetId, 1.0);
      }
    }
  }

  graph.rank(0.85, 0.00001, (node_id, rank) => {
    const node = nodes.find(n => n.id === node_id);
    if (node) {
      node.pagerank = rank;
    }
  });

  return { nodes, links };
}

export function calc_scatterplot_data(games) {
    for (const game of games) {
        game.category = game.category.split(',');
    }
    // Get unique categories
    let uniqueCategoriesArr = getUniqueGameCategories(games);

    // Count how many games are in these categories and sort descending
    let categoriesWithNumberOfGames = countGamesOfAllCategories(games);
    //TODO: make this interactive, k as input
    let k = 10;
    let kMostFeaturedCategories = categoriesWithNumberOfGames.slice(0, k);

    // Create a dataset where each category is featured with each of its games and the parameters relevant for LDA
    let allData = [];
    uniqueCategoriesArr.forEach(cat => {
        if (kMostFeaturedCategories.map(c => c.name).includes(cat)) {
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
        scatterplotdata.push({ category: labels[i], gameTitle: allData[i].gameTitle, x: Math.abs(reductionLDA[i][0]), y: Math.abs(reductionLDA[i][1]) });
    }
    return scatterplotdata;
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
        if (game.category.some(cat => cat === category)) {
            dataset.push({
                categoryName: category,
                gameID: parseInt(game.bgg_id),
                gameTitle: game.name,
                minplayers: parseInt(game.min_players),
                maxplayers: parseInt(game.max_players),
                minplaytime: parseInt(game.min_time),
                maxplaytime: parseInt(game.max_time),
                minage: parseInt(game.min_age)
            });
        }
    });
    return dataset;
}

export function getUniqueGameCategories(games) {
    let categoriesPerGame = games.map(g => g.category);
    return [...new Set(categoriesPerGame.flat().map(JSON.stringify))].map(JSON.parse).sort((a, b) => (a.id - b.id));
}

export function countGamesOfAllCategories(games) {
    let uniqueCategoriesArr = getUniqueGameCategories(games);
    let categoriesWithNumberOfGames = [];
    uniqueCategoriesArr.forEach(cat => {
        let numberOfGames = numberOfGamesPerCategory(cat, games);
        categoriesWithNumberOfGames.push({ name: cat, numberOfGames: numberOfGames });
    });
    return categoriesWithNumberOfGames.sort((a, b) => (b.numberOfGames - a.numberOfGames));
}

export function numberOfGamesPerCategory(category, games) {
    let categoriesPerGame = games.map(g => g.category);
    let result = 0;
    categoriesPerGame.forEach(game => {
        if (game.some(cat => cat === category)) {
            result++;
        }
    });
    return result;
}

export function calc_scatterplot_data_kmeans(games, weights = { max_time: 1, complexity: 1 }) {
    // min/max für max_time und complexity bestimmen
    const maxTimes = games.map(g => Number(g.max_time)).filter(t => !isNaN(t) && t > 0);
    const complexities = games.map(g => Number(g.complexity)).filter(t => !isNaN(t));
    const minTime = Math.min(...maxTimes);
    const maxTime = Math.max(...maxTimes);
    const minComplexity = Math.min(...complexities);
    const maxComplexity = Math.max(...complexities);

    // Logarithmische Werte für max_time
    const minLog = Math.log(minTime);
    const maxLog = Math.log(maxTime);

    // Erst normalisieren, dann gewichten, dann nochmal normalisieren
    let data = games.map(game => {
        // max_time logarithmisch normieren
        let normTime = 0;
        if (game.max_time && !isNaN(Number(game.max_time)) && Number(game.max_time) > 0) {
            normTime = (Math.log(Number(game.max_time)) - minLog) / (maxLog - minLog);
        }
        // complexity wie gehabt
        let normComplexity = 0;
        if (game.complexity && !isNaN(Number(game.complexity))) {
            normComplexity = (Number(game.complexity) - minComplexity) / (maxComplexity - minComplexity);
        }
        return {
            name: game.name,
            features: [normTime * weights.max_time, normComplexity * weights.complexity],
            original: game
        };
    });

    // Nach Gewichtung nochmal normalisieren
    const timeVals = data.map(d => d.features[0]);
    const compVals = data.map(d => d.features[1]);
    const minTimeW = Math.min(...timeVals);
    const maxTimeW = Math.max(...timeVals);
    const minCompW = Math.min(...compVals);
    const maxCompW = Math.max(...compVals);

    data = data.map(d => ({
        ...d,
        features: [
            maxTimeW !== minTimeW ? (d.features[0] - minTimeW) / (maxTimeW - minTimeW) : 0,
            maxCompW !== minCompW ? (d.features[1] - minCompW) / (maxCompW - minCompW) : 0
        ]
    }));

    return {
        data,
        minTime,
        maxTime,
        minComplexity,
        maxComplexity
    };
}